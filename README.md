# 🏥 Federated Healthcare RAG System

> AI assistant for healthcare questions powered by **RAG + Pinecone + Gemini**

## Architecture

```
User Query
  → React UI (port 5173)
  → FastAPI backend (port 8000)
  → Pinecone vector search
  → Retrieve top-k medical documents
  → Gemini LLM (with document context)
  → Answer + Sources + Confidence Score
```

## Project Structure

```
FMMR/
├── backend/                    # FastAPI Python service
│   ├── routes/                 # HTTP endpoint handlers
│   │   └── query.py            # POST /api/query
│   ├── services/               # Business logic
│   │   ├── pinecone_service.py # Vector DB search
│   │   ├── embedding_service.py# Query embedding
│   │   └── llm_service.py      # LLM answer generation
│   ├── utils/
│   │   └── trust_score.py      # Document trust scoring
│   ├── config.py               # App settings (env vars)
│   ├── models.py               # Pydantic schemas
│   ├── main.py                 # FastAPI app entry point
│   └── requirements.txt
├── frontend/                   # React + Vite UI
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatInterface.jsx
│   │   │   ├── ResponseCard.jsx
│   │   │   └── SourceBadge.jsx
│   │   ├── services/
│   │   │   └── api.js          # Axios calls to backend
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
├── .env.example                # ← copy to .env and fill in keys
└── README.md
```

## Quick Start

### 1. Configure environment

```bash
cp .env.example .env
# Edit .env with your Pinecone API key and Gemini API key
```

### 2. Run Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Open **http://localhost:8000/docs** for interactive Swagger UI.

### 3. Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** for the chat UI.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Liveness check |
| `POST` | `/api/query` | Submit a medical question |

### Query Request

```json
{
  "query": "What are the symptoms of Type 2 diabetes?",
  "top_k": 5,
  "language": "en"
}
```

### Query Response

```json
{
  "answer": "Type 2 diabetes symptoms include...",
  "sources": [
    {
      "id": "doc_001",
      "text": "...",
      "score": 0.92,
      "source": "WHO",
      "trust_score": 0.95
    }
  ],
  "confidence": 0.91,
  "language": "en"
}
```

## Multilingual Support

Set `language` in the request body:
- `"en"` — English (default)
- `"hi"` — Hindi
- `"te"` — Telugu

## Team Notes

- Dataset ingestion into Pinecone is handled by a separate teammate.
- Pinecone index must exist before starting the backend.
- The `EMBEDDING_DIMENSION` in `.env` must match the index dimension.
