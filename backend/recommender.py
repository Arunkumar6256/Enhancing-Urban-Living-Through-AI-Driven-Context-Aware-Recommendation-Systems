# backend/recommender.py
"""
Single solid recommender implementation:
- Strict query-based candidate selection (token & category normalization)
- Category-boost to prefer exact category matches
- Vectorized haversine and vectorized cosine (sklearn.linear_kernel)
- Semantic similarity used only as fallback
- Warm-load helper _ensure_loaded()
- Produces readable display_name and categories_display (uses Unidecode transliteration)
"""

import os
import math
from pathlib import Path
from threading import Lock
from typing import List, Dict, Any, Optional

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import linear_kernel

# transliteration fallback
try:
    from unidecode import unidecode
except Exception:
    def unidecode(x):
        return x

BASE = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "recommender_artifacts"))
VEC_PATH = os.path.join(BASE, "tfidf_vectorizer.joblib")
TFIDF_PATH = os.path.join(BASE, "tfidf_matrix.joblib")
META_PATH = os.path.join(BASE, "item_meta.parquet")

_vectorizer = None
_tfidf_matrix = None
_meta = None
_pop_min = 0.0
_pop_max = 1.0
_load_lock = Lock()

# behavior constants
SIM_THRESHOLD = 0.12
CATEGORY_BOOST = 0.30
EXPANSION_STEP_KM = 10.0
MAX_EXPANSION_MULTIPLIER = 5.0

def _ensure_loaded():
    """Load artifacts into module-level caches. Raises FileNotFoundError if missing."""
    global _vectorizer, _tfidf_matrix, _meta, _pop_min, _pop_max
    if _meta is not None and _vectorizer is not None and _tfidf_matrix is not None:
        return

    with _load_lock:
        if _meta is not None and _vectorizer is not None and _tfidf_matrix is not None:
            return

        missing = [p for p in (META_PATH, VEC_PATH, TFIDF_PATH) if not os.path.exists(p)]
        if missing:
            raise FileNotFoundError("Missing artifact(s): " + ", ".join(missing) +
                                    "\nRun rebuild_tfidf.py or preprocess_train.py to create them.")

        _meta = pd.read_parquet(META_PATH)

        for c in ("latitude", "longitude"):
            if c not in _meta.columns:
                raise ImportError(f"Metadata missing required column '{c}'")

        _meta["name_en_lc"] = _meta.get("name_en", _meta.get("name", "")).fillna("").astype(str).str.lower()
        _meta["name_lc"] = _meta.get("name", "").fillna("").astype(str).str.lower()
        _meta["categories_lc"] = _meta.get("categories", "").fillna("").astype(str).str.lower()

        _vectorizer = joblib.load(VEC_PATH)
        _tfidf_matrix = joblib.load(TFIDF_PATH)

        try:
            pop_log = np.log1p(_meta.get("review_count", pd.Series([0]*len(_meta))).fillna(0).astype(float).values)
            _pop_min, _pop_max = float(pop_log.min()), float(pop_log.max())
            if _pop_min == _pop_max:
                _pop_min, _pop_max = 0.0, max(1.0, _pop_max)
        except Exception:
            _pop_min, _pop_max = 0.0, 1.0

def _haversine_vectorized(lat, lon, lats, lons):
    """Return distances in kilometers for arrays."""
    lat1 = math.radians(lat)
    lon1 = math.radians(lon)
    lat2 = np.radians(lats.astype(float))
    lon2 = np.radians(lons.astype(float))
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = np.sin(dlat / 2.0) ** 2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon / 2.0) ** 2
    c = 2 * np.arcsin(np.sqrt(a))
    return 6371.0 * c

def _normalize(v, mn, mx):
    if mx == mn:
        return 0.0
    return float((v - mn) / (mx - mn))

def _pick_display_name(row):
    name_en = row.get("name_en") if "name_en" in row else None
    if name_en and str(name_en).strip():
        return str(name_en).strip()
    name = row.get("name") or ""
    if name and str(name).strip():
        return str(name).strip()
    cats = row.get("categories") or row.get("amenity") or ""
    if isinstance(cats, str):
        low = cats.lower()
        if "police" in low: return "Police Station"
        if "hospital" in low or "clinic" in low: return "Hospital"
        if "post_office" in low or "post office" in low: return "Post Office"
    return "Place"

def _make_query_variants(query: str):
    q = str(query).strip().lower()
    q_us = q.replace(" ", "_")
    q_ns = q.replace(" ", "")
    variants = {q, q_us, q_ns}
    for tok in q.split():
        if tok:
            variants.add(tok)
    synonyms = {
        "police station": "police",
        "post office": "post_office",
        "postoffice": "post_office",
        "atm": "bank",
        "clinic": "hospital",
    }
    if q in synonyms:
        variants.add(synonyms[q])
    return variants

# replace existing _row_to_result with this code

