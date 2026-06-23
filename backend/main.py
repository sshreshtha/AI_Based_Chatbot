from fastapi import FastAPI, UploadFile, File, Depends
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from rapidfuzz import fuzz
import fitz

from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models

import smtplib
from email.mime.text import MIMEText

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Chatbot Backend", version="2.0.0")

# ✅ CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔥 Global PDF storage
knowledge_base = ""

# ✅ DB Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Models
class Query(BaseModel):
    question: str
    email: str = ""

class Answer(BaseModel):
    id: int
    answer: str

# Root
@app.get("/")
def root():
    return {"message": "Backend running 🚀"}

# 🔥 EMAIL FUNCTION
def send_email(to_email, question, answer):
    sender_email = "c7690327@gmail.com"
    app_password = "vbsr lnsw skgl cwkw"

    subject = "Your Query has been Answered"
    body = f"""
Your Question:
{question}

Answer:
{answer}
"""

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = sender_email
    msg["To"] = to_email

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(sender_email, app_password)
        server.sendmail(sender_email, to_email, msg.as_string())
        server.quit()
    except Exception as e:
        print("Email error:", e)

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

# 🔥 ASK (AI + MEMORY + DB)
@app.post("/ask")
def ask_question(query: Query, db: Session = Depends(get_db)):

    all_queries = db.query(models.QueryModel).all()

    # ✅ 1. MEMORY CHECK
    best_match = None
    best_score = 0

    for q in all_queries:
        score = fuzz.ratio(query.question.lower(), q.question.lower())
        if score > best_score:
            best_score = score
            best_match = q

    if best_score > 70 and best_match and best_match.answer:
        return {
            "source": "memory",
            "answer": best_match.answer
        }

    # ✅ 2. PDF SEARCH
    if knowledge_base:
        lines = knowledge_base.split("\n")

        best_line = ""
        best_score = 0

        for line in lines:
            if len(line.strip()) < 20:
                continue

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

    # ❌ 3. STORE IN DB
    new_query = models.QueryModel(
        question=query.question,
        email=query.email,
        answer=None,
        status="pending"
    )

    db.add(new_query)
    db.commit()

    return {"message": "Query stored for admin review"}

# ✅ Get all queries
@app.get("/queries")
def get_queries(db: Session = Depends(get_db)):
    return db.query(models.QueryModel).all()

# ✅ Get pending queries
@app.get("/queries/pending")
def get_pending(db: Session = Depends(get_db)):
    return db.query(models.QueryModel).filter(models.QueryModel.status == "pending").all()

# 🔥 ADMIN ANSWER + EMAIL
@app.post("/answer")
def answer_query(data: Answer, db: Session = Depends(get_db)):
    q = db.query(models.QueryModel).filter(models.QueryModel.id == data.id).first()

    if q:
        q.answer = data.answer
        q.status = "answered"
        db.commit()

        # 📩 SEND EMAIL
        if q.email:
            send_email(q.email, q.question, q.answer)

        return {"message": "Answer submitted + email sent"}

    return {"message": "Query not found"}