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

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("backend.app")

# -------------------------------------------------------------------
# FastAPI app + CORS
# -------------------------------------------------------------------

app = FastAPI(title="SmartCity Recommender - Backend")

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


# -------------------------------------------------------------------
# Root / Health
# -------------------------------------------------------------------

@app.get("/", tags=["root"])
def read_root():
    return {
        "status": "ok",
        "message": "Recommender backend running"
    }


@app.get("/api/health", tags=["health"])
def health():
    return {"status": "ok"}


# -------------------------------------------------------------------
# Sanitizer utilities
# -------------------------------------------------------------------

def _sanitize_scalar(v):
    if isinstance(v, np.generic):
        try:
            v = v.item()
        except Exception:
            pass

    if isinstance(v, float):
        if math.isnan(v) or math.isinf(v):
            return None
        return float(v)

    if isinstance(v, np.floating):
        try:
            f = float(v)
            if math.isnan(f) or math.isinf(f):
                return None
            return f
        except Exception:
            return None

    if isinstance(v, np.integer):
        try:
            return int(v)
        except Exception:
            return None

    return v


def sanitize(obj):
    """
    Recursively sanitize a structure:
      - convert numpy types to native Python
      - replace NaN/Inf with None
    """

    if obj is None:
        return None

    if isinstance(obj, dict):
        out = {}

        for k, v in obj.items():
            out[str(k)] = sanitize(v)

        return out

    if isinstance(obj, (list, tuple)):
        return [sanitize(v) for v in obj]

    return _sanitize_scalar(obj)


# -------------------------------------------------------------------
# Recommender startup preload
# -------------------------------------------------------------------

@app.on_event("startup")
async def startup_warm_recommender():

    try:
        from backend import recommender

        try:
            if hasattr(recommender, "_ensure_loaded"):
                recommender._ensure_loaded()

            logger.info(
                "Recommender artifacts preloaded successfully."
            )

        except Exception as e:
            logger.warning(
                "Warning: recommender artifacts failed to preload: %s",
                repr(e)
            )

    except Exception as e:
        logger.info(
            "Warning: failed to import backend.recommender: %s",
            repr(e)
        )


# -------------------------------------------------------------------
# Categories
# -------------------------------------------------------------------

@app.get(
    "/api/categories",
    response_model=List[str],
    tags=["meta"]
)
def get_categories():

    try:
        from backend import recommender

        if hasattr(recommender, "_ensure_loaded"):
            recommender._ensure_loaded()

        meta = getattr(recommender, "_meta", None)

        if meta is None:
            return []

        cats = set()

        if "categories" in getattr(meta, "columns", []):

            for c in meta["categories"].fillna("").astype(str):

                if not c:
                    continue

                for part in str(c).split(","):

                    part = part.strip()

                    if part:
                        cats.add(part)

        elif "amenity" in getattr(meta, "columns", []):

            for a in meta["amenity"].fillna("").astype(str):

                a = a.strip()

                if a:
                    cats.add(a)

        return sorted(list(cats))

    except FileNotFoundError:
        return []

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# -------------------------------------------------------------------
# Recommend
# -------------------------------------------------------------------

class RecommendParams(BaseModel):

    lat: float
    lon: float

    query: str = Field(
        ...,
        min_length=1,
        description="Search query is required"
    )

    k: Optional[int] = 10

    max_radius_km: Optional[float] = 20.0

    category_filter: Optional[str] = None

    lang: Optional[str] = None


@app.post(
    "/api/recommend",
    tags=["recommend"]
)
def recommend_endpoint(
    p: RecommendParams,
    request: Request
):

    try:
        from backend.recommender import recommend

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Server import error: {e}"
        )

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

        raise HTTPException(
            status_code=500,
            detail=str(fnf)
        )

    except ImportError as ie:

        raise HTTPException(
            status_code=500,
            detail=str(ie)
        )

    except ValueError as ve:

        raise HTTPException(
            status_code=400,
            detail=str(ve)
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Recommendation error: {e}"
        )

    # ---------------------------------------------------------------
    # Translation support
    # ---------------------------------------------------------------

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

                target_lang = (
                    al.split(",")[0]
                    .split("-")[0]
                    .lower()
                )

    if target_lang and target_lang != "en":

        try:

            from backend import translate as translator

            translated = translator.translate_results(
                results,
                target_lang
            )

            safe_payload = {
                "count": len(translated),
                "results": sanitize(translated)
            }

            return jsonable_encoder(safe_payload)

        except Exception as e:

            logger.warning(
                "Warning: translation failed: %s",
                repr(e)
            )

    safe_payload = {
        "count": len(results),
        "results": sanitize(results)
    }

    return jsonable_encoder(safe_payload)


# -------------------------------------------------------------------
# Database / Auth
# -------------------------------------------------------------------

# IMPORTANT:
# Do NOT run Base.metadata.create_all() here.
#
# Vercel serverless functions should not attempt to create
# database tables every time the function starts.
#
# Database tables should already exist in TiDB.

try:

    from . import db, models

    logger.info("Database module loaded.")

except Exception as e:

    logger.warning(
        "DB/models import failed: %s",
        repr(e)
    )


# -------------------------------------------------------------------
# Auth router
# -------------------------------------------------------------------

try:

    from . import auth

    app.include_router(
        auth.router,
        prefix="/api/auth"
    )

    logger.info("Auth router included under /api/auth.")

except Exception as e:

    logger.exception(
        "Auth router import failed: %s",
        e
    )


# -------------------------------------------------------------------
# Service routes
# -------------------------------------------------------------------

try:

    from .service_routes import router as service_router

    app.include_router(
        service_router,
        prefix="/api"
    )

    logger.info(
        "Service router included under /api."
    )

except Exception as e:

    logger.exception(
        "Service router import failed: %s",
        e
    )


# -------------------------------------------------------------------
# Chat routes
# -------------------------------------------------------------------

try:

    from backend.chat import router as chat_router

    app.include_router(
        chat_router,
        prefix="/api"
    )

    logger.info(
        "Chat router included under /api."
    )

except Exception as e:

    logger.exception(
        "Chat router import failed: %s",
        e
    )


# -------------------------------------------------------------------
# Request logging middleware
# -------------------------------------------------------------------

@app.middleware("http")
async def log_requests(
    request: Request,
    call_next
):

    logger.info(
        "Request: %s %s",
        request.method,
        request.url
    )

    try:

        response = await call_next(request)

        logger.info(
            "Response: %s %s -> %s",
            request.method,
            request.url,
            response.status_code
        )

        return response

    except Exception as exc:

        logger.exception(
            "Unhandled error for request %s %s: %s",
            request.method,
            request.url,
            exc
        )

        raise