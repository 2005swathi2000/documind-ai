import requests
import json
import logging
from typing import Optional, List, Dict, Any
from app.config import settings

logger = logging.getLogger(__name__)

class LLMAdapter:
    @staticmethod
    def is_ollama_online() -> bool:
        try:
            res = requests.get(f"{settings.OLLAMA_BASE_URL}/api/tags", timeout=1.5)
            return res.status_code == 200
        except Exception:
            return False

    @staticmethod
    def generate_response(prompt: str, system_prompt: str, model_name: Optional[str] = None) -> str:
        target_model = model_name or settings.DEFAULT_LLM_MODEL
        
        if LLMAdapter.is_ollama_online():
            try:
                payload = {
                    "model": target_model,
                    "prompt": prompt,
                    "system": system_prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.1
                    }
                }
                res = requests.post(f"{settings.OLLAMA_BASE_URL}/api/generate", json=payload, timeout=30.0)
                if res.status_code == 200:
                    data = res.json()
                    return data.get("response", "").strip()
            except Exception as e:
                logger.warning(f"Ollama call failed ({e}). Falling back to local evidence synthesis engine.")

        return ""
