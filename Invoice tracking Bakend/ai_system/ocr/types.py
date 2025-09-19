from dataclasses import dataclass
from typing import Dict, Optional


@dataclass
class OcrResult:
    template_id: Optional[int]
    fields: Dict[str, str]
    confidence: float
    raw_text: str