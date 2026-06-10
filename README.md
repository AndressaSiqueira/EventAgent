# EventAgent

**AI-powered Event Intelligence Dashboard** — A solution that connects Microsoft Copilot Studio to Azure Container Apps via Azure DevOps pipelines, enabling real-time executive reporting with AI-generated insights.

![Architecture](docs/architecture.png)

## Overview

EventAgent is an end-to-end integration that:

1. **Collects event signals** via a Copilot Studio agent
2. **Processes AI-generated reports** using GPT models
3. **Deploys automatically** through Azure DevOps pipelines
4. **Displays executive dashboards** on Azure Container Apps

The solution supports multiple output formats from the AI agent:
- **Structured JSON** (`executive_brief`) — Top stories, solution areas, recommended actions
- **Markdown** (`reportBody`) — Free-form rich text reports

## Live Demo

- **Executive Dashboard**: `https://ca-community-dashboard.wittysky-e03c5f2a.eastus2.azurecontainerapps.io/report`
- **API State Endpoint**: `https://ca-community-dashboard.wittysky-e03c5f2a.eastus2.azurecontainerapps.io/state`
- **Health Check**: `https://ca-community-dashboard.wittysky-e03c5f2a.eastus2.azurecontainerapps.io/health`

## Architecture

```
┌─────────────────────┐     ┌──────────────────────┐     ┌─────────────────────┐
│   Copilot Studio    │     │    Azure DevOps      │     │  Azure Container    │
│       Agent         │────▶│      Pipeline        │────▶│       Apps          │
│  (GPT53Chat Model)  │     │  (Build & Deploy)    │     │  (Executive Report) │
└─────────────────────┘     └──────────────────────┘     └─────────────────────┘
         │                            │                            │
         │ AI Analysis                │ Docker Build               │ HTML Dashboard
         │ executive_brief JSON       │ Base64 Payload             │ /report endpoint
         ▼                            ▼                            ▼
   ┌───────────┐              ┌───────────────┐            ┌───────────────┐
   │  Event    │              │     ACR       │            │   Rendered    │
   │  Signals  │              │  Container    │            │   Executive   │
   │  (RSS,    │              │   Registry    │            │    Report     │
   │  News)    │              └───────────────┘            └───────────────┘
   └───────────┘
```

## Features

### Executive Report Dashboard

- **EPS Reports branding** with professional styling
- **AI-generated badge**: "Executive Report · AI Generated"
- **Top Stories** with "Why it matters" and implications
- **Stories by Solution Area** in tabular format
- **Recommended Actions** for SIs and ISVs
- **Priority Notes** with visual callouts
- **Signal Details** with source attribution

### Multi-Format Support

The server automatically detects and handles both payload formats:

```javascript
// New structured format (executive_brief)
{
  "event_name": "Build 2026",
  "executive_brief": {
    "top_5_stories": [...],
    "stories_by_solution_area": [...],
    "actions": { "SIs": [...], "SDC_ISVs": [...] },
    "priority_notes": [...]
  }
}

// Legacy markdown format
{
  "reportTitle": "Event Summary",
  "reportBody": "## Analysis\n\nMarkdown content..."
}
```

## Project Structure

```
├── src/
│   ├── server.js           # Express server with API endpoints
│   └── report-template.js  # Executive HTML template with branding
├── docs/
│   ├── copilot-studio-agent-setup.md  # Agent configuration guide
│   └── architecture.png               # System architecture diagram
├── azure-pipelines.yml     # CI/CD pipeline definition
├── Dockerfile              # Multi-stage Node.js container
└── package.json            # Dependencies (express, marked)
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Redirects to `/report` |
| `/report` | GET | Executive HTML dashboard |
| `/state` | GET | JSON payload and metadata |
| `/health` | GET | Health check (`{"status":"ok"}`) |
| `/agent-event` | POST | Webhook for real-time updates |

## Pipeline Flow

1. **Copilot Studio Agent** analyzes event signals and generates `executive_brief`
2. **Queue a new build** action sends base64-encoded payload to Azure DevOps
3. **Pipeline** builds Docker image and pushes to ACR
4. **Container App** receives new revision with payload in `COPILOT_AGENT_PAYLOAD_B64`
5. **Server** decodes payload and renders executive dashboard

### Pipeline Expression (Copilot Studio → Azure DevOps)

```
base64(body('Agent')?['result'])
```

This expression encodes the agent's JSON output directly, avoiding double-encoding issues.

## Prerequisites

1. **Azure Container Registry (ACR)** — For Docker image storage
2. **Azure Container App** — For hosting the dashboard
3. **Azure DevOps** — For CI/CD pipeline
4. **Copilot Studio** — With Azure DevOps connector

### Service Connections Required

- `containerRegistryServiceConnection` — ACR authentication
- `azureSubscriptionServiceConnection` — Azure Resource Manager

## Deployment

### Option 1: Via Copilot Studio

Run the agent workflow — it automatically triggers the pipeline.

### Option 2: Manual Pipeline Run

```bash
curl -X POST "https://dev.azure.com/{org}/{project}/_apis/pipelines/7/runs?api-version=7.1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n ":$PAT" | base64)" \
  -d '{"templateParameters":{"agentPayload":"eyJldmVudF9uYW1lIjoiVGVzdCJ9"}}'
```

### Option 3: Local Development

```bash
npm install
npm start
# Server runs at http://localhost:8080
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 8080) |
| `COPILOT_AGENT_PAYLOAD_B64` | Base64-encoded agent payload |
| `BUILD_BUILDID` | Azure DevOps build number |
| `AGENT_SHARED_SECRET` | Optional webhook authentication |

## Technical Details

### Payload Encoding Flow

```
Agent JSON → base64() in Copilot Studio → Pipeline passes directly → Container decodes
```

**Key insight**: The pipeline does NOT re-encode. The `base64()` Power Fx function in Copilot Studio handles all encoding.

### HTML Template Features

- Microsoft Fluent Design System colors
- Responsive layout (mobile-friendly)
- Markdown rendering via `marked` library
- Table styling for solution areas
- Blockquote styling for priority notes
- Code block styling with syntax highlighting ready

## Troubleshooting

### Report shows "No report available"

1. Check `/state` endpoint — does it have payload?
2. Verify `executive_brief` or `reportBody` exists in payload
3. Check pipeline logs for encoding issues

### Pipeline fails with JSON errors

- Ensure Copilot Studio uses `base64(body('Agent')?['result'])` expression
- Verify the agent output is valid JSON

## Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

MIT

---

**EPS Reports - Events** · Powered by Microsoft Copilot Studio & Azure