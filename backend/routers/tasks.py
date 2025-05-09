from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from models.task import TaskCreate, TaskResponse, TaskUpdate
from auth.auth_bearer import JWTBearer
from database import get_tasks_collection, get_projects_collection
from bson import ObjectId
from datetime import datetime

router = APIRouter(tags=["tasks"])

@router.post("/tasks", response_model=TaskResponse)
async def create_task(task: TaskCreate, payload=Depends(JWTBearer())):
    tasks_collection = await get_tasks_collection()
    projects_collection = await get_projects_collection()
    
    # Verify if the project exists
    project = await projects_collection.find_one({"_id": ObjectId(task.project_id)})
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Check if user has permission for the project
    if payload["role"] != "admin" and payload["user_id"] != project["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden"
        )
    
    # Add user_id, assigned_to_id, and timestamps
    task_dict = task.model_dump()
    task_dict["created_by"] = payload["user_id"]
    task_dict["created_at"] = datetime.utcnow()
    task_dict["updated_at"] = datetime.utcnow()
    
    result = await tasks_collection.insert_one(task_dict)
    
    created_task = await tasks_collection.find_one({"_id": result.inserted_id})
    
    return {
        "id": str(created_task["_id"]),
        "title": created_task["title"],
        "description": created_task["description"],
        "priority": created_task["priority"],
        "status": created_task["status"],
        "due_date": created_task["due_date"],
        "project_id": created_task["project_id"],
        "assigned_to": created_task.get("assigned_to"),
        "created_by": created_task["created_by"],
        "created_at": created_task["created_at"],
        "updated_at": created_task["updated_at"]
    }

@router.get("/tasks", response_model=List[TaskResponse])
async def get_tasks(project_id: str = None, payload=Depends(JWTBearer())):
    tasks_collection = await get_tasks_collection()
    projects_collection = await get_projects_collection()
    
    # If project_id is provided, filter by project
    filter_query = {}
    
    if project_id:
        # Verify if the project exists
        project = await projects_collection.find_one({"_id": ObjectId(project_id)})
        
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
        
        # Check if user has permission for the project
        if payload["role"] != "admin" and payload["user_id"] != project["user_id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access forbidden"
            )
        
        filter_query["project_id"] = project_id
    
    # If not admin, filter by projects where user is owner or assigned
    if payload["role"] != "admin":
        # Get all projects where the user is owner
        user_projects = []
        async for project in projects_collection.find({"user_id": payload["user_id"]}):
            user_projects.append(str(project["_id"]))
        
        # Filter by user's projects or tasks assigned to the user
        if not project_id:  # Only apply this filter if no specific project_id was provided
            filter_query["$or"] = [
                {"project_id": {"$in": user_projects}},
                {"assigned_to": payload["user_id"]}
            ]
    
    tasks_cursor = tasks_collection.find(filter_query)
    
    tasks = []
    async for task in tasks_cursor:
        tasks.append({
            "id": str(task["_id"]),
            "title": task["title"],
            "description": task["description"],
            "priority": task["priority"],
            "status": task["status"],
            "due_date": task["due_date"],
            "project_id": task["project_id"],
            "assigned_to": task.get("assigned_to"),
            "created_by": task["created_by"],
            "created_at": task["created_at"],
            "updated_at": task["updated_at"]
        })
    
    return tasks

@router.get("/tasks/{task_id}", response_model=TaskResponse)
async def get_task(task_id: str, payload=Depends(JWTBearer())):
    tasks_collection = await get_tasks_collection()
    projects_collection = await get_projects_collection()
    
    task = await tasks_collection.find_one({"_id": ObjectId(task_id)})
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Get the project to check permissions
    project = await projects_collection.find_one({"_id": ObjectId(task["project_id"])})
    
    # Check if user has permission
    if (payload["role"] != "admin" and 
        payload["user_id"] != project["user_id"] and 
        task.get("assigned_to") != payload["user_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden"
        )
    
    return {
        "id": str(task["_id"]),
        "title": task["title"],
        "description": task["description"],
        "priority": task["priority"],
        "status": task["status"],
        "due_date": task["due_date"],
        "project_id": task["project_id"],
        "assigned_to": task.get("assigned_to"),
        "created_by": task["created_by"],
        "created_at": task["created_at"],
        "updated_at": task["updated_at"]
    }

@router.put("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(task_id: str, task: TaskUpdate, payload=Depends(JWTBearer())):
    tasks_collection = await get_tasks_collection()
    projects_collection = await get_projects_collection()
    
    existing_task = await tasks_collection.find_one({"_id": ObjectId(task_id)})
    
    if not existing_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Get the project to check permissions
    project = await projects_collection.find_one({"_id": ObjectId(existing_task["project_id"])})
    
    # Check if user has permission
    if (payload["role"] != "admin" and 
        payload["user_id"] != project["user_id"] and 
        existing_task.get("assigned_to") != payload["user_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden"
        )
    
    task_dict = task.model_dump(exclude_unset=True)
    
    if not task_dict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    # Add updated_at field
    task_dict["updated_at"] = datetime.utcnow()
    
    await tasks_collection.update_one(
        {"_id": ObjectId(task_id)},
        {"$set": task_dict}
    )
    
    updated_task = await tasks_collection.find_one({"_id": ObjectId(task_id)})
    
    return {
        "id": str(updated_task["_id"]),
        "title": updated_task["title"],
        "description": updated_task["description"],
        "priority": updated_task["priority"],
        "status": updated_task["status"],
        "due_date": updated_task["due_date"],
        "project_id": updated_task["project_id"],
        "assigned_to": updated_task.get("assigned_to"),
        "created_by": updated_task["created_by"],
        "created_at": updated_task["created_at"],
        "updated_at": updated_task["updated_at"]
    }

@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(task_id: str, payload=Depends(JWTBearer())):
    tasks_collection = await get_tasks_collection()
    projects_collection = await get_projects_collection()
    
    existing_task = await tasks_collection.find_one({"_id": ObjectId(task_id)})
    
    if not existing_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Get the project to check permissions
    project = await projects_collection.find_one({"_id": ObjectId(existing_task["project_id"])})
    
    # Check if user has permission (only project owner or admin can delete tasks)
    if payload["role"] != "admin" and payload["user_id"] != project["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden"
        )
    
    await tasks_collection.delete_one({"_id": ObjectId(task_id)})