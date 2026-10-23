import { useState } from "react";

const USERS_KEY = "surakshaXAccounts";

export default function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = (event) => {
    event.preventDefault();
    setMessage("");
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) return setMessage("Please enter your email and password.");
    if (mode === "signup" && (!name.trim() || password.length < 6)) {
      return setMessage("Enter your name and use a password with at least 6 characters.");
    }
    setBusy(true);
    try {
      const accounts = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
      if (mode === "signup") {
        if (accounts.some((account) => account.email === cleanEmail)) {
          setMessage("An account with this email already exists. Please log in.");
          return;
        }
        const account = { name: name.trim(), email: cleanEmail, password };
        localStorage.setItem(USERS_KEY, JSON.stringify([...accounts, account]));
        const session = { name: account.name, email: account.email };
        localStorage.setItem("surakshaXUser", JSON.stringify(session));
        onAuthenticated(session);
      } else {
        const account = accounts.find((item) => item.email === cleanEmail && item.password === password);
        if (!account) return setMessage("Invalid credentials. Sign up first if this is your first visit.");
        const session = { name: account.name, email: account.email };
        localStorage.setItem("surakshaXUser", JSON.stringify(session));
        onAuthenticated(session);
      }
    } catch {
      setMessage("Unable to complete authentication in this browser. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="sx-auth-page">
      <div className="sx-auth-visual">
        <a className="sx-auth-brand" href="#"><span className="sx-brand-mark">✦</span><span><strong>SURAKSHA<span>-X</span></strong><small>DISASTER INTELLIGENCE</small></span></a>
        <div className="sx-auth-visual-content"><span className="sx-eyebrow"><i /> PREPARE · PROTECT · RESPOND</span><h1>Smarter response.<br/><span>Safer communities.</span></h1><p>A unified command center for hazard monitoring, risk intelligence and emergency relocation planning.</p><div className="sx-auth-visual-stats"><div><strong>01</strong><span>Detect risk</span></div><div><strong>02</strong><span>Plan response</span></div><div><strong>03</strong><span>Protect lives</span></div></div></div>
        <div className="sx-auth-map-art"><span className="map-ring ring-a"/><span className="map-ring ring-b"/><span className="map-ring ring-c"/><span className="map-pin">⌖</span></div>
        <small className="sx-auth-footnote">SURAKSHA-X · Hazard Detection & Relocation Management</small>
      </div>
      <section className="sx-auth-panel"><div className="sx-auth-card"><span className="sx-auth-mini">WELCOME TO SURAKSHA-X</span><h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2><p className="sx-auth-subtitle">{mode === "login" ? "Sign in to access your response dashboard." : "Set up your workspace to start monitoring risks."}</p>
        <div className="sx-auth-tabs"><button className={mode === "login" ? "selected" : ""} onClick={() => { setMode("login"); setMessage(""); }}>Log in</button><button className={mode === "signup" ? "selected" : ""} onClick={() => { setMode("signup"); setMessage(""); }}>Sign up</button></div>
        <form onSubmit={submit} className="sx-auth-form">
          {mode === "signup" && <label>Full name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" autoComplete="name" required/></label>}
          <label>Email address<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required/></label>
          <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={mode === "signup" ? "At least 6 characters" : "Enter your password"} autoComplete={mode === "signup" ? "new-password" : "current-password"} minLength={mode === "signup" ? 6 : undefined} required/></label>
          {message && <div className="sx-auth-message" role="alert">{message}</div>}
          <button className="sx-auth-submit" type="submit" disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Sign in to dashboard  →" : "Create account  →"}</button>
        </form>
        <p className="sx-auth-switch">{mode === "login" ? "New to SURAKSHA-X?" : "Already have an account?"} <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMessage(""); }}>{mode === "login" ? "Create account" : "Log in"}</button></p>
        <p className="sx-auth-demo-note">Prototype sign-in: accounts are stored in this browser only. Connect server-side authentication before using real or sensitive data.</p>
      </div></section>
    </main>
  );
}
