import fitz

def extract_text_by_page(file_path: str) -> list[dict]:
    """
    Open a PDF and extract text from each page separately.
    Returns a list of dicts, one per page:
    [
        {"page_number": 1, "text": "Introduction to transformers..."},
        {"page_number": 2, "text": "The attention mechanism..."},
        ...
    ]
    We keep track of page numbers so we can show citations like
    "Source: attention-paper.pdf, Page 4" in the final answer.
    """

    pages = []
    doc = fitz.open(file_path)

    for page_num in range(len(doc)):
        page = doc[page_num]
        text: str = page.get_text("text")  # type: ignore[assignment]

        # Clean up excessive whitespace but keep paragraph breaks
        text = " ".join(text.split())

        if text.strip(): # skip completely empty pages
            pages.append({
                "page_number": page_num + 1,
                "text": text,
            })

    doc.close()

    return pages

