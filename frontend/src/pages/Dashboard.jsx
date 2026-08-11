import { useState, useRef, useEffect } from 'react';
import './Dashboard.css';

// ── Mock Data ─────────────────────────────────────────────
const MOCK_DOCS = [
  { id: 1, name: 'attention-is-all-you-need.pdf', status: 'ready', pages: 15, size: '2.4 MB', uploadedAt: '2 hours ago' },
  { id: 2, name: 'gpt4-technical-report.pdf', status: 'ready', pages: 98, size: '8.1 MB', uploadedAt: '1 day ago' },
  { id: 3, name: 'rag-survey-2024.pdf', status: 'processing', pages: null, size: '3.2 MB', uploadedAt: 'Just now' },
];

const MOCK_USER = {
  name: 'Kunal Paul',
  email: 'kunal@example.com',
  avatar: null,
  initials: 'KP',
};

const WELCOME_MESSAGES = [
  { id: 0, role: 'assistant', content: 'Hello! I\'m **DocMind**, your AI research assistant. Upload a PDF and ask me anything about it — I\'ll provide answers with exact source citations.', citations: null }
];

// ── Helpers ───────────────────────────────────────────────
const statusColors = { ready: 'badge-ready', processing: 'badge-processing', pending: 'badge-pending', failed: 'badge-failed' };
const statusLabels = { ready: 'Ready', processing: 'Processing...', pending: 'Pending', failed: 'Failed' };

function renderMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br/>');
}

