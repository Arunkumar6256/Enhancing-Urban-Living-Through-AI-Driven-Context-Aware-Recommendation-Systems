from sqlalchemy import Column, Integer, String, Date, Text, DateTime, func
from .db import Base

class Service(Base):
    __tablename__ = "services"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True)

    service_name = Column(String(255), nullable=False)
    service_type = Column(String(100), nullable=True)

    description = Column(Text)

    target_professions = Column(String(255))   # student, farmer
    relevance_tags = Column(String(255))       # education, finance

    expiry_date = Column(Date)                 # ✅ MUST MATCH DB EXACTLY
    location_scope = Column(String(50))

    status = Column(String(20), default="active")

    created_at = Column(DateTime, server_default=func.now())
    website_url = Column("website_url", String(512), nullable=True)

