import google.generativeai as genai
from app.config import settings

genai.configure(
    api_key=settings.GEMINI_API_KEY
)

# a single chat model instance reused across all requests
chat_model = genai.GenerativeModel("gemini-2.5-flash")

def get_embeddings(text: str) -> list[float]:
    """
    Convert a string of text into a vector (list of numbers).
    This vector mathematically represents the meaning of the text.
    Similar texts will have vectors close to each other in space.
    Used for: embedding document chunks
    """
    print(text)

    result = genai.embed_content(
        model="gemini-embedding-001",
        content=text,
        task_type="retrieval_document"
    )

    print(result)

    return result['embedding']

def get_query_embeddings(text:str) -> list[float]:
    """
    Same as above but with task_type='retrieval_query'.
    Gemini uses slightly different embeddings for queries vs documents
    to improve retrieval accuracy — always use this for user questions.
    """

    print(text)

    result = genai.embed_content(
        model="gemini-embedding-001",
        content=text,
        task_type="retrieval_query"
    )

    print(result)

    return result['embedding']

def stream_chat(prompt: str):
    """
    Send a prompt to Gemini 2.5 Flash and get back a streaming response.
    Instead of waiting for the full answer, it yields text tokens one by one
    — this is what makes the AI response appear word-by-word on the frontend.
    """
    response = chat_model.generate_content(prompt, stream=True)

    print(response)

    for chunk in response:
        if chunk.text:
            yield chunk.text

    

