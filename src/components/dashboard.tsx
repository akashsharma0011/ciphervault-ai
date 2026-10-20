"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  DEMO_ATTACKS,
  buildDemoResponse,
  detectAndTokenize,
  evaluatePolicy,
  type SecretCategory,
} from "../lib/security";
import { clearSessionVault, encryptSecret } from "../lib/vault";
import { Icon, type IconName } from "./icon";

type ViewId = "overview" | "chat" | "vault" | "attacks" | "events" | "settings";
type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sanitized?: string;
  tokens?: Array<{ token: string; category: SecretCategory }>;
  blocked?: boolean;
};
type EventRecord = {
  id: string;
  time: string;
  title: string;
  detail: string;
  tone: "safe" | "blocked" | "neutral";
};
type AttackResult = { id: string; blocked: boolean };

const SAMPLE_PROMPT = "My API key is sk-test-92837. Explain how I should rotate it safely.";
const VIEW_ITEMS: Array<{ id: ViewId; label: string; icon: IconName }> = [
  { id: "overview", label: "Overview", icon: "grid" },
  { id: "chat", label: "Secure chat", icon: "message" },
  { id: "vault", label: "Local vault", icon: "vault" },
  { id: "attacks", label: "Attack lab", icon: "scan" },
  { id: "events", label: "Security events", icon: "activity" },
  { id: "settings", label: "Policies & settings", icon: "settings" },
];

