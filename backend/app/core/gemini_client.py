from google import genai
from google.genai import types
from app.config import settings

# Create a single client instance reused across all requests
client = genai.Client(
    api_key=settings.GEMINI_API_KEY
)

def get_embeddings(text: str) -> list[float]:
    """
    Convert a string of text into a vector (list of numbers).
    This vector mathematically represents the meaning of the text.
    Similar texts will have vectors close to each other in space.
    Used for: embedding document chunks
    """
    print(text)

    result = client.models.embed_content(
        model="gemini-embedding-001",
        contents=text,
        config=types.EmbedContentConfig(task_type="RETRIEVAL_DOCUMENT")
    )

    print(result)

    if not result.embeddings:
        raise RuntimeError(f"Gemini embedding API returned no embeddings. Full result: {result}")

    values = result.embeddings[0].values
    if values is None:
        raise RuntimeError(f"Gemini embedding returned None values. Full result: {result}")

    return values

def get_query_embeddings(text:str) -> list[float]:
    """
    Same as above but with task_type='retrieval_query'.
    Gemini uses slightly different embeddings for queries vs documents
    to improve retrieval accuracy — always use this for user questions.
    """

    print(text)

    result = client.models.embed_content(
        model="gemini-embedding-001",
        contents=text,
        config=types.EmbedContentConfig(task_type="RETRIEVAL_QUERY")
    )

    print(result)

    if not result.embeddings:
        raise RuntimeError(f"Gemini embedding API returned no embeddings. Full result: {result}")

    values = result.embeddings[0].values
    if values is None:
        raise RuntimeError(f"Gemini embedding returned None values. Full result: {result}")

    return values

def stream_chat(prompt: str):
    """
    Send a prompt to Gemini 2.5 Flash and get back a streaming response.
    Instead of waiting for the full answer, it yields text tokens one by one
    — this is what makes the AI response appear word-by-word on the frontend.
    """
    response = client.models.generate_content_stream(
        model="gemini-3.6-flash",
        contents=prompt,
    )

    print(response)

    for chunk in response:
        if chunk.text:
            yield chunk.text

    

