import { useState, useRef, useEffect } from 'react';
import './Dashboard.css';
import { getToken, removeToken } from '../utils/auth';
import { Link, useNavigate } from 'react-router-dom';
import { useDocuments } from '../hooks/useDocuments';
import api from '../services/api';
import { FiEdit } from "react-icons/fi";

// ── Mock Data ─────────────────────────────────────────────
const WELCOME_MESSAGES = [
  { id: 0, role: 'assistant', content: 'Hello! I\'m **DocMind**, your AI research assistant. Upload a PDF and ask me anything about it — I\'ll provide answers with exact source citations.', citations: null }
];

// ── Helpers ───────────────────────────────────────────────
const statusColors = { READY: 'badge-ready', PROCESSING: 'badge-processing', PENDING: 'badge-pending', FAILED: 'badge-failed', ready: 'badge-ready', processing: 'badge-processing', pending: 'badge-pending', failed: 'badge-failed' };
const statusLabels = { READY: 'Ready', PROCESSING: 'Processing...', PENDING: 'Pending', FAILED: 'Failed' };

function renderMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br/>');
}

// ── Dashboard ─────────────────────────────────────────────
export default function Dashboard() {
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [messages, setMessages] = useState(WELCOME_MESSAGES);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [user, setUser] = useState(null);


  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const { documents, loading, uploading, error, upload, remove, refetch } = useDocuments();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get("/auth/me");
        setUser(response.data);
      } catch (error) {
        console.error("failed to fetch user: ", error)
      }
    }

    fetchUser();
  }, [])

  // Helper to compute initials if no picture is available
  const getinitials = (name, email) => {
    if (name) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      return parts[0].slice(0, 2).toUpperCase();
    }

    if (email) return email.slice(0, 2).toUpperCase()

    return 'U';
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await upload(file);
      e.target.value = "";
    }
  }

  // Toggle document selection
  const toggleDoc = (id) => {
    setSelectedDocs(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  // Handle delete
  const handleDelete = async (docId) => {
    await remove(docId)
    setSelectedDocs(prev => prev.filter(d => d !== docId));
  };

  // backend chat stream (SSE via Fetch)
  const handleSend = async () => {
    const query = input.trim();
    if (!query || isStreaming || selectedDocs.length == 0) return;
    setInput("");

    // add user message
    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: query,
      citations: null
    };

    // Prepare placeholder for assistant streaming response
    const aiId = Date.now() + 1;
    const aiMsg = { id: aiId, role: "assistant", content: '', citations: null, streaming: true };

    setMessages(prev => [...prev, userMsg, aiMsg]);
    setIsStreaming(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          query: query,
          document_ids: selectedDocs,
        }),
      });

      console.log("response: ", response);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log("errorData: ", errorData);
        throw new Error(errorData.detail || `Server responded with ${response.status}`);
      }

      // Read Server-Sent Events (SSE) stream from the response body
      const reader = response.body.getReader();
      console.log("reader:", reader);
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // decode new chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });
        console.log("buffer: ", buffer);

        const lines = buffer.split('\n');
        buffer = lines.pop() // Keep uncompleted line in buffer

        for (const line of lines) {
          const trimmed = line.trim();
          console.log("trimmed: ", trimmed);
          if (!trimmed.startsWith('data: ')) continue;

          const jsonStr = trimmed.replace(/^data:\s*/, '');
          console.log("jsonStr: ", jsonStr);
          if (!jsonStr) continue;

          try {
            const data = JSON.parse(jsonStr);
            console.log("data: ", data);


            if (data.type == 'token') {
              // append token to assistant message
              setMessages(prev => prev.map(m => m.id === aiId ? { ...m, content: m.content + data.content } : m))
            }
            else if (data.type === "sources") {
              // attach citations
              setMessages(prev =>
                prev.map(m =>
                  m.id === aiId ? { ...m, citations: data.content } : m
                )
              );
            }
            else if (data.type === 'done') {
              // End of stream
              setMessages(prev =>
                prev.map(m =>
                  m.id === aiId ? { ...m, streaming: false } : m
                )
              );
            }
          } catch (e) {
            console.error('Error parsing SSE chunk:', e, jsonStr);
          }
        }
      }
    } catch (err) {
      console.error("chat error: ", err);
      setMessages(prev =>
        prev.map(m =>
          m.id === aiId
            ? {
              ...m,
              content: `❌ **Error:** ${err.message || 'Failed to get answer from server.'}`,
              streaming: false
            }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
      setMessages(prev =>
        prev.map(m => (m.id === aiId ? { ...m, streaming: false } : m))
      );
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  useEffect(() => {
    const hasProcessingDocs = documents.some(
      doc => doc.status === "PROCESSING" || doc.status === "PENDING"
    );

    if (!hasProcessingDocs) return;

    const interval = setInterval(() => {
      refetch();
    }, 3000);

    return () => clearInterval(interval);
  }, [documents, refetch])

  // logout
  const handleLogout = () => {
    removeToken();
    navigate('/', { replace: true });
  };

  return (
    <div className="dashboard">
      {/* ── Sidebar ── */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="sidebar-logo">
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit' }}>
            <span className="logo-icon">✦</span>
            {sidebarOpen && <span className="logo-text">DocMind</span>}
          </Link>
          <button
            id="toggle-sidebar-btn"
            className="btn btn-ghost sidebar-toggle"
            onClick={() => setSidebarOpen(o => !o)}
            title="Toggle sidebar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d={sidebarOpen ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'} />
            </svg>
          </button>
        </div>

        {/* Upload Area */}
        {sidebarOpen && (
          <div
            id="upload-area"
            className={`upload-area ${dragOver ? 'drag-over' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            // onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            // onDragLeave={() => setDragOver(false)}
            // onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : (
              <>
                <div className="upload-icon">📄</div>
                <p className="upload-text">Drop PDFs here</p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              multiple
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            {error && <p style={{ color: '#ff6b6b', margin: '0 0 8px' }}>❌ {error}</p>}
          </div>
        )}

        {!sidebarOpen && (
          <button
            className="btn btn-ghost"
            style={{ margin: '8px auto', display: 'block' }}
            onClick={() => fileInputRef.current?.click()}
            title="Upload PDF"
          >
            📄
            <input ref={fileInputRef} type="file" accept=".pdf" multiple style={{ display: 'none' }} onChange={handleFileChange} />
          </button>
        )}

        {/* Documents List */}
        {sidebarOpen && (
          <div className="sidebar-section">
            <div className="sidebar-section-header">
              <span className="sidebar-section-title">Documents</span>
              <span className="sidebar-doc-count">{documents.length}</span>
            </div>
            <div className="doc-list">
              {loading && (
                <div className="doc-skeleton-list">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="doc-skeleton-item">
                      <div className="doc-skeleton-top">
                        <div className="doc-skeleton-box" />
                        <div className="doc-skeleton-bar" style={{ width: `${60 + (i * 12)}%` }} />
                      </div>
                      <div className="doc-skeleton-badge" />
                    </div>
                  ))}
                </div>
              )}

              {!loading && documents.length === 0 && (
                <p className="doc-empty">No documents yet. Upload a PDF to get started.</p>
              )}
              {documents.map(doc => (
                <div
                  key={doc.id}
                  id={`doc-${doc.id}`}
                  className={`doc-item ${selectedDocs.includes(doc.id) && doc.status === 'READY' ? 'doc-item-selected' : ''}`}
                >
                  <div className="doc-item-top">
                    <input
                      type="checkbox"
                      className="doc-checkbox"
                      checked={selectedDocs.includes(doc.id)}
                      disabled={doc.status !== 'READY'}
                      onChange={() => toggleDoc(doc.id)}
                      title={doc.status === 'READY' ? 'Select for chat' : 'Document is not ready yet'}
                    />

                    <span className="doc-icon">📄</span>
                    <span className="doc-name" title={doc.filename}>{doc.filename}</span>
                    <button
                      className="btn btn-ghost doc-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDocToDelete(doc);
                      }}
                      title="Delete document"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>

                  </div>
                  <div className="doc-item-meta">
                    <span className={`badge ${statusColors[doc.status] || 'badge-pending'}`}>
                      {(doc.status === 'PROCESSING' || doc.status === 'PENDING') && (
                        <span
                          className="spin"
                          style={{
                            display: 'inline-block',
                            width: 8,
                            height: 8,
                            marginRight: 4,
                            border: '1.5px solid currentColor',
                            borderTopColor: 'transparent',
                            borderRadius: '50%'
                          }}
                        />
                      )}
                      {statusLabels[doc.status] || doc.status}
                    </span>
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Profile */}
        <div className="sidebar-user" onClick={() => setUserMenuOpen(o => !o)}>
          {user?.picture ? (
            <img
              src={user.picture}
              alt={user.name || 'User'}
              className="user-avatar"
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div className="user-avatar">{getinitials(user?.name, user?.email)}</div>
          )}

          {sidebarOpen && (
            <>
              <div className="user-info">
                <span className="user-name">{user?.name || 'User'}</span>
                <span className="user-email">{user?.email || ''}</span>
              </div>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}
              >
                <circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" />
              </svg>
            </>
          )}

          {userMenuOpen && sidebarOpen && (
            <div className="user-menu">
              <button onClick={handleLogout} className="user-menu-item user-menu-logout">🚪 Sign Out</button>
            </div>
          )}
        </div>

      </aside>

      {/* ── Main Chat ── */}
      <main className="chat-main">
        {/* Chat Header */}
        <div className="chat-header">
          <div className="chat-header-left">
            <h2 className="chat-title">Research Chat</h2>
            {selectedDocs.length > 0 ? (
              <div className="selected-docs-info">
                <span className="selected-dot" />
                {selectedDocs.length} document{selectedDocs.length > 1 ? 's' : ''} selected
              </div>
            ) : (
              <div className="selected-docs-info" style={{ color: 'var(--warning)' }}>
                ⚠️ Select a document from the sidebar
              </div>
            )}
          </div>
          <div className="chat-header-right">
            <button
              id="new-chat-btn"
              className="btn btn-outline"
              style={{ padding: '7px 16px', fontSize: '13px' }}
              onClick={() => setMessages(WELCOME_MESSAGES)}
            >
              <FiEdit size={15} /> New Chat
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages" id="chat-messages">
          {messages.map(msg => (
            <div key={msg.id} className={`message message-${msg.role} fade-in`}>
              {msg.role === 'assistant' && (
                <div className="msg-avatar msg-avatar-ai">✦</div>
              )}
              <div className="msg-bubble-wrap">
                <div className={`msg-bubble ${msg.role === 'user' ? 'msg-bubble-user' : 'msg-bubble-ai'}`}>
                  {/* If waiting for first token, show typing dots inside the bubble */}
                  {msg.role === 'assistant' && msg.streaming && !msg.content ? (
                    <div className="typing-indicator" style={{ padding: '4px 8px' }}>
                      <span /><span /><span />
                    </div>
                  ) : (
                    <>
                      <div
                        className="msg-content"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                      />
                      {msg.streaming && <span className="cursor-blink">▍</span>}
                    </>
                  )}
                </div>

                {/* Citations (Matches backend { filename, page_number } schema) */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="citations">
                    <span className="citations-label">📎 Sources</span>
                    {msg.citations.map((c, i) => (
                      <div key={i} className="citation-chip">
                        <span className="citation-icon">📄</span>
                        <span className="citation-text">{c.filename} — page {c.page_number}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {msg.role === 'user' && (
                user?.picture ? (
                  <img
                    src={user.picture}
                    alt="User"
                    className="msg-avatar msg-avatar-user"
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div className="msg-avatar msg-avatar-user">{getInitials(user?.name, user?.email)}</div>
                )
              )}

            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="chat-input-area">
          {selectedDocs.length === 0 && (
            <div className="input-warning">
              ⚠️ Please select at least one document from the sidebar to start chatting.
            </div>
          )}
          <div className="chat-input-wrap">
            <textarea
              id="chat-input"
              ref={inputRef}
              className="chat-textarea"
              placeholder={selectedDocs.length > 0 ? `Ask anything about your ${selectedDocs.length > 1 ? selectedDocs.length + ' documents' : 'document'}...` : 'Select a document first...'}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isStreaming || selectedDocs.length === 0}
              rows={1}
            />
            <button
              id="send-btn"
              className={`chat-send-btn ${isStreaming || !input.trim() || selectedDocs.length === 0 ? 'chat-send-btn-disabled' : ''}`}
              onClick={handleSend}
              disabled={isStreaming || !input.trim() || selectedDocs.length === 0}
              title="Send message (Enter)"
            >
              {isStreaming ? (
                <span className="spin" style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              )}
            </button>
          </div>
          <p className="input-hint">Press <kbd>Enter</kbd> to send · <kbd>Shift+Enter</kbd> for new line</p>
        </div>
      </main>
      {/* ── Animated Delete Confirmation Modal ── */}
      {docToDelete && (
        <div className="modal-backdrop" onClick={() => !isDeleting && setDocToDelete(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-icon-danger">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
              </svg>
            </div>

            <h3 className="modal-title">Delete Document?</h3>
            <p className="modal-desc">
              Are you sure you want to delete <strong className="modal-filename">{docToDelete.filename}</strong>?
              This will remove its embeddings from the vector database and cannot be undone.
            </p>

            <div className="modal-actions">
              <button
                className="btn btn-outline"
                onClick={() => setDocToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                disabled={isDeleting}
                onClick={async () => {
                  setIsDeleting(true);
                  try {
                    await handleDelete(docToDelete.id);
                    setDocToDelete(null);
                  } finally {
                    setIsDeleting(false);
                  }
                }}
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

