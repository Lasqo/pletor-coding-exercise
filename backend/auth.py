from fastapi import HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import jwt, JWTError
import requests

AUTH0_DOMAIN = "dev-0dmutbo3qxuhffpp.us.auth0.com"
AUTH0_AUDIENCE = "bcyRJztTWeuMUJtHAULBGkS4A2sCBUsQ"
ALGORITHMS = ["RS256"]

security = HTTPBearer()

def get_jwks():
    jwks_url = f"https://{AUTH0_DOMAIN}/.well-known/jwks.json"
    response = requests.get(jwks_url)
    return response.json()

def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    
    try:
        jwks = get_jwks()
        unverified_header = jwt.get_unverified_header(token)
        rsa_key = {}
        
        for key in jwks["keys"]:
            if key["kid"] == unverified_header["kid"]:
                rsa_key = {
                    "kty": key["kty"],
                    "kid": key["kid"],
                    "use": key["use"],
                    "n": key["n"],
                    "e": key["e"]
                }
        
        if rsa_key:
            payload = jwt.decode(
                token,
                rsa_key,
                algorithms=ALGORITHMS,
                audience=AUTH0_AUDIENCE,
                issuer=f"https://{AUTH0_DOMAIN}/"
            )
            return payload
        
        raise HTTPException(status_code=401, detail="Unable to find appropriate key")
        
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token validation failed: {str(e)}")

def get_current_user(token_payload: dict = Security(verify_token)):
    if not token_payload:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    user_email = token_payload.get("email") or token_payload.get("sub")
    if not user_email:
        raise HTTPException(status_code=401, detail="Email not found in token")
    
    return user_email

