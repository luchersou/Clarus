import io

from docx import Document as DocxDocument
from openpyxl import load_workbook
import pdfplumber

CHUNK_SIZE = 1000
CHUNK_OVERLAP = 100

# Caps on what one document may produce. Every chunk costs an embedding call, and a
# small compressed file (PDF, DOCX, XLSX) can expand into far more text than its size suggests.
MAX_PDF_PAGES = 300
MAX_TEXT_CHARS = 500_000


class DocumentTooLargeError(ValueError):
    pass


def _check_text_budget(used_chars: int) -> None:
    if used_chars > MAX_TEXT_CHARS:
        raise DocumentTooLargeError(
            "The document has too much text to process. Split it into smaller files."
        )


def extract_text_and_chunk(file_bytes: bytes, file_type: str) -> list[tuple[str, int]]:
    if file_type == "PDF":
        pages = _extract_pdf(file_bytes)
    elif file_type == "DOCX":
        pages = _extract_docx(file_bytes)
    elif file_type == "XLSX":
        pages = _extract_xlsx(file_bytes)
    else:
        raise ValueError(f"Unsupported file type: {file_type}")

    chunks: list[tuple[str, int]] = []
    for page_number, page_text in pages:
        for chunk_text in _split_into_chunks(page_text):
            chunks.append((chunk_text, page_number))

    return chunks


def _extract_pdf(file_bytes: bytes) -> list[tuple[int, str]]:
    pages: list[tuple[int, str]] = []
    used_chars = 0

    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        if len(pdf.pages) > MAX_PDF_PAGES:
            raise DocumentTooLargeError(
                f"The PDF has more than {MAX_PDF_PAGES} pages. Split it into smaller files."
            )

        for page_number, page in enumerate(pdf.pages, start=1):
            parts = []

            text = page.extract_text() or ""
            if text.strip():
                parts.append(text)

            tables = page.extract_tables()
            for table in tables:
                for row in table:
                    row_text = " | ".join(str(cell).strip() if cell else "" for cell in row)
                    if row_text.strip(" |"):
                        parts.append(row_text)

            page_text = "\n".join(parts)
            used_chars += len(page_text)
            _check_text_budget(used_chars)
            pages.append((page_number, page_text))

    return pages


def _extract_docx(file_bytes: bytes) -> list[tuple[int, str]]:
    doc = DocxDocument(io.BytesIO(file_bytes))

    parts = [paragraph.text for paragraph in doc.paragraphs if paragraph.text.strip()]

    for table in doc.tables:
        for row in table.rows:
            row_text = " | ".join(cell.text.strip() for cell in row.cells)
            if row_text.strip(" |"):
                parts.append(row_text)

    full_text = "\n".join(parts)
    _check_text_budget(len(full_text))
    return [(1, full_text)]


def _extract_xlsx(file_bytes: bytes) -> list[tuple[int, str]]:
    # read_only streams the rows instead of loading the whole workbook into memory
    workbook = load_workbook(io.BytesIO(file_bytes), data_only=True, read_only=True)
    pages: list[tuple[int, str]] = []
    used_chars = 0

    try:
        for sheet_index, sheet in enumerate(workbook.worksheets, start=1):
            rows_text = []
            for row in sheet.iter_rows(values_only=True):
                row_text = " | ".join(str(cell) for cell in row if cell is not None)
                if row_text:
                    rows_text.append(row_text)
                    used_chars += len(row_text)
                    _check_text_budget(used_chars)
            pages.append((sheet_index, "\n".join(rows_text)))
    finally:
        workbook.close()

    return pages


def _split_into_chunks(text: str) -> list[str]:
    text = text.strip()
    if not text:
        return []

    chunks = []
    start = 0
    while start < len(text):
        end = start + CHUNK_SIZE
        chunks.append(text[start:end])
        start = end - CHUNK_OVERLAP

    return chunks