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
 * Convert structured executive_brief payload into markdown.
 */
function convertExecutiveBriefToMarkdown(payload) {
  if (!payload || !payload.executive_brief) return null;

  const brief = payload.executive_brief;
  const eventName = payload.event_name || "Event Report";
  let md = "";

  // Top 5 Stories
  if (brief.top_5_stories && brief.top_5_stories.length > 0) {
    md += "## Top Stories\n\n";
    brief.top_5_stories.forEach((story, i) => {
      md += `### ${i + 1}. ${story.title}\n\n`;
      md += `**Why it matters:** ${story.why_it_matters}\n\n`;
      md += `**Implication:** ${story.implication}\n\n`;
    });
  }

  // Stories by Solution Area
  if (brief.stories_by_solution_area && brief.stories_by_solution_area.length > 0) {
    md += "## Stories by Solution Area\n\n";
    md += "| Solution Area | Key Message | Signals |\n";
    md += "|---|---|---|\n";
    brief.stories_by_solution_area.forEach((area) => {
      const msg = area.key_message.replace(/\|/g, "\\|").substring(0, 200) + (area.key_message.length > 200 ? "..." : "");
      md += `| **${area.solution_area}** | ${msg} | ${area.notable_signals || ""} |\n`;
    });
    md += "\n";
  }

  // Actions
  if (brief.actions) {
    md += "## Recommended Actions\n\n";
    if (brief.actions.SIs && brief.actions.SIs.length > 0) {
      md += "### For System Integrators (SIs)\n\n";
      brief.actions.SIs.forEach((action) => {
        md += `- ${action}\n`;
      });
      md += "\n";
    }
    if (brief.actions.SDC_ISVs && brief.actions.SDC_ISVs.length > 0) {
      md += "### For ISVs & SDC Partners\n\n";
      brief.actions.SDC_ISVs.forEach((action) => {
        md += `- ${action}\n`;
      });
      md += "\n";
    }
  }

  // Priority Notes
  if (brief.priority_notes && brief.priority_notes.length > 0) {
    md += "## Priority Notes\n\n";
    brief.priority_notes.forEach((note) => {
      md += `> ${note}\n\n`;
    });
  }

  // Normalized Signals Summary
  if (payload.normalized_signals && payload.normalized_signals.items) {
    md += "## Signal Details\n\n";
    payload.normalized_signals.items.forEach((signal) => {
      md += `**${signal.id}: ${signal.title}** (${signal.product_area})\n`;
      md += `${signal.summary}\n`;
      md += `_Source: ${signal.source} — ${signal.source_ref}_\n\n`;
    });
  }

  return md || null;
}

/**
 * Extract report data from payload (supports multiple formats).
 */
function extractReportData(payload) {
  if (!payload) return { title: null, bodyMd: null, timestamp: null };

  // Format 1: executive_brief structured JSON
  if (payload.executive_brief) {
    return {
      title: payload.event_name || "Executive Report",
      bodyMd: convertExecutiveBriefToMarkdown(payload),
      timestamp: payload.timestampUtc || null,
    };
  }

  // Format 2: reportBody markdown (legacy)
  if (payload.reportBody) {
    return {
      title: payload.reportTitle || "Executive Report",
      bodyMd: payload.reportBody,
      timestamp: payload.timestampUtc || null,
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
      bodyMd: content,
      timestamp: null,
    };
  }

  return { title: null, bodyMd: null, timestamp: null };
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
  const { title, bodyMd, timestamp } = extractReportData(payload);
  const html = renderReport({
    title: title || "Executive Report",
    body: bodyMd ? marked.parse(bodyMd) : null,
    timestamp: timestamp || null,
    buildId: process.env.BUILD_BUILDID || null,
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
