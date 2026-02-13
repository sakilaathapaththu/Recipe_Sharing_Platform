from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from bson import ObjectId

from app.util.security import decode_token
from app.config.database_config import get_db

bearer = HTTPBearer(auto_error=False)

async def get_current_user(
    cred: HTTPAuthorizationCredentials = Depends(bearer),
):
    if not cred or cred.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="Missing token")

    token = cred.credentials
    try:
        payload = decode_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    db = get_db()
    u = await db["users"].find_one({"_id": ObjectId(user_id)}, {"password_hash": 0})
    if not u:
        raise HTTPException(status_code=401, detail="User not found")

    u["id"] = str(u["_id"])
    del u["_id"]
    return u
