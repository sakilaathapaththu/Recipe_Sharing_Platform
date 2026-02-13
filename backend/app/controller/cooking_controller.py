from datetime import datetime, timezone
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

# ✅ CHANGED imports (old: from db / deps)
from app.config.database_config import get_db
from app.util.auth_guard import get_current_user

router = APIRouter(prefix="/api/cooking", tags=["cooking"])

@router.post("/start/{recipe_id}")
async def start_cooking(recipe_id: str, me=Depends(get_current_user)):
    db = get_db()
    recipes = db["recipes"]
    hist = db["cooking_history"]

    r = await recipes.find_one({"_id": ObjectId(recipe_id)}, {"title": 1})
    if not r:
        raise HTTPException(status_code=404, detail="Recipe not found")

    doc = {
        "user_id": me["id"],
        "recipe_id": recipe_id,
        "recipe_title": r.get("title", ""),
        "status": "in_progress",  # in_progress | completed
        "started_at": datetime.now(timezone.utc),
        "completed_at": None,
    }
    ins = await hist.insert_one(doc)
    return {"message": "Started", "session_id": str(ins.inserted_id)}

@router.post("/complete/{recipe_id}")
async def complete_cooking(recipe_id: str, me=Depends(get_current_user)):
    db = get_db()
    hist = db["cooking_history"]

    latest = await hist.find_one(
        {"user_id": me["id"], "recipe_id": recipe_id, "status": "in_progress"},
        sort=[("started_at", -1)],
    )
    if not latest:
        raise HTTPException(status_code=404, detail="No active cooking session")

    await hist.update_one(
        {"_id": latest["_id"]},
        {"$set": {"status": "completed", "completed_at": datetime.now(timezone.utc)}},
    )
    return {"message": "Completed"}

@router.get("/history")
async def cooking_history(me=Depends(get_current_user)):
    db = get_db()
    hist = db["cooking_history"]

    cursor = (
        hist.find({"user_id": me["id"]})
        .sort("started_at", -1)
        .limit(50)
    )

    items = []
    async for x in cursor:
        x["id"] = str(x["_id"])
        del x["_id"]
        items.append(x)

    return {"items": items}
