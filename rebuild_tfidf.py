import os, joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer

ART = 'recommender_artifacts'
os.makedirs(ART, exist_ok=True)

base_csv = os.path.join(ART, 'business_clean.csv')
if not os.path.exists(base_csv):
    raise SystemExit('Error: base business_clean.csv not found in recommender_artifacts.')

df_base = pd.read_csv(base_csv)

# load hyderabad OSM if present
extra_frames = []
if os.path.exists('hyderabad_osm_pois.csv'):
    extra_frames.append(pd.read_csv('hyderabad_osm_pois.csv'))

# if you created other CSVs (e.g., hyderabad_synthetic.csv), add them similarly
if os.path.exists('hyderabad_synthetic.csv'):
    extra_frames.append(pd.read_csv('hyderabad_synthetic.csv'))

if extra_frames:
    df_all = pd.concat([df_base] + extra_frames, ignore_index=True)
else:
    df_all = df_base

# Ensure required columns exist
for c in ['business_id','name','categories','latitude','longitude','rating','review_count','city','state','address']:
    if c not in df_all.columns:
        df_all[c] = ''

# create combined_text for TF-IDF
df_all['combined_text'] = df_all['name'].fillna('') + ' | ' + df_all['categories'].fillna('') + ' | ' + df_all['address'].fillna('')

# Save item metadata (parquet)
meta_path = os.path.join(ART, 'item_meta.parquet')
df_all[['business_id','name','categories','latitude','longitude','rating','review_count','city','state','address']].to_parquet(meta_path, index=False)
print('Saved item_meta.parquet with', len(df_all), 'rows at', meta_path)

# Build TF-IDF
vectorizer = TfidfVectorizer(max_features=20000, ngram_range=(1,2), stop_words='english')
tfidf_matrix = vectorizer.fit_transform(df_all['combined_text'].astype(str))
joblib.dump(vectorizer, os.path.join(ART, 'tfidf_vectorizer.joblib'), compress=3)
joblib.dump(tfidf_matrix, os.path.join(ART, 'tfidf_matrix.joblib'), compress=3)
print('Built TF-IDF artifacts and saved to', ART)
