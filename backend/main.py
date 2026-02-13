from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from app.config.database_config import connect_db, close_db

from app.controller.auth_controller import router as auth_router
from app.controller.recipes_controller import router as recipes_router
from app.controller.cooking_controller import router as cooking_router

app = FastAPI()

# ✅ CORS (allow Next.js frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# serve uploaded images
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.on_event("startup")
async def startup():
    await connect_db()

@app.on_event("shutdown")
async def shutdown():
    await close_db()

app.include_router(auth_router)
app.include_router(recipes_router)
app.include_router(cooking_router)
