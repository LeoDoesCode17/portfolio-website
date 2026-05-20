"use client";
import { useState } from "react";

interface ApiResponse {
  status: number;
  ok: boolean;
  data: unknown;
  elapsed: number;
}

type TestResult = {
  label: string;
  request: { method: string; url: string; headers: Record<string, string>; body?: string };
  response: ApiResponse | null;
  error: string | null;
  loading: boolean;
};

const API_BASE = "/api/backend";

async function runRequest(
  method: string,
  path: string,
  headers: Record<string, string>,
  body?: BodyInit
): Promise<ApiResponse> {
  const start = performance.now();
  const res = await fetch(`${API_BASE}${path}`, { method, headers, body });
  const elapsed = Math.round(performance.now() - start);
  let data: unknown;
  try { data = await res.json(); } catch { data = await res.text(); }
  return { status: res.status, ok: res.ok, data, elapsed };
}

export default function AuthTestPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [results, setResults] = useState<Record<string, TestResult>>({});

  const isDark = theme === "dark";
  const s = {
    bg: isDark ? "#171614" : "#f7f6f2",
    surface: isDark ? "#1c1b19" : "#f9f8f5",
    surface2: isDark ? "#201f1d" : "#f3f0ec",
    border: isDark ? "#262523" : "#dcd9d5",
    border2: isDark ? "#393836" : "#d4d1ca",
    text: isDark ? "#cdccca" : "#28251d",
    muted: isDark ? "#797876" : "#7a7974",
    faint: isDark ? "#5a5957" : "#bab9b4",
    primary: isDark ? "#4f98a3" : "#01696f",
    primaryBg: isDark ? "#313b3b" : "#cedcd8",
  };

  const update = (key: string, patch: Partial<TestResult>) =>
    setResults(prev => ({ ...prev, [key]: { ...prev[key], ...patch } as TestResult }));

  async function doRequest(key: string, label: string, method: string, path: string, headers: Record<string, string>, body?: string) {
    update(key, { label, request: { method, url: `${API_BASE}${path}`, headers, body }, response: null, error: null, loading: true });
    try {
      const res = await runRequest(method, path, headers, body);
      if (res.ok && key === "login" && typeof res.data === "object" && res.data !== null) {
        const t = (res.data as { access_token?: string }).access_token;
        if (t) setToken(t);
      }
      update(key, { response: res, loading: false });
    } catch (e) {
      update(key, { error: String(e), loading: false });
    }
  }

  const testHealth = () => doRequest("health", "GET /health — Health check", "GET", "/health", {});
  const testLogin = () => doRequest("login", "POST /token — Login", "POST", "/token",
    { "Content-Type": "application/x-www-form-urlencoded" },
    new URLSearchParams({ username, password }).toString()
  );
  const testGetMe = () => doRequest("me", "GET /users/me — Protected route", "GET", "/users/me",
    token ? { "Authorization": `Bearer ${token}` } : {}
  );
  const testUnauthorized = () => doRequest("unauth", "GET /users/me — No token (expect 401)", "GET", "/users/me", {});
  const runAll = async () => { await testHealth(); await testLogin(); await testGetMe(); await testUnauthorized(); };

  const statusColor = (r: ApiResponse | null, err: string | null) => {
    if (err) return isDark ? "#d163a7" : "#a12c7b";
    if (!r) return s.muted;
    if (r.status < 300) return isDark ? "#6daa45" : "#437a22";
    if (r.status === 401 || r.status === 403) return isDark ? "#fdab43" : "#da7101";
    return isDark ? "#dd6974" : "#a13544";
  };
  const statusBg = (r: ApiResponse | null) => {
    if (!r) return isDark ? "#2d2c2a" : "#e6e4df";
    if (r.status < 300) return isDark ? "#3a4435" : "#d4dfcc";
    if (r.status === 401 || r.status === 403) return isDark ? "#564b3e" : "#e7d7c4";
    return isDark ? "#574848" : "#dececb";
  };

  return (
    <div style={{ minHeight: "100dvh", background: s.bg, color: s.text, fontFamily: "'Inter', system-ui, sans-serif", fontSize: "14px" }}>
      {/* Header */}
      <header style={{ borderBottom: `1px solid ${s.border}`, padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: s.surface }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="11" width="18" height="11" rx="2" stroke={s.primary} strokeWidth="1.5"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke={s.primary} strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="12" cy="16" r="1.5" fill={s.primary}/>
          </svg>
          <span style={{ fontWeight: 600, fontSize: "15px" }}>Auth API Tester</span>
          <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "9999px", background: s.primaryBg, color: s.primary, fontWeight: 500 }}>FastAPI</span>
        </div>
        <button onClick={() => setTheme(isDark ? "light" : "dark")}
          style={{ background: "none", border: `1px solid ${s.border2}`, borderRadius: "6px", padding: "6px 12px", cursor: "pointer", color: s.text, fontSize: "12px" }}>
          {isDark ? "☀ Light" : "☾ Dark"}
        </button>
      </header>

      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "24px" }}>
        {/* Credentials */}
        <section style={{ background: s.surface, border: `1px solid ${s.border}`, borderRadius: "10px", padding: "20px", marginBottom: "16px" }}>
          <h2 style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: s.muted, marginBottom: "16px" }}>Credentials</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
            {[["Username", "text", username, setUsername, "admin"], ["Password", "password", password, setPassword, "••••••••"]].map(([label, type, val, setter, ph]) => (
              <label key={label as string} style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <span style={{ fontSize: "11px", color: s.muted }}>{label as string}</span>
                <input type={type as string} value={val as string} onChange={e => (setter as (v: string) => void)(e.target.value)} placeholder={ph as string}
                  style={{ background: s.surface2, border: `1px solid ${s.border2}`, borderRadius: "6px", padding: "8px 10px", color: s.text, outline: "none", fontSize: "13px" }} />
              </label>
            ))}
          </div>
          <label style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <span style={{ fontSize: "11px", color: s.muted, display: "flex", justifyContent: "space-between" }}>
              JWT Token {token && <button onClick={() => setToken("")} style={{ background: "none", border: "none", cursor: "pointer", color: s.muted, fontSize: "11px" }}>Clear</button>}
            </span>
            <div style={{ display: "flex", gap: "8px" }}>
              <input type="text" value={token} onChange={e => setToken(e.target.value)} placeholder="Auto-filled on login, or paste manually"
                style={{ flex: 1, background: s.surface2, border: `1px solid ${s.border2}`, borderRadius: "6px", padding: "8px 10px", color: token ? s.primary : s.faint, outline: "none", fontSize: "11px", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis" }} />
              {token && <button onClick={() => navigator.clipboard.writeText(token)}
                style={{ background: s.surface2, border: `1px solid ${s.border2}`, borderRadius: "6px", padding: "8px 12px", cursor: "pointer", color: s.text, fontSize: "12px" }}>Copy</button>}
            </div>
          </label>
        </section>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
          {[
            { label: "▶ Run All", action: runAll, primary: true },
            { label: "Health", action: testHealth },
            { label: "Login", action: testLogin },
            { label: "GET /users/me", action: testGetMe },
            { label: "Test 401", action: testUnauthorized },
          ].map(({ label, action, primary }) => (
            <button key={label} onClick={action}
              style={{ padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 500, background: primary ? s.primary : s.surface2, color: primary ? "#fff" : s.text, border: `1px solid ${primary ? "transparent" : s.border2}` }}>
              {label}
            </button>
          ))}
          {Object.keys(results).length > 0 &&
            <button onClick={() => setResults({})} style={{ marginLeft: "auto", padding: "8px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", background: "none", border: `1px solid ${s.border2}`, color: s.muted }}>Clear</button>}
        </div>

        {/* Results */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {Object.entries(results).map(([key, r]) => (
            <ResultCard key={key} result={r} isDark={isDark} s={s} statusColor={statusColor} statusBg={statusBg} />
          ))}
          {!Object.keys(results).length && (
            <div style={{ textAlign: "center", padding: "56px 0", color: s.faint }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" style={{ margin: "0 auto 10px" }}>
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p>Run a test to see results</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function ResultCard({ result, isDark, s, statusColor, statusBg }: {
  result: TestResult; isDark: boolean;
  s: Record<string, string>;
  statusColor: (r: ApiResponse | null, e: string | null) => string;
  statusBg: (r: ApiResponse | null) => string;
}) {
  const [open, setOpen] = useState(false);
  const { label, request, response, error, loading } = result;
  const color = statusColor(response, error);
  const bg = statusBg(response);

  return (
    <div style={{ background: s.surface, border: `1px solid ${s.border}`, borderRadius: "10px", overflow: "hidden" }}>
      <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: "10px", borderBottom: `1px solid ${s.border}` }}>
        <span style={{ fontFamily: "monospace", fontSize: "11px", fontWeight: 700, padding: "2px 6px", borderRadius: "4px", background: isDark ? "#2d2c2a" : "#e6e4df", color: s.primary }}>{request?.method}</span>
        <span style={{ flex: 1, fontSize: "13px" }}>{label}</span>
        {response && <span style={{ fontSize: "11px", color: s.faint }}>{response.elapsed}ms</span>}
        {loading && <span style={{ fontSize: "12px", color: s.muted }}>Loading…</span>}
        {response && <span style={{ fontSize: "12px", fontWeight: 600, padding: "2px 8px", borderRadius: "9999px", background: bg, color }}>{response.status}</span>}
        {error && <span style={{ fontSize: "12px", fontWeight: 600, color }}>Error</span>}
      </div>
      <div style={{ padding: "12px 16px" }}>
        <button onClick={() => setOpen(v => !v)} style={{ background: "none", border: "none", cursor: "pointer", color: s.muted, fontSize: "12px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ display: "inline-block", transform: open ? "rotate(90deg)" : "none", transition: "transform 150ms" }}>▶</span> Request
        </button>
        {open && request && (
          <pre style={{ background: s.surface2, borderRadius: "6px", padding: "10px 12px", fontSize: "11px", fontFamily: "monospace", overflowX: "auto", color: s.text, marginBottom: "10px", lineHeight: 1.6 }}>
{`${request.method} ${request.url}\n${Object.entries(request.headers).map(([k, v]) => `${k}: ${k.toLowerCase() === "authorization" ? v.slice(0,30)+"…" : v}`).join("\n")}${request.body ? `\n\n${request.body}` : ""}`}
          </pre>
        )}
        {error && <pre style={{ background: isDark ? "#4c3d46" : "#e0ced7", borderRadius: "6px", padding: "10px 12px", fontSize: "12px", color, fontFamily: "monospace" }}>{error}</pre>}
        {response && <pre style={{ background: s.surface2, borderRadius: "6px", padding: "10px 12px", fontSize: "12px", fontFamily: "monospace", overflowX: "auto", color: s.text, maxHeight: "200px", lineHeight: 1.6 }}>{JSON.stringify(response.data, null, 2)}</pre>}
      </div>
    </div>
  );
}