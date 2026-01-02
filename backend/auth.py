# backend/auth.py
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os
import re
import logging

load_dotenv()
logger = logging.getLogger(__name__)

# Safe imports
try:
    from . import db, models, schemas
except Exception as e:
    logger.exception("Could not import db/models/schemas: %s", e)
    db = None
    models = None
    schemas = None

router = APIRouter(prefix="/auth", tags=["auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-secret")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRES_MINUTES = int(os.getenv("JWT_EXPIRES_MINUTES", "60"))

PASSWORD_RE = re.compile(
    r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$'
)

# ======================================================
# Security scheme (THIS enables Swagger Authorize 🔒)
# ======================================================
security = HTTPBearer()

def get_current_user_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    if credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid authentication scheme")
    return credentials.credentials

# ======================================================
# Utility functions
# ======================================================
def get_password_hash(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=JWT_EXPIRES_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

# ======================================================
# Signup
# ======================================================
@router.post("/signup", response_model=schemas.SignupResponse)
def signup(req: schemas.SignupRequest):

    if db is None or models is None:
        raise HTTPException(status_code=500, detail="Server DB not configured.")

    if not PASSWORD_RE.match(req.password):
        raise HTTPException(
            status_code=400,
            detail="Password must include upper, lower, number, and special char."
        )

    if len(req.password.encode("utf-8")) > 72:
        raise HTTPException(status_code=400, detail="Password too long.")

    dbs = next(db.get_db())

    existing = dbs.query(models.User).filter(
        (models.User.username == req.username) |
        (models.User.emailid == req.emailid)
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="User already exists.")

    hashed = get_password_hash(req.password)

    user = models.User(
        firstname=req.firstname,
        lastname=req.lastname,
        emailid=req.emailid.lower(),
        address=req.address,
        username=req.username,
        hashed_password=hashed,
        occupation=req.occupation,
        profession=req.profession,
        education_level=req.education_level,
        interests=req.interests
    )

    dbs.add(user)
    dbs.commit()
    dbs.refresh(user)

    return {
        "id": user.id,
        "username": user.username,
        "emailid": user.emailid
    }

# ======================================================
# Login
# ======================================================
@router.post("/login", response_model=schemas.Token)
def login(req: schemas.LoginRequest):

    if db is None or models is None:
        raise HTTPException(status_code=500, detail="Server DB not configured.")

    dbs = next(db.get_db())
    user = dbs.query(models.User).filter(
        models.User.username == req.username
    ).first()

    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({
        "sub": user.username,
        "user_id": user.id,
        "profession": user.profession
    })

    return {
        "access_token": token,
        "token_type": "bearer"
    }
