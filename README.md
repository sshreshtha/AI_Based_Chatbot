# NTPC AI Chatbot

An AI-powered knowledge assistant for NTPC employees and trainees. Answers questions about HR policies, safety procedures, joining formalities, and plant operations using a Retrieval-Augmented Generation (RAG) pipeline backed by MongoDB and Google Gemini.

---

## Architecture

```
frontend/               Next.js 16 chatbot UI (employee-facing)
frontend_admin-portal/  Vite + TanStack Router admin portal (admin-facing)
backend/                FastAPI Python backend (RAG engine + REST API)
data/knowledge/         Bundled PDF knowledge base (auto-ingested on startup)
```

### How it works

1. **Ingestion** - PDFs in `data/knowledge/` are extracted, chunked, and embedded using `sentence-transformers/all-MiniLM-L6-v2`, then stored in MongoDB.
2. **Retrieval** - Incoming queries are NLP-preprocessed, embedded, and retrieved via hybrid vector + keyword search across `knowledge_chunks` and `admin_resolutions`.
3. **Generation** - Retrieved context is passed to Google Gemini, which generates a grounded answer with no hallucination outside context.
4. **Confidence** - A confidence score gates whether an answer is returned or a support ticket is suggested.
5. **Caching** - High-confidence answers are cached by topic + embedding similarity, with strict token-overlap gating to prevent wrong cache hits.
6. **Ticket escalation** - Low-confidence queries generate support tickets. Admins resolve tickets via the admin portal; resolutions are stored back as `admin_resolutions` for future retrieval.

---

## Prerequisites

- Python 3.11+
- Node.js 20+ and npm
- MongoDB database
- Google Gemini API key

---

## Setup

### 1. Environment variables

Copy `.env` to the project root and fill in your values:

```env
# MongoDB
MONGO_URI=mongodb://localhost:27017
MONGO_DB=ntpc_ai_chatbot

# Gemini
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash

# SMTP (optional - for ticket resolution emails)
SMTP_HOST=
SMTP_PORT=587
SMTP_USERNAME=
SMTP_PASSWORD=
SMTP_FROM_EMAIL=

# JWT
JWT_SECRET_KEY=change_me_in_production
```

### 2. Python dependencies

```bash
# Activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux

pip install -r requirements.txt
```

### 3. Backend

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

API docs available at `http://localhost:8000/docs`

### 4. Chatbot frontend (employee UI)

```bash
cd frontend
npm install
npm run dev
# -> http://localhost:3000
```

### 5. Admin portal

```bash
cd frontend_admin-portal
npm install
npm run dev
# -> http://localhost:8080
```

Default admin credentials (set via `.env`):
- Username: `admin`
- Password: `admin123`

---

## API Reference

All endpoints are prefixed with `/api/chat`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/query` | Submit a question, get an AI answer |
| POST | `/api/chat/ticket` | Create a support ticket |
| GET | `/api/chat/tickets` | List tickets (admin) |
| POST | `/api/chat/tickets/{id}/resolve` | Resolve a ticket (admin) |
| POST | `/api/chat/upload` | Upload PDF to knowledge base (admin) |
| GET | `/api/chat/history` | Session query history |
| GET | `/api/chat/analytics` | Top query analytics |
| GET | `/api/chat/health` | Health check |
| GET | `/api/chat/admin/overview` | Admin dashboard stats |
| POST | `/auth/login` | Admin login (JWT) |

---

## Knowledge Base

Place additional PDF documents in `data/knowledge/`. They are automatically ingested on backend startup if not already indexed. You can also upload PDFs directly from the admin portal.

---

## Project Structure

```
backend/
  app/
    config/settings.py          Runtime configuration (pydantic-settings)
    database/mongo_client.py    MongoDB connection
    auth/jwt_handler.py         JWT verification
    models/                     Pydantic request/response/retrieval models
    routes/
      chatbot_routes.py         All chatbot + admin API endpoints
      auth_routes.py            Login endpoint
    services/
      retrieval_service.py      Hybrid vector + keyword retrieval + ranking
      nlp_service.py            Query normalization, tokenization, alias expansion
      embedding_service.py      sentence-transformers embedding
      gemini_service.py         Grounded answer generation
      cache_service.py          Embedding-gated response cache
      confidence_service.py     Retrieval confidence classification
      knowledge_ingestion_service.py  PDF -> chunks -> MongoDB
      local_ingestion_service.py      Auto-ingest bundled PDFs on startup
      pdf_extraction_service.py       PyMuPDF text extraction + cleaning
      admin_resolution_service.py     Store resolved tickets for retrieval
      alias_learning_service.py       Learn alternate query phrasings
      analytics_service.py            Record and query analytics
      ticket_service.py               Ticket CRUD
      auth_service.py                 Admin auth + JWT generation
      email_service.py                SMTP ticket resolution emails
```
