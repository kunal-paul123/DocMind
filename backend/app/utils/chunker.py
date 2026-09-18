from langchain_text_splitters import RecursiveCharacterTextSplitter

# Create one splitter instance — reused for all documents
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,    # each chunk is max 1000 characters
    chunk_overlap=200,  # 200 chars overlap between chunks to avoid cutting ideas mid-sentence
    length_function=len
)

def chunk_text(text: str) -> list[str]:
    """
    Split a large block of text into smaller overlapping chunks.
    Why do we chunk?
    - Gemini's embedding model works best on short focused passages
    - ChromaDB retrieves the top-K most relevant chunks, not entire documents
    - Smaller chunks = more precise citations
    Why overlap?
    - If a sentence is split across two chunks, the overlap ensures
      neither chunk loses context from the surrounding sentences.
    """

    return text_splitter.split_text(text)


