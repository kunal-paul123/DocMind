import { Link } from 'react-router-dom';
import './Landing.css';
import { isAuthenticated } from '../utils/auth';

const features = [
  {
    icon: '📄',
    title: 'Upload Any PDF',
    desc: 'Drag & drop your research papers, notes, or any documents.'
  },
  {
    icon: '🧠',
    title: 'AI-Powered RAG',
    desc: 'Powered by Gemini API with semantic search over your knowledge base.'
  },
  {
    icon: '💬',
    title: 'Chat with Docs',
    desc: 'Ask questions and get answers with exact source citations.'
  },
  {
    icon: '⚡',
    title: 'Streaming Responses',
    desc: 'Real-time token streaming for a natural conversational feel.'
  },
];

export default function Landing() {
  return (
    <div className="landing">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-logo">
            <span className="logo-icon">⬡</span>
            <span className="logo-text">DocMind</span>
          </div>
          <div className="landing-nav-links">
            {isAuthenticated() ? (
              <Link to="/dashboard" className="btn btn-primary" style={{ padding: '8px 20px' }}>
                Go to Dashboard →
              </Link>) : (<Link to="/login" className="btn btn-outline" style={{ padding: '8px 20px' }}>
                Sign In
              </Link>)
            }
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-bg-orbs">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>
        <div className="hero-content fade-in">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Powered by Gemini AI
          </div>
          <h1 className="hero-title">
            Chat with your
            <span className="hero-gradient-text"> documents</span>
            <br />like never before
          </h1>
          <p className="hero-subtitle">
            Upload PDFs, research papers, or notes and get instant AI-powered answers
            with source citations — all in a private, secure environment.
          </p>
          <div className="hero-cta">
            <Link to={isAuthenticated() ? "/dashboard" : "/login"} className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '15px' }}>
              {isAuthenticated() ? "Go to Dashboard" : "Get Started Free"}
              {!isAuthenticated() && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              )}
            </Link>
            <a href="#features" className="btn btn-outline" style={{ padding: '14px 32px', fontSize: '15px' }}>
              See How It Works
            </a>
          </div>
          <p className="hero-note">No credit card required · Free tier available</p>
        </div>

        {/* Hero Visual */}
        <div className="hero-visual fade-in">
          <div className="hero-chat-demo">
            <div className="demo-header">
              <div className="demo-dots">
                <span /><span /><span />
              </div>
              <span className="demo-title">research-paper.pdf</span>
            </div>
            <div className="demo-messages">
              <div className="demo-msg demo-msg-user">
                What are the key findings of this paper?
              </div>
              <div className="demo-msg demo-msg-ai">
                <div className="demo-msg-icon">⬡</div>
                <div>
                  <p>The paper identifies <strong>3 key findings</strong>:</p>
                  <ol>
                    <li>Transformer models outperform RNNs by 34%</li>
                    <li>Attention mechanisms reduce training time</li>
                    <li>Zero-shot learning improves with scale</li>
                  </ol>
                  <div className="demo-citation">
                    📄 Page 4, Section 3.2
                  </div>
                </div>
              </div>
            </div>
            <div className="demo-input">
              <span>Ask anything about your document...</span>
              <button className="demo-send">↑</button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section" id="features">
        <div className="features-inner">
          <h2 className="section-title">Everything you need to <span className="hero-gradient-text">research smarter</span></h2>
          <p className="section-subtitle">A complete AI research assistant in your browser</p>
          <div className="features-grid">
            {features.map((f, i) => (
              <div className="feature-card" key={i}>
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-banner">
        <div className="cta-inner">
          <h2>Ready to unlock your documents?</h2>
          <p>Join researchers, students, and professionals using DocMind.</p>
          <Link to={isAuthenticated() ? "/dashboard" : "/login"} className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '15px' }}>
            {isAuthenticated() ? "Go to Dashboard ->" : "Start for Free"}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-logo">
          <span className="logo-icon">⬡</span>
          <span className="logo-text">DocMind</span>
        </div>
        <p className="footer-copy">© 2026 DocMind. Built with Gemini AI.</p>
      </footer>
    </div>
  );
}
