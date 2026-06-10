# Copilot Studio Agent Setup

This guide describes how to configure the Copilot Studio agent to trigger the Azure DevOps pipeline and pass the AI-generated executive report to the Container App.

## Overview

The agent workflow:

1. **Collects event signals** (RSS feeds, news sources)
2. **Analyzes with GPT model** to generate executive brief
3. **Encodes as base64** using Power Fx `base64()` function
4. **Triggers Azure DevOps pipeline** via "Queue a new build" action
5. **Pipeline deploys** new Container App revision with payload

## Pipeline Details

| Property | Value |
|----------|-------|
| Name | `AgentOps-ContainerApp-CI` |
| ID | `7` |
| Project | `AgentOps` |
| Organization | `ansiqueira0239` |

## Copilot Studio Configuration

### Action: Queue a new build

Use the **Azure DevOps** connector's "Queue a new build" action.

#### Connection Settings

- **Organization Name**: `ansiqueira0239`

#### Action Parameters

| Parameter | Value |
|-----------|-------|
| Project Name | `AgentOps` |
| Definition Id | `7` |
| Source Branch | `refs/heads/main` |

### Parameters Expression (Critical)

In the **Parameters** field, use this expression:

```
{"agentPayload": "@{base64(body('Agent')?['result'])}"}
```

Or in the expression editor:

```
concat('{"agentPayload": "', base64(body('Agent')?['result']), '"}')
```

**Important**: The `base64()` function encodes the JSON payload. The pipeline passes it directly without re-encoding.

## Agent Output Format

The agent should output a structured `executive_brief` JSON:

```json
{
  "event_name": "Build 2026",
  "executive_brief": {
    "top_5_stories": [
      {
        "title": "AI-Powered Development",
        "why_it_matters": "Transforms developer productivity",
        "implication": "20% faster development cycles"
      }
    ],
    "stories_by_solution_area": [
      {
        "solution_area": "Azure AI",
        "key_message": "New Foundry capabilities announced",
        "notable_signals": "3 major announcements"
      }
    ],
    "actions": {
      "SIs": ["Upskill on Azure AI Foundry"],
      "SDC_ISVs": ["Integrate Copilot SDK"]
    },
    "priority_notes": [
      "Security updates require immediate attention"
    ]
  },
  "normalized_signals": {
    "items": [
      {
        "id": "SIG001",
        "title": "Signal Title",
        "summary": "Brief description",
        "product_area": "Azure",
        "source": "TechCrunch",
        "source_ref": "article-url"
      }
    ]
  },
  "timestampUtc": "2026-06-10T15:30:00Z"
}
```

## Agent Instructions

Configure the agent with these system instructions:

```
You are an Event Intelligence Agent that analyzes technology event signals and produces executive briefs for Microsoft partners.

Your output MUST be a valid JSON object with this structure:
- event_name: Name of the event being analyzed
- executive_brief: Object containing:
  - top_5_stories: Array of the most important stories
  - stories_by_solution_area: Array grouped by Azure solution area
  - actions: Object with SIs and SDC_ISVs recommendation arrays
  - priority_notes: Array of urgent observations
- normalized_signals: Object with items array of source signals
- timestampUtc: ISO timestamp

Focus on:
1. Business impact and partner opportunities
2. Actionable insights for System Integrators
3. ISV partnership and SDK integration opportunities
4. Security and compliance considerations

Output ONLY the JSON object, no markdown or explanations.
```

## Troubleshooting

### "Parameters value is not valid JSON"

Ensure the expression produces valid JSON. Test with:

```
{"agentPayload": "dGVzdA=="}
```

### Empty payload at Container App

1. Check the agent node outputs a `result` property
2. Verify `body('Agent')?['result']` returns the JSON
3. Confirm `base64()` is applied correctly

### Pipeline shows empty PAYLOAD_INPUT

The pipeline reads from `BUILD_PARAMETERS` environment variable. Ensure:
- Queue action uses `Parameters` field (not `Variables`)
- JSON format is `{"agentPayload": "base64string"}`

## Flow Diagram

```
┌─────────────────┐
│  Event Signals  │
│  (RSS, News)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Copilot Studio │
│     Agent       │
│  (GPT53Chat)    │
└────────┬────────┘
         │ executive_brief JSON
         ▼
┌─────────────────┐
│   base64()      │
│   encoding      │
└────────┬────────┘
         │ "eyJldmVudF9uYW1lIjo..."
         ▼
┌─────────────────┐
│ Queue a new     │
│ build action    │
│ Parameters:     │
│ {"agentPayload":│
│  "base64..."}   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Azure DevOps    │
│ Pipeline        │
│ BUILD_PARAMETERS│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Container App   │
│ COPILOT_AGENT_  │
│ PAYLOAD_B64     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ /report endpoint│
│ Executive HTML  │
└─────────────────┘
```

## Testing the Integration

### 1. Test Agent Output

In Copilot Studio test panel, verify the agent produces valid JSON.

### 2. Test Pipeline Manually

```bash
# Encode a test payload
PAYLOAD=$(echo '{"event_name":"Test"}' | base64)

# Trigger pipeline
curl -X POST "https://dev.azure.com/ansiqueira0239/AgentOps/_apis/pipelines/7/runs?api-version=7.1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n ":$PAT" | base64)" \
  -d "{\"templateParameters\":{\"agentPayload\":\"$PAYLOAD\"}}"
```

### 3. Verify Container App

```bash
curl https://ca-community-dashboard.wittysky-e03c5f2a.eastus2.azurecontainerapps.io/state
```

Check `revisionPayload.payload` contains the decoded JSON.

Descricao sugerida:

- `Dispara a pipeline AgentOps-ContainerApp-CI no Azure DevOps para atualizar o Container App com os dados do agente.`

## Exemplo de body pronto

Se o designer do Copilot Studio permitir expressao dinamica, use um body neste formato e troque os placeholders pelas variaveis reais do fluxo.

```json
{
  "templateParameters": {
    "agentPayload": "{\"source\":\"copilot-studio\",\"conversationId\":\"{{conversation.id}}\",\"userId\":\"{{system.user.id}}\",\"message\":\"{{activity.text}}\",\"action\":\"refresh\",\"timestampUtc\":\"{{system.currentTimeUtc}}\"}"
  }
}
```

Se essas variaveis nao existirem com esses nomes no seu tenant, substitua pelos tokens disponiveis no painel dinamico do Copilot Studio.

## Versao minima para testar

Se quiser testar sem variaveis dinamicas, use este body fixo.

```json
{
  "templateParameters": {
    "agentPayload": "{\"source\":\"copilot-studio\",\"conversationId\":\"test-001\",\"userId\":\"manual-user\",\"message\":\"executar atualizacao\",\"action\":\"refresh\",\"timestampUtc\":\"2026-06-09T21:00:00Z\"}"
  }
}
```

## O que a pipeline faz com isso

A pipeline definida em `azure-pipelines.yml`:

1. Faz build da imagem Docker.
2. Publica a imagem no ACR.
3. Atualiza o Azure Container App.
4. Salva o payload recebido em `COPILOT_AGENT_PAYLOAD_B64`.

A aplicacao exposta pelo Container App disponibiliza:

- `GET /health`
- `GET /state`
- `POST /agent-event`

## O que ainda precisa existir no Azure DevOps

Configure estas variaveis na pipeline ou Library:

- `containerRegistryServiceConnection`
- `azureSubscriptionServiceConnection`
- `acrLoginServer`
- `resourceGroup`
- `containerAppName`

Sem essas variaveis, a pipeline sera criada, mas o stage de deploy nao vai funcionar.
