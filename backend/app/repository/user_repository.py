from app.config.database_config import get_db

class UserRepository:
    @staticmethod
    async def find_by_email(email: str):
        db = get_db()
        return await db["users"].find_one({"email": email})

    @staticmethod
    async def find_by_username(username: str):
        db = get_db()
        return await db["users"].find_one({"username": username})

    @staticmethod
    async def create(doc: dict) -> str:
        db = get_db()
        res = await db["users"].insert_one(doc)
        return str(res.inserted_id)
