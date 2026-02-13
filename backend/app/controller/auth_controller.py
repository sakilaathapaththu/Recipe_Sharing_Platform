from fastapi import APIRouter, Form, UploadFile, File
from app.service.auth_service import AuthService

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register")
async def register(
    username: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    bio: str = Form(""),
    profile_image: UploadFile | None = File(None),
):
    return await AuthService.register(username, email, password, bio, profile_image)

@router.post("/login")
async def login(email: str = Form(...), password: str = Form(...)):
    return await AuthService.login(email, password)
