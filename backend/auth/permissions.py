from fastapi import Request, HTTPException, status
from models.user import UserRole
from database import projects_collection, tasks_collection
from bson import ObjectId

async def is_admin(request: Request):
    if request.state.user["role"] != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Admins only."
        )
    return True

async def can_edit_project(request: Request, project_id: str):
    user = request.state.user
    
    # Admins can edit any project
    if user["role"] == UserRole.ADMIN:
        return True
    
    # Leader can only edit projects they created
    if user["role"] == UserRole.LEADER:
        project = await projects_collection.find_one({"_id": ObjectId(project_id)})
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Projeto não encontrado"
            )
        
        if str(project["author_id"]) != str(user["_id"]):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only edit projects you created"
            )
        
        return True
    
    # Common users cannot edit projects
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Permission denied"
    )

async def can_edit_task(request: Request, task_id: str):
    user = request.state.user
    
    # Admins can edit any task
    if user["role"] == UserRole.ADMIN:
        return True
    
    # Leaders can only edit tasks in projects they created
    if user["role"] == UserRole.LEADER:
        task = await tasks_collection.find_one({"_id": ObjectId(task_id)})
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )
        
        project = await projects_collection.find_one({"_id": ObjectId(task["project_id"])})
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
        
        if str(project["author_id"]) != str(user["_id"]):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only edit tasks in projects you created"
            )
        
        return True
    
    # Common users cannot edit tasks
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Permission denied"
    )