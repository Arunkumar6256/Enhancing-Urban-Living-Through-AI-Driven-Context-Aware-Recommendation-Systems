from fastapi import APIRouter, Depends, HTTPException
from datetime import date
from typing import List
from jose import jwt
import os

from .db import get_db
from .service_models import Service
from .models import User
from .auth import get_current_user_token

router = APIRouter(prefix="/services", tags=["services"])

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-secret")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

@router.get("/recommend/me", response_model=List[dict])
def recommend_services_for_user(
    token: str = Depends(get_current_user_token),
    k: int = 15   # 🔥 show MANY services like Netflix
):
    db = next(get_db())
    today = date.today()

    payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
    user = db.query(User).filter(User.id == payload["user_id"]).first()

    profession = (user.occupation or "").lower()
    interests = (user.interests or "").lower().split(",")

    services = db.query(Service).filter(
        Service.status == "active"
    ).all()

    ranked = []

    for s in services:
        score = 0.3  # 🔥 base exploration score (VERY IMPORTANT)

        # 1️⃣ Profession relevance
        if s.target_professions and profession in s.target_professions.lower():
            score += 0.5

        # 2️⃣ Interest relevance
        if s.relevance_tags:
            tags = s.relevance_tags.lower()
            overlap = sum(1 for i in interests if i.strip() and i.strip() in tags)
            score += min(0.4, overlap * 0.2)

        # 3️⃣ Freshness boost (new services auto-surface)
        if s.created_at:
            days_old = (today - s.created_at.date()).days
            if days_old < 30:
                score += 0.3

        # 4️⃣ Expiry safety
        if s.expiry_date and s.expiry_date < today:
            score -= 1.0  # hard penalty

        ranked.append({
            "service_name": s.service_name,
            "service_type": s.service_type,
            "description": s.description,
            "website_url": s.website_url, 
            "expiry_date": s.expiry_date,
            "location_scope": s.location_scope,
            "score": round(score, 2)
        })

    # 🔥 Netflix-style ranking
    ranked.sort(key=lambda x: x["score"], reverse=True)
    return ranked[:k]

