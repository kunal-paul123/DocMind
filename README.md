# ⬡ DocMind — AI Research Assistant

> Chat with your PDF documents using the power of Gemini AI and Retrieval-Augmented Generation (RAG).

DocMind is a full-stack AI research assistant that lets users upload PDF documents and interact with them through a natural language chat interface. Answers are grounded in the actual content of your documents — with exact source citations included.

---

## ✨ Features

- 🔐 **Google OAuth Authentication** — Secure, one-click sign-in with Google
- 📄 **PDF Upload & Processing** — Drag & drop upload with real-time background processing status
- 🧠 **RAG Pipeline** — Semantic search over your documents using Gemini vector embeddings
- 💬 **Streaming Chat** — Real-time token streaming via Server-Sent Events (SSE)
- 📎 **Source Citations** — Every AI answer includes the exact filename and page number
- 📚 **Multi-Document Support** — Select and query across multiple documents simultaneously
- 🌙 **Dark Theme UI** — Premium dark mode interface built with React + Vite

---

## 🧰 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + Vite | UI framework & build tool |
| Tailwind CSS | Utility-first styling |
| shadcn/ui | Pre-built accessible components |
| Zustand | Lightweight global state management |
| Axios + React Query | API calls + server state caching |
| React Router v6 | Client-side routing & protected routes |
| react-dropzone | Drag & drop PDF upload |
| react-markdown | Render AI responses as markdown |
| React Hook Form + Zod | Form validation |

### Backend
| Technology | Purpose |
|---|---|
| FastAPI (Python) | REST API + Server-Sent Events streaming |
| SQLAlchemy 2.0 | ORM for relational database models |
| Alembic | Database schema migrations |
| python-jose | JWT token creation & validation |
| passlib (bcrypt) | Password hashing |
| httpx | Async HTTP client (Google OAuth) |
| python-multipart | Multipart file upload handling |
| slowapi | Rate limiting on API endpoints |
| pydantic-settings | Environment variable management |
| FastAPI BackgroundTasks | Async document processing (no Redis/Celery needed) |

### AI / ML
| Technology | Purpose |
|---|---|
| Gemini API `gemini-1.5-flash` | LLM for chat response generation |
| Gemini Embedding API `text-embedding-004` | Vector embeddings for documents & queries |
| LangChain | Document chunking & retrieval orchestration |
| ChromaDB | Local, self-hostable vector store |
| PyMuPDF (`fitz`) | PDF text extraction per page |

### Database
| Technology | Purpose |
|---|---|
| Neon DB (Serverless PostgreSQL) | Users & document metadata — cloud-hosted, zero infra |
| ChromaDB | Vector embeddings — local persistent store |

---

## 📁 Folder Structure

