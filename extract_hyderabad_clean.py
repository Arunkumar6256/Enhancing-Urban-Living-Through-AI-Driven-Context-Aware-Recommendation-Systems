import osmnx as ox
import pandas as pd

ox.settings.use_cache = True
ox.settings.timeout = 300

PLACE = "Hyderabad, Telangana, India"

TAGS = {
    "hospital": {"amenity": "hospital"},
    "school": {"amenity": "school"},
    "college": {"amenity": ["college", "university"]},
    "police": {"amenity": "police"},
    "pharmacy": {"amenity": "pharmacy"},
}

print("Downloading boundary...")
boundary = ox.geocode_to_gdf(PLACE).geometry.iloc[0]

rows = []

for category, tag in TAGS.items():
    print(f"Downloading {category} ...")
    gdf = ox.features_from_polygon(boundary, tag)
    gdf = gdf[gdf.geometry.type == "Point"]

    # CRITICAL: keep only REAL names
    gdf = gdf[gdf["name"].notna()]

    for _, r in gdf.iterrows():
        rows.append({
            "business_id": f"osm_{r['name']}_{category}",
            "name": r["name"],
            "categories": category,
            "latitude": r.geometry.y,
            "longitude": r.geometry.x,
        })

df = pd.DataFrame(rows)
df.to_parquet("item_meta.parquet", index=False)

print("Total POIs:", len(df))


import pandas as pd
df = pd.read_parquet("item_meta.parquet")
print(df[df["categories"] == "hospital"].head(10))