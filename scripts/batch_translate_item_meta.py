# --- auto-add project root to sys.path so `import backend` works when run as a script ---
import sys, os
proj_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if proj_root not in sys.path:
    sys.path.insert(0, proj_root)
# --- end auto-fix ---# scripts/batch_translate_item_meta.py
"""
Translate item_meta.parquet 'name' -> 'name_en' using Google Translate (service account).
Backs up original parquet before writing.
"""
from pathlib import Path
import pandas as pd
import math
import shutil
import sys
from backend.translate import translate_texts, transliterate_name, _NON_LATIN_RE

ROOT = Path(".").resolve()
ART_DIR = ROOT / "recommender_artifacts"
META = ART_DIR / "item_meta.parquet"
META_BAK = ART_DIR / "item_meta.parquet.bak"

CHUNK = 100  # texts per translate request

def main(target_lang="hi"):
    if not META.exists():
        print("Error: metadata parquet not found at", META)
        sys.exit(1)

    df = pd.read_parquet(META)
    n = len(df)
    print("Loaded metadata rows:", n)

    # Ensure name_en exists (create empty)
    if "name_en" not in df.columns:
        df["name_en"] = None

    # Build list of indices to translate:
    idxs = []
    texts = []
    for i, row in df.iterrows():
        name = row.get("name") or ""
        name_en = row.get("name_en")
        # If already filled with non-empty value, skip
        if name_en and str(name_en).strip():
            continue
        # If name is empty, fallback from categories later
        if not name or not str(name).strip():
            continue
        # If name contains non-latin script, attempt transliteration first:
        if _NON_LATIN_RE.search(str(name)):
            translit = transliterate_name(name)
            if translit and str(translit).strip():
                df.at[i, "name_en"] = translit
                continue
            # otherwise schedule for translation of name (English canonical might be empty)
        # schedule for translation of name
        idxs.append(i)
        texts.append(str(name))

    print(f"Scheduled {len(texts)} names for translation (target={target_lang})")

    # Batch translate
    from backend.translate import translate_texts
    for start in range(0, len(texts), CHUNK):
        batch_texts = texts[start : start + CHUNK]
        translated = translate_texts(batch_texts, target_lang)
        for j, t in enumerate(translated):
            i = idxs[start + j]
            df.at[i, "name_en"] = t

        print(f"Translated {min(start+CHUNK, len(texts))}/{len(texts)}")

    # Final fallback: fill empty name_en from categories or original name
    def fallback(row):
        if row.get("name_en") and str(row.get("name_en")).strip():
            return row.get("name_en")
        cats = row.get("categories") or row.get("amenity") or ""
        if isinstance(cats, str):
            low = cats.lower()
            if "police" in low: return "Police Station"
            if "hospital" in low or "clinic" in low: return "Hospital"
            if "pharmacy" in low: return "Pharmacy"
            if "restaurant" in low: return "Restaurant"
        name = row.get("name") or ""
        if name and str(name).strip(): return name
        return "Place"

    print("Filling fallback names for any remaining empty name_en...")
    df["name_en"] = df.apply(lambda r: fallback(r), axis=1)

    # Backup parquet
    print("Backing up original parquet to", META_BAK)
    shutil.copy2(META, META_BAK)

    # Write updated parquet
    print("Writing updated metadata to", META)
    df.to_parquet(META, index=False)
    print("Done. Updated metadata has name_en populated. Restart backend.")
    return 0

if __name__ == "__main__":
    import argparse
    p = argparse.ArgumentParser()
    p.add_argument("--lang", default="en", help="Target language code (e.g., hi, ar). name_en will be English if 'en'")
    args = p.parse_args()
    # If user wants name_en in English (en), we can set target_lang='en' and skip translate_texts;
    # but script expects e.g., 'en' to mean keep english: for translation to other languages pass that code.
    main(target_lang="en")

