# # backend/models.py
# from sqlalchemy import Column, Integer, String, DateTime, func
# from .db import Base

# class User(Base):
#     __tablename__ = "users"

#     id = Column(Integer, primary_key=True, index=True)
#     firstname = Column(String(128), nullable=False)
#     lastname = Column(String(128), nullable=False)
#     emailid = Column(String(256), unique=True, index=True, nullable=False)
#     address = Column(String(1024), nullable=True)
#     username = Column(String(128), unique=True, index=True, nullable=False)
#     hashed_password = Column(String(256), nullable=False)
#     occupation = Column(String(256), nullable=True)
#     created_at = Column(DateTime(timezone=True), server_default=func.now())
# backend/models.py
from sqlalchemy import Column, Integer, String, DateTime, func
from .db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    # Basic identity
    firstname = Column(String(128), nullable=False)
    lastname = Column(String(128), nullable=False)
    emailid = Column(String(256), unique=True, index=True, nullable=False)
    username = Column(String(128), unique=True, index=True, nullable=False)
    hashed_password = Column(String(256), nullable=False)

    # Address & legacy field
    address = Column(String(1024), nullable=True)
    occupation = Column(String(256), nullable=True)  
    # ↑ keep this (legacy / optional)

    # 🔥 New dynamic profile fields (for recommendations)
    profession = Column(String(64), nullable=True)         
    education_level = Column(String(64), nullable=True)    
    interests = Column(String(512), nullable=True)         

    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
