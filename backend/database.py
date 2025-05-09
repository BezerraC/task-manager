from motor.motor_asyncio import AsyncIOMotorClient
from config import settings
import logging
import asyncio

# Global variables to store connections
client = None
database = None

# Function to get collections
async def get_collection(collection_name):
    if database is None:
        await connect_to_mongo()
    return database[collection_name]

async def get_users_collection():
    return await get_collection("users")

async def get_projects_collection():
    return await get_collection("projects")

async def get_tasks_collection():
    return await get_collection("tasks")

async def connect_to_mongo():
    global client, database

    if database is not None:
        return  # Already connected
    
    logging.info("Initializing MongoDB connection...")
    try:
        client = AsyncIOMotorClient(settings.MONGO_URI)
        database = client[settings.DATABASE_NAME]

        await database.command("ping")
        logging.info("Connected to MongoDB successfully")
        
    except Exception as e:
        logging.error(f"Error connecting to MongoDB: {e}")
        raise

async def close_mongo_connection():
    global client, database
    if client:
        client.close()
        client = None
        database = None
        logging.info("Connection to MongoDB closed")

async def check_database_connection():
    try:
        if database is None:
            await connect_to_mongo()
            
        await database.command("ping")
        return {"status": "connected", "database": settings.DATABASE_NAME}
    except Exception as e:
        return {"status": "disconnected", "error": str(e)}