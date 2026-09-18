import json
from chromadb.api.types import Where
from app.core.chroma_client import get_or_create_collection
from app.core.gemini_client import get_query_embeddings, stream_chat


def get_rag_stream(query: str, document_ids: list[str]):
    """
    The RAG query pipeline. This is a Python generator — it yields
    SSE-formatted strings one by one, which FastAPI streams to the frontend.
    Steps:
    1. Embed the user's question into a vector
    2. Search ChromaDB for the top-5 most similar chunks (filtered to selected docs)
    3. Build a prompt: system instructions + retrieved context + user question
    4. Stream Gemini's answer token by token
    5. At the end, send the source citations as a final SSE event
    """

    # embed user query
    query_embedding = get_query_embeddings(query)

    # Step 2: Retrieve top-5 most relevant chunks from ChromaDB
    # The 'where' filter ensures we only search within the documents the user selected
    collection = get_or_create_collection()

    if len(document_ids) == 1:
        where_filter: Where = {"doc_id": {"$eq": document_ids[0]}}
    else:
        # ChromaDB uses "$or" for multiple values
        where_filter: Where = {"$or": [{"doc_id": {"$eq": doc_id}} for doc_id in document_ids]}

    results = collection.query(
        query_embeddings = [query_embedding],
        n_results = 5,     # get top 5 most similar chunks
        where = where_filter,
        include = ["documents", "metadatas"]
    ) 

    # Extract the retrieved chunks and their metadata
    if results["documents"] and results["metadatas"]:
        chunks = results["documents"][0]
        metadatas = results["metadatas"][0]
    else:
        yield f"Sorry, I couldn't find any relevant information in the uploaded documents."
        return

    # Step 3: Build the prompt
    # We give Gemini the context it needs and instruct it to cite sources
    context = "\n\n---\n\n".join([
        f"[source: {m['filename']}, page {m['page_number']}]\n{chunk}"
        for chunk, m in zip(chunks, metadatas)
    ])

    prompt = f"""You are DocMind, an expert AI research assistant. Your job is to answer the user's question based ONLY on 
    the provided document context below. Do not use any outside knowledge.

    If the answer is not found in the context, say: "I couldn't find information about that in the selected documents."

    Always be concise, accurate, and cite the source filename and page number when referencing specific information.

    --- DOCUMENT CONTEXT ---

    {context}

    --- END CONTEXT ---

    USER QUESTION: {query}

    ANSWER:"""

    # Step 4: Stream Gemini's answer token by token
    # Each token is sent as a Server-Sent Event (SSE) to the frontend
    for token in stream_chat(prompt):
        # SSE format: "data: <json>\n\n"
        yield f"data: {json.dumps({'type': 'token', 'content': token})}\n\n"
    
    # Step 5: Send source citations as a final SSE event
    # Deduplicate citations by (filename, page_number) pair
    seen = set()
    sources = []
    for m in metadatas:
        key = (m['filename'], m['page_number'])
        if key not in seen:
            seen.add(key)
            sources.append({
                "filename": m['filename'],
                "page_number": m['page_number'],
                "doc_id": m['doc_id'],
            })  
    
    yield f"data: {json.dumps({'type': 'sources', 'content': sources})}\n\n"
    
    # Signal the frontend that the stream is done
    yield f"data: {json.dumps({'type': 'done'})}\n\n"



