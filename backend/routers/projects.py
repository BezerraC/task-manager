from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from models.project import ProjectCreate, ProjectResponse, ProjectUpdate, ProjectStatus
from auth.auth_bearer import JWTBearer
from database import get_projects_collection
from bson import ObjectId
from datetime import datetime

router = APIRouter(tags=["projects"])

@router.post("/projects", response_model=ProjectResponse)
async def create_project(project: ProjectCreate, payload=Depends(JWTBearer())):
    projects_collection = await get_projects_collection()
    
    # Add user_id and timestamps
    project_dict = project.model_dump()
    
    # Ensure all required fields are present
    if "name" not in project_dict and hasattr(project, "name"):
        project_dict["name"] = getattr(project, "name", "Untitled Project")  
    
    project_dict["author_id"] = payload["user_id"]
    
    if "deadline" not in project_dict:
        project_dict["deadline"] = datetime.utcnow()  # Default fallback
    
    project_dict["created_at"] = datetime.utcnow()
    project_dict["updated_at"] = datetime.utcnow()
    
    result = await projects_collection.insert_one(project_dict)
    
    created_project = await projects_collection.find_one({"_id": result.inserted_id})
    
    # Build response aligned with the ProjectResponse model
    response = {
        "id": str(created_project["_id"]),
        "description": created_project["description"],
        "status": created_project.get("status", ProjectStatus.PENDING),
        "author_id": created_project["author_id"],
        "created_at": created_project["created_at"],
        "updated_at": created_project["updated_at"],
        "deadline": created_project.get("deadline", datetime.utcnow()) 
    }
    
    if "name" in created_project:
        response["name"] = created_project["name"]
    
    return response

@router.get("/projects", response_model=List[ProjectResponse])
async def get_projects(payload=Depends(JWTBearer())):
    projects_collection = await get_projects_collection()
    
    # If admin, return all projects, otherwise only user's projects
    if payload["role"] == "admin":
        projects_cursor = projects_collection.find()
    else:
 
        filter_key = "author_id" if await has_projects_with_author_id(projects_collection) else "user_id"
        projects_cursor = projects_collection.find({filter_key: payload["user_id"]})
    
    projects = []
    async for project in projects_cursor:
        project_dict = {
            "id": str(project["_id"]),
            "description": project["description"],
            "status": project.get("status", ProjectStatus.PENDING),
            "created_at": project["created_at"],
            "updated_at": project["updated_at"],
            "deadline": project.get("deadline", datetime.utcnow()), 
            "author_id": project.get("author_id", project.get("user_id"))  
        }
        
        if "name" in project:
            project_dict["name"] = project["name"]
            
        projects.append(project_dict)
    
    return projects

async def has_projects_with_author_id(collection):
    """Check if the collection has documents with author_id instead of user_id"""
    count = await collection.count_documents({"author_id": {"$exists": True}})
    return count > 0

@router.get("/projects/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: str, payload=Depends(JWTBearer())):
    projects_collection = await get_projects_collection()
    
    project = await projects_collection.find_one({"_id": ObjectId(project_id)})
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Check if user has permission
    user_field = "author_id" if "author_id" in project else "user_id"
    if payload["role"] != "admin" and payload["user_id"] != project.get(user_field):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden"
        )
    
    response = {
        "id": str(project["_id"]),
        "description": project["description"],
        "status": project.get("status", ProjectStatus.PENDING),
        "created_at": project["created_at"],
        "updated_at": project["updated_at"],
        "deadline": project.get("deadline", datetime.utcnow()), 
        "author_id": project.get("author_id", project.get("user_id")) 
    }
    
    if "name" in project:
        response["name"] = project["name"]
    
    return response

@router.put("/projects/{project_id}", response_model=ProjectResponse)
async def update_project(project_id: str, project: ProjectUpdate, payload=Depends(JWTBearer())):
    projects_collection = await get_projects_collection()
    
    existing_project = await projects_collection.find_one({"_id": ObjectId(project_id)})
    
    if not existing_project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Check if user has permission 
    user_field = "author_id" if "author_id" in existing_project else "user_id"
    if payload["role"] != "admin" and payload["user_id"] != existing_project.get(user_field):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden"
        )
    
    project_dict = project.model_dump(exclude_unset=True)
    
    if not project_dict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    # Add updated_at field
    project_dict["updated_at"] = datetime.utcnow()
    
    await projects_collection.update_one(
        {"_id": ObjectId(project_id)},
        {"$set": project_dict}
    )
    
    updated_project = await projects_collection.find_one({"_id": ObjectId(project_id)})
    
    response = {
        "id": str(updated_project["_id"]),
        "description": updated_project["description"],
        "status": updated_project.get("status", ProjectStatus.PENDING),
        "created_at": updated_project["created_at"],
        "updated_at": updated_project["updated_at"],
        "deadline": updated_project.get("deadline", datetime.utcnow()),  # Default if missing
        "author_id": updated_project.get("author_id", updated_project.get("user_id"))  
    }
    
    if "name" in updated_project:
        response["name"] = updated_project["name"]
    
    return response

@router.delete("/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(project_id: str, payload=Depends(JWTBearer())):
    projects_collection = await get_projects_collection()
    
    existing_project = await projects_collection.find_one({"_id": ObjectId(project_id)})
    
    if not existing_project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Check if user has permission - handle both author_id and user_id
    user_field = "author_id" if "author_id" in existing_project else "user_id"
    if payload["role"] != "admin" and payload["user_id"] != existing_project.get(user_field):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden"
        )
    
    await projects_collection.delete_one({"_id": ObjectId(project_id)})