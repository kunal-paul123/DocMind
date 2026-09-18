import chromadb
from chromadb.config import Settings as ChromaSettings

chroma_client = chromadb.PersistentClient(
    path="./chroma_db",
    settings=ChromaSettings(
        anonymized_telemetry=False
    )
)

def get_or_create_collection(collection_name: str = "documents"):
    """
    Get an existing ChromaDB collection or create it if it doesn't exist.
    A collection is like a table in a regular database — it holds all
    the document chunks and their vector embeddings.
    We use one shared collection for all documents, and filter by doc_id later.
    """
    return chroma_client.get_or_create_collection(
        name=collection_name,
        metadata={"hnsw:space":"cosine"}, # cosine similarity for semantic search
    )

def delete_document_vectors(doc_id: str):
    """
    Delete ALL vector chunks that belong to a specific document.
    Called when a user deletes a document — cleans up ChromaDB too.
    Uses the 'doc_id' metadata field we attach when inserting chunks.
    """

    collection = get_or_create_collection()
    collection.delete(
        where = {"doc_id": doc_id}
    )

