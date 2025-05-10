from motor.motor_asyncio import AsyncIOMotorClient
from config import settings
import logging
import asyncio
import urllib.parse
import certifi

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
        # Parse the connection string to properly escape password characters
        mongo_uri = settings.MONGO_URI
        
        # Set additional connection options
        connection_options = {
            "tls": True,
            "tlsCAFile": certifi.where(),  # Use certifi for trusted CA certificates
            "retryWrites": True,
            "w": "majority",
            "maxPoolSize": 10,
            "minPoolSize": 1,
            "serverSelectionTimeoutMS": 30000,  # Increased timeout for server selection
            "socketTimeoutMS": 45000,  # Increased socket timeout
            "connectTimeoutMS": 30000,  # Increased connection timeout
        }
        
        # Create the client
        client = AsyncIOMotorClient(mongo_uri, **connection_options)
        database = client[settings.DATABASE_NAME]

        # Test connection with a ping command
        await database.command("ping")
        logging.info("Connected to MongoDB successfully")
        
    except Exception as e:
        logging.error(f"Error connecting to MongoDB: {e}")
        # Log more specific information for debugging
        if hasattr(e, 'details'):
            logging.error(f"Error details: {e.details}")
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