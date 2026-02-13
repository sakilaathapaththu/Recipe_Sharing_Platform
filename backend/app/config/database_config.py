from motor.motor_asyncio import AsyncIOMotorClient
from app.config.config import settings

client: AsyncIOMotorClient | None = None

def get_client() -> AsyncIOMotorClient:
    global client
    if client is None:
        client = AsyncIOMotorClient(settings.MONGO_URI)
    return client

def get_db():
    return get_client()[settings.MONGO_DB]

async def connect_db():
    c = get_client()
    await c.admin.command("ping")

async def close_db():
    global client
    if client:
        client.close()
        client = None
