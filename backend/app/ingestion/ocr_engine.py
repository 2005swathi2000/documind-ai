import fitz
from PIL import Image
import io
import logging
from typing import Optional, Tuple

logger = logging.getLogger(__name__)

try:
    import pytesseract
    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False

class OCREngine:
    @staticmethod
    def is_available() -> bool:
        if not TESSERACT_AVAILABLE:
            return False
        try:
            pytesseract.get_tesseract_version()
            return True
        except Exception:
            return False

    @staticmethod
    def process_scanned_page(pdf_path: str, page_num: int) -> Tuple[str, bool]:
        """
        Renders PDF page to image and runs OCR if Tesseract is available.
        Returns tuple of (ocr_text, success_flag).
        """
        try:
            doc = fitz.open(pdf_path)
            if page_num < 1 or page_num > len(doc):
                doc.close()
                return "", False
            
            page = doc[page_num - 1]
            pix = page.get_pixmap(dpi=300)
            img = Image.open(io.BytesIO(pix.tobytes("png")))
            doc.close()

            if OCREngine.is_available():
                ocr_text = pytesseract.image_to_string(img)
                return ocr_text.strip(), True
            else:
                logger.warning(f"Tesseract OCR is not configured/installed on system PATH. Skipping OCR for page {page_num}.")
                return "[Scanned Image Page - OCR Engine Unavailable on System]", False
        except Exception as e:
            logger.error(f"OCR processing failed for page {page_num}: {e}")
            return "", False
