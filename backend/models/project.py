from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum
from bson import ObjectId

class PyObjectId(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ID")
        return str(v)

class ProjectStatus(str, Enum):
    PENDING = "Pending"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"

class ProjectBase(BaseModel):
    name: Optional[str] = None  
    description: str
    deadline: datetime
    status: ProjectStatus = ProjectStatus.PENDING
    assigned_by: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectInDB(ProjectBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    author_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class ProjectResponse(ProjectBase):
    id: str
    author_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True

class ProjectUpdate(BaseModel):
    name: Optional[str] = None 
    description: Optional[str] = None
    deadline: Optional[datetime] = None
    status: Optional[ProjectStatus] = None
    assigned_by: Optional[str] = None