# # backend/translate.py
# """
# Translation & transliteration helper.

# Usage:
#   from backend.translate import translate_results, detect_target_lang

# translate_results(results, target_lang) -> results with translated display fields.

# Behavior:
# - If GOOGLE_API_KEY/GOOGLE_APPLICATION_CREDENTIALS exists, uses Google Translate.
# - Else attempts to use transformers MarianMT models for en -> <lang> if transformers installed.
# - Caches translations (LRU).
# - Uses unidecode to transliterate original non-latin names when possible.
# """

# import os
# import functools
# from typing import List, Dict, Any, Optional
# import re

# # caching
# from functools import lru_cache

# # fallback transliteration
# try:
#     from unidecode import unidecode
# except Exception:
#     def unidecode(x):  # type: ignore
#         return x

# # Try google cloud translate client (optional, high quality)
# _GOOGLE_AVAILABLE = False
# try:
#     from google.cloud import translate_v2 as google_translate
#     _GOOGLE_AVAILABLE = True
# except Exception:
#     _GOOGLE_AVAILABLE = False

# # Try local transformers (optional, heavy)
# _TRANSFORMERS_AVAILABLE = False
# try:
#     from transformers import MarianMTModel, MarianTokenizer, pipeline
#     _TRANSFORMERS_AVAILABLE = True
# except Exception:
#     _TRANSFORMERS_AVAILABLE = False

# # small map of en->target model names (Helsinki OPUS)
# # add more pairs as needed
# _MARIAN_MODELS = {
#     "hi": "Helsinki-NLP/opus-mt-en-hi",
#     "fr": "Helsinki-NLP/opus-mt-en-fr",
#     "es": "Helsinki-NLP/opus-mt-en-es",
#     "de": "Helsinki-NLP/opus-mt-en-de",
#     "ar": "Helsinki-NLP/opus-mt-en-ar",
#     "pt": "Helsinki-NLP/opus-mt-en-pt",
#     "bn": "Helsinki-NLP/opus-mt-en-bn",
#     "ru": "Helsinki-NLP/opus-mt-en-ru"
# }

# _NON_LATIN_RE = re.compile(r"[\u0600-\u06FF\u0750-\u077F\u0590-\u05FF\u0400-\u04FF\u0900-\u097F\u4e00-\u9fff]")

# # small LRU caches for translations
# @lru_cache(maxsize=20000)
# def _cache_translate_text_backend(text: str, target_lang: str, backend_name: str) -> str:
#     # placeholder - actual backend implementations below will use decorated functions
#     return text

# def detect_target_lang(accept_language_header: Optional[str], explicit_lang: Optional[str]) -> str:
#     # explicit param wins
#     if explicit_lang:
#         return explicit_lang.split("-")[0].lower()
#     if not accept_language_header:
#         return "en"
#     # parse Accept-Language: pick first two-letter code
#     parts = accept_language_header.split(",")
#     if not parts:
#         return "en"
#     first = parts[0].strip().split(";")[0]
#     return first.split("-")[0].lower()

# # --- backend implementations ---

# def _translate_with_google(texts: List[str], target_lang: str) -> List[str]:
#     """Use google.cloud.translate_v2 client. Expects GOOGLE_APPLICATION_CREDENTIALS set or env credentials set."""
#     client = google_translate.Client()
#     # batch translate
#     translated = client.translate(texts, target_language=target_lang, format_="text")
#     out = []
#     for item in translated:
#         out.append(item.get("translatedText"))
#     return out

# # simple transformer-based translator wrapper (batch)
# # We'll create per-lang pipelines cached in global dict
# _transformer_pipelines = {}

# def _translate_with_transformers(texts: List[str], target_lang: str) -> List[str]:
#     model_name = _MARIAN_MODELS.get(target_lang)
#     if not model_name:
#         # no model known for target_lang; return original text
#         return texts
#     if target_lang not in _transformer_pipelines:
#         # load pipeline (this downloads models the first time)
#         _transformer_pipelines[target_lang] = pipeline("translation", model=model_name, tokenizer=model_name)
#     pipe = _transformer_pipelines[target_lang]
#     out = []
#     # pipeline handles batching but we'll map each input to output
#     results = pipe(texts)
#     for r in results:
#         # r can be {'translation_text': '...'}
#         if isinstance(r, dict):
#             out.append(r.get("translation_text", ""))
#         else:
#             out.append(str(r))
#     return out

# # decide which backend to use
# def _available_backend():
#     # prefer google if configured
#     if _GOOGLE_AVAILABLE and (os.environ.get("GOOGLE_APPLICATION_CREDENTIALS") or os.environ.get("GOOGLE_API_KEY")):
#         return "google"
#     if _TRANSFORMERS_AVAILABLE:
#         return "transformers"
#     return "none"

