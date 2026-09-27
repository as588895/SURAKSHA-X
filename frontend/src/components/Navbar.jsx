function Navbar() {
  return (
    <header className="topbar">
      <div className="brand-area">
        <div className="brand-logo">🛡️</div>
        <div>
          <h1>SURAKSHA-X</h1>
          <span>Disaster Intelligence & Response Platform</span>
        </div>
      </div>

      <div className="system-status">
        <span className="status-dot" />
        <div>
          <strong>System Online</strong>
          <small>Emergency monitoring active</small>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
