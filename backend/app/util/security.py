from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
import bcrypt

from app.config.config import settings


# ---------------- Password Hash ----------------

def hash_pw(pw: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pw.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def verify_pw(pw: str, hashed: str) -> bool:
    return bcrypt.checkpw(
        pw.encode("utf-8"),
        hashed.encode("utf-8")
    )


# ---------------- JWT ----------------

def create_token(payload: dict) -> str:
    exp = datetime.now(timezone.utc) + timedelta(
        minutes=settings.JWT_EXPIRE_MIN
    )
    data = {**payload, "exp": exp}

    return jwt.encode(
        data,
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALG
    )


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALG]
        )
    except JWTError:
        raise ValueError("Invalid token")
