const express = require("express");

const app = express();
app.use(express.json({ limit: "1mb" }));

const port = process.env.PORT || 8080;
const sharedSecret = process.env.AGENT_SHARED_SECRET || "";

function decodePayload(payloadB64) {
  if (!payloadB64) {
    return null;
  }

  try {
    const decoded = Buffer.from(payloadB64, "base64").toString("utf-8");
    return JSON.parse(decoded);
  } catch {
    return { raw: payloadB64 };
  }
}

let lastEvent = {
  receivedAtUtc: null,
  payload: decodePayload(process.env.COPILOT_AGENT_PAYLOAD_B64)
};

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

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
