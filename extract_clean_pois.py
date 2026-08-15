import osmnx as ox
import pandas as pd

ox.settings.use_cache = True
ox.settings.timeout = 600

# Only the categories you actually need
TAGS = {
    "hospital": {"amenity": "hospital"},
    "school": {"amenity": "school"},
    "college": {"amenity": ["college", "university"]},
    "police": {"amenity": "police"},
    "pharmacy": {"amenity": "pharmacy"},
    "restaurant": {"amenity": "restaurant"},
    "fast_food": {"amenity": "fast_food"},
    "park": {"leisure": "park"},
    "temple": {"amenity": "place_of_worship"},
}

india = ox.geocode_to_gdf("India").geometry.iloc[0]

rows = []

for category, tag in TAGS.items():
    print(f"Downloading {category} ...")

    gdf = ox.features_from_polygon(india, tag)
    gdf = gdf[gdf.geometry.type == "Point"]

    # 🔴 CRITICAL FILTER: must have a REAL name
    gdf = gdf[gdf["name"].notna()]

    for _, r in gdf.iterrows():
        rows.append({
            "business_id": f"osm_{r.name}_{category}",
            "name": r["name"],
            "categories": category,
            "latitude": r.geometry.y,
            "longitude": r.geometry.x,
        })

df = pd.DataFrame(rows)

print("Total clean POIs:", len(df))
df.to_parquet("item_meta.parquet", index=False)
