# backend/app.py
import logging
import math
import numpy as np
from fastapi import FastAPI, HTTPException, Request
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
from dotenv import load_dotenv
import os

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("backend.app")

# -------------------------------------------------------------------
# FastAPI app + CORS + simple root/health endpoints
# -------------------------------------------------------------------
app = FastAPI(title="SmartCity Recommender - Backend")

# CORS for local dev (Vite)
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["root"])
def read_root():
    return {"status": "ok", "message": "Recommender backend running"}

@app.get("/health", tags=["health"])
def health():
    return {"status": "ok"}


# -------------------------------------------------------------------
# Sanitizer utilities (your existing functions, unchanged)
# -------------------------------------------------------------------
def _sanitize_scalar(v):
    # convert numpy scalars & types to native python, guard NaN/Inf
    if isinstance(v, np.generic):
        try:
            v = v.item()
        except Exception:
            pass

    if isinstance(v, float):
        if math.isnan(v) or math.isinf(v):
            return None
        return float(v)
    if isinstance(v, (np.floating,)):
        # fallback
        try:
            f = float(v)
            if math.isnan(f) or math.isinf(f):
                return None
            return f
        except Exception:
            return None
    if isinstance(v, (np.integer,)):
        try:
            return int(v)
        except Exception:
            return None
    # ints, strs, bools, None pass through
    return v

def sanitize(obj):
    """
    Recursively sanitize a structure (dict/list/scalars):
      - convert numpy types to native Python
      - replace NaN/Inf with None
    """
    if obj is None:
        return None
    if isinstance(obj, dict):
        out = {}
        for k, v in obj.items():
            # ensure keys are strings
            out[str(k)] = sanitize(v)
        return out
    if isinstance(obj, (list, tuple)):
        return [sanitize(v) for v in obj]
    # numpy scalars or numerical types
    return _sanitize_scalar(obj)


# -------------------------------------------------------------------
# Try to preload recommender on startup to reduce first-request latency
# -------------------------------------------------------------------
@app.on_event("startup")
async def startup_warm_recommender():
    try:
        # try to import backend.recommender and ensure loaded
        from backend import recommender
        try:
            # call a loader if available
            if hasattr(recommender, "_ensure_loaded"):
                recommender._ensure_loaded()
            logger.info("Recommender artifacts preloaded successfully.")
        except Exception as e:
            logger.warning("Warning: recommender artifacts failed to preload on startup: %s", repr(e))
    except Exception as e:
        logger.info("Warning: failed to import backend.recommender during startup: %s", repr(e))


# -------------------------------------------------------------------
# Categories endpoint (reads from recommender metadata if available)
# -------------------------------------------------------------------
@app.get("/categories", response_model=List[str], tags=["meta"])
def get_categories():
    """
    Returns a sorted list of unique category strings (if available in metadata).
    Returns empty list if metadata is missing or can't be read.
    """
    try:
        from backend import recommender
        if hasattr(recommender, "_ensure_loaded"):
            recommender._ensure_loaded()
        meta = getattr(recommender, "_meta", None)
        if meta is None:
            return []
        cats = set()
        # support common column names
        if "categories" in getattr(meta, "columns", []):
            for c in meta['categories'].fillna("").astype(str):
                if not c:
                    continue
                for part in str(c).split(","):
                    part = part.strip()
                    if part:
                        cats.add(part)
        elif "amenity" in getattr(meta, "columns", []):
            for a in meta['amenity'].fillna("").astype(str):
                a = a.strip()
                if a:
                    cats.add(a)
        return sorted(list(cats))
    except FileNotFoundError:
        return []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# -------------------------------------------------------------------
# Recommend endpoint (preserves your original logic)
# -------------------------------------------------------------------
class RecommendParams(BaseModel):
    lat: float
    lon: float
    query: str = Field(..., min_length=1, description="Search query is required")
    k: Optional[int] = 10
    max_radius_km: Optional[float] = 20.0
    category_filter: Optional[str] = None
    lang: Optional[str] = None

@app.post("/recommend", tags=["recommend"])
def recommend_endpoint(p: RecommendParams, request: Request):
    """
    Calls backend.recommender.recommend and returns sanitized results.
    """
    # import recommend function defensively
    try:
        from backend.recommender import recommend
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server import error: {e}")

    # call the recommender
    try:
        results = recommend(
            lat=p.lat,
            lon=p.lon,
            query=p.query,
            k=p.k,
            max_radius_km=p.max_radius_km,
            category_filter=p.category_filter
        )
    except FileNotFoundError as fnf:
        raise HTTPException(status_code=500, detail=str(fnf))
    except ImportError as ie:
        raise HTTPException(status_code=500, detail=str(ie))
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation error: {e}")

    # translation support (optional)
    target_lang = None
    if p.lang:
        target_lang = p.lang.split("-")[0].lower()
    else:
        qlang = request.query_params.get("lang")
        if qlang:
            target_lang = qlang.split("-")[0].lower()
        else:
            al = request.headers.get("accept-language")
            if al:
                target_lang = al.split(",")[0].split("-")[0].lower()

    if target_lang and target_lang != "en":
        try:
            from backend import translate as translator
            translated = translator.translate_results(results, target_lang)
            safe_payload = {"count": len(translated), "results": sanitize(translated)}
            return jsonable_encoder(safe_payload)
        except Exception as e:
            logger.warning("Warning: translation failed: %s", repr(e))
            # fall through to return english results

    safe_payload = {"count": len(results), "results": sanitize(results)}
    return jsonable_encoder(safe_payload)


# -------------------------------------------------------------------
# Database / Auth router inclusion (safe import)
# -------------------------------------------------------------------
# We attempt to include auth router and create tables *if* db/models exist.
# This prevents startup crashes when files are missing or broken.
try:
    from . import db, models  # relative import within backend package
    # create tables (development convenience)
    try:
        models.Base.metadata.create_all(bind=db.engine)
        logger.info("Database tables ensured (create_all).")
    except Exception as e:
        logger.exception("Warning: could not create DB tables: %s", e)

    try:
        from . import auth
        app.include_router(auth.router)
        logger.info("Auth router included.")
    except Exception as e:
        logger.exception("Auth router import failed: %s", e)

except Exception as e:
    # If db/models can't be imported, warn and continue — endpoints that depend on DB will return server errors
    logger.info("DB/models not available or failed to import; skipping DB table creation and auth router. (%s)", e)


# -------------------------------------------------------------------
# Optional: generic exception logging middleware (lightweight)
# -------------------------------------------------------------------
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info("Request: %s %s", request.method, request.url)
    try:
        response = await call_next(request)
        logger.info("Response: %s %s -> %s", request.method, request.url, response.status_code)
        return response
    except Exception as exc:
        logger.exception("Unhandled error for request %s %s: %s", request.method, request.url, exc)
        raise
# register service routes
from .service_routes import router as service_router
app.include_router(service_router)
from backend.chat import router as chat_router
app.include_router(chat_router)
