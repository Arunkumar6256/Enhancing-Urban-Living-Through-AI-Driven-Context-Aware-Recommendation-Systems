import re
from typing import List
from unidecode import unidecode
import nltk

# --- Ensure common NLTK resources, but tolerate failures ---
def _ensure_nltk_resource(path, short_name=None):
    try:
        nltk.data.find(path)
        return True
    except Exception:
        try:
            name = short_name if short_name else path.split('/')[-1]
            nltk.download(name)
            return True
        except Exception:
            return False

# Try to ensure resources we need (non-fatal)
_ensure_nltk_resource("corpora/stopwords", "stopwords")
_ensure_nltk_resource("tokenizers/punkt", "punkt")
_ensure_nltk_resource("tokenizers/punkt_tab/english", "punkt_tab")
_ensure_nltk_resource("corpora/wordnet", "wordnet")
_ensure_nltk_resource("corpora/omw-1.4", "omw-1.4")

from nltk.corpus import stopwords
from nltk.stem.porter import PorterStemmer

# Attempt to import NLTK tokenizer; if unavailable we'll fallback to a simple tokenizer
try:
    from nltk.tokenize import word_tokenize, sent_tokenize
    _NLTK_TOKENIZE_AVAILABLE = True
except Exception:
    _NLTK_TOKENIZE_AVAILABLE = False

# Lazy lemmatizer init and stemmer
_LEMMATIZER = None
_STEMMER = PorterStemmer()

try:
    _STOPWORDS = set(stopwords.words("english"))
except Exception:
    _STOPWORDS = set()

_RE_NON_ASCII = re.compile(r"[^A-Za-z\s]")
_RE_MULTI_SPACE = re.compile(r"\s+")

def _ensure_lemmatizer():
    global _LEMMATIZER
    if _LEMMATIZER is None:
        try:
            from nltk.stem import WordNetLemmatizer
            nltk.data.find("corpora/wordnet")
            _LEMMATIZER = WordNetLemmatizer()
        except Exception:
            _LEMMATIZER = None

def transliterate_to_ascii(s: str) -> str:
    if s is None:
        return ""
    return unidecode(str(s))

def _simple_tokenize(s: str) -> List[str]:
    # fallback tokenizer: split on whitespace and punctuation cleanup
    s = re.sub(r"[^\w\s]", " ", s)
    tokens = [t for t in s.split() if t.isalpha()]
    return tokens

def clean_text_for_tfidf(s: str, do_lemmatize: bool = True, remove_stopwords: bool = True) -> str:
    """
    Clean a string for TF-IDF:
    - transliterate -> ascii
    - lowercase
    - remove non-letter chars
    - tokenize -> lemmatize/stem -> stopword removal
    Returns cleaned tokens joined by space (string).
    """
    if not s:
        return ""
    s = transliterate_to_ascii(s)
    s = s.lower()
    s = _RE_NON_ASCII.sub(" ", s)
    s = _RE_MULTI_SPACE.sub(" ", s).strip()

    # Tokenize (prefer NLTK)
    if _NLTK_TOKENIZE_AVAILABLE:
        try:
            tokens = word_tokenize(s)
        except Exception:
            tokens = _simple_tokenize(s)
    else:
        tokens = _simple_tokenize(s)

    out_tokens = []
    if do_lemmatize:
        _ensure_lemmatizer()
    for t in tokens:
        if not t.isalpha():
            continue
        if remove_stopwords and t in _STOPWORDS:
            continue
        if do_lemmatize and _LEMMATIZER is not None:
            t2 = _LEMMATIZER.lemmatize(t)
        else:
            t2 = _STEMMER.stem(t)
        if t2:
            out_tokens.append(t2)
    return " ".join(out_tokens)

def tokenizer_for_vectorizer(s: str, do_lemmatize: bool = True, remove_stopwords: bool = True) -> List[str]:
    """
    Tokenizer that returns a list of tokens for TfidfVectorizer.
    """
    cleaned = clean_text_for_tfidf(s, do_lemmatize=do_lemmatize, remove_stopwords=remove_stopwords)
    return cleaned.split() if cleaned else []

# ---------------------------
# Picklable wrappers (stable module path)
# ---------------------------
def vectorizer_tokenizer(s):
    """Picklable wrapper used by TfidfVectorizer (stable import path: text_preproc.vectorizer_tokenizer)."""
    return tokenizer_for_vectorizer(s, do_lemmatize=True, remove_stopwords=True)

def vectorizer_preprocessor(s):
    """Picklable wrapper used by TfidfVectorizer (stable import path: text_preproc.vectorizer_preprocessor)."""
    return s if isinstance(s, str) else ""

# Aliases to be extra safe (in case old pickles refer to underscored names)
_vectorizer_tokenizer = vectorizer_tokenizer
_vectorizer_preprocessor = vectorizer_preprocessor
