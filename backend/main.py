from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from routers import auth, users, projects, tasks
from database import connect_to_mongo, close_mongo_connection, check_database_connection
import logging
logging.basicConfig(level=logging.INFO)

# Logger config
@asynccontextmanager
async def lifespan(app: FastAPI):
    
    # Startup event
    await connect_to_mongo()
    yield
    
    # Shutdown event
    await close_mongo_connection()

app = FastAPI(
    title="Task Management API",
    description="API for managing projects and tasks with user authentication",
    version="1.0.0",
    lifespan=lifespan
)

# CORS config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(projects.router, prefix="/api")
app.include_router(tasks.router, prefix="/api")

@app.get("/")
async def root():
    return {
        "message": "API of Task Management",
        "docs": "/docs"
    }

@app.get("/api/health")
async def health_check():
    db_status = await check_database_connection()
    return {
        "api_status": "online",
        "database": db_status
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="localhost", port=8000, reload=True)