def _row_to_result(idx, row, distance_km, content_sim, max_radius_km, is_category_exact=False):
    """
    Build result dict with robust display_name:
      - prefer name_en if it exists and looks Latin
      - else attempt to FIX mojibake (latin1->utf8 repair) on original name
      - transliterate repaired or original name with unidecode
      - final fallbacks preserve something sensible
    Also produce categories_display (underscores -> spaces, title-cased lightly).
    """
    # scoring (unchanged)
    rating = float(0.0 if pd.isna(row.get("rating")) else (row.get("rating") or 0.0))
    rating_score = (rating - 1.0) / 4.0 if rating > 0 else 0.0
    pop = math.log1p(float(row.get("review_count") or 0))
    pop_score = _normalize(pop, _pop_min, _pop_max)
    loc_score = max(0.0, 1.0 - (distance_km / max_radius_km)) if max_radius_km > 0 else 0.0

    hybrid = 0.45 * float(content_sim) + 0.25 * loc_score + 0.15 * rating_score + 0.10 * pop_score
    if is_category_exact:
        hybrid = hybrid + CATEGORY_BOOST

    # ---------- robust display name ----------
    def looks_latin(s: Optional[str]) -> bool:
        if not s or not isinstance(s, str):
            return False
        # consider latin if at least one ASCII letter exists
        return any('A' <= ch <= 'z' for ch in s)

    def try_fix_mojibake(s: str) -> str:
        """
        Common repair: interpret the current Python str as latin-1 bytes,
        then decode those bytes as utf-8. If that yields sensible Unicode,
        return it; otherwise return original s.
        """
        if not s or not isinstance(s, str):
            return s
        try:
            # encode the garbled str as latin-1 bytes, then decode as utf-8
            b = s.encode('latin-1', errors='ignore')
            repaired = b.decode('utf-8', errors='strict')
            # require repaired to contain at least one letter beyond ASCII control
            if any(ord(ch) > 127 for ch in repaired) or any('A' <= ch <= 'z' for ch in repaired):
                return repaired
        except Exception:
            pass
        return s

    name_en_val = row.get("name_en") if "name_en" in row else None
    orig_name = row.get("name") or row.get("original_name") or ""
    display_name = None

    # 1) prefer name_en if latin-like
    if name_en_val and isinstance(name_en_val, str) and name_en_val.strip():
        if looks_latin(name_en_val):
            display_name = name_en_val.strip()

    # 2) attempt to fix mojibake on original/orig_name
    if not display_name:
        try:
            repaired = try_fix_mojibake(str(orig_name))
            # if repaired contains readable letters, use it
            if repaired and isinstance(repaired, str) and repaired.strip():
                # prefer repaired if it gained ASCII letters or non-ascii unicode
                if looks_latin(repaired) or any(ord(ch) > 127 for ch in repaired):
                    # transliterate repaired to ascii-friendly string
                    try:
                        translit = unidecode(repaired)
                        if translit and translit.strip():
                            display_name = translit.strip()
                        else:
                            display_name = repaired.strip()
                    except Exception:
                        display_name = repaired.strip()
        except Exception:
            display_name = None

    # 3) transliterate original name if still non-latin
    if not display_name:
        try:
            if any(ord(ch) > 127 for ch in str(orig_name)):
                translit2 = unidecode(orig_name)
                if translit2 and isinstance(translit2, str) and translit2.strip():
                    display_name = translit2.strip()
        except Exception:
            display_name = None

    # 4) fallback to name_en or name
    if not display_name:
        if name_en_val and isinstance(name_en_val, str) and name_en_val.strip():
            display_name = name_en_val.strip()
        else:
            display_name = (orig_name or row.get("name") or "Place")

    # ---------- categories display (clean) ----------
    cats_raw = row.get("categories") or ""
    try:
        if isinstance(cats_raw, str):
            cats_display = cats_raw.replace("_", " ").strip()
            # simple humanization: lower -> title for multiword (keep short words lowercase if needed)
            if len(cats_display) <= 2:
                cats_display = cats_display.upper()
            else:
                cats_display = " ".join([w.capitalize() if len(w)>2 else w for w in cats_display.split()])
        else:
            cats_display = str(cats_raw)
    except Exception:
        cats_display = str(cats_raw)

    # assemble final dict (keeps backward-compatible 'name' and adds 'display_name'/'categories_display')
    return dict(
        business_id=row.get("business_id"),
        name=_pick_display_name(row),
        display_name=display_name,
        original_name=row.get("name"),
        categories=row.get("categories"),
        categories_display=cats_display,
        latitude=row.get("latitude"),
        longitude=row.get("longitude"),
        rating=float(row.get("rating") or 0.0) if "rating" in row else 0.0,
        review_count=int(row.get("review_count") or 0),
        distance_km=round(float(distance_km), 3),
        hybrid_score=round(float(hybrid), 5),
        components=dict(
            content_similarity=round(float(content_sim), 5),
            location_score=round(float(loc_score), 5),
            rating_score=round(float(rating_score), 5),
            popularity_score=round(float(pop_score), 5),
        ),
    )

