import httpx
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import settings
from app.models.user import User
from app.schemas.user import TokenResponse, UserOut
from app.core.security import create_access_token, get_current_user


router = APIRouter(prefix="/auth", tags=["auth"])

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"

# Step 1 — Redirect user to Google login page
@router.get("/google")
def google_login():
    params = (
        f"?client_id={settings.GOOGLE_CLIENT_ID}"
        f"&redirect_uri={settings.GOOGLE_REDIRECT_URI}"
        f"&response_type=code"
        f"&scope=openid email profile"
        f"&access_type=offline"
    )

    return RedirectResponse(url=GOOGLE_AUTH_URL + params)

# Step 2 — Google redirects back here with a `code`
@router.get("/google/callback")
async def google_callback(code: str, db: Session = Depends(get_db)):
    # Exchange code for access token
    async with httpx.AsyncClient() as client:
        token_response = await client.post(GOOGLE_TOKEN_URL, data={
            "code": code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
        })
    token_data = token_response.json()
    if "error" in token_data:
        raise HTTPException(status_code=400, detail="Google OAuth failed")
    google_access_token = token_data["access_token"]
    # Fetch user info from Google
    async with httpx.AsyncClient() as client:
        userinfo_response = await client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {google_access_token}"}
        )
    userinfo = userinfo_response.json()
    email = userinfo.get("email")
    google_id = userinfo.get("sub")
    name = userinfo.get("name")
    picture = userinfo.get("picture")
    # Find or create user in DB
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(email=email, google_id=google_id, name=name, picture=picture)
        db.add(user)
        db.commit()
        db.refresh(user)
    # Create JWT for our app
    access_token = create_access_token(data={"sub": str(user.id)})
    # Redirect to frontend with token in URL
    return RedirectResponse(
        url=f"{settings.FRONTEND_URL}/auth/callback?token={access_token}"
    )

# get logged-in user info
@router.get("/me", response_model=UserOut)
def get_me(
    current_user:User = Depends(get_current_user)
):
    return current_user



