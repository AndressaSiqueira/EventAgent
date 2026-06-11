"use strict";

function renderReport({ title, body, timestamp, buildId }) {
  const formattedDate = timestamp
    ? new Date(timestamp).toLocaleString("en-US", {
        timeZone: "America/Sao_Paulo",
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title || "Executive Report")}</title>
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
    .topbar {
      background: #1a1a2e;
      padding: 12px 0;
    }
    .topbar-inner {
      max-width: 900px;
      margin: 0 auto;
      padding: 0 32px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #fff;
      font-weight: 700;
      font-size: 18px;
      letter-spacing: -0.3px;
    }
    .logo-icon {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .logo-icon svg { width: 20px; height: 20px; fill: #fff; }
    .logo-text { display: flex; flex-direction: column; line-height: 1.1; }
    .logo-text .brand { font-size: 16px; }
    .logo-text .sub { font-size: 11px; font-weight: 400; opacity: 0.7; text-transform: uppercase; letter-spacing: 1px; }

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

    /* ── Partner Filters ── */
    .filter-bar {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }
    .filter-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      border: 2px solid var(--border);
      border-radius: 24px;
      background: var(--surface);
      font-size: 14px;
      font-weight: 600;
      color: var(--muted);
      cursor: pointer;
      transition: all 0.2s;
    }
    .filter-btn:hover {
      border-color: var(--brand);
      color: var(--brand);
    }
    .filter-btn.active {
      background: var(--brand);
      border-color: var(--brand);
      color: #fff;
    }
    .filter-btn svg { width: 16px; height: 16px; }

    /* Hide filtered content */
    .report-card.filter-si .isv-content { display: none; }
    .report-card.filter-isv .si-content { display: none; }

    /* ── Progress Bar ── */
    .progress-bar {
      position: fixed;
      top: 0;
      left: 0;
      width: 0%;
      height: 4px;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      z-index: 9999;
      transition: width 0.1s;
    }

    /* ── Table of Contents ── */
    .toc {
      background: var(--surface-alt);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 20px 24px;
      margin-bottom: 32px;
    }
    .toc-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .toc-title svg { width: 16px; height: 16px; }
    .toc-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .toc-list a {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 20px;
      color: var(--text);
      text-decoration: none;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.2s;
    }
    .toc-list a:hover {
      border-color: var(--brand);
      color: var(--brand);
      transform: translateY(-1px);
    }
    .toc-list a svg { width: 14px; height: 14px; opacity: 0.6; }

    /* ── Collapsible Sections ── */
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      padding: 16px 0;
      border-bottom: 2px solid var(--brand-light);
      margin: 40px 0 14px;
      user-select: none;
    }
    .section-header:hover { opacity: 0.8; }
    .section-header h2 {
      margin: 0 !important;
      padding: 0 !important;
      border: none !important;
    }
    .section-toggle {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--brand-light);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.3s;
    }
    .section-toggle svg { width: 16px; height: 16px; color: var(--brand); }
    .section-content {
      overflow: hidden;
      transition: max-height 0.3s ease-out;
    }
    .section-content.collapsed {
      max-height: 0 !important;
    }
    .section-header.collapsed .section-toggle {
      transform: rotate(-90deg);
    }

    /* ── Back to Top ── */
    .back-to-top {
      position: fixed;
      bottom: 32px;
      right: 32px;
      width: 48px;
      height: 48px;
      background: var(--brand);
      color: #fff;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,120,212,0.3);
      opacity: 0;
      visibility: hidden;
      transform: translateY(20px);
      transition: all 0.3s;
      z-index: 1000;
    }
    .back-to-top.visible {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }
    .back-to-top:hover {
      background: var(--brand-dark);
      transform: translateY(-2px);
    }
    .back-to-top svg { width: 24px; height: 24px; }

    /* ── Story Cards ── */
    .story-card {
      background: var(--surface-alt);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 20px 24px;
      margin-bottom: 16px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .story-card:hover {
      border-color: var(--brand);
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }
    .story-card h3 {
      margin: 0 0 8px 0 !important;
      font-size: 16px !important;
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }
    .story-card h3 .num {
      background: var(--brand);
      color: #fff;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      flex-shrink: 0;
    }
    .story-card .preview {
      color: var(--muted);
      font-size: 14px;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .story-card .details {
      display: none;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid var(--border);
    }
    .story-card.expanded .preview { display: none; }
    .story-card.expanded .details { display: block; }
    .story-card .expand-hint {
      color: var(--brand);
      font-size: 12px;
      font-weight: 600;
      margin-top: 12px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .story-card.expanded .expand-hint { display: none; }

    /* ── Signal Badge ── */
    .signal-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: var(--brand-light);
      color: var(--brand-dark);
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    /* ── Reading Stats ── */
    .reading-stats {
      display: flex;
      gap: 20px;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid rgba(255,255,255,0.1);
      font-size: 12px;
    }
    .reading-stats span {
      display: flex;
      align-items: center;
      gap: 6px;
      opacity: 0.7;
    }

    @media (max-width: 640px) {
      .report-card { padding: 28px 24px; }
      .header-inner { padding: 0 20px; }
      .content-wrap { padding: 0 16px; }
      .back-to-top { bottom: 20px; right: 20px; width: 44px; height: 44px; }
      .toc-list { flex-direction: column; }
      .toc-list a { width: 100%; justify-content: center; }
    }
  </style>
</head>
<body>

  <div class="topbar">
    <div class="topbar-inner">
      <div class="logo">
        <div class="logo-icon">
          <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
        </div>
        <div class="logo-text">
          <span class="brand">EPS Reports</span>
          <span class="sub">Events</span>
        </div>
      </div>
    </div>
  </div>

  <header class="header">
    <div class="header-inner">
      <div class="header-badge">
        <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm.75 10.5h-1.5v-5h1.5v5zm0-6.5h-1.5V3.5h1.5V5z"/></svg>
        Executive Report · AI Generated
      </div>
      <h1>${escapeHtml(title || "Executive Report")}</h1>
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
        ? `<article class="report-card" id="reportCard">
            <div class="filter-bar">
              <button class="filter-btn active" data-filter="all" onclick="filterPartner('all')">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                All Partners
              </button>
              <button class="filter-btn" data-filter="si" onclick="filterPartner('si')">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/></svg>
                SI Only
              </button>
              <button class="filter-btn" data-filter="isv" onclick="filterPartner('isv')">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/></svg>
                SDC / ISV Only
              </button>
            </div>
            ${body}
          </article>`
        : `<div class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>
            <h2>No report available</h2>
            <p>The report will appear here after the next agent execution.</p>
          </div>`
    }
  </main>

  <!-- Progress Bar -->
  <div class="progress-bar" id="progressBar"></div>

  <!-- Back to Top Button -->
  <button class="back-to-top" id="backToTop" onclick="window.scrollTo({top:0,behavior:'smooth'})">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 15l-6-6-6 6"/></svg>
  </button>

  <footer class="footer">
    <span>Automatically generated by Copilot Studio Agent</span>
    <span>EPS Reports - Events · <a href="/state">API JSON</a> · <a href="/health">Health</a></span>
  </footer>

  <script>
  // Partner filter
  function filterPartner(type) {
    const card = document.getElementById('reportCard');
    if (!card) return;
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.toggle('active', btn.dataset.filter === type));
    card.classList.remove('filter-si', 'filter-isv');
    if (type === 'si') card.classList.add('filter-si');
    if (type === 'isv') card.classList.add('filter-isv');
  }

  // Progress bar
  window.addEventListener('scroll', () => {
    const winScroll = document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    document.getElementById('progressBar').style.width = scrolled + '%';
    
    // Back to top visibility
    const btn = document.getElementById('backToTop');
    if (winScroll > 300) btn.classList.add('visible');
    else btn.classList.remove('visible');
  });

  // Collapsible sections
  document.querySelectorAll('.section-header').forEach(header => {
    header.addEventListener('click', () => {
      header.classList.toggle('collapsed');
      const content = header.nextElementSibling;
      if (content && content.classList.contains('section-content')) {
        content.classList.toggle('collapsed');
        if (!content.classList.contains('collapsed')) {
          content.style.maxHeight = content.scrollHeight + 'px';
        }
      }
    });
  });

  // Initialize section heights
  document.querySelectorAll('.section-content').forEach(content => {
    if (!content.classList.contains('collapsed')) {
      content.style.maxHeight = content.scrollHeight + 'px';
    }
  });

  // Story card expand
  document.querySelectorAll('.story-card').forEach(card => {
    card.addEventListener('click', () => card.classList.toggle('expanded'));
  });

  // Smooth scroll for anchor links (expand section if collapsed)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const target = document.querySelector(targetId);
      if (target) {
        // If target is inside a collapsed section, expand it
        const section = target.closest('.section-content');
        if (section && section.classList.contains('collapsed')) {
          const header = section.previousElementSibling;
          if (header && header.classList.contains('section-header')) {
            header.classList.remove('collapsed');
            section.classList.remove('collapsed');
            section.style.maxHeight = section.scrollHeight + 'px';
          }
        }
        // Small delay to allow section to expand
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    });
  });
  </script>

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
