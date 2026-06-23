from typing import Annotated
from pathlib import Path
import sys

from fastapi import Depends, File, UploadFile

BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.main import app
from app.models.response_models import UploadResponse
from app.routes.chatbot_routes import get_services, upload_pdf


@app.post("/upload", response_model=UploadResponse, tags=["PDF Upload"])
async def upload_pdf_compat(
    services: Annotated[dict, Depends(get_services)],
    file: UploadFile = File(...),
    topic: str | None = None,
) -> UploadResponse:
    return await upload_pdf(services=services, file=file, topic=topic)
