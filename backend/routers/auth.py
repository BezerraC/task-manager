from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from models.user import UserCreate, UserResponse, UserInDB
from auth.auth_handler import verify_password, get_password_hash, create_access_token
from database import get_users_collection
from config import settings
from bson import ObjectId

router = APIRouter(tags=["authentication"])

@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate):
    # Get the users collection
    users_collection = await get_users_collection()
    
    # Check if the email is already registered
    if await users_collection.find_one({"email": user.email}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    # Create a new user
    user_dict = user.model_dump()
    hashed_password = get_password_hash(user.password)
    user_dict.pop("password")
    
    new_user = UserInDB(
        **user_dict,
        hashed_password=hashed_password
    )
    
    user_data = new_user.model_dump(by_alias=True)
    if "_id" in user_data and not user_data["_id"]:
        del user_data["_id"]  
    
    result = await users_collection.insert_one(user_data)
    
    # Search for the newly created user to return
    created_user = await users_collection.find_one({"_id": result.inserted_id})
    
    if created_user:
        return {
            "id": str(created_user["_id"]),
            "name": created_user["name"],
            "email": created_user["email"],
            "role": created_user["role"],
            "created_at": created_user["created_at"],
            "updated_at": created_user["updated_at"]
        }

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    users_collection = await get_users_collection()
    
    user = await users_collection.find_one({"email": form_data.username})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"user_id": str(user["_id"]), "role": user["role"]},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": str(user["_id"]),
        "name": user["name"],
        "role": user["role"]
    }