"use strict";

function renderReport({ title, body, timestamp, buildId, storyCount, areaCount, signalCount, eventName }) {
  const formattedDate = timestamp
    ? new Date(timestamp).toLocaleString("en-US", {
        timeZone: "America/Sao_Paulo",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleString("en-US", { day: "2-digit", month: "long", year: "numeric" });

  const displayTitle = eventName || title || "Executive Report";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(displayTitle)} - Executive Report</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --brand: #2563eb;
      --brand-dark: #1e3a5f;
      --brand-light: #dbeafe;
      --accent: #7c3aed;
      --accent-light: #ede9fe;
      --success: #10b981;
      --success-light: #d1fae5;
      --warning: #f59e0b;
      --warning-light: #fef3c7;
      --gold: #eab308;
      --gold-light: #fef9c3;
      --teal: #14b8a6;
      --teal-light: #ccfbf1;
      --text: #1e293b;
      --text-muted: #64748b;
      --border: #e2e8f0;
      --surface: #ffffff;
      --surface-alt: #f8fafc;
      --bg: #f1f5f9;
      --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
      --shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
      --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1);
      --radius: 12px;
      --radius-lg: 16px;
    }

    body {
      font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
      font-size: 16px;
      line-height: 1.7;
      color: var(--text);
      background: var(--bg);
      min-height: 100vh;
    }

    /* Skip link for accessibility */
    .skip-link {
      position: absolute;
      top: -40px;
      left: 0;
      background: var(--brand);
      color: #fff;
      padding: 8px 16px;
      z-index: 10000;
      text-decoration: none;
      border-radius: 0 0 8px 0;
    }
    .skip-link:focus { top: 0; }

    /* ═══════════════════════════════════════════════════════════════════════════
       HEADER
    ═══════════════════════════════════════════════════════════════════════════ */
    .header {
      background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%);
      padding: 32px 0 48px;
    }
    .header-inner {
      max-width: 900px;
      margin: 0 auto;
      padding: 0 24px;
    }
    .badge-ai {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(124,58,237,0.9);
      color: #fff;
      padding: 6px 12px;
      border-radius: 16px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin-bottom: 20px;
    }
    .badge-ai svg { width: 14px; height: 14px; }
    .header h1 {
      font-size: clamp(28px, 5vw, 40px);
      font-weight: 700;
      color: #fff;
      line-height: 1.2;
      margin-bottom: 12px;
    }
    .header-subtitle {
      font-size: 18px;
      color: rgba(255,255,255,0.85);
      max-width: 600px;
      margin-bottom: 16px;
    }
    .header-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      font-size: 13px;
      color: rgba(255,255,255,0.7);
    }
    .header-meta span { display: flex; align-items: center; gap: 6px; }
    .header-meta svg { width: 14px; height: 14px; }

    /* ═══════════════════════════════════════════════════════════════════════════
       QUICK NAV (Simplified)
    ═══════════════════════════════════════════════════════════════════════════ */
    .quick-nav {
      max-width: 900px;
      margin: -24px auto 0;
      padding: 0 24px;
      position: relative;
      z-index: 10;
    }
    .quick-nav-inner {
      background: var(--surface);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      padding: 16px 24px;
      display: flex;
      flex-wrap: wrap;
      gap: 8px 24px;
      align-items: center;
    }
    .quick-nav-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .quick-nav a {
      font-size: 14px;
      color: var(--brand);
      text-decoration: none;
      padding: 6px 0;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
    }
    .quick-nav a:hover, .quick-nav a:focus {
      border-bottom-color: var(--brand);
    }
    .quick-nav a:focus {
      outline: 2px solid var(--brand);
      outline-offset: 2px;
      border-radius: 2px;
    }

    /* ═══════════════════════════════════════════════════════════════════════════
       MAIN CONTENT WRAPPER
    ═══════════════════════════════════════════════════════════════════════════ */
    .main {
      max-width: 900px;
      margin: 0 auto;
      padding: 32px 24px 64px;
    }
    .content-section {
      background: var(--surface);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      padding: 32px;
      margin-bottom: 24px;
    }
    .visually-hidden {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      border: 0;
    }

    /* ═══════════════════════════════════════════════════════════════════════════
       OVERVIEW SECTION (Who is this for + How to read)
    ═══════════════════════════════════════════════════════════════════════════ */
    .overview-box {
      background: var(--brand-light);
      border-radius: var(--radius);
      padding: 24px;
      margin-bottom: 24px;
      border-left: 4px solid var(--brand);
    }
    .overview-box h3 {
      font-size: 16px;
      font-weight: 700;
      color: var(--brand-dark);
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .overview-box h3 svg { width: 20px; height: 20px; color: var(--brand); }
    .overview-box p {
      font-size: 15px;
      color: var(--text);
      margin: 0;
      line-height: 1.6;
    }
    .overview-box.accent {
      background: var(--accent-light);
      border-left-color: var(--accent);
    }
    .overview-box.accent h3 { color: var(--accent); }
    .overview-box.accent h3 svg { color: var(--accent); }

    /* ═══════════════════════════════════════════════════════════════════════════
       SECTION HEADERS
    ═══════════════════════════════════════════════════════════════════════════ */
    .section-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 2px solid var(--border);
    }
    .section-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .section-icon svg { width: 22px; height: 22px; color: #fff; }
    .section-icon.gold { background: linear-gradient(135deg, #fbbf24, #f59e0b); }
    .section-icon.purple { background: linear-gradient(135deg, #a78bfa, #7c3aed); }
    .section-icon.teal { background: linear-gradient(135deg, #2dd4bf, #14b8a6); }
    .section-icon.blue { background: linear-gradient(135deg, #60a5fa, #3b82f6); }
    .section-header h2 {
      font-size: 22px;
      font-weight: 700;
      color: var(--text);
      margin: 0;
    }
    .section-header .count {
      font-size: 14px;
      color: var(--text-muted);
      font-weight: 400;
    }

    /* ═══════════════════════════════════════════════════════════════════════════
       TOP STORIES (Full-width executive list)
    ═══════════════════════════════════════════════════════════════════════════ */
    .story-list {
      list-style: none;
    }
    .story-item {
      padding: 20px 0;
      border-bottom: 1px solid var(--border);
    }
    .story-item:last-child { border-bottom: none; }
    .story-item-header {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 12px;
    }
    .story-num {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #fbbf24, #f59e0b);
      color: #fff;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 700;
      flex-shrink: 0;
    }
    .story-item h4 {
      font-size: 17px;
      font-weight: 700;
      color: var(--text);
      margin: 0;
      line-height: 1.4;
    }
    .story-item p {
      font-size: 15px;
      color: var(--text-muted);
      margin: 0 0 8px 48px;
      line-height: 1.6;
    }
    .story-item p:last-child { margin-bottom: 0; }
    .story-item strong { color: var(--text); font-weight: 600; }

    /* ═══════════════════════════════════════════════════════════════════════════
       SOLUTION AREAS (Responsive card grid)
    ═══════════════════════════════════════════════════════════════════════════ */
    .area-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
    }
    .area-card {
      background: var(--surface-alt);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 24px;
      transition: all 0.2s;
    }
    .area-card:hover {
      border-color: var(--accent);
      box-shadow: var(--shadow);
    }
    .area-card h4 {
      font-size: 16px;
      font-weight: 700;
      color: var(--accent);
      margin: 0 0 12px 0;
    }
    .area-card p {
      font-size: 14px;
      color: var(--text-muted);
      margin: 0 0 16px 0;
      line-height: 1.6;
    }
    .area-signals {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .signal-tag {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: var(--teal-light);
      color: var(--teal);
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s;
    }
    .signal-tag:hover, .signal-tag:focus {
      background: var(--teal);
      color: #fff;
      text-decoration: none;
    }
    .signal-tag:focus { outline: 2px solid var(--teal); outline-offset: 2px; }
    .signal-tag svg { width: 10px; height: 10px; }

    /* ═══════════════════════════════════════════════════════════════════════════
       SIGNALS (with collapsible Learn More)
    ═══════════════════════════════════════════════════════════════════════════ */
    .signal-item {
      background: var(--surface-alt);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 24px;
      margin-bottom: 16px;
    }
    .signal-item:last-child { margin-bottom: 0; }
    .signal-header {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      margin-bottom: 12px;
    }
    .signal-id {
      background: linear-gradient(135deg, #2dd4bf, #14b8a6);
      color: #fff;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .signal-item h4 {
      font-size: 17px;
      font-weight: 700;
      color: var(--text);
      margin: 0;
      line-height: 1.4;
    }
    .signal-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 12px;
      font-size: 13px;
      color: var(--text-muted);
    }
    .signal-meta span {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .signal-meta svg { width: 14px; height: 14px; }
    .signal-meta a { color: var(--brand); text-decoration: none; }
    .signal-meta a:hover { text-decoration: underline; }
    .signal-item > p {
      font-size: 15px;
      color: var(--text-muted);
      margin: 0;
      line-height: 1.7;
    }

    /* Collapsible Learn More */
    .learn-more {
      margin-top: 16px;
      border-top: 1px solid var(--border);
      padding-top: 12px;
    }
    .learn-more-toggle {
      background: none;
      border: none;
      padding: 8px 0;
      font-size: 14px;
      font-weight: 600;
      color: var(--brand);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: color 0.2s;
    }
    .learn-more-toggle:hover { color: var(--brand-dark); }
    .learn-more-toggle:focus {
      outline: 2px solid var(--brand);
      outline-offset: 2px;
      border-radius: 4px;
    }
    .learn-more-toggle svg {
      width: 16px;
      height: 16px;
      transition: transform 0.2s;
    }
    .learn-more-toggle[aria-expanded="true"] svg {
      transform: rotate(180deg);
    }
    .learn-more-content {
      display: none;
      padding: 12px 0 0;
    }
    .learn-more-content.open { display: block; }
    .learn-more-content ul {
      list-style: none;
      margin: 0;
    }
    .learn-more-content li {
      padding: 8px 0;
      border-bottom: 1px solid var(--border);
      font-size: 14px;
    }
    .learn-more-content li:last-child { border-bottom: none; }
    .learn-more-content a {
      color: var(--brand);
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .learn-more-content a:hover { text-decoration: underline; }
    .learn-more-content a svg { width: 14px; height: 14px; flex-shrink: 0; }
    .learn-more-content .source-label {
      font-size: 12px;
      color: var(--text-muted);
      margin-left: 22px;
    }

    /* ═══════════════════════════════════════════════════════════════════════════
       ACTIONS
    ═══════════════════════════════════════════════════════════════════════════ */
    .partner-section {
      background: var(--surface-alt);
      border-radius: var(--radius);
      padding: 24px;
      margin-bottom: 16px;
      border-left: 4px solid var(--brand);
    }
    .partner-section:last-child { margin-bottom: 0; }
    .partner-section.si { border-left-color: #2563eb; }
    .partner-section.isv { border-left-color: #7c3aed; }
    .partner-section h4 {
      font-size: 15px;
      font-weight: 700;
      color: var(--text);
      margin: 0 0 16px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .partner-section h4 svg { width: 20px; height: 20px; }
    .partner-section ul {
      margin: 0;
      padding-left: 20px;
      color: var(--text-muted);
    }
    .partner-section li {
      margin-bottom: 10px;
      line-height: 1.6;
    }
    .partner-section li:last-child { margin-bottom: 0; }
    .partner-section li::marker { color: var(--brand); }

    /* Filter classes for audience toggle */
    .filter-si .isv-content { display: none; }
    .filter-isv .si-content { display: none; }

    /* Filter toggle in header */
    .filter-toggle {
      display: flex;
      gap: 8px;
      margin-top: 16px;
    }
    .filter-btn {
      padding: 8px 16px;
      border: 1px solid rgba(255,255,255,0.3);
      border-radius: 20px;
      background: transparent;
      color: rgba(255,255,255,0.9);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .filter-btn:hover { background: rgba(255,255,255,0.1); }
    .filter-btn:focus { outline: 2px solid #fff; outline-offset: 2px; }
    .filter-btn.active {
      background: #fff;
      color: var(--brand-dark);
      border-color: #fff;
    }

    /* ═══════════════════════════════════════════════════════════════════════════
       AI NOTICE
    ═══════════════════════════════════════════════════════════════════════════ */
    .ai-notice {
      background: var(--warning-light);
      border-radius: var(--radius);
      padding: 16px 20px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 24px;
      border: 1px solid #fcd34d;
    }
    .ai-notice svg {
      width: 20px;
      height: 20px;
      color: var(--warning);
      flex-shrink: 0;
      margin-top: 2px;
    }
    .ai-notice p {
      font-size: 14px;
      color: #92400e;
      margin: 0;
      line-height: 1.5;
    }
    .ai-notice strong { color: #78350f; }

    /* ═══════════════════════════════════════════════════════════════════════════
       FOOTER
    ═══════════════════════════════════════════════════════════════════════════ */
    .footer {
      background: var(--surface);
      border-top: 1px solid var(--border);
      padding: 24px;
      text-align: center;
    }
    .footer p {
      max-width: 900px;
      margin: 0 auto;
      font-size: 13px;
      color: var(--text-muted);
    }
    .footer a { color: var(--brand); text-decoration: none; }
    .footer a:hover { text-decoration: underline; }

    /* ═══════════════════════════════════════════════════════════════════════════
       UTILITIES
    ═══════════════════════════════════════════════════════════════════════════ */
    .back-to-top {
      position: fixed;
      bottom: 24px;
      right: 24px;
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
      box-shadow: var(--shadow-lg);
      opacity: 0;
      visibility: hidden;
      transform: translateY(16px);
      transition: all 0.3s;
      z-index: 1000;
    }
    .back-to-top:focus { outline: 2px solid var(--brand-dark); outline-offset: 2px; }
    .back-to-top.visible { opacity: 1; visibility: visible; transform: translateY(0); }
    .back-to-top:hover { background: var(--brand-dark); }
    .back-to-top svg { width: 20px; height: 20px; }

    .progress-bar {
      position: fixed;
      top: 0;
      left: 0;
      width: 0%;
      height: 3px;
      background: linear-gradient(90deg, var(--accent), var(--brand));
      z-index: 9999;
      transition: width 0.1s;
    }

    /* Empty state */
    .empty-state {
      text-align: center;
      padding: 60px 24px;
      color: var(--text-muted);
    }
    .empty-state svg { width: 48px; height: 48px; margin-bottom: 16px; opacity: 0.4; }
    .empty-state h2 { font-size: 20px; color: var(--text); margin-bottom: 8px; }

    /* ═══════════════════════════════════════════════════════════════════════════
       RESPONSIVE
    ═══════════════════════════════════════════════════════════════════════════ */
    @media (max-width: 640px) {
      .header-inner, .quick-nav, .main { padding-left: 16px; padding-right: 16px; }
      .content-section { padding: 24px 20px; }
      .quick-nav-inner { padding: 12px 16px; }
      .story-item p { margin-left: 0; }
      .area-grid { grid-template-columns: 1fr; }
      .filter-toggle { flex-wrap: wrap; }
    }
  </style>
</head>
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <div class="progress-bar" id="progressBar" role="progressbar" aria-label="Reading progress"></div>

  <!-- ═══════════════════════════════════════════════════════════════════════════
       HEADER
  ═══════════════════════════════════════════════════════════════════════════ -->
  <header class="header">
    <div class="header-inner">
      <div class="badge-ai">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        Executive Report · AI Generated
      </div>
      <h1>${escapeHtml(displayTitle)}</h1>
      <p class="header-subtitle">Key signals, stories and actions shaping the future of AI, development and the Microsoft ecosystem.</p>
      <div class="header-meta">
        <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg> ${formattedDate}</span>
        ${buildId ? `<span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg> Build #${escapeHtml(String(buildId))}</span>` : ''}
      </div>
      <div class="filter-toggle" role="group" aria-label="Filter content by partner type">
        <button class="filter-btn active" data-filter="all" onclick="filterPartner('all')" aria-pressed="true">All Partners</button>
        <button class="filter-btn" data-filter="si" onclick="filterPartner('si')" aria-pressed="false">SI Only</button>
        <button class="filter-btn" data-filter="isv" onclick="filterPartner('isv')" aria-pressed="false">ISV / SDC Only</button>
      </div>
    </div>
  </header>

  ${body ? `
  <!-- Quick Navigation -->
  <nav class="quick-nav" aria-label="Quick navigation">
    <div class="quick-nav-inner">
      <span class="quick-nav-label">Jump to:</span>
      <a href="#overview">Overview</a>
      <a href="#section-stories">Top Stories</a>
      <a href="#section-areas">Solution Areas</a>
      <a href="#section-signals">Signals</a>
      <a href="#section-actions">Actions</a>
    </div>
  </nav>

  <!-- ═══════════════════════════════════════════════════════════════════════════
       MAIN CONTENT
  ═══════════════════════════════════════════════════════════════════════════ -->
  <main class="main" id="main-content">
    
    <!-- Overview Section -->
    <section id="overview" class="content-section" aria-labelledby="overview-heading">
      <h2 id="overview-heading" class="visually-hidden">Overview</h2>
      
      <div class="overview-box">
        <h3>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
          Who is this for?
        </h3>
        <p>Designed for Microsoft partner-facing teams and leadership to identify key ${escapeHtml(displayTitle)} signals, align messaging, and support strategic conversations with partners.</p>
      </div>
      
      <div class="overview-box accent">
        <h3>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2 12h2M20 12h2M12 2v2M12 20v2M6.93 6.93l1.41 1.41M15.66 15.66l1.41 1.41M6.93 17.07l1.41-1.41M15.66 8.34l1.41-1.41"/><circle cx="12" cy="12" r="4"/></svg>
          How to read this report
        </h3>
        <p><strong>Signals</strong> are recurring patterns identified across ${escapeHtml(displayTitle)} sessions, announcements, and partner discussions. Each Signal highlights an emerging trend, explains why it matters, and suggests potential impact. Start with Top Stories for key highlights, explore Solution Areas for domain context, then dive into Signals for deeper insights.</p>
      </div>
      
      <div class="ai-notice" role="note">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        <p><strong>AI-generated, human-validated.</strong> This report was generated using AI and curated by the EPS team to ensure accuracy and relevance.</p>
      </div>
    </section>

    <!-- Main Report Content -->
    <div id="mainContent">
      ${body}
    </div>

  </main>
  ` : `
  <main class="main" id="main-content">
    <section class="content-section">
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>
        <h2>No report available</h2>
        <p>The report will appear here after the next agent execution.</p>
      </div>
    </section>
  </main>
  `}

  <!-- Back to Top -->
  <button class="back-to-top" id="backToTop" onclick="window.scrollTo({top:0,behavior:'smooth'})" aria-label="Back to top">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 15l-6-6-6 6"/></svg>
  </button>

  <!-- Footer -->
  <footer class="footer">
    <p>${escapeHtml(displayTitle)} Executive Report · Last updated: ${formattedDate} · <a href="/state">API</a> · <a href="/health">Health</a></p>
  </footer>

  <script>
  // Filter by partner type
  function filterPartner(type) {
    const content = document.getElementById('mainContent');
    if (!content) return;
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
      const isActive = btn.dataset.filter === type;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive);
    });
    
    content.classList.remove('filter-si', 'filter-isv');
    if (type === 'si') content.classList.add('filter-si');
    if (type === 'isv') content.classList.add('filter-isv');
  }

  // Toggle Learn More sections
  function toggleLearnMore(btn) {
    const content = btn.nextElementSibling;
    const isOpen = content.classList.toggle('open');
    btn.setAttribute('aria-expanded', isOpen);
  }

  // Progress bar + back to top
  window.addEventListener('scroll', () => {
    const winScroll = document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = height > 0 ? (winScroll / height) * 100 : 0;
    document.getElementById('progressBar').style.width = progress + '%';
    document.getElementById('backToTop').classList.toggle('visible', winScroll > 300);
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        target.focus({ preventScroll: true });
      }
    });
  });

  // Keyboard navigation for Learn More
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      if (e.target.classList.contains('learn-more-toggle')) {
        e.preventDefault();
        toggleLearnMore(e.target);
      }
    }
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