# def translate_texts(texts: List[str], target_lang: str) -> List[str]:
#     """
#     Translate a list of texts into target_lang using selected backend. Caches results.
#     """
#     backend = _available_backend()
#     # do not translate to english
#     if not target_lang or target_lang == "en":
#         return texts

#     cache_key = ("txt", tuple(texts), target_lang, backend)
#     # Use simple per-call caching via lru_cache wrapper function: create a hashable string
#     out = []
#     if backend == "google":
#         # batch call
#         try:
#             out = _translate_with_google(texts, target_lang)
#         except Exception as e:
#             # fallback to no translation
#             out = texts
#     elif backend == "transformers":
#         try:
#             out = _translate_with_transformers(texts, target_lang)
#         except Exception:
#             out = texts
#     else:
#         # no backend available, return original
#         out = texts
#     # final safety: ensure same length
#     if len(out) != len(texts):
#         out = texts
#     return out

# def transliterate_name(name: str) -> str:
#     """
#     Transliterate non-Latin name to Latin/ASCII using unidecode.
#     If name is already Latin, returns it unchanged.
#     """
#     if not name:
#         return name
#     if _NON_LATIN_RE.search(name):
#         try:
#             cand = unidecode(name)
#             if cand and isinstance(cand, str) and len(cand.strip())>0:
#                 return cand
#         except Exception:
#             pass
#     return name

# def translate_results(results: List[Dict[str, Any]], target_lang: str, translate_fields: Optional[List[str]] = None) -> List[Dict[str, Any]]:
#     """
#     Translate display fields inside recommender results.
#     - results: list of dicts (each has keys: name, original_name, categories, components,...)
#     - target_lang: 'hi','fr', etc.
#     - translate_fields: list of fields to translate (by default: ['name','categories'])
#     Policy:
#     - For 'name': if original_name contains non-Latin script, transliterate original_name and use that (not translation).
#       Else translate the English name.
#     - categories: translate via translate_texts (comma-separated parts translated individually).
#     - components: numeric; not translated.
#     """
#     if not target_lang or target_lang == "en":
#         return results

#     if translate_fields is None:
#         translate_fields = ["name", "categories"]

#     # Prepare batches
#     names_to_translate = []
#     name_indexes = []
#     cats_to_translate = []
#     cat_indexes = []

#     # Prepare placeholder arrays
#     for i, r in enumerate(results):
#         # name handling: prefer to transliterate if original_name non-latin
#         orig = r.get("original_name") or ""
#         name_en = r.get("name") or ""
#         if _NON_LATIN_RE.search(str(orig)):
#             # transliterate original_name
#             translit = transliterate_name(orig)
#             # if translit meaningful and contains ascii letters, use it and DON'T translate
#             if translit and re.search(r"[A-Za-z0-9]", translit):
#                 r["name_translated"] = translit
#             else:
#                 # fallback: translate name_en
#                 names_to_translate.append(name_en)
#                 name_indexes.append(i)
#         else:
#             # original_name not non-Latin -> translate name_en
#             names_to_translate.append(name_en)
#             name_indexes.append(i)

#         # categories handling
#         cats = r.get("categories") or ""
#         if cats and isinstance(cats, str):
#             # translate as whole or per-part. We'll translate the whole string to preserve language flow
#             cats_to_translate.append(cats)
#             cat_indexes.append(i)
#         else:
#             # nothing to do
#             pass

#     # translate names batch
#     if names_to_translate:
#         translated_names = translate_texts(names_to_translate, target_lang)
#         for idx, val in enumerate(translated_names):
#             i = name_indexes[idx]
#             results[i]["name_translated"] = val

#     # translate categories batch
#     if cats_to_translate:
#         translated_cats = translate_texts(cats_to_translate, target_lang)
#         for idx, val in enumerate(translated_cats):
#             i = cat_indexes[idx]
#             results[i]["categories_translated"] = val

#     # finalize: for each result, set fields
#     out = []
#     for r in results:
#         out_r = r.copy()
#         # set display_name field according to translation
#         if "name_translated" in r and r["name_translated"]:
#             out_r["display_name"] = r["name_translated"]
#         else:
#             out_r["display_name"] = r.get("name")  # fallback
#         # categories
#         if "categories_translated" in r and r["categories_translated"]:
#             out_r["categories_display"] = r["categories_translated"]
#         else:
#             out_r["categories_display"] = r.get("categories")
#         out.append(out_r)
#     return out


# backend/translate.py
"""
Google Translate backed helper + transliteration fallback.

Requires:
  - pip install google-cloud-translate pandas Unidecode
  - GOOGLE_APPLICATION_CREDENTIALS env var set to service account JSON

Functions:
  - translate_texts(texts, target_lang) -> list of translated strings
  - transliterate_name(name) -> transliterated ascii (uses Unidecode)
  - translate_results(results, target_lang) -> results with display_name/categories_display fields
"""

