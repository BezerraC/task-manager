from pydantic_settings import BaseSettings
import urllib.parse
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings(BaseSettings):
    # Parse and escape the MongoDB password properly
    raw_mongo_uri: str = os.getenv("MONGO_URI", "")
    
    # Parse the MongoDB URI components to handle special characters in password
    @property
    def MONGO_URI(self) -> str:
        # If already properly formatted, return as is
        if "%" in self.raw_mongo_uri:
            return self.raw_mongo_uri
        
        # Otherwise, parse and escape
        parts = self.raw_mongo_uri.split("@")
        if len(parts) != 2:
            return self.raw_mongo_uri
            
        auth_part = parts[0]
        server_part = parts[1]
        
        # Extract protocol and credentials
        protocol_creds = auth_part.split("://")
        if len(protocol_creds) != 2:
            return self.raw_mongo_uri
            
        protocol = protocol_creds[0]
        credentials = protocol_creds[1]
        
        # Parse username and password
        if ":" in credentials:
            username, password = credentials.split(":", 1)
            # URL encode the password to handle special characters
            encoded_password = urllib.parse.quote_plus(password)
            
            # Reconstruct the URI with encoded password
            return f"{protocol}://{username}:{encoded_password}@{server_part}"
        
        return self.raw_mongo_uri
    
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "task_management")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "default_secret_key")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # MongoDB minimum TLS version setting - ensure using modern TLS
    MONGODB_TLS_MIN_VERSION: str = os.getenv("MONGODB_TLS_MIN_VERSION", "TLS1_2")

settings = Settings()