// ── Dashboard ─────────────────────────────────────────────
export default function Dashboard() {
  const [docs, setDocs] = useState(MOCK_DOCS);
  const [selectedDocs, setSelectedDocs] = useState([1]);
  const [messages, setMessages] = useState(WELCOME_MESSAGES);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Toggle document selection
  const toggleDoc = (id) => {
    setSelectedDocs(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  // Handle file upload
  const handleFiles = (files) => {
    Array.from(files).forEach(file => {
      if (!file.name.endsWith('.pdf')) return;
      const newDoc = {
        id: Date.now() + Math.random(),
        name: file.name,
        status: 'pending',
        pages: null,
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        uploadedAt: 'Just now',
      };
      setDocs(prev => [newDoc, ...prev]);
      // Simulate processing
      setTimeout(() => {
        setDocs(prev => prev.map(d => d.id === newDoc.id ? { ...d, status: 'processing' } : d));
        setTimeout(() => {
          setDocs(prev => prev.map(d => d.id === newDoc.id ? { ...d, status: 'ready', pages: Math.floor(Math.random() * 50 + 5) } : d));
        }, 3000);
      }, 1000);
    });
  };

  // Handle delete
  const handleDelete = (id) => {
    setDocs(prev => prev.filter(d => d.id !== id));
    setSelectedDocs(prev => prev.filter(d => d !== id));
  };

  // Handle send
  const handleSend = async () => {
    const query = input.trim();
    if (!query || isStreaming) return;
    setInput('');

    const userMsg = { id: Date.now(), role: 'user', content: query, citations: null };
    setMessages(prev => [...prev, userMsg]);
    setIsStreaming(true);

    // Simulate streaming AI response
    const aiId = Date.now() + 1;
    setMessages(prev => [...prev, { id: aiId, role: 'assistant', content: '', citations: null, streaming: true }]);

    const mockResponse = `Based on the selected documents, here is what I found:\n\nThe paper discusses **transformer architectures** and their application to sequence modeling tasks. The key insight is the use of self-attention mechanisms that allow the model to weigh the relevance of different parts of the input sequence.\n\nSpecifically, the model uses **multi-head attention** with \`h = 8\` parallel attention layers, enabling it to attend to information from different representation subspaces simultaneously.`;

    let i = 0;
    const interval = setInterval(() => {
      i += 3;
      const chunk = mockResponse.slice(0, i);
      setMessages(prev => prev.map(m => m.id === aiId ? { ...m, content: chunk } : m));
      if (i >= mockResponse.length) {
        clearInterval(interval);
        const citations = [
          { docName: 'attention-is-all-you-need.pdf', page: 3, section: 'Section 3.2 — Attention' },
          { docName: 'attention-is-all-you-need.pdf', page: 5, section: 'Section 4 — Experiments' },
        ];
        setMessages(prev => prev.map(m => m.id === aiId ? { ...m, streaming: false, citations } : m));
        setIsStreaming(false);
      }
    }, 20);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const readyDocs = docs.filter(d => d.status === 'ready');

  return (
    <div className="dashboard">
      {/* ── Sidebar ── */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <span className="logo-icon">⬡</span>
          {sidebarOpen && <span className="logo-text">DocMind</span>}
          <button
            id="toggle-sidebar-btn"
            className="btn btn-ghost sidebar-toggle"
            onClick={() => setSidebarOpen(o => !o)}
            title="Toggle sidebar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d={sidebarOpen ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'}/>
            </svg>
          </button>
        </div>

        {/* Upload Area */}
        {sidebarOpen && (
          <div
            id="upload-area"
            className={`upload-area ${dragOver ? 'drag-over' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
          >
            <div className="upload-icon">📄</div>
            <p className="upload-text">Drop PDFs here</p>
            <p className="upload-sub">or click to browse</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              multiple
              style={{ display: 'none' }}
              onChange={e => handleFiles(e.target.files)}
            />
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
            <input ref={fileInputRef} type="file" accept=".pdf" multiple style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} />
          </button>
        )}

        {/* Documents List */}
        {sidebarOpen && (
          <div className="sidebar-section">
            <div className="sidebar-section-header">
              <span className="sidebar-section-title">Documents</span>
              <span className="sidebar-doc-count">{docs.length}</span>
            </div>
            <div className="doc-list">
              {docs.length === 0 && (
                <p className="doc-empty">No documents yet. Upload a PDF to get started.</p>
              )}
              {docs.map(doc => (
                <div
                  key={doc.id}
                  id={`doc-${doc.id}`}
                  className={`doc-item ${selectedDocs.includes(doc.id) && doc.status === 'ready' ? 'doc-item-selected' : ''}`}
                >
                  <div className="doc-item-top">
                    {doc.status === 'ready' && (
                      <input
                        type="checkbox"
                        className="doc-checkbox"
                        checked={selectedDocs.includes(doc.id)}
                        onChange={() => toggleDoc(doc.id)}
                        title="Select for chat"
                      />
                    )}
                    <span className="doc-icon">📄</span>
                    <span className="doc-name" title={doc.name}>{doc.name}</span>
                    <button
                      className="btn btn-ghost doc-delete-btn"
                      onClick={() => handleDelete(doc.id)}
                      title="Delete document"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M18 6L6 18M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                  <div className="doc-item-meta">
                    <span className={`badge ${statusColors[doc.status]}`}>
                      {doc.status === 'processing' && <span className="spin" style={{ display: 'inline-block', width: 8, height: 8, border: '1.5px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%' }} />}
                      {statusLabels[doc.status]}
                    </span>
                    <span className="doc-meta-text">{doc.size}{doc.pages ? ` · ${doc.pages}p` : ''}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Profile */}
        <div className="sidebar-user" onClick={() => setUserMenuOpen(o => !o)}>
          <div className="user-avatar">{MOCK_USER.initials}</div>
          {sidebarOpen && (
            <>
              <div className="user-info">
                <span className="user-name">{MOCK_USER.name}</span>
                <span className="user-email">{MOCK_USER.email}</span>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>
                <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
              </svg>
            </>
          )}
          {userMenuOpen && sidebarOpen && (
            <div className="user-menu">
              <button className="user-menu-item">⚙️ Settings</button>
              <button className="user-menu-item user-menu-logout">🚪 Sign Out</button>
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
              + New Chat
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages" id="chat-messages">
          {messages.map(msg => (
            <div key={msg.id} className={`message message-${msg.role} fade-in`}>
              {msg.role === 'assistant' && (
                <div className="msg-avatar msg-avatar-ai">⬡</div>
              )}
              <div className="msg-bubble-wrap">
                <div className={`msg-bubble ${msg.role === 'user' ? 'msg-bubble-user' : 'msg-bubble-ai'}`}>
                  <div
                    className="msg-content"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                  />
                  {msg.streaming && (
                    <span className="cursor-blink">▍</span>
                  )}
                </div>
                {/* Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="citations">
                    <span className="citations-label">📎 Sources</span>
                    {msg.citations.map((c, i) => (
                      <div key={i} className="citation-chip">
                        <span className="citation-icon">📄</span>
                        <span className="citation-text">{c.docName} — {c.section} (p.{c.page})</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="msg-avatar msg-avatar-user">{MOCK_USER.initials}</div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {isStreaming && messages[messages.length - 1]?.content === '' && (
            <div className="message message-assistant fade-in">
              <div className="msg-avatar msg-avatar-ai">⬡</div>
              <div className="typing-indicator">
                <span /><span /><span />
              </div>
            </div>
          )}
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
                  <path d="M12 19V5M5 12l7-7 7 7"/>
                </svg>
              )}
            </button>
          </div>
          <p className="input-hint">Press <kbd>Enter</kbd> to send · <kbd>Shift+Enter</kbd> for new line</p>
        </div>
      </main>
    </div>
  );
}
