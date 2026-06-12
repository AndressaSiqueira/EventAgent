const express = require("express");
const { marked } = require("marked");
const { renderReport } = require("./report-template");

marked.setOptions({ gfm: true, breaks: false });

const app = express();
app.use(express.json({ limit: "1mb" }));

const port = process.env.PORT || 8080;
const sharedSecret = process.env.AGENT_SHARED_SECRET || "";

/**
 * Extract JSON from markdown code blocks if present.
 * Handles: ```json ... ```, ``` ... ```, or plain JSON
 */
function extractJsonFromMarkdown(text) {
  if (!text) return text;
  
  // Remove leading/trailing whitespace
  let content = text.trim();
  
  // Check for ```json or ``` code block wrapper
  const codeBlockMatch = content.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?```\s*$/);
  if (codeBlockMatch) {
    content = codeBlockMatch[1].trim();
  }
  
  return content;
}

function decodePayload(payloadB64) {
  if (!payloadB64) {
    return null;
  }

  try {
    const decoded = Buffer.from(payloadB64, "base64").toString("utf-8");
    // Try to extract JSON from markdown code blocks
    const jsonContent = extractJsonFromMarkdown(decoded);
    return JSON.parse(jsonContent);
  } catch {
    return { raw: payloadB64 };
  }
}

/**
 * Convert structured executive_brief payload into HTML content.
 */
function convertExecutiveBriefToMarkdown(payload) {
  if (!payload || !payload.executive_brief) return null;

  const brief = payload.executive_brief;
  const eventName = payload.event_name || "Event Report";
  let html = "";

  // Build signal ID to title map for lookups
  const signalMap = {};
  const signalSourceMap = {};
  if (payload.normalized_signals && payload.normalized_signals.items) {
    payload.normalized_signals.items.forEach(sig => {
      signalMap[sig.id.toUpperCase()] = sig.title;
      signalSourceMap[sig.id.toUpperCase()] = sig;
    });
  }

  // Back button HTML
  const backBtn = `<button class="section-back" onclick="goBack()">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
  Back to Overview
</button>`;

  // ═══════════════════════════════════════════════════════════════════════════
  // TOP STORIES - FULL WIDTH VERTICAL LIST
  // ═══════════════════════════════════════════════════════════════════════════
  if (brief.top_5_stories && brief.top_5_stories.length > 0) {
    html += `<section id="section-stories">
${backBtn}
<h2>
  <span class="section-icon" style="background: linear-gradient(135deg, #fbbf24, #f59e0b);">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
  </span>
  Top ${brief.top_5_stories.length} Stories
</h2>
<div class="story-list">
`;
    brief.top_5_stories.forEach((story, i) => {
      html += `  <div class="story-item">
    <span class="story-num">${i + 1}</span>
    <div class="story-content">
      <h4>${escapeHtml(story.title)}</h4>
      <p><strong>Why it matters:</strong> ${escapeHtml(story.why_it_matters)}</p>
      <p><strong>Implication:</strong> ${escapeHtml(story.implication)}</p>
    </div>
  </div>
`;
    });
    html += `</div>
</section>
`;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SOLUTION AREAS - TILE GRID (2-3 columns, handles odd numbers)
  // ═══════════════════════════════════════════════════════════════════════════
  if (brief.stories_by_solution_area && brief.stories_by_solution_area.length > 0) {
    html += `<section id="section-areas">
${backBtn}
<h2>
  <span class="section-icon" style="background: linear-gradient(135deg, #a78bfa, #7c3aed);">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
  </span>
  Stories by Solution Area (${brief.stories_by_solution_area.length})
</h2>
<div class="area-grid">
`;
    brief.stories_by_solution_area.forEach((area) => {
      html += `  <div class="area-tile">
    <h4>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
      ${escapeHtml(area.solution_area)}
    </h4>
    <p>${escapeHtml(area.key_message)}</p>
`;
      if (area.notable_signals) {
        let signals = area.notable_signals;
        if (typeof signals === 'string') {
          signals = signals.split(/[,\s]+/).filter(Boolean);
        }
        html += `    <div class="area-signals">
`;
        signals.forEach(sig => {
          const id = String(sig).trim().toUpperCase();
          const title = signalMap[id] || id;
          const shortTitle = title.length > 30 ? title.substring(0, 27) + '...' : title;
          html += `      <a href="javascript:void(0)" onclick="showSection('section-signals'); setTimeout(() => document.getElementById('signal-${id.toLowerCase()}').scrollIntoView({behavior:'smooth'}), 100);" class="signal-badge">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/></svg>
        ${escapeHtml(shortTitle)}
      </a>
`;
        });
        html += `    </div>
`;
      }
      html += `  </div>
`;
    });
    html += `</div>
</section>
`;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════
  if (brief.actions) {
    html += `<section id="section-actions">
${backBtn}
<h2>
  <span class="section-icon" style="background: linear-gradient(135deg, #60a5fa, #3b82f6);">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
  </span>
  Recommended Actions
</h2>
`;
    if (brief.actions.SIs && brief.actions.SIs.length > 0) {
      html += `<div class="partner-section si si-content">
  <h4>
    <svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
    For Systems Integrators (SI)
  </h4>
  <ul>
`;
      brief.actions.SIs.forEach((action) => {
        html += `    <li>${escapeHtml(action)}</li>
`;
      });
      html += `  </ul>
</div>
`;
    }
    if (brief.actions.SDC_ISVs && brief.actions.SDC_ISVs.length > 0) {
      html += `<div class="partner-section isv isv-content">
  <h4>
    <svg viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
    For SDC / ISV
  </h4>
  <ul>
`;
      brief.actions.SDC_ISVs.forEach((action) => {
        html += `    <li>${escapeHtml(action)}</li>
`;
      });
      html += `  </ul>
</div>
`;
    }
    html += `</section>
`;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SIGNAL DETAILS - WITH SOURCE LINKS (blog, docs, video)
  // ═══════════════════════════════════════════════════════════════════════════
  if (payload.normalized_signals && payload.normalized_signals.items) {
    html += `<section id="section-signals">
${backBtn}
<h2>
  <span class="section-icon" style="background: linear-gradient(135deg, #2dd4bf, #14b8a6);">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12h2M20 12h2M12 2v2M12 20v2M6.93 6.93l1.41 1.41M15.66 15.66l1.41 1.41M6.93 17.07l1.41-1.41M15.66 8.34l1.41-1.41"/><circle cx="12" cy="12" r="4"/></svg>
  </span>
  Signal Details (${payload.normalized_signals.items.length})
</h2>
`;
    payload.normalized_signals.items.forEach((signal) => {
      html += `<div class="signal-detail" id="signal-${signal.id.toLowerCase()}">
  <div class="signal-detail-header">
    <span class="signal-id">${escapeHtml(signal.id)}</span>
    <h4>${escapeHtml(signal.title)}</h4>
  </div>
  <div class="signal-meta">
    <span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
      ${escapeHtml(signal.product_area)}
    </span>
  </div>
  <p>${escapeHtml(signal.summary)}</p>
`;
      // Source links section - session_url (Build sessions) and learn_more_url (other links)
      const hasLinks = signal.session_url || signal.learn_more_url;
      if (hasLinks) {
        html += `  <div class="source-links">
`;
        if (signal.session_url && signal.session_url.startsWith('http')) {
          html += `    <a href="${escapeHtml(signal.session_url)}" target="_blank" class="source-link session">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
      Watch Session
    </a>
`;
        }
        if (signal.learn_more_url && signal.learn_more_url.startsWith('http')) {
          html += `    <a href="${escapeHtml(signal.learn_more_url)}" target="_blank" class="source-link learn">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
      Read More
    </a>
`;
        }
        html += `  </div>
`;
      }
      html += `</div>
`;
    });
    html += `</section>
`;
  }

  return html || null;
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Extract report data from payload (supports multiple formats).
 */
function extractReportData(payload) {
  if (!payload) return { title: null, bodyHtml: null, timestamp: null, storyCount: 0, areaCount: 0, signalCount: 0, eventName: null };

  // Format 1: executive_brief structured JSON
  if (payload.executive_brief) {
    const brief = payload.executive_brief;
    return {
      title: payload.event_name || "Executive Report",
      bodyHtml: convertExecutiveBriefToMarkdown(payload),
      timestamp: payload.timestampUtc || null,
      storyCount: brief.top_5_stories?.length || 0,
      areaCount: brief.stories_by_solution_area?.length || 0,
      signalCount: payload.normalized_signals?.items?.length || 0,
      eventName: payload.event_name || null,
    };
  }

  // Format 2: reportBody markdown (legacy)
  if (payload.reportBody) {
    return {
      title: payload.reportTitle || "Executive Report",
      bodyHtml: marked.parse(payload.reportBody),
      timestamp: payload.timestampUtc || null,
      storyCount: 0,
      areaCount: 0,
      signalCount: 0,
      eventName: null,
    };
  }

  // Format 3: raw text/markdown (fallback when JSON parse failed)
  if (payload.raw) {
    // Decode base64 if it looks like base64
    let content = payload.raw;
    try {
      const decoded = Buffer.from(payload.raw, "base64").toString("utf-8");
      // Check if it looks like text (not binary)
      if (/^[\x20-\x7E\r\n\t]+$/.test(decoded.substring(0, 100)) || decoded.includes("**") || decoded.includes("##")) {
        content = decoded;
      }
    } catch {
      // Keep original content
    }

    // Try to extract a title from the markdown
    let title = "Executive Report";
    const titleMatch = content.match(/^#\s+(.+)$/m) || content.match(/\*\*(.+?)\*\*/);
    if (titleMatch) {
      title = titleMatch[1].substring(0, 100);
    }

    return {
      title: title,
      bodyHtml: marked.parse(content),
      timestamp: null,
      storyCount: 0,
      areaCount: 0,
      signalCount: 0,
      eventName: null,
    };
  }

  return { title: null, bodyHtml: null, timestamp: null, storyCount: 0, areaCount: 0, signalCount: 0, eventName: null };
}

let lastEvent = {
  receivedAtUtc: null,
  payload: decodePayload(process.env.COPILOT_AGENT_PAYLOAD_B64)
};

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/report", (_req, res) => {
  const payload = lastEvent.payload || {};
  const { title, bodyHtml, timestamp, storyCount, areaCount, signalCount, eventName } = extractReportData(payload);
  const html = renderReport({
    title: title || "Executive Report",
    body: bodyHtml,
    timestamp: timestamp || null,
    buildId: process.env.BUILD_BUILDID || null,
    storyCount,
    areaCount,
    signalCount,
    eventName,
  });
  res.status(200).type("html").send(html);
});

app.get("/", (_req, res) => res.redirect("/report"));

app.get("/state", (_req, res) => {
  res.status(200).json({
    service: "agentops-webhook",
    revisionPayload: lastEvent,
    buildId: process.env.BUILD_BUILDID || null
  });
});

app.post("/agent-event", (req, res) => {
  const incomingSecret = req.header("x-agent-secret") || "";
  if (sharedSecret && incomingSecret !== sharedSecret) {
    return res.status(401).json({ message: "unauthorized" });
  }

  lastEvent = {
    receivedAtUtc: new Date().toISOString(),
    payload: req.body
  };

  // Keep logs concise to avoid exposing very large payloads.
  console.log("[agent-event]", JSON.stringify({
    receivedAtUtc: lastEvent.receivedAtUtc,
    keys: Object.keys(req.body || {})
  }));

  return res.status(202).json({ message: "accepted", at: lastEvent.receivedAtUtc });
});

app.listen(port, () => {
  console.log(`Webhook receiver listening on port ${port}`);
});
