# Application configuration constants

# Quota limits
USER_DAILY_LIMIT = 5
GLOBAL_DAILY_LIMIT = 100

# JWT authentication
SECRET_KEY = "your-secret-key-change-in-production"  # TODO: Move to environment variable
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# CORS
CORS_ORIGINS = ["http://localhost:5173"]