import os
import math
from typing import List, Dict, Any, Optional
import re
from functools import lru_cache

# transliteration
try:
    from unidecode import unidecode
except Exception:
    def unidecode(x):
        return x

# Google Translate client (v3)
_GOOGLE_AVAILABLE = False
try:
    # modern client
    from google.cloud import translate_v2 as translate_v2_client  # fallback v2
    _GOOGLE_AVAILABLE = True
except Exception:
    try:
        from google.cloud import translate
        _GOOGLE_AVAILABLE = True
    except Exception:
        _GOOGLE_AVAILABLE = False

# non-latin detection (common scripts)
_NON_LATIN_RE = re.compile(
    r"[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\u0590-\u05FF\u0400-\u04FF\u0900-\u097F\u4e00-\u9fff]"
)

# ---------- Google translate using translate_v2 client (if available) ----------
def _chunk_list(lst, n):
    """Yield successive n-sized chunks from list."""
    for i in range(0, len(lst), n):
        yield lst[i:i+n]

def _translate_with_google_v2(texts: List[str], target_lang: str, batch_size: int = 100) -> List[str]:
    """
    Uses google.cloud.translate_v2 client which provides translate(texts, target_language=...).
    batch_size default=100 (sensible).
    """
    client = translate_v2_client.Client()
    out = []
    for chunk in _chunk_list(texts, batch_size):
        # google supports list input
        resp = client.translate(chunk, target_language=target_lang, format_="text")
        # resp is a list of dicts
        for item in resp:
            translated = item.get("translatedText")
            out.append(translated)
    return out

# top-level function
def translate_texts(texts: List[str], target_lang: str) -> List[str]:
    """
    Translate a list of texts into target_lang using Google Translate.
    If Google is unavailable or target_lang is 'en' or empty, returns texts unchanged.
    """
    if not target_lang or target_lang.lower() == "en":
        return texts
    if not _GOOGLE_AVAILABLE:
        # fallback: return original texts if Google client missing
        return texts

    # Clean inputs: ensure strings
    inputs = [("" if t is None else str(t)) for t in texts]
    try:
        translated = _translate_with_google_v2(inputs, target_lang, batch_size=100)
        # safety: ensure length matches
        if len(translated) != len(inputs):
            return inputs
        return translated
    except Exception as e:
        # On any error, do not crash — return originals
        print("Warning: Google translate error:", repr(e))
        return inputs

def transliterate_name(name: str) -> str:
    """
    Transliterate non-Latin letters to ASCII using unidecode.
    If name appears Latin, returns unchanged.
    """
    if name is None:
        return name
    try:
        if _NON_LATIN_RE.search(str(name)):
            out = unidecode(name)
            if out and isinstance(out, str):
                return out
    except Exception:
        pass
    return name

# ---------- result-level translation ----------
def translate_results(results: List[Dict[str, Any]], target_lang: str) -> List[Dict[str, Any]]:
    """
    Translate results (list of dicts) into target_lang.
    Adds:
      - display_name (translated or transliterated)
      - categories_display (translated categories string)
    """
    if not target_lang or target_lang.lower() == "en":
        # set display_name = name, categories_display = categories
        for r in results:
            r["display_name"] = r.get("name")
            r["categories_display"] = r.get("categories")
        return results

    # Prepare batches
    names_to_translate = []
    name_indexes = []
    cats_to_translate = []
    cat_indexes = []

    for i, r in enumerate(results):
        orig = r.get("original_name") or ""
        name_en = r.get("name") or ""
        # If original_name contains non-latin script, transliterate that and prefer it
        if _NON_LATIN_RE.search(str(orig)):
            translit = transliterate_name(orig)
            if translit and re.search(r"[A-Za-z0-9]", translit):
                r["display_name"] = translit
            else:
                # schedule name_en for translation
                names_to_translate.append(name_en)
                name_indexes.append(i)
        else:
            # original_name seems Latin, translate the canonical English name
            names_to_translate.append(name_en)
            name_indexes.append(i)

        cats = r.get("categories") or ""
        if cats and isinstance(cats, str):
            cats_to_translate.append(cats)
            cat_indexes.append(i)

    # Translate names
    if names_to_translate:
        tnames = translate_texts(names_to_translate, target_lang)
        for idx, txt in enumerate(tnames):
            i = name_indexes[idx]
            results[i]["display_name"] = txt

    # Translate categories
    if cats_to_translate:
        tcats = translate_texts(cats_to_translate, target_lang)
        for idx, txt in enumerate(tcats):
            i = cat_indexes[idx]
            results[i]["categories_display"] = txt

    # Fill any remaining with fallbacks
    for r in results:
        if "display_name" not in r or not r["display_name"]:
            r["display_name"] = r.get("name")
        if "categories_display" not in r or not r["categories_display"]:
            r["categories_display"] = r.get("categories")

    return results