```
RAG/
│
├── frontend/                        # React + Vite App
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── assets/                  # Static images, icons
│   │   ├── components/
│   │   │   ├── ui/                  # shadcn/ui base components (Button, Input, etc.)
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.jsx      # Document list sidebar
│   │   │   │   ├── Navbar.jsx
│   │   │   │   └── AppShell.jsx     # Main layout wrapper
│   │   │   ├── chat/
│   │   │   │   ├── ChatWindow.jsx   # Chat message display area
│   │   │   │   ├── ChatInput.jsx    # Message input + send button
│   │   │   │   ├── MessageBubble.jsx
│   │   │   │   └── SourceCitation.jsx  # Source references card
│   │   │   ├── documents/
│   │   │   │   ├── DocumentUpload.jsx  # Drag & drop PDF uploader
│   │   │   │   ├── DocumentCard.jsx    # Document item in sidebar
│   │   │   │   └── DocumentStatus.jsx  # Processing progress badge
│   │   │   └── auth/
│   │   │       └── GoogleLoginButton.jsx
│   │   ├── pages/
│   │   │   ├── Landing.jsx          # Home / marketing page
│   │   │   ├── Login.jsx            # Google OAuth login
│   │   │   ├── Register.jsx         # Sign up page
│   │   │   ├── AuthCallback.jsx     # Handles OAuth redirect & stores JWT
│   │   │   └── Dashboard.jsx        # Main chat + document view
│   │   ├── hooks/
│   │   │   ├── useChat.js           # Chat SSE stream hook
│   │   │   ├── useDocuments.js      # Document CRUD hook
│   │   │   └── useAuth.js           # Auth state hook
│   │   ├── store/
│   │   │   ├── authStore.js         # Zustand: user/token state
│   │   │   └── chatStore.js         # Zustand: messages, active doc
│   │   ├── services/
│   │   │   ├── api.js               # Axios instance + Bearer token interceptor
│   │   │   ├── chatService.js       # /chat API calls (SSE streaming)
│   │   │   └── documentService.js   # /documents API calls
│   │   ├── utils/
│   │   │   └── stream.js            # SSE stream parser utility
│   │   ├── App.jsx                  # Router + protected routes
│   │   ├── main.jsx
│   │   └── index.css                # Global dark theme design system
│   ├── .env
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── backend/                         # FastAPI App
│   ├── app/
│   │   ├── main.py                  # FastAPI entry + CORS + router registration
│   │   ├── config.py                # All settings via pydantic-settings
│   │   ├── database.py              # SQLAlchemy engine + session + Base
│   │   │
│   │   ├── models/                  # SQLAlchemy ORM models
│   │   │   ├── user.py              # User model (UUID PK, google_id, email)
│   │   │   └── document.py         # Document model (status, file_path, owner)
│   │   │
│   │   ├── schemas/                 # Pydantic request/response schemas
│   │   │   ├── user.py              # UserOut, TokenResponse
│   │   │   ├── document.py          # DocumentOut, DocumentCreate
│   │   │   └── chat.py              # ChatRequest, ChatResponse
│   │   │
│   │   ├── routers/                 # API route handlers
│   │   │   ├── auth.py              # GET /auth/google, /auth/google/callback, /auth/me
│   │   │   ├── documents.py         # POST/GET/DELETE /documents
│   │   │   └── chat.py              # POST /chat (SSE streaming)
│   │   │
│   │   ├── services/                # Business logic layer
│   │   │   ├── document_service.py  # PDF parse → chunk → embed → store in ChromaDB
│   │   │   └── rag_service.py       # Query → retrieve → Gemini LLM → stream response
│   │   │
│   │   ├── core/                    # Shared utilities
│   │   │   ├── security.py          # JWT helpers + get_current_user dependency
│   │   │   ├── gemini_client.py     # Gemini API + Embedding client wrapper
│   │   │   └── chroma_client.py     # ChromaDB collection manager
│   │   │
│   │   └── utils/
│   │       ├── pdf_parser.py        # PyMuPDF text extraction + cleaning
│   │       └── chunker.py           # RecursiveCharacterTextSplitter config
│   │
│   ├── alembic/                     # Database migrations
│   │   ├── versions/                # Auto-generated migration files
│   │   └── env.py                   # Alembic config (reads DATABASE_URL from settings)
│   ├── chroma_db/                   # Persisted ChromaDB vector data (gitignored)
│   ├── uploads/                     # Uploaded PDF storage (gitignored)
│   ├── alembic.ini
│   ├── requirements.txt
│   ├── .env                         # ⚠️ Never commit this!
│   ├── .gitignore
│   └── Dockerfile
│
├── docker-compose.yml               # Backend + ChromaDB only (Neon is cloud-hosted)
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- A [Neon DB](https://neon.tech) account (free tier)
- A [Google Cloud](https://console.cloud.google.com) project with OAuth 2.0 credentials
- A [Gemini API key](https://aistudio.google.com/app/apikey)

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/docmind.git
cd docmind
```

---

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt
```

#### Create `backend/.env`

```env
DATABASE_URL=postgresql://user:password@ep-xxxxx.us-east-1.aws.neon.tech/neondb?sslmode=require
GEMINI_API_KEY=your_gemini_api_key_here
SECRET_KEY=your_generated_secret_key_here

GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback
FRONTEND_URL=http://localhost:5173
```

> 💡 Generate SECRET_KEY: `python -c "import secrets; print(secrets.token_hex(32))"`

#### Run Database Migrations

```bash
alembic revision --autogenerate -m "create users table"
alembic upgrade head
```

#### Start the Backend Server

```bash
uvicorn app.main:app --reload
```

Backend → **http://localhost:8000**  
Swagger Docs → **http://localhost:8000/docs**

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend → **http://localhost:5173**

---

## 🔑 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (no payment info needed for OAuth)
3. Go to **APIs & Services → Credentials → Create OAuth 2.0 Client ID**
4. Set **Application type** to **Web application**
5. Add **Authorized redirect URI**: `http://localhost:8000/auth/google/callback`
6. Copy **Client ID** and **Client Secret** into your `backend/.env`

