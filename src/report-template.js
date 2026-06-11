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
       INTRO SECTION (START HERE + ABOUT)
    ════════════════════════════════════════════════════════════════════════════ */
    .intro-section {
      max-width: 1200px;
      margin: -40px auto 0;
      padding: 0 32px;
      position: relative;
      z-index: 10;
    }
    .intro-grid {
      display: grid;
      grid-template-columns: 1fr 1.6fr;
      gap: 24px;
    }
    .intro-card {
      background: var(--surface);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      padding: 32px;
    }
    .intro-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
    }
    .intro-icon {
      width: 40px;
      height: 40px;
      background: var(--brand-light);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .intro-icon svg { width: 20px; height: 20px; color: var(--brand); }
    .intro-title {
      font-size: 12px;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    /* Steps */
    .steps-intro {
      font-size: 14px;
      color: var(--text-muted);
      margin-bottom: 20px;
      line-height: 1.6;
    }
    .steps-list { list-style: none; }
    .steps-list li {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 14px 0;
      border-bottom: 1px solid var(--border);
    }
    .steps-list li:last-child { border-bottom: none; }
    .step-num {
      width: 28px;
      height: 28px;
      background: var(--brand);
      color: #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 700;
      flex-shrink: 0;
    }
    .step-text { flex: 1; font-weight: 600; color: var(--text); }
    .step-time { font-size: 13px; color: var(--text-muted); }
    
    /* About */
    .about-text {
      font-size: 15px;
      color: var(--text-muted);
      line-height: 1.7;
      margin-bottom: 28px;
    }
    .about-features {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }
    .about-feature { text-align: center; }
    .about-feature-icon {
      width: 48px;
      height: 48px;
      margin: 0 auto 12px;
      background: var(--teal-light);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .about-feature-icon svg { width: 24px; height: 24px; color: var(--teal); }
    .about-feature-icon.purple { background: var(--accent-light); }
    .about-feature-icon.purple svg { color: var(--accent); }
    .about-feature-icon.green { background: var(--success-light); }
    .about-feature-icon.green svg { color: var(--success); }
    .about-feature h4 {
      font-size: 14px;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 6px;
    }
    .about-feature p {
      font-size: 13px;
      color: var(--text-muted);
      line-height: 1.5;
    }

    /* ════════════════════════════════════════════════════════════════════════════
       EXPLORE SECTION
    ════════════════════════════════════════════════════════════════════════════ */
    .explore-section {
      max-width: 1200px;
      margin: 48px auto;
      padding: 0 32px;
    }
    .section-label {
      font-size: 12px;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 20px;
    }
    .explore-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }
    .explore-card {
      background: var(--surface);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow);
      padding: 28px;
      cursor: pointer;
      transition: all 0.25s;
      border: 2px solid transparent;
      text-decoration: none;
      color: inherit;
      display: block;
    }
    .explore-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
      border-color: var(--brand);
    }
    .explore-card-header {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 12px;
    }
    .explore-card-icon {
      width: 56px;
      height: 56px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .explore-card-icon.gold { background: linear-gradient(135deg, #fbbf24, #f59e0b); }
    .explore-card-icon.teal { background: linear-gradient(135deg, #2dd4bf, #14b8a6); }
    .explore-card-icon.blue { background: linear-gradient(135deg, #60a5fa, #3b82f6); }
    .explore-card-icon svg { width: 28px; height: 28px; color: #fff; }
    .explore-card-info { flex: 1; }
    .explore-card-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .explore-badge {
      font-size: 10px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 10px;
      text-transform: uppercase;
    }
    .explore-badge.executive { background: var(--brand-light); color: var(--brand); }
    .explore-badge.deep { background: var(--accent-light); color: var(--accent); }
    .explore-badge.action { background: var(--success-light); color: var(--success); }
    .explore-card-desc {
      font-size: 14px;
      color: var(--text-muted);
      line-height: 1.5;
      margin-bottom: 16px;
    }
    .explore-card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 16px;
      border-top: 1px solid var(--border);
    }
    .explore-card-time {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: var(--text-muted);
    }
    .explore-card-time svg { width: 16px; height: 16px; }
    .explore-card-arrow {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--surface-alt);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .explore-card:hover .explore-card-arrow { background: var(--brand); }
    .explore-card:hover .explore-card-arrow svg { color: #fff; }
    .explore-card-arrow svg { width: 16px; height: 16px; color: var(--text-muted); }

    /* ════════════════════════════════════════════════════════════════════════════
       MAIN CONTENT
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

    /* Typography */
    .content-card h2 {
      font-size: 24px;
      font-weight: 700;
      color: var(--text);
      margin: 48px 0 20px;
      padding-bottom: 12px;
      border-bottom: 2px solid var(--border);
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .content-card h2:first-child { margin-top: 0; }
    .content-card h2 .section-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .content-card h2 .section-icon svg { width: 20px; height: 20px; color: #fff; }
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
    .content-card hr {
      border: none;
      border-top: 1px solid var(--border);
      margin: 32px 0;
    }

    /* Story cards */
    .story-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin: 24px 0;
    }
    .story-card {
      background: var(--surface-alt);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 24px;
      transition: all 0.2s;
    }
    .story-card:hover {
      border-color: var(--brand);
      box-shadow: var(--shadow);
    }
    .story-card-header {
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
    .story-card h4 {
      font-size: 16px;
      font-weight: 700;
      color: var(--text);
      margin: 0;
      line-height: 1.4;
    }
    .story-card p {
      font-size: 14px;
      color: var(--text-muted);
      margin: 0;
    }
    .story-card .why { margin-bottom: 8px; }

    /* Signal badges */
    .signal-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--teal-light);
      color: var(--teal);
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      margin: 4px 4px 4px 0;
      text-decoration: none;
      transition: all 0.2s;
    }
    .signal-badge:hover {
      background: var(--teal);
      color: #fff;
      text-decoration: none;
    }

    /* Partner sections */
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

    /* Signal details */
    .signal-detail {
      background: var(--surface-alt);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 24px;
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
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      white-space: nowrap;
    }
    .signal-detail h4 {
      font-size: 18px;
      font-weight: 700;
      color: var(--text);
      margin: 0 !important;
    }
    .signal-meta {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
      font-size: 13px;
      flex-wrap: wrap;
    }
    .signal-meta span {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--text-muted);
    }
    .signal-meta svg { width: 16px; height: 16px; }

    /* Filter content */
    .filter-si .isv-content { display: none; }
    .filter-isv .si-content { display: none; }

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
       UTILITIES
    ════════════════════════════════════════════════════════════════════════════ */
    .back-to-top {
      position: fixed;
      bottom: 32px;
      right: 32px;
      width: 52px;
      height: 52px;
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
      transform: translateY(20px);
      transition: all 0.3s;
      z-index: 1000;
    }
    .back-to-top.visible {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }
    .back-to-top:hover { background: var(--brand-dark); }
    .back-to-top svg { width: 24px; height: 24px; }

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
    @media (max-width: 900px) {
      .hero-content { grid-template-columns: 1fr; }
      .filter-group { margin-top: 24px; }
      .intro-grid { grid-template-columns: 1fr; }
      .explore-grid { grid-template-columns: 1fr; }
      .about-features { grid-template-columns: 1fr; gap: 20px; }
      .story-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 640px) {
      .hero-inner, .intro-section, .explore-section, .main-content, .ai-notice { padding: 0 16px; }
      .content-card, .intro-card { padding: 24px; }
      .filter-buttons { flex-wrap: wrap; }
      .footer-inner { flex-direction: column; gap: 12px; text-align: center; }
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
       INTRO CARDS
  ══════════════════════════════════════════════════════════════════════════ -->
  <section class="intro-section">
    <div class="intro-grid">
      <!-- START HERE -->
      <div class="intro-card">
        <div class="intro-header">
          <div class="intro-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>
          </div>
          <span class="intro-title">Start Here</span>
        </div>
        <p class="steps-intro">Follow this suggested path to get the most out of this report</p>
        <ol class="steps-list">
          <li>
            <span class="step-num">1</span>
            <span class="step-text">Read the overview</span>
            <span class="step-time">1 min</span>
          </li>
          <li>
            <span class="step-num">2</span>
            <span class="step-text">Explore Top Stories</span>
            <span class="step-time">5 min</span>
          </li>
          <li>
            <span class="step-num">3</span>
            <span class="step-text">Dive into Signals</span>
            <span class="step-time">10+ min</span>
          </li>
          <li>
            <span class="step-num">4</span>
            <span class="step-text">Review Actions</span>
            <span class="step-time">5 min</span>
          </li>
        </ol>
      </div>
      
      <!-- ABOUT -->
      <div class="intro-card">
        <div class="intro-header">
          <div class="intro-icon" style="background: var(--accent-light);">
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
          </div>
          <span class="intro-title">About This Report</span>
        </div>
        <p class="about-text">This report is structured around Signals (S) — recurring patterns and emerging trends identified across ${escapeHtml(displayTitle)} sessions, announcements and partner conversations.</p>
        <div class="about-features">
          <div class="about-feature">
            <div class="about-feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12h2M20 12h2M12 2v2M12 20v2M6.93 6.93l1.41 1.41M15.66 15.66l1.41 1.41M6.93 17.07l1.41-1.41M15.66 8.34l1.41-1.41"/><circle cx="12" cy="12" r="4"/></svg>
            </div>
            <h4>What are Signals?</h4>
            <p>Signals represent consistent themes that indicate where the ecosystem is heading.</p>
          </div>
          <div class="about-feature">
            <div class="about-feature-icon purple">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>
            </div>
            <h4>What's included?</h4>
            <p>Each Signal includes what's happening, why it matters, and potential impact.</p>
          </div>
          <div class="about-feature">
            <div class="about-feature-icon green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
            </div>
            <h4>Who is this for?</h4>
            <p>Designed for Microsoft partners to identify opportunities and make informed decisions.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ══════════════════════════════════════════════════════════════════════════
       EXPLORE CARDS
  ══════════════════════════════════════════════════════════════════════════ -->
  <section class="explore-section">
    <div class="section-label">Explore the Report</div>
    <div class="explore-grid">
      <a href="#section-stories" class="explore-card">
        <div class="explore-card-header">
          <div class="explore-card-icon gold">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </div>
          <div class="explore-card-info">
            <div class="explore-card-title">Top Stories <span class="explore-badge executive">Executive summary</span></div>
          </div>
        </div>
        <p class="explore-card-desc">The most important announcements and highlights from ${escapeHtml(displayTitle)}.</p>
        <div class="explore-card-footer">
          <span class="explore-card-time">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            5 min read
          </span>
          <span class="explore-card-arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </span>
        </div>
      </a>
      
      <a href="#section-signals" class="explore-card">
        <div class="explore-card-header">
          <div class="explore-card-icon teal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12h2M20 12h2M12 2v2M12 20v2M6.93 6.93l1.41 1.41M15.66 15.66l1.41 1.41M6.93 17.07l1.41-1.41M15.66 8.34l1.41-1.41"/><circle cx="12" cy="12" r="4"/></svg>
          </div>
          <div class="explore-card-info">
            <div class="explore-card-title">Signals (S) <span class="explore-badge deep">Deep insights</span></div>
          </div>
        </div>
        <p class="explore-card-desc">Key patterns across sessions, what they mean and why they matter.</p>
        <div class="explore-card-footer">
          <span class="explore-card-time">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            10+ min read
          </span>
          <span class="explore-card-arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </span>
        </div>
      </a>
      
      <a href="#section-actions" class="explore-card">
        <div class="explore-card-header">
          <div class="explore-card-icon blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
          </div>
          <div class="explore-card-info">
            <div class="explore-card-title">Actions <span class="explore-badge action">What to do</span></div>
          </div>
        </div>
        <p class="explore-card-desc">Recommended actions and opportunities for partners.</p>
        <div class="explore-card-footer">
          <span class="explore-card-time">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            5 min read
          </span>
          <span class="explore-card-arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </span>
        </div>
      </a>
    </div>
  </section>

  <!-- ══════════════════════════════════════════════════════════════════════════
       MAIN CONTENT
  ══════════════════════════════════════════════════════════════════════════ -->
  <section class="main-content" id="mainContent">
    <div class="content-card">
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
  <button class="back-to-top" id="backToTop" onclick="window.scrollTo({top:0,behavior:'smooth'})">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 15l-6-6-6 6"/></svg>
  </button>

  <!-- Footer -->
  <footer class="footer">
    <div class="footer-inner">
      <span>${escapeHtml(displayTitle)} Executive Report | EPS Reports</span>
      <span>Last updated: ${formattedDate} | <a href="/state">API JSON</a> · <a href="/health">Health</a></span>
    </div>
  </footer>

  <script>
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
    document.getElementById('backToTop').classList.toggle('visible', winScroll > 300);
  });

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
