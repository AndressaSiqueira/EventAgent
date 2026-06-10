# Changelog

All notable changes to this project are documented in this file.

## [1.0.0] - 2026-06-10

### Added

- **Executive Report Dashboard** (`/report` endpoint)
  - Professional HTML template with EPS Reports branding
  - "Executive Report · AI Generated" badge
  - Microsoft Fluent Design System styling
  - Responsive layout for mobile devices
  - Markdown rendering with `marked` library

- **Multi-Format Payload Support**
  - `executive_brief` structured JSON format (new)
  - `reportBody` markdown format (legacy)
  - Automatic format detection in server

- **Structured Report Sections**
  - Top Stories with "Why it matters" and implications
  - Stories by Solution Area (tabular format)
  - Recommended Actions for SIs and ISVs
  - Priority Notes with visual callouts
  - Signal Details with source attribution

- **API Endpoints**
  - `GET /` - Redirect to `/report`
  - `GET /report` - Executive HTML dashboard
  - `GET /state` - JSON payload and metadata
  - `GET /health` - Health check
  - `POST /agent-event` - Webhook for real-time updates

- **Azure DevOps Pipeline**
  - Docker multi-stage build
  - ACR push with build tags
  - Container App deployment
  - Base64 payload passthrough

- **Copilot Studio Integration**
  - Azure DevOps connector configuration
  - `base64()` encoding in Parameters expression
  - GPT53Chat model for report generation

### Fixed

- **Double Base64 Encoding** - Pipeline now passes payload directly without re-encoding
- **Queue Parameters Expression** - Corrected syntax for `base64(body('Agent')?['result'])`
- **Empty Payload Issue** - Proper extraction from `BUILD_PARAMETERS` environment variable

### Technical Details

- Node.js 20 runtime
- Express 4.21 server
- marked 18.x for Markdown parsing
- Multi-stage Dockerfile for minimal image size
- Azure Container Apps with revision management

## Implementation Timeline

| Date | Build | Change |
|------|-------|--------|
| 2026-06-09 | #1-27 | Initial setup, pipeline debugging |
| 2026-06-09 | #28 | First successful payload delivery |
| 2026-06-10 | #29-32 | Executive dashboard, branding |
| 2026-06-10 | #33+ | Multi-format support, English i18n |

## Architecture

```
Copilot Studio Agent
        │
        │ executive_brief JSON
        ▼
    base64() encoding
        │
        ▼
Azure DevOps Pipeline
        │
        │ Docker build + deploy
        ▼
Azure Container Apps
        │
        ▼
    /report endpoint
   Executive Dashboard
```

## Contributors

- Andressa Siqueira (@AndressaSiqueira)