---

## 🟢 Neon DB Setup

1. Go to [neon.tech](https://neon.tech) → Sign up (free tier available)
2. Create a new **Project** → choose a region close to you
3. Copy the **Connection String** from the dashboard
4. Paste into `backend/.env` as `DATABASE_URL`
5. Run `alembic upgrade head` to create tables
6. ✅ Done — no local PostgreSQL needed!

> **Why Neon?** Serverless PostgreSQL — auto-scales, free tier (0.5 GB), supports DB branching, zero infra management.

---

## 🔄 Authentication Flow

```
User clicks "Continue with Google"   (frontend: 5173)
    ↓
GET /auth/google                      (backend: 8000)
    ↓
FastAPI redirects → Google Login Page
    ↓
User authenticates with Google
    ↓
GET /auth/google/callback?code=xxx    (backend: 8000)
    ↓
FastAPI: exchange code → get user info → save to Neon DB → create JWT
    ↓
Redirect → /auth/callback?token=xxx  (frontend: 5173)
    ↓
AuthCallback.jsx: save token to localStorage → redirect to /dashboard
```

---

## 🔄 RAG Pipeline Flow

```
User Query
    │
    ▼
[Embed Query]  ──── text-embedding-004 ────►  Query Vector
    │
    ▼
[ChromaDB Retrieval]  ── top-K=5 chunks filtered by doc_id ──►  Context Chunks
    │
    ▼
[Prompt Assembly]
    │  "You are a research assistant. Answer based on the context below.
    │   Context: {chunks}   Question: {query}"
    ▼
[Gemini 1.5 Flash]  ──── generate_content_stream ────►  Token Stream
    │
    ▼
[FastAPI StreamingResponse]  ──── SSE ────►  Frontend EventSource
    │
    ▼
[Source Citations]  ──── chunk metadata ────►  Citation Cards UI
```

---

## 🔗 API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | No | Health check |
| `GET` | `/auth/google` | No | Redirect to Google login |
| `GET` | `/auth/google/callback` | No | Google OAuth callback, returns JWT |
| `GET` | `/auth/me` | Yes | Get current logged-in user |
| `POST` | `/documents/upload` | Yes | Upload a PDF (multipart) |
| `GET` | `/documents` | Yes | List user's documents |
| `GET` | `/documents/{id}/status` | Yes | Poll document processing status |
| `DELETE` | `/documents/{id}` | Yes | Delete document + its ChromaDB vectors |
| `POST` | `/chat` | Yes | RAG query — returns SSE stream |

---

## 🗄️ Database Schema

### `users` table (Neon DB)
| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Unique user identifier |
| `email` | String (unique) | User's Google email |
| `name` | String | Display name from Google |
| `picture` | String | Profile picture URL |
| `google_id` | String (unique) | Google's internal user ID |
| `is_active` | Boolean | Account status |
| `created_at` | DateTime | Timestamp |

### `documents` table (Neon DB)
| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Unique document identifier |
| `user_id` | UUID (FK → users) | Owner of the document |
| `filename` | String | Original PDF filename |
| `file_path` | String | Path inside `uploads/` |
| `status` | Enum | `PENDING` → `PROCESSING` → `READY` / `FAILED` |
| `created_at` | DateTime | Upload timestamp |

---

## 🗺️ Development Roadmap

### Phase 1 — Project Setup & Foundation ✅
- [x] Monorepo folder structure (`frontend/` + `backend/`)
- [x] Python venv + all backend packages installed
- [x] FastAPI app with health check endpoint
- [x] React + Vite frontend scaffolded
- [x] Neon DB account + connection string configured
- [x] `.env` files set up for backend
- [x] CORS configured in FastAPI

### Phase 2 — Neon DB Setup & Google OAuth Auth ✅
- [x] `database.py` with SQLAlchemy + Neon connection
- [x] `User` SQLAlchemy model with UUID primary key
- [x] Alembic initialized and configured
- [x] Migration run — `users` table created in Neon DB
- [x] Google OAuth routes (`/auth/google`, `/auth/google/callback`)
- [x] JWT creation + `get_current_user` dependency
- [x] `AuthCallback.jsx` — stores token, redirects to dashboard
- [x] Protected route wrapper in React Router

### Phase 3 — Document Upload & Processing Pipeline
- [ ] `Document` SQLAlchemy model
- [ ] `POST /documents/upload` endpoint (multipart)
- [ ] Background task: PDF parse → chunk → embed → store in ChromaDB
- [ ] `pdf_parser.py` — PyMuPDF text extraction per page
- [ ] `chunker.py` — `RecursiveCharacterTextSplitter` (chunk_size=1000, overlap=200)
- [ ] `gemini_client.py` — `text-embedding-004` embeddings
- [ ] `chroma_client.py` — ChromaDB upsert with metadata
- [ ] Document status polling (`PENDING → PROCESSING → READY`)
- [ ] `GET /documents` + `DELETE /documents/{id}` endpoints
- [ ] `DocumentUpload` component (drag & drop)
- [ ] `DocumentCard` with real-time status badge

### Phase 4 — RAG Chat Pipeline
- [ ] `POST /chat` endpoint (`{ query, document_ids[] }`)
- [ ] `rag_service.py` — embed query → ChromaDB retrieval → context assembly
- [ ] Gemini 1.5 Flash streaming via `generate_content_stream`
- [ ] FastAPI `StreamingResponse` with Server-Sent Events
- [ ] Source citations appended to each response
- [ ] `ChatWindow` with react-markdown rendering
- [ ] `useChat` hook consuming the SSE stream
- [ ] `SourceCitation` cards below each AI response

### Phase 5 — Multi-Document Support & UX Polish
- [ ] Document selection checkboxes (query across multiple docs)
- [ ] Conversation history (persist chat messages)
- [ ] "New Chat" button to reset context
- [ ] Copy-to-clipboard on code blocks
- [ ] Loading skeletons + error toasts (sonner)
- [ ] Fully responsive layout (mobile sidebar drawer)

### Phase 6 — Testing & Hardening
- [ ] pytest tests for RAG service + document processing
- [ ] Rate limiting via `slowapi` on `/chat`
- [ ] File type validation (PDF only) + 10MB size limit
- [ ] Error handling + user-friendly error messages
- [ ] `.gitignore` audit (`uploads/`, `chroma_db/`, `.env`)

---

## 📦 Backend Dependencies (`requirements.txt`)

```
fastapi
uvicorn[standard]
python-multipart
sqlalchemy
alembic
psycopg2-binary
pydantic-settings
python-jose[cryptography]
passlib[bcrypt]
httpx
google-generativeai
langchain
langchain-google-genai
langchain-chroma
chromadb
pymupdf
slowapi
```

## 📦 Frontend Key Dependencies

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.24.0",
    "axios": "^1.7.2",
    "@tanstack/react-query": "^5.45.0",
    "zustand": "^4.5.2",
    "react-dropzone": "^14.2.3",
    "react-markdown": "^9.0.1",
    "react-hook-form": "^7.52.0",
    "zod": "^3.23.8",
    "sonner": "^1.5.0"
  }
}
```

---

## ⚠️ Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | Neon DB PostgreSQL connection string |
| `GEMINI_API_KEY` | ✅ | Google Gemini API key |
| `SECRET_KEY` | ✅ | JWT signing secret (32+ char random hex) |
| `GOOGLE_CLIENT_ID` | ✅ | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | ✅ | Google OAuth Client Secret |
| `GOOGLE_REDIRECT_URI` | ✅ | Must match Google Cloud Console setting |
| `FRONTEND_URL` | ✅ | Frontend origin (for post-auth redirect) |
| `ALGORITHM` | ❌ | JWT algorithm (default: `HS256`) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | ❌ | Token expiry in minutes (default: `60`) |

---

## ✅ Definition of Done

- [ ] User can sign in with Google and token persists across page refresh
- [ ] PDF uploads are processed and status updates in real time
- [ ] Chat returns streamed responses with visible typing effect
- [ ] Source citations (filename + page number) appear below each answer
- [ ] Querying across multiple selected documents works correctly
- [ ] Deleting a document removes it from both Neon DB and ChromaDB
- [ ] Neon DB dashboard shows correct user and document records
- [ ] Alembic migrations run cleanly (`alembic upgrade head`)
- [ ] Rate limiting prevents abuse on the `/chat` endpoint

---

## 🔒 Security Notes

- `.env` is gitignored — **never commit it**
- JWT tokens stored in `localStorage` on the frontend
- All protected routes require a valid `Bearer` token in the `Authorization` header
- Neon DB uses `sslmode=require` for encrypted connections
- File uploads validated for PDF type + 10MB size limit

---

Built with ❤️ using FastAPI, React, Gemini AI, and LangChain.
