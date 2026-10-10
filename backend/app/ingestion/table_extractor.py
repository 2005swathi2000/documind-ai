import pdfplumber
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

class TableExtractor:
    @staticmethod
    def extract_tables_from_pdf(file_path: str) -> List[Dict[str, Any]]:
        extracted_tables = []
        try:
            with pdfplumber.open(file_path) as pdf:
                for page_idx, page in enumerate(pdf.pages):
                    page_num = page_idx + 1
                    tables = page.extract_tables()
                    for table_idx, table in enumerate(tables):
                        if not table or len(table) == 0:
                            continue
                        
                        # Format table into markdown
                        markdown_table = TableExtractor._table_to_markdown(table)
                        if markdown_table.strip():
                            extracted_tables.append({
                                "page_number": page_num,
                                "table_index": table_idx + 1,
                                "raw_grid": table,
                                "markdown": markdown_table,
                                "row_count": len(table),
                                "col_count": max(len(row) for row in table if row)
                            })
        except Exception as e:
            logger.error(f"Error during table extraction for {file_path}: {e}")
            
        return extracted_tables

    @staticmethod
    def _table_to_markdown(table: List[List[Any]]) -> str:
        if not table:
            return ""
        
        # Clean null values
        cleaned_rows = []
        for row in table:
            cleaned_row = [str(cell).replace("\n", " ").strip() if cell is not None else "" for cell in row]
            if any(cleaned_row):
                cleaned_rows.append(cleaned_row)
                
        if not cleaned_rows:
            return ""
            
        headers = cleaned_rows[0]
        divider = ["---"] * len(headers)
        
        lines = [
            "| " + " | ".join(headers) + " |",
            "| " + " | ".join(divider) + " |"
        ]
        
        for row in cleaned_rows[1:]:
            # Match header column count
            if len(row) < len(headers):
                row = row + [""] * (len(headers) - len(row))
            elif len(row) > len(headers):
                row = row[:len(headers)]
            lines.append("| " + " | ".join(row) + " |")
            
        return "\n".join(lines)
