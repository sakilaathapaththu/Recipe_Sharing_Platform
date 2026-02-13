import os, uuid
from datetime import datetime, timezone
from fastapi import HTTPException, UploadFile

from app.repository.user_repository import UserRepository
from app.util.security import hash_pw, verify_pw, create_token
from app.config.database_config import get_db

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
ALLOWED = {"image/png", "image/jpeg", "image/jpg", "image/webp"}

class AuthService:
    @staticmethod
    async def register(username: str, email: str, password: str, bio: str, profile_image: UploadFile | None):
        username = username.strip()
        email = email.strip().lower()

        if len(password) < 6:
            raise HTTPException(status_code=400, detail="Password must be at least 6 chars")

        if await UserRepository.find_by_email(email):
            raise HTTPException(status_code=409, detail="Email already exists")

        if await UserRepository.find_by_username(username):
            raise HTTPException(status_code=409, detail="Username already exists")

        image_path = None
        if profile_image:
            if profile_image.content_type not in ALLOWED:
                raise HTTPException(status_code=400, detail="Invalid image type")

            ext = os.path.splitext(profile_image.filename or "")[1].lower() or ".jpg"
            fname = f"{uuid.uuid4().hex}{ext}"
            save_path = os.path.join(UPLOAD_DIR, fname)
            content = await profile_image.read()
            with open(save_path, "wb") as f:
                f.write(content)
            image_path = f"/uploads/{fname}"

        doc = {
            "username": username,
            "email": email,
            "password_hash": hash_pw(password),
            "bio": (bio or "").strip(),
            "profile_image": image_path,
            "created_at": datetime.now(timezone.utc),
        }

        user_id = await UserRepository.create(doc)
        token = create_token({"sub": user_id, "email": email, "username": username})

        return {
            "message": "Registered",
            "token": token,
            "user": {"id": user_id, "username": username, "email": email, "bio": doc["bio"], "profile_image": image_path, "created_at": doc["created_at"]},
        }

    @staticmethod
    async def login(email: str, password: str):
        db = get_db()
        email = email.strip().lower()
        u = await db["users"].find_one({"email": email})
        if not u or not verify_pw(password, u.get("password_hash", "")):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        token = create_token({"sub": str(u["_id"]), "email": u["email"], "username": u["username"]})
        return {
            "message": "Logged in",
            "token": token,
            "user": {
                "id": str(u["_id"]),
                "username": u["username"],
                "email": u["email"],
                "bio": u.get("bio", ""),
                "profile_image": u.get("profile_image"),
                "created_at": u.get("created_at"),
            },
        }
