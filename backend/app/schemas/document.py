from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from app.models.document import DocumentStatus

class DocumentOut(BaseModel):
    id:UUID
    user_id:UUID
    filename:str
    status:DocumentStatus
    created_at:datetime

    model_config = {"from_attributes":True}

class DocumentCreate(BaseModel):
    filename:str
    filepath:str


