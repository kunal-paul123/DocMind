from app.core.gemini_client import get_embeddings
import uuid
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.document import Document, DocumentStatus
from app.utils.pdf_parser import extract_text_by_page
from app.utils.chunker import chunk_text
from app.core.chroma_client import get_or_create_collection


def process_document(doc_id: str, file_path: str):
    """
    The full document processing pipeline. Runs as a FastAPI BackgroundTask
    so it doesn't block the upload API response.

    Steps:
    1. Create a fresh DB session (background tasks don't share the request's session)
    2. Mark document as PROCESSING
    3. Extract text page-by-page from the PDF
    4. Split each page's text into small chunks
    5. Generate a vector embedding for each chunk via Gemini
    6. Store all chunks + embeddings in ChromaDB
    7. Mark document as READY

    If anything fails, mark as FAILED so the user knows.
    """
    # Step 1: Create own DB session — background tasks run outside the request lifecycle
    db: Session = SessionLocal()

    try:
        # Step 2: Mark as PROCESSING
        doc = db.query(Document).filter(Document.id == doc_id).first()
        if not doc:
            return
        doc.status = DocumentStatus.PROCESSING
        db.commit()

        # Step 3: Extract text from PDF, page by page
        pages = extract_text_by_page(file_path)

        # Prepare lists for bulk insert into ChromaDB
        all_chunk_ids = []
        all_embeddings = []
        all_documents = []  # the actual text of each chunk
        all_metadatas = []  # metadata attached to each chunk for citations

        # Step 4 & 5: Chunk each page, embed each chunk
        for page_data in pages:
            chunks = chunk_text(page_data["text"])

            for chunk in chunks:
                embedding = get_embeddings(chunk)  # calls Gemini embedding API

                chunk_id = str(uuid.uuid4())  # unique ID for this chunk in ChromaDB

                all_chunk_ids.append(chunk_id)
                all_embeddings.append(embedding)
                all_documents.append(chunk)
                all_metadatas.append({
                    "doc_id": doc_id,               # to filter by document later
                    "filename": doc.filename,        # for citations
                    "page_number": page_data["page_number"],  # for citations
                })

        # Step 6: Insert all chunks into ChromaDB in one batch call
        collection = get_or_create_collection()
        collection.add(
            ids=all_chunk_ids,
            embeddings=all_embeddings,
            documents=all_documents,
            metadatas=all_metadatas,
        )

        # Step 7: Mark as READY
        doc.status = DocumentStatus.READY
        db.commit()

    except Exception as e:
        # If anything goes wrong, mark as FAILED
        print(f"[document_service] Error processing {doc_id}: {e}")
        doc = db.query(Document).filter(Document.id == doc_id).first()
        if doc:
            doc.status = DocumentStatus.FAILED
            db.commit()
    finally:
        db.close()  # always close the session
