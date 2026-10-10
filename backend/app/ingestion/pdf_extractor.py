import fitz  # PyMuPDF
import os
import hashlib
from typing import List, Dict, Any, Tuple
import logging

logger = logging.getLogger(__name__)

class PDFPageData:
    def __init__(self, page_num: int, text: str, char_count: int, is_scanned: bool = False, image_count: int = 0):
        self.page_num = page_num
        self.text = text
        self.char_count = char_count
        self.is_scanned = is_scanned
        self.image_count = image_count

class PDFExtractor:
    @staticmethod
    def calculate_file_hash(file_path: str) -> str:
        sha256 = hashlib.sha256()
        with open(file_path, "rb") as f:
            while chunk := f.read(8192):
                sha256.update(chunk)
        return sha256.hexdigest()

    @staticmethod
    def extract_document_info(file_path: str) -> Dict[str, Any]:
        doc = fitz.open(file_path)
        file_hash = PDFExtractor.calculate_file_hash(file_path)
        file_size = os.path.getsize(file_path)
        
        metadata = doc.metadata or {}
        page_count = len(doc)
        
        doc.close()
        
        return {
            "page_count": page_count,
            "file_hash": file_hash,
            "file_size": file_size,
            "title": metadata.get("title", ""),
            "author": metadata.get("author", ""),
            "subject": metadata.get("subject", ""),
            "creator": metadata.get("creator", "")
        }

    @staticmethod
    def extract_pages(file_path: str) -> List[PDFPageData]:
        doc = fitz.open(file_path)
        pages_data = []
        
        for i in range(len(doc)):
            page = doc[i]
            text = page.get_text("text").strip()
            images = page.get_images()
            
            # Scanned page detection heuristic: text length < 50 chars but contains images or non-empty page
            is_scanned = len(text) < 50 and len(images) > 0
            
            pages_data.append(PDFPageData(
                page_num=i + 1,
                text=text,
                char_count=len(text),
                is_scanned=is_scanned,
                image_count=len(images)
            ))
            
        doc.close()
        return pages_data
