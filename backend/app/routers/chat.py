from app.services.rag_service import get_rag_stream
from app.models.document import Document, DocumentStatus
from app.database import get_db
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from app.schemas.chat import ChatRequest, ChatResponse
from app.models.user import User
from app.core.security import get_current_user


router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("/", response_model=ChatResponse)
def chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    POST /chat
    Accepts a user query + list of document IDs.
    Validates that the documents exist, belong to the user, and are READY.
    Returns a StreamingResponse with SSE (Server-Sent Events).
    """

    if not request.document_ids:
        raise HTTPException(status_code=400, detail="Select at least one document to chat with")

    # validate all requested documents
    doc_ids_str = [str(doc_id) for doc_id in request.document_ids]

    docs = db.query(Document).filter(
        Document.id.in_(request.document_ids),
        Document.user_id == current_user.id
    ).all()

    if len(docs) != len(request.document_ids):
        raise HTTPException(status_code=400, detail="One or more documents not found")

    # only allow chat with ready documents
    not_ready = [d.filename for d in docs if d.status != DocumentStatus.READY]

    if not_ready:
        raise HTTPException(
            status_code=400,
            detail=f"Documents are not ready yet: {', '.join(not_ready)}"
        )

    # Return a streaming SSE response
    return StreamingResponse(
        get_rag_stream(request.query, doc_ids_str),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",  # disables Nginx buffering if deployed
        }
    )




    