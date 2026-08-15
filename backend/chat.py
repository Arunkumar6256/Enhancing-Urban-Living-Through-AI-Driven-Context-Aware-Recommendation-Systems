# import requests
# from fastapi import APIRouter, HTTPException
# from backend.recommender import recommend

# router = APIRouter(prefix="/chat", tags=["chat"])

# OLLAMA_URL = "http://localhost:11434/api/generate"
# MODEL = "phi3"

# # ---------------------------------
# # LIMITED EMOTION → SERVICE MAP
# # ---------------------------------
# EMOTION_SERVICE_MAP = {
#     "robbed": "police station",
#     "stolen": "police station",

#     "sick": "hospital",
#     "ill": "hospital",
#     "pain": "hospital",

#     "hungry": "restaurant",
#     "food": "restaurant",
#     "biryani": "restaurant"
# }

# SERVICE_KEYWORDS = [
#     "hospital",
#     "police station",
#     "police",
#     "restaurant",
#     "school",
#     "bank",
#     "pharmacy"
# ]

# # ---------------------------------
# # Helpers
# # ---------------------------------
# def detect_service(message: str):
#     msg = message.lower()

#     for k, v in EMOTION_SERVICE_MAP.items():
#         if k in msg:
#             return v

#     for s in SERVICE_KEYWORDS:
#         if s in msg:
#             return s

#     return None

# def normalize_service(service: str):
#     service = service.lower().strip()
#     if service.endswith("s"):
#         return service[:-1]
#     return service


# # ---------------------------------
# # CHAT ENDPOINT (FINAL FIXED)
# # ---------------------------------
# @router.post("/")
# def chat(payload: dict):
#     user_message = payload.get("message")
#     lat = payload.get("lat")
#     lon = payload.get("lon")

#     if not user_message:
#         raise HTTPException(status_code=400, detail="message required")

#     # ------------------------------------------------
#     # 1️⃣ ALWAYS GET CHATGPT-LIKE RESPONSE
#     # ------------------------------------------------
#     base_reply = "I’m here to help 😊"

#     try:
#         prompt = f"""
# You are a friendly and helpful AI assistant.
# Reply naturally like ChatGPT.

# User message:
# {user_message}
# """
#         llm_resp = requests.post(
#             OLLAMA_URL,
#             json={
#                 "model": MODEL,
#                 "prompt": prompt,
#                 "stream": False,
#                 "options": {"num_predict": 120}
#             },
#             timeout=30
#         )

#         if llm_resp.ok:
#             text = llm_resp.json().get("response", "").strip()
#             if text:
#                 base_reply = text
#     except Exception:
#         base_reply = "I’m here to help. Let me check that for you."

#     # ------------------------------------------------
#     # 2️⃣ DETECT SERVICE
#     # ------------------------------------------------
#     service = detect_service(user_message)

#     if not service or lat is None or lon is None:
#         return {"message": base_reply}

#     service = normalize_service(service)

#     # ------------------------------------------------
#     # 3️⃣ GET RECOMMENDATIONS (IMPORTANT FIX HERE)
#     # ------------------------------------------------
#     try:
#         places = recommend(
#             lat=float(lat),
#             lon=float(lon),
#             query=service,
#             max_radius_km=10.0,
#             k=5
#             # ❌ category_filter REMOVED
#         )
#     except Exception:
#         return {
#             "message": base_reply + "\n\n(I had trouble fetching nearby places.)"
#         }

#     if not places:
#         return {
#             "message": base_reply + f"\n\nI couldn’t find any nearby {service}s."
#         }

#     # ------------------------------------------------
#     # 4️⃣ BUILD RESPONSE
#     # ------------------------------------------------
#     lines = [
#         f"{i}. {p['display_name']} – {p['distance_km']} km away"
#         for i, p in enumerate(places, start=1)
#     ]

#     final_message = (
#         f"{base_reply}\n\n"
#         f"Here are some nearby {service}s:\n" +
#         "\n".join(lines)
#     )

#     return {
#         "message": final_message,
#         "places": places
#     }



# import requests
# from fastapi import APIRouter, HTTPException

# router = APIRouter(prefix="/chat", tags=["chat"])

# OLLAMA_URL = "http://localhost:11434/api/generate"
# MODEL = "phi3"

# @router.post("/")
# def chat(payload: dict):
#     user_message = payload.get("message")

#     if not user_message:
#         raise HTTPException(status_code=400, detail="message required")

#     try:
#         prompt = f"""
# You are a friendly, helpful AI assistant.
# Answer the user's message clearly and naturally like ChatGPT.

# User:
# {user_message}
# """

#         response = requests.post(
#             OLLAMA_URL,
#             json={
#                 "model": MODEL,
#                 "prompt": prompt,
#                 "stream": False,
#                 "options": {
#                     "num_predict": 200
#                 }
#             },
#             timeout=60
#         )

#         if not response.ok:
#             return {
#                 "message": "Sorry, I’m having trouble responding right now."
#             }

#         reply = response.json().get("response", "").strip()

#         if not reply:
#             reply = "I’m here to help 😊"

#         return {
#             "message": reply
#         }

#     except Exception as e:
#         return {
#             "message": "Sorry, something went wrong. Please try again."
#         }



import requests
from fastapi import APIRouter, HTTPException
from backend.recommender import recommend

router = APIRouter(prefix="/chat", tags=["chat"])

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "phi3"


def detect_intent(message: str):
    msg = message.lower()

    if "park" in msg:
        return "park"
    if "hospital" in msg:
        return "hospital"
    if "police" in msg:
        return "police"
    if "pharmacy" in msg or "medical shop" in msg:
        return "pharmacy"
    if "bank" in msg or "atm" in msg:
        return "bank"
    if "restaurant" in msg or "food" in msg:
        return "restaurant"

    return None


@router.post("/")
def chat(payload: dict):

    message = payload.get("message", "").strip()
    lat = payload.get("lat")
    lon = payload.get("lon")

    if not message:
        raise HTTPException(status_code=400, detail="message required")

    intent = detect_intent(message)

    # -----------------------------
    # LOCATION-BASED QUERIES
    # -----------------------------
    if intent:

        if lat is None or lon is None:
            return {
                "type": "error",
                "code": "LOCATION_REQUIRED",
                "message": "Enable GPS to find nearby places."
            }

        results = recommend(
            lat=float(lat),
            lon=float(lon),
            query=intent,
            k=5,                   # 🔥 multiple results
            max_radius_km=15
        )

        if not results:
            return {
                "type": "no_results",
                "message": f"No nearby {intent} found."
            }

        # 🔥 Return clean structured list
        return {
            "type": "list",
            "category": intent,
            "results": [
                {
                    "name": r.get("display_name") or r.get("name"),
                    "distance_km": r.get("distance_km"),
                    "latitude": r.get("latitude"),
                    "longitude": r.get("longitude"),
                    "rating": r.get("rating")
                }
                for r in results
            ]
        }

    # -----------------------------
    # FALLBACK CHAT (NON-LOCATION)
    # -----------------------------
    try:
        prompt = f"""
Reply in maximum 2 short sentences.

User: {message}
"""

        response = requests.post(
            OLLAMA_URL,
            json={
                "model": MODEL,
                "prompt": prompt,
                "stream": False,
                "options": {"num_predict": 80}
            },
            timeout=30
        )

        if response.ok:
            text = response.json().get("response", "").strip()
            if text:
                return {"type": "chat", "message": text}

    except Exception:
        pass

    return {
        "type": "chat",
        "message": "How can I help?"
    }
