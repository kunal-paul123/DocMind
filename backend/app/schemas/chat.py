from pydantic import BaseModel
from uuid import UUID
from typing import List

class ChatRequest(BaseModel):
    query: str
    document_ids: List[UUID]

class SourceCitation(BaseModel):
    document_id:UUID
    filename: str
    page_number: int

class ChatResponse(BaseModel):
    answer: str
    source: List[SourceCitation]

    
