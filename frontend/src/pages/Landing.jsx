import { Link } from 'react-router-dom';
import './Landing.css';
import { isAuthenticated } from '../utils/auth';
// import { FaArrowRight } from "react-icons/fa";
import { FaArrowRight } from "react-icons/fa6";

const features = [
  {
    icon: '📄',
    title: 'Upload Any PDF',
    desc: 'Upload research papers, academic journals, books, or technical documentation.'
  },
  {
    icon: '🧠',
    title: 'AI-Powered RAG',
    desc: 'Powered by Gemini API with dense semantic vector retrieval over your private knowledge base.'
  },
  {
    icon: '💬',
    title: 'Chat with Docs',
    desc: 'Ask contextual questions and receive synthesis with verified page and section citations.'
  },
  {
    icon: '⚡',
    title: 'Streaming Responses',
    desc: 'Ultra-low latency SSE token streaming for instantaneous, natural conversation.'
  },
];

export default function Landing() {
  return (
    <div className="landing-root">
      {/* ── Background Aura & Radial Concentric Waves ── */}
      <div className="aura-bg-container" aria-hidden="true">
        <div className="aura-center-spotlight" />
        <div className="aura-concentric-circles">
          <div className="aura-ring ring-1" />
          <div className="aura-ring ring-2" />
          <div className="aura-ring ring-3" />
          <div className="aura-ring ring-4" />
          <div className="aura-ring ring-5" />
          <div className="aura-ring ring-6" />
        </div>
        <div className="mesh-glow orb-purple" />
        <div className="mesh-glow orb-blue" />
        <div className="grid-overlay" />
      </div>

      {/* ── Floating Glass Capsule Nav ── */}
      <header className="nav-header">
        <nav className="nav-capsule">
          <div className="nav-logo">
            <span className="logo-sparkle">✦</span>
            <span className="logo-title">DocMind</span>
          </div>

          <div className="nav-links">
            <a href="#features" className="nav-item">Features</a>
            <a href="#pipeline" className="nav-item">Pipeline</a>
            <a href="#citations" className="nav-item">Citations</a>
            <a href="#security" className="nav-item">Security</a>
          </div>

          <div className="nav-action">
            {isAuthenticated() ? (
              <Link to="/dashboard" className="btn-glass-white nav-btn">
                Dashboard
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>

            ) : (
              <Link to="/login" className="btn-glass-white nav-btn">
                Sign In
              </Link>
            )}
          </div>
        </nav>
      </header>

      {/* ── Hero Section ── */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">

            <h1 className="hero-headline">
              Chat with your
              <br />
              <span className="hero-italic-serif">documents</span>
              <br />
              like never before.
            </h1>

            <p className="hero-description">
              Pushing the boundaries of semantic retrieval, document intelligence,
              and real-time AI knowledge synthesis with exact source citations.
            </p>

            <div className="hero-actions">
              <Link
                to={isAuthenticated() ? "/dashboard" : "/login"}
                className="btn-glass-white hero-btn-primary"
              >
                <span>{isAuthenticated() ? "Go to Dashboard" : "Get Started Free"}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <a href="#features" className="btn-glass hero-btn-secondary">
                See How It Works
              </a>
            </div>

          </div>

          {/* Hero Visual Terminal Card */}
          <div className="hero-visual-wrap">
            <div className="hero-glass-card">
              <div className="glass-card-header">
                <div className="mac-dots">
                  <span className="dot dot-red" />
                  <span className="dot dot-yellow" />
                  <span className="dot dot-green" />
                </div>
                <div className="card-doc-pill">
                  <span className="doc-pill-icon">📄</span>
                  <span>research-paper.pdf</span>
                </div>
              </div>

              <div className="glass-card-body">
                <div className="demo-chat-row demo-user-row">
                  <div className="demo-user-bubble">
                    What are the key findings of this paper?
                  </div>
                </div>

                <div className="demo-chat-row demo-ai-row">
                  <div className="demo-ai-avatar">✦</div>
                  <div className="demo-ai-bubble">
                    <p className="ai-lead">The paper demonstrates <strong>3 transformative insights</strong>:</p>
                    <ul className="ai-points">
                      <li>
                        <span className="point-bullet">1</span>
                        <span>Transformer models outperform traditional RNNs by <strong>34%</strong> on complex benchmarks.</span>
                      </li>
                      <li>
                        <span className="point-bullet">2</span>
                        <span>Self-attention mechanisms drastically reduce training convergence time.</span>
                      </li>
                      <li>
                        <span className="point-bullet">3</span>
                        <span>Zero-shot generalizability scales predictably with parameter depth.</span>
                      </li>
                    </ul>
                    <div className="demo-citation-chip">
                      <span className="chip-icon">📎</span>
                      <span>Page 4 · Section 3.2 — Attention Mechanics</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card-footer">
                <span className="demo-footer-text">Ask anything about your document...</span>
                <button className="demo-footer-btn" aria-label="Send query">↑</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Section with Cool Card Animations ── */}
      <section className="features-section" id="features">
        <div className="features-container">
          <div className="section-header">
            <span className="section-pill">CAPABILITIES</span>
            <h2 className="section-title">
              Everything you need to <span className="hero-italic-serif">research smarter</span>
            </h2>
            <p className="section-subtitle">
              A comprehensive AI document intelligence engine running directly in your browser.
            </p>
          </div>

          <div className="features-grid">
            {features.map((f, i) => (
              <div className="animated-feature-card" key={i}>
                <div className="card-glow-reflection" />
                <div className="card-inner">
                  <div className="feature-icon-glass">{f.icon}</div>
                  <h3 className="feature-title">{f.title}</h3>
                  <p className="feature-desc">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner with Aura Waves ── */}
      <section className="cta-section" id="pipeline">
        <div className="cta-container">
          <div className="cta-glass-card">
            <div className="cta-aura-glow" />
            <span className="cta-badge">GET STARTED IN SECONDS</span>
            <h2 className="cta-title">Ready to unlock your documents?</h2>
            <p className="cta-desc">
              Join researchers, analysts, students, and engineers transforming raw PDFs into instant answers.
            </p>
            <div className="cta-actions">
              <Link
                to={isAuthenticated() ? "/dashboard" : "/login"}
                className="btn-glass-white cta-btn"
              >
                <span>{isAuthenticated() ? "Go to Dashboard" : "Start For Free"}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-logo">
            <span className="logo-sparkle">✦</span>
            <span className="logo-title">DocMind</span>
          </div>
          <p className="footer-copy">
            © {new Date().getFullYear()} DocMind
          </p>
        </div>
      </footer>
    </div>
  );
}
