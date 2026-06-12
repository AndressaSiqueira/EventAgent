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
  <title>${escapeHtml(displayTitle)}</title>
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
      font-size: 15px;
      line-height: 1.6;
      color: var(--text);
      background: var(--bg);
      min-height: 100vh;
    }

    /* ════════════════════════════════════════════════════════════════════════════
       HERO HEADER
    ════════════════════════════════════════════════════════════════════════════ */
    .hero {
      background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #3b82f6 100%);
      position: relative;
      overflow: hidden;
      padding: 0 0 60px;
    }
    .hero::before {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 120px;
      background: linear-gradient(to top, rgba(241,245,249,0.1), transparent);
    }
    .hero-inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 32px;
      position: relative;
      z-index: 1;
    }
    
    /* Top bar */
    .topbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 0;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      margin-bottom: 40px;
    }
    .badge-ai {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(124,58,237,0.9);
      color: #fff;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .badge-ai svg { width: 14px; height: 14px; }
    
    /* Filter in header */
    .filter-group {
      background: rgba(255,255,255,0.12);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 20px 24px;
      border: 1px solid rgba(255,255,255,0.18);
      min-width: 320px;
    }
    .filter-label {
      font-size: 11px;
      font-weight: 700;
      color: rgba(255,255,255,0.8);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 14px;
      text-align: center;
    }
    .filter-buttons {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      justify-content: center;
    }
    .filter-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 24px;
      background: transparent;
      color: #fff;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .filter-btn:hover { background: rgba(255,255,255,0.1); }
    .filter-btn.active {
      background: #fff;
      border-color: #fff;
      color: var(--brand-dark);
    }
    .filter-btn svg { width: 16px; height: 16px; }
    
    /* Hero content */
    .hero-content {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 40px;
      align-items: start;
    }
    .hero-title {
      font-size: clamp(32px, 5vw, 48px);
      font-weight: 700;
      color: #fff;
      line-height: 1.15;
      margin-bottom: 16px;
    }
    .hero-subtitle {
      font-size: 18px;
      color: rgba(255,255,255,0.85);
      line-height: 1.5;
      margin-bottom: 24px;
      max-width: 600px;
    }
    .hero-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 24px;
      font-size: 14px;
      color: rgba(255,255,255,0.7);
    }
    .hero-meta span { display: flex; align-items: center; gap: 8px; }
    .hero-meta svg { width: 16px; height: 16px; opacity: 0.7; }

    /* ════════════════════════════════════════════════════════════════════════════
       QUICK NAV (Jump to) - STICKY
    ════════════════════════════════════════════════════════════════════════════ */
    .quick-nav {
      max-width: 1200px;
      margin: -30px auto 0;
      padding: 0 32px;
      position: sticky;
      top: 8px;
      z-index: 100;
    }
    .quick-nav-inner {
      background: var(--surface);
      border-radius: var(--radius);
      box-shadow: var(--shadow-lg);
      padding: 16px 28px;
      display: flex;
      flex-wrap: wrap;
      gap: 8px 20px;
      align-items: center;
    }
    .quick-nav-label {
      font-size: 12px;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .quick-nav a {
      font-size: 14px;
      font-weight: 600;
      color: var(--brand);
      text-decoration: none;
      padding: 8px 16px;
      border-radius: 20px;
      background: var(--brand-light);
      transition: all 0.2s;
    }
    .quick-nav a:hover {
      background: var(--brand);
      color: #fff;
    }
    .quick-nav a.active {
      background: var(--brand);
      color: #fff;
    }

    /* ════════════════════════════════════════════════════════════════════════════
       OVERVIEW SECTION (Who is this for + How to read)
    ════════════════════════════════════════════════════════════════════════════ */
    .overview-section {
      max-width: 1200px;
      margin: 48px auto 32px;
      padding: 0 32px;
    }
    .overview-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
    }
    .overview-box {
      background: var(--surface);
      border-radius: var(--radius-lg);
      padding: 28px;
      box-shadow: var(--shadow);
      border-left: 4px solid var(--brand);
    }
    .overview-box.accent {
      border-left-color: var(--accent);
    }
    .overview-box h3 {
      font-size: 16px;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .overview-box h3 svg {
      width: 22px;
      height: 22px;
      color: var(--brand);
    }
    .overview-box.accent h3 svg {
      color: var(--accent);
    }
    .overview-box p {
      font-size: 15px;
      color: var(--text-muted);
      line-height: 1.7;
      margin: 0;
    }
    .overview-box strong {
      color: var(--text);
    }

    /* ════════════════════════════════════════════════════════════════════════════
       MAIN CONTENT - COLLAPSIBLE SECTIONS
    ════════════════════════════════════════════════════════════════════════════ */
    .main-content {
      max-width: 1200px;
      margin: 0 auto 48px;
      padding: 0 32px;
    }
    .content-card {
      background: var(--surface);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow);
      padding: 48px;
    }

    /* Collapsible sections */
    .content-card section {
      display: none;
      animation: fadeIn 0.3s ease;
    }
    .content-card section.active {
      display: block;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Section intro message */
    .section-intro {
      text-align: center;
      padding: 60px 20px;
      color: var(--text-muted);
    }
    .section-intro svg {
      width: 64px;
      height: 64px;
      margin-bottom: 20px;
      opacity: 0.4;
    }
    .section-intro h3 {
      font-size: 20px;
      color: var(--text);
      margin-bottom: 12px;
    }
    .section-intro p {
      font-size: 15px;
      max-width: 400px;
      margin: 0 auto;
    }

    /* Section back button */
    .section-back {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      background: var(--surface-alt);
      border: 1px solid var(--border);
      border-radius: 24px;
      color: var(--text-muted);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      margin-bottom: 24px;
    }
    .section-back:hover {
      background: var(--brand-light);
      border-color: var(--brand);
      color: var(--brand);
    }
    .section-back svg { width: 16px; height: 16px; }

    /* Typography */
    .content-card h2 {
      font-size: 28px;
      font-weight: 700;
      color: var(--text);
      margin: 0 0 24px;
      padding-bottom: 16px;
      border-bottom: 2px solid var(--border);
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .content-card h2 .section-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .content-card h2 .section-icon svg { width: 24px; height: 24px; color: #fff; }
    .content-card h3 {
      font-size: 18px;
      font-weight: 700;
      color: var(--brand-dark);
      margin: 32px 0 12px;
    }
    .content-card h4 {
      font-size: 16px;
      font-weight: 600;
      color: var(--text);
      margin: 24px 0 10px;
    }
    .content-card p {
      color: var(--text-muted);
      margin-bottom: 16px;
      line-height: 1.7;
    }
    .content-card strong { color: var(--text); }
    .content-card ul, .content-card ol {
      margin: 0 0 20px 24px;
      color: var(--text-muted);
    }
    .content-card li { margin-bottom: 8px; line-height: 1.6; }
    .content-card li::marker { color: var(--brand); }
    .content-card a { color: var(--brand); text-decoration: none; }
    .content-card a:hover { text-decoration: underline; }

    /* ════════════════════════════════════════════════════════════════════════════
       TOP STORIES - FULL WIDTH VERTICAL LIST
    ════════════════════════════════════════════════════════════════════════════ */
    .story-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin: 24px 0;
    }
    .story-item {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 20px;
      background: var(--surface-alt);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 24px;
      transition: all 0.2s;
    }
    .story-item:hover {
      border-color: var(--gold);
      box-shadow: var(--shadow);
    }
    .story-num {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #fbbf24, #f59e0b);
      color: #fff;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: 700;
      flex-shrink: 0;
    }
    .story-content h4 {
      font-size: 18px;
      font-weight: 700;
      color: var(--text);
      margin: 0 0 12px 0 !important;
      line-height: 1.4;
    }
    .story-content p {
      font-size: 14px;
      color: var(--text-muted);
      margin: 0 0 8px 0;
      line-height: 1.6;
    }
    .story-content p:last-child { margin-bottom: 0; }

    /* ════════════════════════════════════════════════════════════════════════════
       SOLUTION AREAS - TILE GRID (handles odd numbers)
    ════════════════════════════════════════════════════════════════════════════ */
    .area-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin: 24px 0;
    }
    /* For odd numbers - last item spans remaining space or centers */
    .area-grid .area-tile:last-child:nth-child(3n+1) {
      grid-column: 2; /* Center if alone in last row */
    }
    .area-grid .area-tile:last-child:nth-child(3n+2) {
      grid-column: span 1; /* Normal if 2 items in last row */
    }
    .area-tile {
      background: var(--surface-alt);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 24px;
      transition: all 0.2s;
      border-top: 4px solid var(--accent);
    }
    .area-tile:hover {
      border-color: var(--accent);
      box-shadow: var(--shadow);
      transform: translateY(-2px);
    }
    .area-tile h4 {
      font-size: 16px;
      font-weight: 700;
      color: var(--text);
      margin: 0 0 12px 0 !important;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .area-tile h4 svg {
      width: 20px;
      height: 20px;
      color: var(--accent);
    }
    .area-tile p {
      font-size: 14px;
      color: var(--text-muted);
      margin: 0 0 12px 0;
      line-height: 1.6;
    }
    .area-signals {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 12px;
    }

    /* Signal badges */
    .signal-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--teal-light);
      color: var(--teal);
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s;
    }
    .signal-badge:hover {
      background: var(--teal);
      color: #fff;
      text-decoration: none;
    }
    .signal-badge svg { width: 10px; height: 10px; }

    /* ════════════════════════════════════════════════════════════════════════════
       ACTIONS - Partner sections
    ════════════════════════════════════════════════════════════════════════════ */
    .partner-section {
      background: var(--surface-alt);
      border-radius: var(--radius);
      padding: 24px;
      margin: 16px 0;
      border-left: 4px solid var(--brand);
    }
    .partner-section.si { border-left-color: #2563eb; }
    .partner-section.isv { border-left-color: #7c3aed; }
    .partner-section h4 {
      font-size: 15px;
      font-weight: 700;
      color: var(--text);
      margin: 0 0 16px 0 !important;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .partner-section h4 svg { width: 20px; height: 20px; }

    /* Filter content */
    .filter-si .isv-content { display: none; }
    .filter-isv .si-content { display: none; }

    /* ════════════════════════════════════════════════════════════════════════════
       SIGNAL DETAILS - WITH SOURCE LINKS
    ════════════════════════════════════════════════════════════════════════════ */
    .signal-detail {
      background: var(--surface-alt);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 28px;
      margin: 20px 0;
    }
    .signal-detail-header {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 16px;
    }
    .signal-id {
      background: linear-gradient(135deg, #2dd4bf, #14b8a6);
      color: #fff;
      padding: 10px 16px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 700;
      white-space: nowrap;
    }
    .signal-detail h4 {
      font-size: 20px;
      font-weight: 700;
      color: var(--text);
      margin: 0 !important;
      line-height: 1.3;
    }
    .signal-meta {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
      font-size: 13px;
      flex-wrap: wrap;
    }
    .signal-meta span {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: var(--text-muted);
      background: var(--surface);
      padding: 6px 12px;
      border-radius: 16px;
      border: 1px solid var(--border);
    }
    .signal-meta svg { width: 14px; height: 14px; }
    .signal-meta a {
      color: var(--brand);
      text-decoration: none;
    }
    .signal-meta a:hover { text-decoration: underline; }

    /* Source links */
    .source-links {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid var(--border);
    }
    .source-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      background: var(--brand-light);
      color: var(--brand);
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s;
    }
    .source-link:hover {
      background: var(--brand);
      color: #fff;
      text-decoration: none;
    }
    .source-link.session { background: var(--accent-light); color: var(--accent); }
    .source-link.session:hover { background: var(--accent); color: #fff; }
    .source-link.learn { background: var(--teal-light); color: var(--teal); }
    .source-link.learn:hover { background: var(--teal); color: #fff; }
    .source-link svg { width: 16px; height: 16px; }

    /* ════════════════════════════════════════════════════════════════════════════
       AI NOTICE
    ════════════════════════════════════════════════════════════════════════════ */
    .ai-notice {
      max-width: 1200px;
      margin: 0 auto 32px;
      padding: 0 32px;
    }
    .ai-notice-inner {
      background: var(--surface);
      border-radius: var(--radius);
      padding: 16px 24px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: var(--shadow-sm);
    }
    .ai-notice-icon {
      width: 40px;
      height: 40px;
      background: var(--warning-light);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .ai-notice-icon svg { width: 20px; height: 20px; color: var(--warning); }
    .ai-notice-label {
      font-size: 14px;
      font-weight: 700;
      color: var(--success);
    }
    .ai-notice-text {
      font-size: 14px;
      color: var(--text-muted);
    }

    /* ════════════════════════════════════════════════════════════════════════════
       FOOTER
    ════════════════════════════════════════════════════════════════════════════ */
    .footer {
      background: var(--surface);
      border-top: 1px solid var(--border);
      padding: 24px 32px;
    }
    .footer-inner {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      color: var(--text-muted);
    }
    .footer a { color: var(--brand); text-decoration: none; }
    .footer a:hover { text-decoration: underline; }

    /* ════════════════════════════════════════════════════════════════════════════
       BACK TO TOP - ENHANCED
    ════════════════════════════════════════════════════════════════════════════ */
    .back-to-top {
      position: fixed;
      bottom: 32px;
      right: 32px;
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, var(--brand), var(--accent));
      color: #fff;
      border: none;
      border-radius: 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 24px rgba(37, 99, 235, 0.4);
      opacity: 0;
      visibility: hidden;
      transform: translateY(20px) scale(0.9);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 1000;
    }
    .back-to-top.visible {
      opacity: 1;
      visibility: visible;
      transform: translateY(0) scale(1);
    }
    .back-to-top:hover {
      transform: translateY(-4px) scale(1.05);
      box-shadow: 0 12px 32px rgba(37, 99, 235, 0.5);
    }
    .back-to-top svg { width: 28px; height: 28px; }

    .progress-bar {
      position: fixed;
      top: 0;
      left: 0;
      width: 0%;
      height: 4px;
      background: linear-gradient(90deg, #7c3aed, #2563eb);
      z-index: 9999;
      transition: width 0.1s;
    }

    /* Empty state */
    .empty-state {
      background: var(--surface);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow);
      padding: 80px 40px;
      text-align: center;
      color: var(--text-muted);
      margin-top: 48px;
    }
    .empty-state svg { width: 64px; height: 64px; margin-bottom: 20px; opacity: 0.4; }
    .empty-state h2 { font-size: 22px; margin-bottom: 10px; color: var(--text); }

    /* ════════════════════════════════════════════════════════════════════════════
       RESPONSIVE
    ════════════════════════════════════════════════════════════════════════════ */
    @media (max-width: 1024px) {
      .area-grid { grid-template-columns: repeat(2, 1fr); }
      .area-grid .area-tile:last-child:nth-child(odd) {
        grid-column: span 2;
      }
    }
    @media (max-width: 900px) {
      .hero-content { grid-template-columns: 1fr; }
      .filter-group { margin-top: 24px; }
      .overview-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 640px) {
      .hero-inner, .quick-nav, .overview-section, .main-content, .ai-notice { padding: 0 16px; }
      .content-card { padding: 24px; }
      .filter-buttons { flex-wrap: wrap; }
      .footer-inner { flex-direction: column; gap: 12px; text-align: center; }
      .area-grid { grid-template-columns: 1fr; }
      .area-grid .area-tile:last-child:nth-child(odd) { grid-column: span 1; }
      .story-item { grid-template-columns: 1fr; text-align: center; }
      .story-num { margin: 0 auto 12px; }
      .quick-nav-inner { justify-content: center; }
    }
  </style>
</head>
<body>
  <div class="progress-bar" id="progressBar"></div>

  <!-- ══════════════════════════════════════════════════════════════════════════
       HERO
  ══════════════════════════════════════════════════════════════════════════ -->
  <header class="hero">
    <div class="hero-inner">
      <div class="topbar">
        <div class="badge-ai">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          Executive Report · AI Generated
        </div>
      </div>
      
      <div class="hero-content">
        <div>
          <h1 class="hero-title">${escapeHtml(displayTitle)}</h1>
          <p class="hero-subtitle">Key signals, stories and actions shaping the future of AI, development and the Microsoft ecosystem.</p>
          <div class="hero-meta">
            ${buildId ? `<span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg> Build #${escapeHtml(String(buildId))}</span>` : ''}
            <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> Microsoft Copilot Studio</span>
          </div>
        </div>
        
        <div class="filter-group">
          <div class="filter-label">Filter by Audience</div>
          <div class="filter-buttons">
            <button class="filter-btn active" data-filter="all" onclick="filterPartner('all')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
              All Partners
            </button>
            <button class="filter-btn" data-filter="si" onclick="filterPartner('si')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
              SI Only
            </button>
            <button class="filter-btn" data-filter="isv" onclick="filterPartner('isv')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
              SDC / ISV Only
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>

  ${body ? `
  <!-- ══════════════════════════════════════════════════════════════════════════
       QUICK NAV (Jump to) - STICKY
  ══════════════════════════════════════════════════════════════════════════ -->
  <nav class="quick-nav" id="quickNav">
    <div class="quick-nav-inner">
      <span class="quick-nav-label">Jump to:</span>
      <a href="#section-stories" onclick="showSection('section-stories'); return false;">Top Stories</a>
      <a href="#section-areas" onclick="showSection('section-areas'); return false;">Solution Areas</a>
      <a href="#section-signals" onclick="showSection('section-signals'); return false;">Signals</a>
      <a href="#section-actions" onclick="showSection('section-actions'); return false;">Actions</a>
    </div>
  </nav>

  <!-- ══════════════════════════════════════════════════════════════════════════
       OVERVIEW (Who is this for + How to read)
  ══════════════════════════════════════════════════════════════════════════ -->
  <section class="overview-section">
    <div class="overview-grid">
      <div class="overview-box">
        <h3>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
          Who is this for?
        </h3>
        <p>Designed for <strong>Microsoft partner-facing teams and leadership</strong> to identify key ${escapeHtml(displayTitle)} signals, align messaging, and support strategic conversations with partners.</p>
      </div>
      <div class="overview-box accent">
        <h3>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12h2M20 12h2M12 2v2M12 20v2M6.93 6.93l1.41 1.41M15.66 15.66l1.41 1.41M6.93 17.07l1.41-1.41M15.66 8.34l1.41-1.41"/><circle cx="12" cy="12" r="4"/></svg>
          How to read this report
        </h3>
        <p><strong>Signals</strong> are recurring patterns identified across ${escapeHtml(displayTitle)} sessions, announcements, and partner discussions. Each Signal highlights an emerging trend, explains why it matters, and suggests potential impact.</p>
      </div>
    </div>
  </section>

  <!-- ══════════════════════════════════════════════════════════════════════════
       MAIN CONTENT - COLLAPSIBLE SECTIONS
  ══════════════════════════════════════════════════════════════════════════ -->
  <section class="main-content" id="mainContent">
    <div class="content-card">
      <!-- Intro message -->
      <div class="section-intro" id="sectionIntro">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"/></svg>
        <h3>Select a section to explore</h3>
        <p>Use the "Jump to" navigation above to view Top Stories, Solution Areas, Signals, or Actions.</p>
      </div>
      ${body}
    </div>
  </section>

  <!-- AI Notice -->
  <div class="ai-notice">
    <div class="ai-notice-inner">
      <div class="ai-notice-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
      </div>
      <div>
        <span class="ai-notice-label">AI-generated insights, human validated</span>
        <span class="ai-notice-text"> · This report was generated using AI and curated by the EPS team to ensure accuracy and relevance.</span>
      </div>
    </div>
  </div>
  ` : `
  <section class="main-content">
    <div class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>
      <h2>No report available</h2>
      <p>The report will appear here after the next agent execution.</p>
    </div>
  </section>
  `}

  <!-- Back to Top -->
  <button class="back-to-top" id="backToTop" onclick="scrollToTop()">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 15l-6-6-6 6"/></svg>
  </button>

  <!-- Footer -->
  <footer class="footer">
    <div class="footer-inner">
      <span>${escapeHtml(displayTitle)} Executive Report | EPS Reports</span>
      <span>Last updated: ${formattedDate} | <a href="/state">API JSON</a> · <a href="/health">Health</a></span>
    </div>
  </footer>

  <script>
  // Show section and hide intro
  function showSection(sectionId) {
    // Hide intro
    const intro = document.getElementById('sectionIntro');
    if (intro) intro.style.display = 'none';
    
    // Hide all sections
    document.querySelectorAll('.content-card section').forEach(s => s.classList.remove('active'));
    
    // Show target section
    const target = document.getElementById(sectionId);
    if (target) {
      target.classList.add('active');
      // Scroll to section
      setTimeout(() => {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
    
    // Update nav active state
    document.querySelectorAll('.quick-nav a').forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + sectionId);
    });
  }
  
  // Go back to overview (show intro, hide sections)
  function goBack() {
    // Show intro
    const intro = document.getElementById('sectionIntro');
    if (intro) intro.style.display = 'block';
    
    // Hide all sections
    document.querySelectorAll('.content-card section').forEach(s => s.classList.remove('active'));
    
    // Clear nav active state
    document.querySelectorAll('.quick-nav a').forEach(a => a.classList.remove('active'));
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  // Scroll to top
  function scrollToTop() {
    goBack();
  }

  // Filter
  function filterPartner(type) {
    const content = document.getElementById('mainContent');
    if (!content) return;
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === type);
    });
    content.classList.remove('filter-si', 'filter-isv');
    if (type === 'si') content.classList.add('filter-si');
    if (type === 'isv') content.classList.add('filter-isv');
  }

  // Progress bar + back to top
  window.addEventListener('scroll', () => {
    const winScroll = document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    document.getElementById('progressBar').style.width = (winScroll / height) * 100 + '%';
    document.getElementById('backToTop').classList.toggle('visible', winScroll > 200);
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
