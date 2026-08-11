from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime

class UserOut(BaseModel):
    id: UUID
    email:EmailStr
    name:str | None 
    picture:str | None 
    created_at: datetime

    model_config = {"from_attributes":True}

class TokenResponse(BaseModel):
    access_token:str
    token_type: str = "bearer"
    user: UserOut

    