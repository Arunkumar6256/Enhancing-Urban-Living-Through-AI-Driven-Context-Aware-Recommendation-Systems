# # backend/schemas.py
# from pydantic import BaseModel, EmailStr, Field
# from typing import Optional

# class SignupRequest(BaseModel):
#     firstname: str = Field(..., min_length=1)
#     lastname: str = Field(..., min_length=1)
#     emailid: EmailStr
#     address: Optional[str] = None
#     username: str = Field(..., min_length=3)
#     password: str = Field(..., min_length=8)
#     occupation: Optional[str] = None

# class SignupResponse(BaseModel):
#     id: int
#     username: str
#     emailid: EmailStr

# class Token(BaseModel):
#     access_token: str
#     token_type: str = "bearer"

# class LoginRequest(BaseModel):
#     username: str
#     password: str
# backend/schemas.py
from pydantic import BaseModel, EmailStr, Field
from typing import Optional

# -------------------------
# Signup
# -------------------------
class SignupRequest(BaseModel):
    firstname: str = Field(..., min_length=1)
    lastname: str = Field(..., min_length=1)
    emailid: EmailStr
    address: Optional[str] = None

    username: str = Field(..., min_length=3)
    password: str = Field(..., min_length=8)

    # legacy (kept for backward compatibility)
    occupation: Optional[str] = None

    # 🔥 new dynamic profile fields
    profession: Optional[str] = None        # student, farmer, doctor, etc.
    education_level: Optional[str] = None   # school / college / graduate
    interests: Optional[str] = None          # comma separated


class SignupResponse(BaseModel):
    id: int
    username: str
    emailid: EmailStr


# -------------------------
# Auth / Token
# -------------------------
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    username: str
    password: str
