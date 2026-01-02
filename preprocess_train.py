# preprocess_train.py
# Usage:
#  python preprocess_train.py --input ./yelp_academic_dataset_business.json --out ./recommender_artifacts
#  python preprocess_train.py --input ./hyderabad_osm_pois_en.csv --out ./recommender_artifacts

import os
import json
import argparse
from pathlib import Path

import pandas as pd
import numpy as np
import joblib

from sklearn.feature_extraction.text import TfidfVectorizer

# Import stable wrappers from text_preproc (these must be module-level and picklable)
from text_preproc import vectorizer_tokenizer, vectorizer_preprocessor

# -------------------------
# Arg parsing & helpers
# -------------------------
def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument("--input", required=True, help="Path to input JSONL/JSON/CSV/Parquet file")
    p.add_argument("--out", default="./recommender_artifacts", help="Output folder for artifacts")
    return p.parse_args()

def safe_float(x):
    try:
        return float(x)
    except Exception:
        return np.nan

# -------------------------
# Input loader
# -------------------------
def load_input(path: Path) -> pd.DataFrame:
    """
    Support:
      - newline-delimited JSON (JSONL)
      - JSON array file
      - CSV
      - Parquet
    Returns a pandas DataFrame.
    """
    if not path.exists():
        raise FileNotFoundError(f"Input path not found: {path}")
    suffix = path.suffix.lower()
    if suffix in [".csv"]:
        print("Loading CSV input...")
        return pd.read_csv(path)
    if suffix in [".parquet", ".parq"]:
        print("Loading Parquet input...")
        return pd.read_parquet(path)

    # try JSON/JSONL
    print("Attempting to load JSON / JSONL input...")
    records = []
    with open(path, "r", encoding="utf-8") as f:
        first = f.readline()
        if not first:
            return pd.DataFrame()
        # detect JSON array (starts with '[') vs JSON lines
        if first.lstrip().startswith("["):
            # full JSON array
            f.seek(0)
            try:
                arr = json.load(f)
                if isinstance(arr, list):
                    records = arr
                else:
                    raise ValueError("JSON root is not a list")
            except Exception as e:
                raise ValueError(f"Failed to parse JSON array: {e}")
        else:
            # JSONL: first line is already read
            try:
                records.append(json.loads(first))
            except json.JSONDecodeError:
                # maybe single-line JSON object: attempt parse full file
                f.seek(0)
                try:
                    obj = json.load(f)
                    if isinstance(obj, list):
                        records = obj
                    else:
                        records = [obj]
                except Exception as e:
                    raise ValueError(f"Failed to parse JSONL or JSON: {e}")
            else:
                # read remaining lines
                for line in f:
                    line = line.strip()
                    if not line:
                        continue
                    try:
                        records.append(json.loads(line))
                    except json.JSONDecodeError:
                        # skip bad lines
                        continue
    print(f"Parsed {len(records)} JSON records.")
    return pd.DataFrame(records)

# -------------------------
# Normalization
# -------------------------
def build_rows_from_yelp_like(df_raw: pd.DataFrame) -> pd.DataFrame:
    """
    Normalize a dataframe built from Yelp-like JSON records into the columns we care about.
    This function is permissive and will handle rows that already have those fields (e.g., CSV from OSM).
    """
    rows = []
    for _, r in df_raw.iterrows():
        # r may be a dict-like or a Series
        if isinstance(r, dict):
            rec = r
        else:
            rec = r.to_dict()

        bid = rec.get("business_id") or rec.get("osm_id") or rec.get("id") or None
        name = rec.get("name", "") or ""
        # prefer name_en if present
        name_en = rec.get("name_en") or rec.get("name_en_lc") or ""
        cats = rec.get("categories") or rec.get("category") or ""
        if isinstance(cats, list):
            cats = ", ".join(cats)
        latitude = rec.get("latitude") or rec.get("lat") or rec.get("y") or None
        longitude = rec.get("longitude") or rec.get("lon") or rec.get("x") or None
        rating = rec.get("stars") or rec.get("rating") or None
        review_count = rec.get("review_count", 0) or 0
        city = rec.get("city") or rec.get("town") or ""
        state = rec.get("state") or rec.get("region") or ""
        attributes = rec.get("attributes") or rec.get("tags") or {}
        # flatten attributes
        attr_s = []
        if isinstance(attributes, dict):
            for k, v in attributes.items():
                if isinstance(v, dict):
                    for k2, v2 in v.items():
                        attr_s.append(f"{k}_{k2}:{v2}")
                else:
                    attr_s.append(f"{k}:{v}")
        elif isinstance(attributes, list):
            attr_s = [str(a) for a in attributes]
        else:
            # string or other
            if attributes:
                attr_s = [str(attributes)]

        # choose display name preferring name_en
        final_name = name_en if name_en else name

        combined_text = " | ".join([str(final_name), str(cats), "; ".join(attr_s)])

        rows.append({
            "business_id": bid,
            "name": name,
            "name_en": name_en,
            "name_for_index": final_name,
            "categories": cats,
            "latitude": safe_float(latitude),
            "longitude": safe_float(longitude),
            "rating": safe_float(rating),
            "review_count": int(review_count) if review_count is not None else 0,
            "city": city,
            "state": state,
            "attributes": "; ".join(attr_s),
            "combined_text": combined_text
        })
    out = pd.DataFrame(rows)
    # drop rows without id
    out = out.dropna(subset=["business_id"])
    return out

# -------------------------
# Main
# -------------------------
def main():
    args = parse_args()
    IN = Path(args.input)
    OUT = Path(args.out)
    OUT.mkdir(parents=True, exist_ok=True)

    print(f"Loading input from: {IN}")
    df_raw = load_input(IN)
    print(f"Raw shape: {df_raw.shape}")

    # Build normalized rows
    df = build_rows_from_yelp_like(df_raw)
    print("After normalization rows:", df.shape)

    # Filter missing lat/lon - most recommenders need geometry
    before = df.shape[0]
    df = df[~(df["latitude"].isnull() | df["longitude"].isnull())].reset_index(drop=True)
    print(f"Filtered lat/lon: {before} -> {df.shape[0]} rows remain")

    if df.empty:
        raise SystemExit("No rows left after filtering. Check your input file and fields.")

    # Save a cleaned CSV for inspection
    df.to_csv(OUT / "business_clean.csv", index=False)
    print("Saved business_clean.csv")

    # Build TF-IDF vectorizer (use stable wrappers from text_preproc)
    print("Building TF-IDF vectorizer (this may take a while)...")
    vectorizer = TfidfVectorizer(
        max_features=20000,
        ngram_range=(1, 2),
        tokenizer=vectorizer_tokenizer,
        preprocessor=vectorizer_preprocessor,
        lowercase=False,
        token_pattern=None
    )

    tfidf_matrix = vectorizer.fit_transform(df["combined_text"].astype(str))
    print("TF-IDF built. Matrix shape:", tfidf_matrix.shape)

    # Save artifacts
    joblib.dump(vectorizer, OUT / "tfidf_vectorizer.joblib", compress=3)
    joblib.dump(tfidf_matrix, OUT / "tfidf_matrix.joblib", compress=3)
    print("Saved TF-IDF artifacts.")

    # Save metadata for quick loads
    meta_cols = [
        "business_id", "name", "name_en", "name_for_index", "categories",
        "latitude", "longitude", "rating", "review_count", "city", "state", "attributes"
    ]
    df[meta_cols].to_parquet(OUT / "item_meta.parquet", index=False)
    print("Saved item_meta.parquet")

    print("All artifacts saved to:", OUT)


if __name__ == "__main__":
    main()
