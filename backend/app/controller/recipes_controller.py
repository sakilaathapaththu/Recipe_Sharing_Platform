import os
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Form, UploadFile, File
from bson import ObjectId
from fastapi import Query

# ✅ CHANGED imports (old: from db / deps)
from app.config.database_config import get_db
from app.util.auth_guard import get_current_user

router = APIRouter(prefix="/api/recipes", tags=["recipes"])

# folders
IMG_DIR = "uploads/images"
VID_DIR = "uploads/videos"
os.makedirs(IMG_DIR, exist_ok=True)
os.makedirs(VID_DIR, exist_ok=True)

ALLOWED_IMG = {"image/png", "image/jpeg", "image/jpg", "image/webp"}
ALLOWED_VID = {"video/mp4", "video/webm", "video/quicktime"}  # mov

def _save_upload(up: UploadFile, folder: str, allowed_types: set[str]) -> str:
    if up.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail=f"Invalid file type: {up.content_type}")

    ext = os.path.splitext(up.filename or "")[1].lower()
    if not ext:
        ext = ".bin"

    name = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(folder, name)

    return path, name

@router.post("")
async def create_recipe(
    # ---- basic info ----
    title: str = Form(...),
    description: str = Form(""),
    cuisine_type: str = Form(""),
    difficulty: str = Form("Easy"),  # Easy/Medium/Hard
    prep_time_min: int = Form(0),
    cook_time_min: int = Form(0),
    servings: int = Form(1),

    # ---- JSON strings for complex fields ----
    # ingredients_json: [{"name":"Flour","qty":2,"unit":"cups"}]
    ingredients_json: str = Form("[]"),

    # steps_json: [{"text":"Mix flour.."}, {"text":"Bake.."}]
    steps_json: str = Form("[]"),

    # ---- media ----
    # step_images: multiple files, matched by step_images_step_idx list
    step_images: Optional[List[UploadFile]] = File(None),
    step_images_step_idx: Optional[List[int]] = Form(None),

    # step_videos: multiple files, matched by step_videos_step_idx list
    step_videos: Optional[List[UploadFile]] = File(None),
    step_videos_step_idx: Optional[List[int]] = Form(None),

    me=Depends(get_current_user),
):
    import json

    db = get_db()
    col = db["recipes"]

    try:
        ingredients = json.loads(ingredients_json)
        steps = json.loads(steps_json)
        if not isinstance(ingredients, list) or not isinstance(steps, list):
            raise ValueError()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ingredients_json or steps_json")

    # normalize steps with media arrays
    for s in steps:
        s.setdefault("text", "")
        s["images"] = []
        s["videos"] = []

    # attach images per step index
    if step_images:
        if not step_images_step_idx or len(step_images_step_idx) != len(step_images):
            raise HTTPException(status_code=400, detail="step_images_step_idx must match step_images length")

        for up, idx in zip(step_images, step_images_step_idx):
            if idx < 0 or idx >= len(steps):
                raise HTTPException(status_code=400, detail=f"Invalid step index for image: {idx}")

            ext = os.path.splitext(up.filename or "")[1].lower() or ".jpg"
            fname = f"{uuid.uuid4().hex}{ext}"
            save_path = os.path.join(IMG_DIR, fname)

            content = await up.read()
            with open(save_path, "wb") as f:
                f.write(content)

            steps[idx]["images"].append(f"/uploads/images/{fname}")

    # attach videos per step index
    if step_videos:
        if not step_videos_step_idx or len(step_videos_step_idx) != len(step_videos):
            raise HTTPException(status_code=400, detail="step_videos_step_idx must match step_videos length")

        for up, idx in zip(step_videos, step_videos_step_idx):
            if idx < 0 or idx >= len(steps):
                raise HTTPException(status_code=400, detail=f"Invalid step index for video: {idx}")

            if up.content_type not in ALLOWED_VID:
                raise HTTPException(status_code=400, detail=f"Invalid video type: {up.content_type}")

            ext = os.path.splitext(up.filename or "")[1].lower() or ".mp4"
            fname = f"{uuid.uuid4().hex}{ext}"
            save_path = os.path.join(VID_DIR, fname)

            content = await up.read()
            with open(save_path, "wb") as f:
                f.write(content)

            steps[idx]["videos"].append(f"/uploads/videos/{fname}")

    doc = {
        "user_id": me["id"],
        "title": title.strip(),
        "description": description.strip(),
        "cuisine_type": cuisine_type.strip(),
        "difficulty": difficulty.strip(),
        "prep_time_min": int(prep_time_min),
        "cook_time_min": int(cook_time_min),
        "servings": int(servings),
        "ingredients": ingredients,
        "steps": steps,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    r = await col.insert_one(doc)
    doc["id"] = str(r.inserted_id)

    # ✅ remove _id safely (if exists)
    doc.pop("_id", None)

    return {"message": "Recipe created", "recipe": doc}

@router.put("/{recipe_id}")
async def update_recipe(
    recipe_id: str,
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    cuisine_type: Optional[str] = Form(None),
    difficulty: Optional[str] = Form(None),
    prep_time_min: Optional[int] = Form(None),
    cook_time_min: Optional[int] = Form(None),
    servings: Optional[int] = Form(None),
    ingredients_json: Optional[str] = Form(None),
    steps_json: Optional[str] = Form(None),

    me=Depends(get_current_user),
):
    import json

    db = get_db()
    col = db["recipes"]

    doc = await col.find_one({"_id": ObjectId(recipe_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Recipe not found")
    if doc.get("user_id") != me["id"]:
        raise HTTPException(status_code=403, detail="Not allowed")

    update = {"updated_at": datetime.now(timezone.utc)}

    if title is not None: update["title"] = title.strip()
    if description is not None: update["description"] = description.strip()
    if cuisine_type is not None: update["cuisine_type"] = cuisine_type.strip()
    if difficulty is not None: update["difficulty"] = difficulty.strip()
    if prep_time_min is not None: update["prep_time_min"] = int(prep_time_min)
    if cook_time_min is not None: update["cook_time_min"] = int(cook_time_min)
    if servings is not None: update["servings"] = int(servings)

    if ingredients_json is not None:
        try:
            ingredients = json.loads(ingredients_json)
            if not isinstance(ingredients, list): raise ValueError()
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid ingredients_json")
        update["ingredients"] = ingredients

    if steps_json is not None:
        try:
            steps = json.loads(steps_json)
            if not isinstance(steps, list): raise ValueError()
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid steps_json")
        update["steps"] = steps

    await col.update_one({"_id": ObjectId(recipe_id)}, {"$set": update})
    return {"message": "Recipe updated"}

@router.delete("/{recipe_id}")
async def delete_recipe(recipe_id: str, me=Depends(get_current_user)):
    db = get_db()
    col = db["recipes"]

    doc = await col.find_one({"_id": ObjectId(recipe_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Recipe not found")
    if doc.get("user_id") != me["id"]:
        raise HTTPException(status_code=403, detail="Not allowed")

    await col.delete_one({"_id": ObjectId(recipe_id)})
    return {"message": "Recipe deleted"}

@router.get("")
async def list_recipes(
    q: Optional[str] = Query(None),
    cuisine: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    max_time: Optional[int] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=50),
):
    db = get_db()
    col = db["recipes"]

    filt = {}

    if cuisine:
        filt["cuisine_type"] = {"$regex": cuisine, "$options": "i"}
    if difficulty:
        filt["difficulty"] = difficulty
    if max_time is not None:
        filt["cook_time_min"] = {"$lte": int(max_time)}

    if q:
        filt["$or"] = [
            {"title": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
        ]

    cursor = (
        col.find(filt, {"steps": 0})
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
    )

    items = []
    async for r in cursor:
        r["id"] = str(r["_id"])
        del r["_id"]
        items.append(r)

    total = await col.count_documents(filt)
    return {"items": items, "total": total, "skip": skip, "limit": limit}

@router.get("/mine")
async def my_recipes(me=Depends(get_current_user)):
    db = get_db()
    col = db["recipes"]

    cursor = (
        col.find({"user_id": me["id"]}, {"steps": 0})
        .sort("created_at", -1)
    )

    items = []
    async for r in cursor:
        r["id"] = str(r["_id"])
        del r["_id"]
        items.append(r)

    return {"items": items}

@router.get("/{recipe_id}")
async def get_recipe(recipe_id: str):
    db = get_db()
    col = db["recipes"]

    r = await col.find_one({"_id": ObjectId(recipe_id)})
    if not r:
        raise HTTPException(status_code=404, detail="Recipe not found")

    r["id"] = str(r["_id"])
    del r["_id"]
    return {"recipe": r}
