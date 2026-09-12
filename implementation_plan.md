# DocMind — Implementation Roadmap

> **Project:** AI Research Assistant — Chat with PDFs using Gemini AI + RAG
> **Stack:** FastAPI · React 18 · Gemini · ChromaDB · Neon PostgreSQL

---

## 📊 Progress Overview

| Phase | Description | Status |
|---|---|---|
| Phase 1 | Auth Foundation (Backend) | ✅ Complete |
| Phase 2 | Document Management (Backend) | 🔴 Not Started |
| Phase 3 | AI / RAG Pipeline (Backend) | 🔴 Not Started |
| Phase 4 | Frontend State, Services & Hooks | 🔴 Not Started |
| Phase 5 | Frontend UI Components | 🔴 Not Started |
| Phase 6 | Deployment & Docker | 🔴 Not Started |

---

## ✅ Phase 1 — Auth Foundation (Backend)
> **Status: COMPLETE**

All authentication infrastructure is built and working.

- [x] `app/main.py` — FastAPI app entry point + CORS + router registration
- [x] `app/config.py` — All env vars via `pydantic-settings`
- [x] `app/database.py` — SQLAlchemy engine, session factory, `Base`
- [x] `app/models/user.py` — User ORM model (`UUID PK`, `google_id`, `email`, `name`, `picture`, `is_active`)
- [x] `app/schemas/user.py` — `UserOut`, `TokenResponse` Pydantic schemas
- [x] `app/core/security.py` — JWT create/decode helpers + `get_current_user` dependency
- [x] `app/routers/auth.py` — `GET /auth/google`, `GET /auth/google/callback`, `GET /auth/me`
- [x] `alembic/` — Migration infrastructure configured, `users` table migrated

---

## 🔴 Phase 2 — Document Management (Backend)
> **Status: NOT STARTED**

Handles PDF uploads, metadata storage, and processing status tracking.

- [ ] **`app/models/document.py`** — Document ORM model
  ```python
  # Columns: id (UUID PK), user_id (FK→users), filename, file_path,
  #          status (Enum: PENDING→PROCESSING→READY/FAILED), created_at
  ```
- [ ] **`app/schemas/document.py`** — `DocumentOut`, `DocumentCreate` Pydantic schemas
- [ ] **`app/schemas/chat.py`** — `ChatRequest`, `ChatResponse` Pydantic schemas
- [ ] **Alembic migration** — `alembic revision --autogenerate -m "create documents table"` → `alembic upgrade head`
- [ ] **`app/routers/documents.py`** — Document CRUD routes:
  - `POST /documents/upload` — multipart PDF upload, triggers background processing
  - `GET /documents` — list current user's documents
  - `GET /documents/{id}/status` — poll processing status
  - `DELETE /documents/{id}` — delete document + its ChromaDB vectors
- [ ] **Register `documents` router** in `app/main.py`
- [ ] **Create `uploads/` directory** (gitignored) for storing raw PDFs

---

## 🔴 Phase 3 — AI / RAG Pipeline (Backend)
> **Status: NOT STARTED**

The core intelligence layer — PDF parsing, embedding, vector storage, and LLM streaming.

### Core AI Clients
- [ ] **`app/core/gemini_client.py`** — Gemini API wrapper
  - Chat model: `gemini-2.5-flash`
  - Embedding model: `text-embedding-004`
- [ ] **`app/core/chroma_client.py`** — ChromaDB collection manager
  - Connect to persistent `./chroma_db/` store
  - Scoped CRUD per `doc_id`

### Document Processing Utilities
- [ ] **`app/utils/pdf_parser.py`** — PyMuPDF (`fitz`) text extraction
  - Extract text per-page with page number metadata
  - Clean/normalize whitespace
- [ ] **`app/utils/chunker.py`** — LangChain `RecursiveCharacterTextSplitter`
  - Configure chunk size + overlap

### Service Layer
- [ ] **`app/services/document_service.py`** — Full processing pipeline (runs as `BackgroundTask`)
  1. Set document status → `PROCESSING`
  2. Extract text from PDF via `pdf_parser.py`
  3. Split into chunks via `chunker.py`
  4. Generate embeddings via `gemini_client.py` (`text-embedding-004`)
  5. Upsert chunks + metadata into ChromaDB via `chroma_client.py`
  6. Set status → `READY` (or `FAILED` on any error)

- [ ] **`app/services/rag_service.py`** — RAG query + streaming pipeline
  1. Embed user query → query vector
  2. ChromaDB top-K=5 retrieval, filtered by selected `doc_id`(s)
  3. Assemble prompt with retrieved context chunks
  4. Stream tokens from `gemini-2.5-flash` via `generate_content_stream`
  5. Yield SSE events → `FastAPI StreamingResponse`
  6. Return source citations from chunk metadata

