from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from pymongo.database import Database

from app.services.embedding_service import EmbeddingService


class KnowledgeIngestionService:
    """Stores extracted PDF text chunks in MongoDB Atlas Vector Search format."""

    def __init__(self, db: Database, embedding_service: EmbeddingService):
        self.collection = db.knowledge_chunks
        self.embedding_service = embedding_service

    def store_pdf_text(self, text: str, source_document: str, topic: str | None = None) -> int:
        chunks = self._chunk_text(text)
        if not chunks:
            return 0
        now = datetime.now(timezone.utc)
        inferred_topic = topic or Path(source_document).stem or "uploaded_pdf"
        documents = [
            {
                "chunk_id": f"CHK-{uuid4().hex[:12].upper()}",
                "text": chunk,
                "embedding": self.embedding_service.embed_query(chunk),
                "source_document": source_document,
                "topic": inferred_topic,
                "created_at": now,
            }
            for chunk in chunks
        ]
        self.collection.insert_many(documents)
        return len(documents)

    @staticmethod
    def _chunk_text(text: str, chunk_size: int = 1200, overlap: int = 150) -> list[str]:
        normalized = " ".join(text.split())
        if not normalized:
            return []
        chunks: list[str] = []
        start = 0
        while start < len(normalized):
            end = min(start + chunk_size, len(normalized))
            chunks.append(normalized[start:end].strip())
            if end == len(normalized):
                break
            start = max(end - overlap, start + 1)
        return chunks