def recommend(lat: float, lon: float, query: str, k: int = 10, max_radius_km: float = 20.0, category_filter: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Single solid recommend:
    - Requires non-empty 'query'
    - Strict candidate selection by query variants (name/category)
    - Expand radius stepwise if no matches; semantic fallback only if necessary
    """
    if not query or not str(query).strip():
        raise ValueError("query parameter is required and must be non-empty")

    _ensure_loaded()

    variants = _make_query_variants(query)
    cat_filter = str(category_filter).strip().lower() if category_filter else None
    k = int(k or 10)
    max_radius_km = float(max_radius_km or 20.0)

    lat_arr = _meta["latitude"].values
    lon_arr = _meta["longitude"].values
    name_en_lc = _meta["name_en_lc"].values
    name_lc = _meta["name_lc"].values
    categories_lc = _meta["categories_lc"].values

    mask_name = np.zeros(len(_meta), dtype=bool)
    mask_cat = np.zeros(len(_meta), dtype=bool)
    for v in variants:
        if not v: continue
        mask_name |= (np.char.find(name_en_lc.astype(str), v) >= 0)
        mask_name |= (np.char.find(name_lc.astype(str), v) >= 0)
        v_us = v.replace(" ", "_")
        v_ns = v.replace(" ", "")
        mask_cat |= (np.char.find(categories_lc.astype(str), v) >= 0)
        mask_cat |= (np.char.find(categories_lc.astype(str), v_us) >= 0)
        mask_cat |= (np.char.find(categories_lc.astype(str), v_ns) >= 0)

    mask_candidate = mask_name | mask_cat

    if cat_filter:
        cf_us = cat_filter.replace(" ", "_")
        mask_cf = (np.char.find(categories_lc.astype(str), cat_filter) >= 0) | (np.char.find(categories_lc.astype(str), cf_us) >= 0)
        mask_candidate &= mask_cf

    has_text_candidates = mask_candidate.any()
    qvec = None
    cosine_all = None

    search_radius = max_radius_km
    max_cap = max_radius_km * MAX_EXPANSION_MULTIPLIER
    if max_cap < 100.0:
        max_cap = 100.0
    while search_radius <= max_cap:
        idxs = np.where(mask_candidate)[0]
        if len(idxs) > 0:
            dists = _haversine_vectorized(lat, lon, lat_arr[idxs], lon_arr[idxs])
            within_idx_local = np.where(dists <= search_radius)[0]
            if len(within_idx_local) > 0:
                cand_global = idxs[within_idx_local]
                try:
                    if qvec is None:
                        qvec = _vectorizer.transform([query])
                    cand_matrix = _tfidf_matrix[cand_global]
                    content_sim = linear_kernel(qvec, cand_matrix).flatten()
                except Exception:
                    content_sim = np.zeros(len(cand_global), dtype=float)

                results = []
                for i_local, idx_global in enumerate(cand_global):
                    row = _meta.iloc[idx_global]
                    dkm = float(dists[within_idx_local][i_local])
                    cat_val = str(row.get("categories") or "").lower()
                    is_cat_exact = any((v in cat_val) for v in variants)
                    results.append(_row_to_result(int(idx_global), row, dkm, float(content_sim[i_local]), max_radius_km, is_category_exact=is_cat_exact))
                results_sorted = sorted(results, key=lambda r: r["hybrid_score"], reverse=True)
                return results_sorted[:k]

        # semantic fallback
        if qvec is None:
            try:
                qvec = _vectorizer.transform([query])
                cosine_all = linear_kernel(qvec, _tfidf_matrix).flatten()
            except Exception:
                cosine_all = np.zeros(_meta.shape[0], dtype=float)
        mask_sim = cosine_all >= SIM_THRESHOLD
        if cat_filter:
            cf_us = cat_filter.replace(" ", "_")
            mask_sim &= ((np.char.find(categories_lc.astype(str), cat_filter) >= 0) | (np.char.find(categories_lc.astype(str), cf_us) >= 0))
        if mask_sim.any():
            sim_idxs = np.where(mask_sim)[0]
            dists_sim = _haversine_vectorized(lat, lon, lat_arr[sim_idxs], lon_arr[sim_idxs])
            within_sim_local = np.where(dists_sim <= search_radius)[0]
            if len(within_sim_local) > 0:
                chosen = sim_idxs[within_sim_local]
                results = []
                for j, gidx in enumerate(chosen):
                    row = _meta.iloc[gidx]
                    dkm = float(dists_sim[within_sim_local][j])
                    is_cat_exact = any((v in str(row.get("categories") or "").lower()) for v in variants)
                    content_sim_val = float(cosine_all[gidx])
                    results.append(_row_to_result(int(gidx), row, dkm, content_sim_val, max_radius_km, is_category_exact=is_cat_exact))
                results_sorted = sorted(results, key=lambda r: r["hybrid_score"], reverse=True)
                return results_sorted[:k]

        search_radius += EXPANSION_STEP_KM

    return []
