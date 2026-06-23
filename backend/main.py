from app.main import app
from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from rapidfuzz import fuzz
import fitz  # PyMuPDF

app = FastAPI(title="AI Chatbot Backend", version="1.0.0")

# ✅ CORS (frontend connection)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔥 Storage
queries = []
knowledge_base = ""  # stores PDF text

# Models
class Query(BaseModel):
    question: str
    email: str = ""

class Answer(BaseModel):
    id: int
    answer: str

# Root
@app.get("/")
def read_root():
    return {"message": "FastAPI backend is ready"}

# 🔥 Upload PDF
@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    global knowledge_base

    pdf_bytes = await file.read()
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")

    text = ""
    for page in doc:
        text += page.get_text()

    knowledge_base = text

    return {"message": "Brochure uploaded and processed"}

# 🔥 MAIN AI LOGIC
@app.post("/ask")
def ask_question(query: Query):

    # ✅ 1. Check memory (previous answers)
    best_match = None
    best_score = 0

    for q in queries:
        score = fuzz.ratio(query.question.lower(), q["question"].lower())

        if score > best_score:
            best_score = score
            best_match = q

    if best_score > 70 and best_match and best_match["answer"] is not None:
        return {
            "source": "memory",
            "answer": best_match["answer"]
        }

    # ✅ 2. Search inside PDF (smart extraction)
    if knowledge_base:
        lines = knowledge_base.split("\n")

        best_line = ""
        best_score = 0

        for line in lines:
            if len(line.strip()) < 20:
                continue  # skip useless lines

            score = fuzz.partial_ratio(query.question.lower(), line.lower())

            if score > best_score:
                best_score = score
                best_line = line

        if best_score > 60:
            return {
                "source": "brochure",
                "answer": best_line.strip(),
                "confidence": best_score
            }

    # ❌ 3. Store for admin
    new_query = {
        "id": len(queries),
        "question": query.question,
        "email": query.email,
        "answer": None,
        "status": "pending"
    }

    queries.append(new_query)

    return {
        "message": "Query stored for admin review"
    }

# Get all queries
@app.get("/queries")
def get_queries():
    return queries

# Get pending queries
@app.get("/queries/pending")
def get_pending_queries():
    return [q for q in queries if q["status"] == "pending"]

# Admin answers
@app.post("/answer")
def answer_query(data: Answer):
    for q in queries:
        if q["id"] == data.id:
            q["answer"] = data.answer
            q["status"] = "answered"
            return {"message": "Answer submitted successfully"}

    return {"message": "Query not found"}
