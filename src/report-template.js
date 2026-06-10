"use strict";

function renderReport({ title, body, timestamp, buildId }) {
  const formattedDate = timestamp
    ? new Date(timestamp).toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title || "Relatório Executivo")}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --brand: #0078d4;
      --brand-dark: #005a9e;
      --brand-light: #deecf9;
      --text: #1b1b1b;
      --muted: #605e5c;
      --border: #edebe9;
      --surface: #ffffff;
      --surface-alt: #f8f9fa;
      --shadow: 0 2px 8px rgba(0,0,0,0.08);
      --radius: 8px;
    }

    body {
      font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
      font-size: 16px;
      line-height: 1.7;
      color: var(--text);
      background: #f0f2f5;
      min-height: 100vh;
    }

    /* ── Header ── */
    .header {
      background: linear-gradient(135deg, var(--brand-dark) 0%, var(--brand) 100%);
      color: #fff;
      padding: 48px 0 40px;
    }
    .header-inner {
      max-width: 900px;
      margin: 0 auto;
      padding: 0 32px;
    }
    .header-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.25);
      border-radius: 20px;
      padding: 4px 14px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin-bottom: 20px;
    }
    .header-badge svg { width: 14px; height: 14px; }
    .header h1 {
      font-size: clamp(24px, 4vw, 36px);
      font-weight: 700;
      line-height: 1.25;
      margin-bottom: 16px;
    }
    .header-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      font-size: 13px;
      opacity: 0.85;
    }
    .header-meta span { display: flex; align-items: center; gap: 6px; }

    /* ── Content ── */
    .content-wrap {
      max-width: 900px;
      margin: 32px auto 64px;
      padding: 0 32px;
    }

    .report-card {
      background: var(--surface);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      padding: 48px 56px;
    }

    /* ── Typography inside card ── */
    .report-card h1,
    .report-card h2,
    .report-card h3,
    .report-card h4 {
      font-weight: 700;
      line-height: 1.3;
      color: var(--text);
    }
    .report-card h1 { font-size: 28px; margin: 40px 0 16px; }
    .report-card h2 {
      font-size: 20px;
      margin: 40px 0 14px;
      padding-bottom: 10px;
      border-bottom: 2px solid var(--brand-light);
      color: var(--brand-dark);
    }
    .report-card h3 { font-size: 17px; margin: 28px 0 10px; color: var(--brand); }
    .report-card h4 { font-size: 15px; margin: 20px 0 8px; }

    .report-card h1:first-child,
    .report-card h2:first-child { margin-top: 0; }

    .report-card p { margin-bottom: 16px; color: #3a3a3a; }
    .report-card strong { color: var(--text); font-weight: 700; }

    /* ── Lists ── */
    .report-card ul,
    .report-card ol {
      margin: 0 0 16px 0;
      padding-left: 24px;
    }
    .report-card li { margin-bottom: 6px; color: #3a3a3a; }
    .report-card li::marker { color: var(--brand); }

    /* ── Task list ── */
    .report-card ul li input[type="checkbox"] {
      accent-color: var(--brand);
      margin-right: 8px;
    }

    /* ── Tables ── */
    .report-card table {
      width: 100%;
      border-collapse: collapse;
      margin: 24px 0;
      font-size: 14px;
      border-radius: var(--radius);
      overflow: hidden;
      box-shadow: 0 1px 4px rgba(0,0,0,0.07);
    }
    .report-card thead tr {
      background: var(--brand);
      color: #fff;
    }
    .report-card thead th {
      padding: 12px 16px;
      text-align: left;
      font-weight: 600;
      font-size: 13px;
      letter-spacing: 0.3px;
    }
    .report-card tbody tr { transition: background 0.15s; }
    .report-card tbody tr:nth-child(even) { background: var(--surface-alt); }
    .report-card tbody tr:hover { background: var(--brand-light); }
    .report-card td {
      padding: 10px 16px;
      border-top: 1px solid var(--border);
      vertical-align: top;
    }

    /* ── Blockquote ── */
    .report-card blockquote {
      border-left: 4px solid var(--brand);
      background: var(--brand-light);
      margin: 24px 0;
      padding: 16px 20px;
      border-radius: 0 var(--radius) var(--radius) 0;
      color: var(--brand-dark);
    }
    .report-card blockquote p { margin: 0; color: inherit; }

    /* ── Code ── */
    .report-card code {
      background: var(--surface-alt);
      border: 1px solid var(--border);
      border-radius: 4px;
      padding: 2px 6px;
      font-family: "Cascadia Code", "Fira Code", monospace;
      font-size: 13px;
    }
    .report-card pre {
      background: #1e1e1e;
      color: #d4d4d4;
      border-radius: var(--radius);
      padding: 20px 24px;
      overflow-x: auto;
      margin: 24px 0;
    }
    .report-card pre code {
      background: none;
      border: none;
      padding: 0;
      color: inherit;
      font-size: 13px;
    }

    /* ── Horizontal rule ── */
    .report-card hr {
      border: none;
      border-top: 1px solid var(--border);
      margin: 32px 0;
    }

    /* ── Footer ── */
    .footer {
      max-width: 900px;
      margin: 0 auto;
      padding: 0 32px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: var(--muted);
    }
    .footer a { color: var(--brand); text-decoration: none; }

    /* ── No-report state ── */
    .empty-state {
      background: var(--surface);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      padding: 80px 40px;
      text-align: center;
      color: var(--muted);
    }
    .empty-state svg { width: 56px; height: 56px; margin-bottom: 20px; opacity: 0.4; }
    .empty-state h2 { font-size: 20px; margin-bottom: 10px; color: var(--text); }
    .empty-state p { font-size: 15px; }

    @media (max-width: 640px) {
      .report-card { padding: 28px 24px; }
      .header-inner { padding: 0 20px; }
      .content-wrap { padding: 0 16px; }
    }
  </style>
</head>
<body>

  <header class="header">
    <div class="header-inner">
      <div class="header-badge">
        <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm.75 10.5h-1.5v-5h1.5v5zm0-6.5h-1.5V3.5h1.5V5z"/></svg>
        Relatório Executivo · Gerado por IA
      </div>
      <h1>${escapeHtml(title || "Relatório Executivo")}</h1>
      <div class="header-meta">
        ${formattedDate ? `<span><svg viewBox="0 0 16 16" fill="currentColor" style="width:14px;height:14px"><path d="M11 1h-1V0H6v1H5C3.9 1 3 1.9 3 3v10c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm1 12c0 .6-.4 1-1 1H5c-.6 0-1-.4-1-1V5h8v8zM5 4V3c0-.6.4-1 1-1h4c.6 0 1 .4 1 1v1H5z"/></svg>${formattedDate}</span>` : ""}
        ${buildId ? `<span><svg viewBox="0 0 16 16" fill="currentColor" style="width:14px;height:14px"><path d="M13.5 1h-11C1.7 1 1 1.7 1 2.5v11c0 .8.7 1.5 1.5 1.5h11c.8 0 1.5-.7 1.5-1.5v-11C15 1.7 14.3 1 13.5 1zM6 12H4V7h2v5zm0-6.5C6 6.3 5.3 7 4.5 7S3 6.3 3 5.5 3.7 4 4.5 4 6 4.7 6 5.5zM13 12H8V9h5v3zm0-4H8V7h5v1z"/></svg>Build #${escapeHtml(String(buildId))}</span>` : ""}
        <span>
          <svg viewBox="0 0 16 16" fill="currentColor" style="width:14px;height:14px"><path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm.5 12h-1V7h1v5zm0-6h-1V5h1v1z"/></svg>
          Microsoft Copilot Studio
        </span>
      </div>
    </div>
  </header>

  <main class="content-wrap">
    ${
      body
        ? `<article class="report-card">${body}</article>`
        : `<div class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>
            <h2>Nenhum relatório disponível</h2>
            <p>O relatório será exibido aqui após a próxima execução do agente.</p>
          </div>`
    }
  </main>

  <footer class="footer">
    <span>Gerado automaticamente pelo Copilot Studio Agent</span>
    <span>AgentOps · <a href="/state">API JSON</a> · <a href="/health">Health</a></span>
  </footer>

</body>
</html>`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

module.exports = { renderReport };