- [ ] **`app/routers/chat.py`** — `POST /chat` SSE streaming endpoint
- [ ] **Register `chat` router** in `app/main.py`

---

## 🔴 Phase 4 — Frontend: State, Services & Hooks
> **Status: NOT STARTED**

Global state, API communication layer, and reusable React hooks.

### Stores (Zustand)
- [ ] **`src/store/authStore.js`** — User + JWT token global state
- [ ] **`src/store/chatStore.js`** — Chat messages, active document selection

### Services (API Layer)
- [ ] **`src/services/api.js`** — Axios instance with Bearer token interceptor
- [ ] **`src/services/documentService.js`** — Wraps all `/documents` API calls
- [ ] **`src/services/chatService.js`** — Wraps `/chat` SSE streaming

### Hooks (React Query + custom)
- [ ] **`src/hooks/useAuth.js`** — Auth state hook
- [ ] **`src/hooks/useDocuments.js`** — Document CRUD with React Query caching
- [ ] **`src/hooks/useChat.js`** — Chat SSE stream hook (real-time token streaming)

### Utilities
- [ ] **`src/utils/stream.js`** — SSE `EventSource` stream parser utility

---

## 🔴 Phase 5 — Frontend: UI Components
> **Status: NOT STARTED**

All reusable components that power the Dashboard and document/chat experience.

### Layout Components
- [ ] **`src/components/layout/AppShell.jsx`** — Main layout wrapper (sidebar + content area)
- [ ] **`src/components/layout/Navbar.jsx`** — Top navigation bar with user avatar
- [ ] **`src/components/layout/Sidebar.jsx`** — Left panel document list

### Document Components
- [ ] **`src/components/documents/DocumentUpload.jsx`** — Drag & drop PDF uploader (`react-dropzone`)
- [ ] **`src/components/documents/DocumentCard.jsx`** — Single document item in sidebar
- [ ] **`src/components/documents/DocumentStatus.jsx`** — Processing status badge (`PENDING` / `PROCESSING` / `READY` / `FAILED`)

### Chat Components
- [ ] **`src/components/chat/ChatWindow.jsx`** — Scrollable message display area
- [ ] **`src/components/chat/ChatInput.jsx`** — Text input + send button
- [ ] **`src/components/chat/MessageBubble.jsx`** — User/AI message bubble with `react-markdown` rendering
- [ ] **`src/components/chat/SourceCitation.jsx`** — Citation card showing filename + page number

### Auth Components
- [ ] **`src/components/auth/GoogleLoginButton.jsx`** — Reusable "Continue with Google" button

### Base UI Components (`shadcn/ui`)
- [ ] Button, Input, Badge, Card, Avatar, Spinner, Toast/Sonner

### Wire-up
- [ ] **Update `src/pages/Dashboard.jsx`** — Integrate all components, stores, and hooks

---

## 🔴 Phase 6 — Deployment & Docker
> **Status: NOT STARTED**

- [ ] **`backend/Dockerfile`** — Containerize FastAPI app
- [ ] **`docker-compose.yml`** (root) — Compose backend + ChromaDB service
  - Note: Neon DB is cloud-hosted — no local Postgres container needed
- [ ] Add `uploads/` and `chroma_db/` to `backend/.gitignore`
- [ ] Set production environment variables
- [ ] Test full deployment end-to-end

---

## 🔄 RAG Pipeline Architecture

```
User Query
    │
    ▼
[Embed Query]  ── text-embedding-004 ──►  Query Vector
    │
    ▼
[ChromaDB Retrieval]  ── top-K=5 filtered by doc_id ──►  Context Chunks
    │
    ▼
[Prompt Assembly]
    │  "You are a research assistant. Answer only from the context below.
    │   Context: {chunks}    Question: {query}"
    ▼
[Gemini 2.5 Flash]  ── generate_content_stream ──►  Token Stream
    │
    ▼
[FastAPI StreamingResponse]  ── SSE ──►  Frontend EventSource
    │
    ▼
[SourceCitation.jsx]  ── chunk metadata ──►  Citation Cards
```

---

## 🔗 API Endpoints — Target State

| Method | Endpoint | Auth | Status |
|---|---|---|---|
| `GET` | `/` | ❌ | ✅ Done |
| `GET` | `/auth/google` | ❌ | ✅ Done |
| `GET` | `/auth/google/callback` | ❌ | ✅ Done |
| `GET` | `/auth/me` | ✅ | ✅ Done |
| `POST` | `/documents/upload` | ✅ | 🔴 Phase 2 |
| `GET` | `/documents` | ✅ | 🔴 Phase 2 |
| `GET` | `/documents/{id}/status` | ✅ | 🔴 Phase 2 |
| `DELETE` | `/documents/{id}` | ✅ | 🔴 Phase 2 |
| `POST` | `/chat` | ✅ | 🔴 Phase 3 |
