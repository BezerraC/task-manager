from fastapi import APIRouter, HTTPException, status, Depends
from models.user import UserResponse, UserUpdate
from auth.auth_bearer import JWTBearer
from database import get_users_collection
from bson import ObjectId

router = APIRouter(tags=["users"])

@router.get("/users/me", response_model=UserResponse)
async def get_current_user(payload=Depends(JWTBearer())):
    users_collection = await get_users_collection()
    user = await users_collection.find_one({"_id": ObjectId(payload["user_id"])})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "created_at": user["created_at"],
        "updated_at": user["updated_at"]
    }

@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: str, payload=Depends(JWTBearer())):
    if payload["role"] != "admin" and payload["user_id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden"
        )
    
    users_collection = await get_users_collection()
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "created_at": user["created_at"],
        "updated_at": user["updated_at"]
    }


@router.get("/users", response_model=list[UserResponse])
async def get_all_users(payload=Depends(JWTBearer())):
    if payload["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden"
        )
        
    users_collection = await get_users_collection()
    users_cursor = users_collection.find()
    users = await users_cursor.to_list(length=None)
        
    return [
        {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "created_at": user["created_at"],
            "updated_at": user["updated_at"]
        }
        for user in users
    ]

@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(user_id: str, user: UserUpdate, payload=Depends(JWTBearer())):
    if payload["role"] != "admin" and payload["user_id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden"
        )
    
    users_collection = await get_users_collection()
    user_dict = user.model_dump(exclude_unset=True)
    
    if not user_dict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    # Add updated_at field
    from datetime import datetime
    user_dict["updated_at"] = datetime.utcnow()
    
    result = await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": user_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    updated_user = await users_collection.find_one({"_id": ObjectId(user_id)})
    
    return {
        "id": str(updated_user["_id"]),
        "name": updated_user["name"],
        "email": updated_user["email"],
        "role": updated_user["role"],
        "created_at": updated_user["created_at"],
        "updated_at": updated_user["updated_at"]
    }

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: str, payload=Depends(JWTBearer())):
    if payload["role"] != "admin" and payload["user_id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden"
        )
    
    users_collection = await get_users_collection()
    result = await users_collection.delete_one({"_id": ObjectId(user_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )