"""
Distance-first Smart City Recommender
"""

from pathlib import Path
import math
import pandas as pd
from typing import List, Dict, Optional

# --------------------------------------------------
# Load dataset ONCE
# --------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent
# DATA_PATH = BASE_DIR / "recommender_artifacts" / "item_meta.parquet"

# DATA = pd.read_parquet(DATA_PATH)
DATA_PATH = BASE_DIR / "backend" / "recommender_artifacts" / "item_meta.csv"

DATA = pd.read_csv(DATA_PATH)

# Normalize text columns once
DATA["name"] = DATA.get("name", "").fillna("").astype(str)
DATA["name_lc"] = DATA["name"].str.lower()
DATA["categories"] = DATA.get("categories", "").fillna("").astype(str)
DATA["categories_lc"] = DATA["categories"].str.lower()

# --------------------------------------------------
# Utility: detect generic / placeholder OSM names
# --------------------------------------------------
def is_generic_name(name: str) -> bool:
    if not name:
        return True

    name = name.lower().strip()

    return (
        name.startswith("hospital ") or
        name.startswith("super speciality hospital") or
        name.startswith("clinic ") or
        name.startswith("school ") or
        "#" in name
    )

# --------------------------------------------------
# Haversine distance (vectorized, km)
# --------------------------------------------------
def haversine_vectorized(lat, lon, lats, lons):
    R = 6371.0
    lat1 = math.radians(lat)
    lon1 = math.radians(lon)

    lat2 = pd.Series(lats, index=lats.index).astype(float).apply(math.radians)
    lon2 = pd.Series(lons, index=lons.index).astype(float).apply(math.radians)

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = (
        (dlat / 2).apply(math.sin) ** 2
        + math.cos(lat1) * lat2.apply(math.cos)
        * (dlon / 2).apply(math.sin) ** 2
    )

    return 2 * R * a.apply(math.sqrt).apply(math.asin)

# --------------------------------------------------
# MAIN RECOMMENDER
# --------------------------------------------------
def recommend(
    lat: float,
    lon: float,
    query: str,
    k: int = 10,
    max_radius_km: float = 5.0,
    category_filter: Optional[str] = None
) -> List[Dict]:

    if not query or not str(query).strip():
        raise ValueError("query is required")

    query = query.lower().strip()

    # --------------------------------------------------
    # STEP 1: DISTANCE FILTER (GPS FIRST)
    # --------------------------------------------------
    distances = haversine_vectorized(
        lat,
        lon,
        DATA["latitude"],
        DATA["longitude"]
    )

    nearby = DATA.copy()
    nearby["distance_km"] = distances
    nearby = nearby[nearby["distance_km"] <= max_radius_km]

    if nearby.empty:
        return []

    # --------------------------------------------------
    # STEP 2: QUERY / CATEGORY FILTER
    # --------------------------------------------------
    mask = (
        nearby["categories_lc"].str.contains(query, regex=False) |
        nearby["name_lc"].str.contains(query, regex=False)
    )

    if category_filter:
        cf = category_filter.lower().replace(" ", "_")
        mask &= nearby["categories_lc"].str.contains(cf, regex=False)

    filtered = nearby[mask]

    if filtered.empty:
        return []

    # --------------------------------------------------
    # STEP 3: PRIORITIZE REAL NAMES + SORT BY DISTANCE
    # --------------------------------------------------
    filtered = filtered.copy()
    filtered["is_generic"] = filtered["name"].apply(is_generic_name)

    # Sort priority:
    # 1️⃣ Real named places first
    # 2️⃣ Then by distance
    filtered = filtered.sort_values(
        by=["is_generic", "distance_km"],
        ascending=[True, True]
    )

    # --------------------------------------------------
    # STEP 4: FORMAT RESPONSE
    # --------------------------------------------------
    results = []
    for _, row in filtered.head(k).iterrows():
        results.append({
            "business_id": row.get("business_id"),
            "name": row.get("name"),
            "display_name": row.get("name"),
            "categories": row.get("categories"),
            "latitude": float(row["latitude"]),
            "longitude": float(row["longitude"]),
            "distance_km": round(float(row["distance_km"]), 3)
        })

    return results
