import pandas as pd
import os

csv_path = "hyderabad_synthetic_20k.csv"

# The IDs we added
added_ids = [
    "dundigal_police_1",
    "hyd_central_uni",
    "sec_rail_stn",
    "mgbs_bus_stn",
    "ghmc_ho",
    "jntuh_college",
    "meeseva_dundigal"
]

if not os.path.exists(csv_path):
    print(f"File not found: {csv_path}")
    exit(1)

print(f"Loading {csv_path}...")
df = pd.read_csv(csv_path)
print(f"Shape before: {df.shape}")

# Filter out the added IDs
df_clean = df[~df["business_id"].isin(added_ids)]

print(f"Shape after: {df_clean.shape}")

df_clean.to_csv(csv_path, index=False)
print("Restored original dataset.")
