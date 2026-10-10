from typing import List, Dict, Any
import uuid

class ProcessedChunk:
    def __init__(
        self,
        document_id: str,
        page_number: int,
        chunk_index: int,
        content: str,
        is_table: bool = False,
        is_ocr: bool = False,
        metadata: Dict[str, Any] = None
    ):
        self.id = str(uuid.uuid4())
        self.document_id = document_id
        self.page_number = page_number
        self.chunk_index = chunk_index
        self.content = content
        self.char_count = len(content)
        self.is_table = is_table
        self.is_ocr = is_ocr
        self.metadata = metadata or {}

class DocumentChunker:
    def __init__(self, chunk_size: int = 600, overlap: int = 100):
        self.chunk_size = chunk_size
        self.overlap = overlap

    def chunk_text(self, text: str) -> List[str]:
        if not text or not text.strip():
            return []
        
        words = text.split()
        if not words:
            return []
            
        chunks = []
        # Approximate word count for target character chunk size (~5 chars/word)
        words_per_chunk = max(20, int(self.chunk_size / 5))
        overlap_words = max(5, int(self.overlap / 5))
        step = max(1, words_per_chunk - overlap_words)
        
        for i in range(0, len(words), step):
            chunk_words = words[i:i + words_per_chunk]
            chunk_str = " ".join(chunk_words)
            if len(chunk_str.strip()) > 15:  # Filter out trivial fragments
                chunks.append(chunk_str)
                
        return chunks

    def process_document_pages(
        self,
        document_id: str,
        pages_text: List[Dict[str, Any]],
        tables: List[Dict[str, Any]] = None
    ) -> List[ProcessedChunk]:
        all_chunks = []
        global_chunk_idx = 0

        # Process page text & OCR content
        for page in pages_text:
            page_num = page["page_number"]
            text = page["text"]
            is_ocr = page.get("is_ocr", False)

            text_chunks = self.chunk_text(text)
            for t_chunk in text_chunks:
                all_chunks.append(ProcessedChunk(
                    document_id=document_id,
                    page_number=page_num,
                    chunk_index=global_chunk_idx,
                    content=t_chunk,
                    is_table=False,
                    is_ocr=is_ocr,
                    metadata={"char_offset": text.find(t_chunk[:30]) if len(t_chunk) >= 30 else 0}
                ))
                global_chunk_idx += 1

        # Add extracted tables as dedicated structured chunks
        if tables:
            for tbl in tables:
                page_num = tbl["page_number"]
                markdown_content = f"### Table (Page {page_num})\n" + tbl["markdown"]
                all_chunks.append(ProcessedChunk(
                    document_id=document_id,
                    page_number=page_num,
                    chunk_index=global_chunk_idx,
                    content=markdown_content,
                    is_table=True,
                    is_ocr=False,
                    metadata={
                        "table_index": tbl.get("table_index", 1),
                        "row_count": tbl.get("row_count", 0),
                        "col_count": tbl.get("col_count", 0)
                    }
                ))
                global_chunk_idx += 1

        return all_chunks
