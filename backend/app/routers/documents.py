from fastapi import responses
from certifi import contents
from httpx import _status_codes
import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.document import Document, DocumentStatus
from app.schemas.document import DocumentOut
from app.core.security import get_current_user

router = APIRouter(prefix="/documents",tags=["documents"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Post documents/upload
@router.post("/upload", response_model=DocumentOut)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    # save the file to disk
    file_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")
    contents = await file.read()
    with open(file_path, "wb") as f:
        f.write(contents)


    doc = Document(
        user_id = current_user.id,
        filename= file.filename,
        file_path = file_path,
        status = DocumentStatus.PENDING
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # TODO Phase 3: background_tasks.add_task(process_document, str(doc.id), file_path)

    return doc

# GET /documents
@router.get("/", response_model = List[DocumentOut])
def list_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all documents for the current user"""
    docs = db.query(Document).filter(Document.user_id == current_user.id).all()
    return docs

# GET /documents/{id}/status
@router.get("/{id}/status", response_model=DocumentOut)
def get_document_status(
    doc_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the status of a specific document"""
    doc = db.query(Document).filter(Document.id == id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

# Delete /document/{id}
@router.delete("/{doc_id}")
def delete_document(
    doc_id:str,
    current_user:User = Depends(get_current_user),
    db:Session = Depends(get_db)
):
    """Delete a document"""
    doc = db.query(Document).filter(Document.id == doc_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail = "Document not found")

    # Delete the file from disk
    if os.path.exists(str(doc.file_path)):
        os.remove(str(doc.file_path))
    
    # TODO Phase 3: delete vectors from ChromaDB

    db.delete(doc)
    db.commit()
    return {"message": "Document deleted successfully"}

    