function timestamp(): string {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function makeEvent(title: string, detail: string, tone: EventRecord["tone"]): EventRecord {
  return { id: `${Date.now()}-${Math.random().toString(16).slice(2, 7)}`, time: timestamp(), title, detail, tone };
}

export function Dashboard() {
  const [activeView, setActiveView] = useState<ViewId>("overview");
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "intro",
      role: "assistant",
      content: "CipherVault is ready to inspect a prompt locally. Try the sample credential to see detection, tokenization, and a safe placeholder response.",
    },
  ]);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [vaultCount, setVaultCount] = useState(0);
  const [secretCount, setSecretCount] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [blockedCount, setBlockedCount] = useState(0);
  const [lastPayload, setLastPayload] = useState("Your sanitized prompt will appear here after local inspection.");
  const [lastTokens, setLastTokens] = useState<Array<{ token: string; category: SecretCategory }>>([]);
  const [customSecretDraft, setCustomSecretDraft] = useState("");
  const [customSecrets, setCustomSecrets] = useState<string[]>([]);
  const [attackResults, setAttackResults] = useState<AttackResult[]>([]);
  const [testRunning, setTestRunning] = useState(false);
  const [testFinished, setTestFinished] = useState(false);
  const [notice, setNotice] = useState("");

  const recentEvents = useMemo(() => events.slice(0, 5), [events]);
  const privacyScore = 100;
  const addEvent = (title: string, detail: string, tone: EventRecord["tone"]) => {
    setEvents((current) => [makeEvent(title, detail, tone), ...current].slice(0, 80));
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const prompt = draft.trim();
    if (!prompt || busy) return;

    setBusy(true);
    setNotice("");
    setMessages((current) => [...current, { id: `u-${Date.now()}`, role: "user", content: prompt }]);
    setDraft("");

    try {
      const decision = evaluatePolicy(prompt);
      if (decision.blocked) {
        const description = `${decision.category ?? "Policy violation"} · ${decision.resource ?? "RESTRICTED_RESOURCE"}`;
        setLastPayload(`BLOCKED · ${description}\nNo response provider was called.`);
        setLastTokens([]);
        setBlockedCount((count) => count + 1);
        addEvent("Policy decision: blocked", description, "blocked");
        setMessages((current) => [
          ...current,
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            blocked: true,
            content: `Access denied. ${decision.reason ?? "The local policy engine rejected this request."} No secret value or master key was disclosed.`,
          },
        ]);
        return;
      }

      const result = detectAndTokenize(prompt, customSecrets);
      await Promise.all(result.matches.map((match) => encryptSecret(match.token, match.value, match.category)));
      const tokenSummaries = result.matches.map(({ token, category }) => ({ token, category }));
      setLastPayload(result.sanitized || "(empty prompt)");
      setLastTokens(tokenSummaries);
      setVaultCount((count) => count + result.matches.length);
      setSecretCount((count) => count + result.matches.length);
      setProcessedCount((count) => count + 1);
      if (result.matches.length > 0) {
        const categories = [...new Set(result.matches.map((match) => match.category))].join(", ");
        addEvent("Sensitive values tokenized", `${result.matches.length} item(s) · ${categories}`, "safe");
      } else {
        addEvent("Prompt inspected locally", "No supported sensitive pattern found · no external request", "neutral");
      }
      setMessages((current) => [
        ...current,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: buildDemoResponse(result.sanitized),
          sanitized: result.sanitized,
          tokens: tokenSummaries,
        },
      ]);
    } catch {
      setNotice("The local vault could not encrypt this value. No provider request was made.");
      addEvent("Local encryption unavailable", "Prompt was not forwarded · check secure browser context", "blocked");
      setMessages((current) => [
        ...current,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          blocked: true,
          content: "Local encryption could not run, so the request was stopped. No external model or provider was contacted.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  async function runAttackTest() {
    if (testRunning) return;
    setTestRunning(true);
    setTestFinished(false);
    setAttackResults([]);
    addEvent("Curated attack simulation started", `${DEMO_ATTACKS.length} local policy fixtures · no network calls`, "neutral");

    for (const attack of DEMO_ATTACKS) {
      await new Promise((resolve) => window.setTimeout(resolve, 185));
      const decision = evaluatePolicy(attack.prompt);
      setAttackResults((current) => [...current, { id: attack.id, blocked: decision.blocked }]);
      setBlockedCount((count) => count + (decision.blocked ? 1 : 0));
      addEvent(
        decision.blocked ? "Simulated request blocked" : "Simulation rule missed",
        `${attack.id} · ${attack.kind} · ${attack.resource}`,
        decision.blocked ? "blocked" : "neutral",
      );
    }

    const blocked = DEMO_ATTACKS.filter((attack) => evaluatePolicy(attack.prompt).blocked).length;
    setTestFinished(true);
    setTestRunning(false);
    addEvent("Curated simulation complete", `${blocked}/${DEMO_ATTACKS.length} fixtures blocked · not a security certification`, blocked === DEMO_ATTACKS.length ? "safe" : "blocked");
  }

  function addCustomSecret(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = customSecretDraft.trim();
    if (value.length < 3) {
      setNotice("Use at least 3 characters for a local custom detector.");
      return;
    }
    if (customSecrets.includes(value)) {
      setNotice("That exact value is already in the session detector list.");
      return;
    }
    setCustomSecrets((current) => [...current, value]);
    setCustomSecretDraft("");
    setNotice("Custom detector added in browser memory for this session only.");
    addEvent("Custom detector added", "Value held in browser memory · excluded from audit logs", "safe");
  }

  function clearVault() {
    clearSessionVault();
    setVaultCount(0);
    setNotice("Ephemeral encrypted entries cleared. JavaScript does not guarantee physical memory zeroization.");
    addEvent("Session vault cleared", "Application references dropped · physical zeroization is not guaranteed", "neutral");
  }

  function exportAudit() {
    const report = {
      product: "CipherVault AI demo",
      generatedAt: new Date().toISOString(),
      note: "Curated local prototype events only; not a security certification. Raw prompt text and secret values are never included.",
      metrics: { secretsDetected: secretCount, promptsInspected: processedCount, externalRequests: 0, simulatedAttemptsBlocked: blockedCount, ephemeralVaultEntries: vaultCount },
      events: [...events].reverse().map(({ time, title, detail, tone }) => ({ time, title, detail, tone })),
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "ciphervault-demo-audit.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  const sidebar = (
    <aside className="sidebar">
      <div className="brand-lockup">
        <div className="brand-mark" aria-hidden="true"><Icon name="shield" size={22} strokeWidth={1.65} /></div>
        <div><span className="brand-name">CipherVault</span><span className="brand-product">AI GATEWAY</span></div>
      </div>
      <div className="workspace-label">WORKSPACE <span>DEMO</span></div>
      <nav className="side-nav" aria-label="Primary navigation">
        {VIEW_ITEMS.map((item) => (
          <button
            className={`nav-item ${activeView === item.id ? "active" : ""}`}
            key={item.id}
            aria-label={item.label}
            onClick={() => { setActiveView(item.id); setNotice(""); }}
            type="button"
            aria-current={activeView === item.id ? "page" : undefined}
          >
            <Icon name={item.icon} size={17} />
            <span>{item.label}</span>
            {item.id === "attacks" && blockedCount > 0 && <span className="nav-count">{blockedCount}</span>}
          </button>
        ))}
      </nav>
      <div className="sidebar-spacer" />
      <div className="boundary-card">
        <div className="boundary-icon"><Icon name="lock" size={16} /></div>
        <div className="boundary-copy"><strong>Trust boundary active</strong><span>Model provider · not connected</span></div>
        <span className="tiny-dot" />
      </div>
      <div className="sidebar-footer"><span className="local-indicator" /> LOCAL DEMO <span className="footer-divider">·</span> v1.0.0</div>
    </aside>
  );

  return (
    <div className="app-shell">
      {sidebar}
      <main className="main-shell">
        <header className="topbar">
          <div className="breadcrumbs"><span>Workspace</span><Icon name="chevron" size={13} /><strong>{VIEW_ITEMS.find((item) => item.id === activeView)?.label}</strong></div>
          <div className="topbar-actions">
            <span className="session-pill"><span className="tiny-dot" /> PROTECTED SESSION</span>
            <button className="icon-button help-button" type="button" aria-label="Show project scope" onClick={() => setActiveView("settings")}><Icon name="warning" size={17} /></button>
            <div className="profile-chip"><span className="profile-avatar">CV</span><span>Demo workspace</span></div>
          </div>
        </header>
        <div className="page-content">
          <div className="page-heading">
            <div>
              <div className="eyebrow"><span className="eyebrow-line" /> ZERO-TRUST AI GATEWAY</div>
              <h1>{activeView === "overview" ? "The boundary is holding." : VIEW_ITEMS.find((item) => item.id === activeView)?.label}</h1>
              <p className="page-subtitle">Sensitive context stays on this device. Only sanitized placeholders would cross a future model boundary.</p>
            </div>
            <div className="heading-actions">
              <span className="live-state"><span className="tiny-dot" /> ALL SYSTEMS NOMINAL</span>
              <button className="button button-primary" type="button" onClick={() => { setActiveView("attacks"); void runAttackTest(); }} disabled={testRunning}>
                <Icon name="scan" size={16} /> Run security test
              </button>
            </div>
          </div>

          {notice && <div className="notice-banner" role="status"><Icon name="warning" size={16} /> <span>{notice}</span><button type="button" onClick={() => setNotice("")} aria-label="Dismiss message"><Icon name="close" size={15} /></button></div>}

          {(activeView === "overview" || activeView === "chat") && (
            <>
              {activeView === "overview" && <StatsRow secretCount={secretCount} blockedCount={blockedCount} privacyScore={privacyScore} processedCount={processedCount} />}
              <div className={`workbench-grid ${activeView === "chat" ? "chat-focused" : ""}`}>
                <ChatPanel messages={messages} draft={draft} busy={busy} setDraft={setDraft} onSubmit={handleSubmit} onSample={() => setDraft(SAMPLE_PROMPT)} />
                <div className="right-rail">
                  <SanitizedPanel payload={lastPayload} tokens={lastTokens} />
                  <VaultSummary vaultCount={vaultCount} onOpen={() => setActiveView("vault")} />
                  <EventSummary events={recentEvents} onOpen={() => setActiveView("events")} />
                </div>
              </div>
              {activeView === "overview" && <OverviewFooter secretCount={secretCount} blockedCount={blockedCount} onOpenAttacks={() => setActiveView("attacks")} />}
            </>
          )}

          {activeView === "vault" && <VaultView vaultCount={vaultCount} onClear={clearVault} />}
          {activeView === "attacks" && <AttackLab results={attackResults} running={testRunning} finished={testFinished} blockedCount={blockedCount} onRun={() => void runAttackTest()} />}
          {activeView === "events" && <EventsView events={events} onExport={exportAudit} />}
          {activeView === "settings" && (
            <SettingsView
              customSecretDraft={customSecretDraft}
              customSecrets={customSecrets}
              setCustomSecretDraft={setCustomSecretDraft}
              addCustomSecret={addCustomSecret}
              onClearVault={clearVault}
            />
          )}

          <div className="prototype-disclaimer"><Icon name="warning" size={15} /><span><strong>Prototype boundary:</strong> no external LLM is connected. This demo illustrates local controls; it is not a security certification.</span><button type="button" onClick={() => setActiveView("settings")}>Read limitations <Icon name="arrow" size={13} /></button></div>
        </div>
      </main>
    </div>
  );
}

function StatsRow({ secretCount, blockedCount, privacyScore, processedCount }: { secretCount: number; blockedCount: number; privacyScore: number; processedCount: number }) {
  const stats = [
    { label: "Secrets tokenized", value: String(secretCount).padStart(2, "0"), detail: "this browser session", icon: "key" as IconName, tone: "teal" },
    { label: "External transmissions", value: "00", detail: "provider not connected", icon: "arrow" as IconName, tone: "blue" },
    { label: "Policy blocks", value: String(blockedCount).padStart(2, "0"), detail: "observed in demo", icon: "shield" as IconName, tone: "amber" },
    { label: "Privacy score", value: `${privacyScore}%`, detail: `${processedCount} prompt(s) · illustrative`, icon: "activity" as IconName, tone: "violet" },
  ];
  return <section className="stats-grid" aria-label="Session metrics">
    {stats.map((stat) => <article className="stat-card" key={stat.label}>
      <div className={`stat-icon ${stat.tone}`}><Icon name={stat.icon} size={17} /></div>
      <div className="stat-copy"><span>{stat.label}</span><strong>{stat.value}</strong><small>{stat.detail}</small></div>
      <span className="stat-trend"><Icon name="activity" size={16} /></span>
    </article>)}
  </section>;
}

function ChatPanel({ messages, draft, busy, setDraft, onSubmit, onSample }: {
  messages: Message[];
  draft: string;
  busy: boolean;
  setDraft: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onSample: () => void;
}) {
  return <section className="panel chat-panel">
    <div className="panel-heading chat-heading">
      <div className="panel-title-group"><span className="panel-kicker">SECURE PROMPT LAB</span><h2>Private conversation</h2><p>Inspect before a model boundary. Nothing leaves this browser.</p></div>
      <span className="firewall-tag"><Icon name="shield" size={14} /> FIREWALL ACTIVE</span>
    </div>
    <div className="chat-stream" role="log" aria-label="Secure conversation">
      {messages.map((message) => <div className={`message-row ${message.role}`} key={message.id}>
        <div className={`message-avatar ${message.role === "assistant" ? "assistant-avatar" : "user-avatar"}`}>{message.role === "assistant" ? <Icon name="shield" size={16} /> : "YO"}</div>
        <div className="message-content">
          <div className="message-meta"><strong>{message.role === "assistant" ? "CipherVault" : "You"}</strong><span>{message.role === "assistant" ? "LOCAL DEMO" : "LOCAL INPUT"}</span></div>
          <div className={`message-bubble ${message.blocked ? "blocked-bubble" : ""}`}>{message.content}</div>
          {message.sanitized && <div className="inline-sanitized"><span>PROTECTED PAYLOAD</span><code>{message.sanitized}</code>{(message.tokens?.length ?? 0) > 0 && <div className="inline-token-list">{message.tokens?.map((token) => <span className="token-chip" key={token.token}><Icon name="lock" size={11} /> {token.token} <i>{token.category}</i></span>)}</div>}</div>}
        </div>
      </div>)}
      {busy && <div className="processing-line"><span className="processing-dots"><i /><i /><i /></span> Inspecting locally and encrypting detected values…</div>}
    </div>
    <form className="composer" onSubmit={onSubmit}>
      <label className="sr-only" htmlFor="secure-prompt">Type a secure prompt</label>
      <textarea id="secure-prompt" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ask a question or paste a sample prompt…" rows={3} maxLength={1000} />
      <div className="composer-bottom"><div className="composer-tools"><button className="text-action" type="button" onClick={onSample}><Icon name="spark" size={14} /> Try sample prompt</button><span className="char-count">{draft.length}/1000</span></div><button className="button button-primary send-button" type="submit" disabled={busy || !draft.trim()}><Icon name="lock" size={15} /> {busy ? "Inspecting…" : "Inspect securely"}</button></div>
    </form>
    <div className="chat-boundary"><Icon name="lock" size={14} /><span>Browser-side inspection</span><span className="boundary-separator">·</span><span>Provider disconnected</span><span className="boundary-separator">·</span><span>Secret-free event log</span></div>
  </section>;
}

function SanitizedPanel({ payload, tokens }: { payload: string; tokens: Array<{ token: string; category: SecretCategory }> }) {
  return <section className="panel sanitized-panel">
    <div className="compact-panel-header"><div><span className="panel-kicker">BOUNDARY PREVIEW</span><h3>Sanitized payload</h3></div><span className="mini-status"><span className="tiny-dot" /> LOCAL</span></div>
    <div className="payload-code"><span className="code-label">OUTBOUND CONTEXT</span><pre>{payload}</pre></div>
    <div className="token-row"><div className="token-summary"><Icon name="lock" size={14} /><span>{tokens.length} value{tokens.length === 1 ? "" : "s"} tokenized</span></div>{tokens.length > 0 && <span className="encrypted-label"><Icon name="check" size={12} /> encrypted in memory</span>}</div>
    {tokens.length > 0 ? <div className="detected-list">{tokens.map((token) => <div className="detected-item" key={token.token}><span className="token-pill">{token.token}</span><span>{token.category}</span><Icon name="check" size={14} /></div>)}</div> : <div className="empty-inspection"><Icon name="scan" size={16} /><span>Waiting for a prompt to inspect.</span></div>}
    <div className="no-provider-note"><span className="provider-dash" /> Demo only — this payload is <strong>not sent</strong> to any model.</div>
  </section>;
}

function VaultSummary({ vaultCount, onOpen }: { vaultCount: number; onOpen: () => void }) {
  return <section className="panel vault-summary">
    <div className="compact-panel-header"><div><span className="panel-kicker">KEY ISOLATION</span><h3>Ephemeral vault</h3></div><div className="vault-emblem"><Icon name="key" size={15} /></div></div>
    <div className="vault-status-row"><span className="status-ring"><Icon name="lock" size={18} /></span><div><strong>{vaultCount ? "Encrypted entries" : "Ready · no entries"}</strong><span>{vaultCount ? `${vaultCount} item(s) · memory only` : "Key generated on first capture"}</span></div></div>
    <div className="vault-meta-grid"><div><span>MASTER KEY</span><strong>LOCAL ONLY</strong></div><div><span>EXPORT</span><strong>NOT EXPOSED</strong></div></div>
    <button className="panel-link" type="button" onClick={onOpen}>Inspect vault boundary <Icon name="arrow" size={14} /></button>
  </section>;
}

function EventSummary({ events, onOpen }: { events: EventRecord[]; onOpen: () => void }) {
  return <section className="panel events-summary">
    <div className="compact-panel-header"><div><span className="panel-kicker">AUDIT TRAIL</span><h3>Recent events</h3></div><button className="quiet-icon-button" type="button" aria-label="View all security events" onClick={onOpen}><Icon name="arrow" size={15} /></button></div>
    {events.length === 0 ? <div className="event-empty"><span className="event-line" /><div><strong>Clean slate</strong><span>Events are recorded as metadata only.</span></div></div> : <div className="event-list">{events.slice(0, 3).map((event) => <EventRow event={event} key={event.id} compact />)}</div>}
    <button className="panel-link" type="button" onClick={onOpen}>View event log <Icon name="arrow" size={14} /></button>
  </section>;
}

function EventRow({ event, compact = false }: { event: EventRecord; compact?: boolean }) {
  return <div className={`event-row ${compact ? "compact" : ""}`}><span className={`event-mark ${event.tone}`}><Icon name={event.tone === "blocked" ? "close" : event.tone === "safe" ? "check" : "activity"} size={13} /></span><div className="event-text"><strong>{event.title}</strong><span>{event.detail}</span></div><time>{event.time}</time></div>;
}

function OverviewFooter({ secretCount, blockedCount, onOpenAttacks }: { secretCount: number; blockedCount: number; onOpenAttacks: () => void }) {
  return <div className="overview-lower-grid">
    <section className="panel flow-card"><div className="lower-heading"><div><span className="panel-kicker">THE TRUST BOUNDARY</span><h3>Useful context. No key access.</h3></div><span className="flow-badge"><Icon name="shield" size={13} /> ZERO TRUST</span></div><div className="flow-steps"><div className="flow-node"><span className="flow-icon"><Icon name="message" size={17} /></span><span>USER</span></div><Icon name="arrow" size={15} /><div className="flow-node active-flow"><span className="flow-icon"><Icon name="shield" size={17} /></span><span>CIPHERVAULT</span></div><Icon name="arrow" size={15} /><div className="flow-node"><span className="flow-icon"><Icon name="scan" size={17} /></span><span>POLICY LAYER</span></div><Icon name="arrow" size={15} /><div className="flow-node muted-flow"><span className="flow-icon"><Icon name="terminal" size={17} /></span><span>MODEL · OFF</span></div></div><p className="flow-caption">{secretCount} secret(s) tokenized · {blockedCount} policy block(s) observed in this local session.</p></section>
    <section className="panel quick-test-card"><div className="test-orbit"><span /><span /><div><Icon name="shield" size={22} /></div></div><div className="quick-test-copy"><span className="panel-kicker">CONTROLLED SIMULATION</span><h3>Can the policy hold?</h3><p>Run 8 curated local attack fixtures. Results are limited to these cases.</p><button type="button" className="panel-link" onClick={onOpenAttacks}>Open attack lab <Icon name="arrow" size={14} /></button></div></section>
  </div>;
}

function VaultView({ vaultCount, onClear }: { vaultCount: number; onClear: () => void }) {
  return <div className="section-stack">
    <section className="vault-hero panel"><div className="vault-hero-art"><div className="vault-orbit orbit-one" /><div className="vault-orbit orbit-two" /><div className="vault-center"><Icon name="lock" size={34} /></div><span className="orbit-tag tag-left">AES-256-GCM</span><span className="orbit-tag tag-right">NON-EXTRACTABLE</span></div><div className="vault-hero-copy"><span className="panel-kicker">EPHEMERAL CRYPTOGRAPHIC VAULT</span><h2>Key material stays<br />outside the model path.</h2><p>On the first detected value, this browser generates a non-exportable AES-GCM key with Web Crypto. Values are encrypted in this tab's memory and represented in the UI by token IDs.</p><div className="vault-hero-state"><span className="tiny-dot" /><strong>{vaultCount ? `${vaultCount} encrypted entry${vaultCount === 1 ? "" : "ies"} in this session` : "No encrypted entries yet"}</strong><span>· key exists only after capture</span></div></div><div className="vault-hero-action"><button type="button" className="button button-secondary" onClick={onClear} disabled={vaultCount === 0}>Clear ephemeral entries</button></div></section>
    <div className="two-column-layout"><section className="panel detail-panel"><div className="panel-heading"><div><span className="panel-kicker">ISOLATION RULES</span><h2>What the model path can access</h2></div></div><div className="rule-list"><RuleRow allowed label="Sanitized prompt text" detail="Only placeholder-substituted text is eligible for a model boundary." /><RuleRow label="Master encryption key" detail="Never exposed by the demo policy or any model request." /><RuleRow label="Arbitrary vault entries" detail="A token ID does not authorize resolving its underlying value." /><RuleRow label="Vault export / environment" detail="Restricted resources are blocked by local policy fixtures." /></div></section><section className="panel caveat-panel"><div className="caveat-icon"><Icon name="warning" size={17} /></div><span className="panel-kicker">IMPORTANT LIMITATION</span><h3>A browser demo is not a production enclave.</h3><p>Client-side code runs in the same browser environment as the UI. This prototype demonstrates separation in its data flow; it does not defend against a compromised browser, malicious extension, XSS, or device-level compromise.</p><p>Reloading the page drops app references to its session key and ciphertext. JavaScript does not guarantee physical memory zeroization.</p></section></div>
    <div className="architecture-strip panel"><span className="panel-kicker">DEMO DATA FLOW</span><div className="architecture-flow"><span>RAW INPUT</span><Icon name="arrow" size={15} /><span>LOCAL SCAN</span><Icon name="arrow" size={15} /><span className="architecture-highlight">AES-GCM VAULT</span><Icon name="arrow" size={15} /><span>PLACEHOLDER ONLY</span><Icon name="arrow" size={15} /><span className="architecture-off">EXTERNAL LLM · DISCONNECTED</span></div></div>
  </div>;
}

function RuleRow({ allowed = false, label, detail }: { allowed?: boolean; label: string; detail: string }) {
  return <div className="rule-row"><span className={`rule-icon ${allowed ? "allowed" : "denied"}`}><Icon name={allowed ? "check" : "close"} size={14} /></span><div><strong>{label}</strong><span>{detail}</span></div><span className={`rule-outcome ${allowed ? "allow-text" : "deny-text"}`}>{allowed ? "LIMITED" : "DENIED"}</span></div>;
}

function AttackLab({ results, running, finished, blockedCount, onRun }: { results: AttackResult[]; running: boolean; finished: boolean; blockedCount: number; onRun: () => void }) {
  const progress = Math.round((results.length / DEMO_ATTACKS.length) * 100);
  return <div className="section-stack">
    <div className="attack-banner panel"><div className="attack-banner-copy"><span className="panel-kicker">RED-TEAM PRACTICE · LOCAL FIXTURES ONLY</span><h2>Probe the policy.<br /><span>Keep the key out of reach.</span></h2><p>Run a fixed set of prompt-injection and restricted-resource requests against the local policy rules. Nothing is sent over the network.</p><button className="button button-primary" type="button" onClick={onRun} disabled={running}><Icon name={running ? "activity" : "scan"} size={16} />{running ? "Running controlled test…" : "Run 8 curated attacks"}</button></div><div className="attack-scorecard"><div className="score-label"><span>FIXTURES BLOCKED</span><Icon name="shield" size={16} /></div><strong>{finished ? `${results.filter((result) => result.blocked).length}` : String(results.filter((result) => result.blocked).length).padStart(2, "0")}<small>/{results.length || DEMO_ATTACKS.length}</small></strong><div className="score-meter"><span style={{ width: `${progress}%` }} /></div><div className="score-foot"><span>{results.length} / {DEMO_ATTACKS.length} evaluated</span><span>{blockedCount} total blocks</span></div>{finished && <div className="simulation-note"><Icon name="warning" size={13} /> Limited local test · not certification</div>}</div></div>
    <section className="panel attack-table-panel"><div className="table-heading"><div><span className="panel-kicker">CURATED ATTACK SET</span><h2>Policy decisions</h2></div><span className="result-count">{results.length} / {DEMO_ATTACKS.length} evaluated</span></div><div className="attack-table"><div className="attack-table-head"><span>FIXTURE</span><span>SIMULATED REQUEST</span><span>RESOURCE</span><span>DECISION</span></div>{DEMO_ATTACKS.map((attack, index) => { const result = results.find((entry) => entry.id === attack.id); return <div className={`attack-row ${result?.blocked ? "attack-row-blocked" : ""}`} key={attack.id}><span className="attack-id">{attack.id}</span><span className="attack-prompt">“{attack.prompt}”</span><span className="resource-code">{attack.resource}</span><span>{result ? <span className="decision-tag blocked"><Icon name="check" size={12} /> BLOCKED</span> : <span className={`decision-tag ${running && index === results.length ? "checking" : "pending"}`}>{running && index === results.length ? "CHECKING" : "QUEUED"}</span>}</span></div>; })}</div><p className="table-footnote"><Icon name="warning" size={14} /> These eight canned inputs test specific local pattern rules. They do not establish resistance to unknown or adaptive attacks.</p></section>
  </div>;
}

function EventsView({ events, onExport }: { events: EventRecord[]; onExport: () => void }) {
  return <section className="panel full-events-panel"><div className="table-heading"><div><span className="panel-kicker">SECRET-FREE AUDIT TRAIL</span><h2>Security events</h2><p>Metadata only. The original prompt and detected values are deliberately excluded.</p></div><button type="button" className="button button-secondary" onClick={onExport} disabled={events.length === 0}><Icon name="external" size={15} /> Export report</button></div>{events.length === 0 ? <div className="events-zero"><div className="zero-mark"><Icon name="activity" size={21} /></div><strong>No events recorded yet</strong><span>Submit a sample prompt or run the attack lab to populate this session log.</span></div> : <div className="full-event-list">{events.map((event) => <EventRow event={event} key={event.id} />)}</div>}<div className="events-privacy-note"><Icon name="lock" size={14} /><span>Events are held in browser state for this session and are never uploaded.</span></div></section>;
}

function SettingsView({ customSecretDraft, customSecrets, setCustomSecretDraft, addCustomSecret, onClearVault }: { customSecretDraft: string; customSecrets: string[]; setCustomSecretDraft: (value: string) => void; addCustomSecret: (event: FormEvent<HTMLFormElement>) => void; onClearVault: () => void }) {
  return <div className="settings-grid">
    <section className="panel settings-panel"><div className="panel-heading"><div><span className="panel-kicker">POLICY ENGINE</span><h2>Enforced demo rules</h2><p>Fixed local controls. The model is not connected and cannot call these policies.</p></div><span className="firewall-tag"><Icon name="shield" size={14} /> ACTIVE</span></div><div className="rule-list"><RuleRow allowed label="Sanitized prompt handoff" detail="Placeholders, not matched values, are shown in the demo payload." /><RuleRow label="Master-key access" detail="Direct reveal requests and override attempts are blocked." /><RuleRow label="Vault export" detail="Bulk export and arbitrary secret resolution are denied." /><RuleRow label="Environment variables" detail="Environment and process values are unavailable to the demo path." /><RuleRow allowed label="Secret-free audit events" detail="Event descriptions store categories and token counts only." /></div></section>
    <section className="panel custom-detector-panel"><div><span className="panel-kicker">CUSTOM DETECTION</span><h2>Watch a company secret</h2><p>Add an exact phrase to the in-browser detector for this session. It is not saved to disk or included in logs.</p></div><form className="custom-secret-form" onSubmit={addCustomSecret}><label htmlFor="custom-secret">Secret value <span>LOCAL MEMORY</span></label><div className="secret-input-wrap"><input id="custom-secret" type="password" value={customSecretDraft} onChange={(event) => setCustomSecretDraft(event.target.value)} placeholder="Enter a demo-only value" autoComplete="off" /><Icon name="eye" size={16} /></div><button type="submit" className="button button-primary"><Icon name="plus" size={15} /> Add detector</button></form>{customSecrets.length > 0 && <div className="custom-count"><Icon name="shield" size={14} /> {customSecrets.length} custom detector{customSecrets.length === 1 ? "" : "s"} active · values hidden</div>}<div className="custom-note"><Icon name="warning" size={14} /> Browser memory only. A compromised browser or injected script can still access client-side state.</div></section>
    <section className="panel provider-settings"><div className="provider-icon"><Icon name="terminal" size={19} /></div><div><span className="panel-kicker">MODEL PROVIDER</span><h3>Not configured</h3><p>No external provider receives prompts. To connect a real LLM later, add a server-side integration, secret management, authorization controls, and privacy review; never put provider keys in browser code.</p></div><span className="provider-state"><i /> DISCONNECTED</span></section>
    <section className="panel reset-panel"><div><span className="panel-kicker">SESSION CONTROLS</span><h3>Clear encrypted entries</h3><p>Drop the application references to this tab’s ephemeral key and ciphertext.</p></div><button type="button" className="button button-secondary" onClick={onClearVault}>Clear vault</button><small>JavaScript does not guarantee physical memory zeroization.</small></section>
  </div>;
}
