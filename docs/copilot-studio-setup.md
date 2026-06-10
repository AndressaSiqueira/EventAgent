# Copilot Studio Workflow Setup

Complete guide to configure the Copilot Studio workflow that triggers Azure DevOps pipelines and delivers AI-generated executive reports.

## Workflow Overview

The workflow consists of 3 nodes:

```
[Start] ──▶ [Agent] ──▶ [Queue a new build]
```

![Workflow Screenshot](workflow-screenshot.png)

---

## Step 1: Create a New Agent

1. Go to https://copilotstudio.microsoft.com
2. Click **Create** → **New agent**
3. Name: `Event Intelligence Agent`
4. Description: `Analyzes event signals and generates executive briefs`

---

## Step 2: Add Azure DevOps Connection

Before creating the workflow, set up the connector:

1. Go to **Settings** (gear icon) → **Connections**
2. Click **+ Add connection**
3. Search for **Azure DevOps**
4. Click **Add** and authenticate with your Azure DevOps account
5. Select your organization

---

## Step 3: Create the Workflow

### 3.1 Create New Topic/Workflow

1. Go to **Topics** → **+ New topic** → **From blank**
2. Or use **Workflows** if available in your version
3. Name: `Generate Executive Report`

### 3.2 Configure Start Node

The **Start** node is created automatically. Configure trigger:

- **Trigger type**: Manual (for testing) or Scheduled
- For scheduled: Set frequency (e.g., daily at 9 AM)

### 3.3 Add Agent Node

1. Click **+** after Start node
2. Select **Call an action** → **Create a prompt**
3. Or select **Generative AI** → **Create with AI**

#### Agent Instructions

```
You are an Event Intelligence Agent that analyzes technology signals and produces executive briefs for partners.

Your output MUST be a valid JSON object with this EXACT structure:

{
  "event_name": "Name of the event or analysis period",
  "executive_brief": {
    "top_5_stories": [
      {
        "title": "Headline of the story",
        "why_it_matters": "Business impact explanation",
        "implication": "Recommended action or consideration"
      }
    ],
    "stories_by_solution_area": [
      {
        "solution_area": "Azure AI | Azure Data | Security | Modern Work | etc.",
        "key_message": "Main takeaway for this area",
        "notable_signals": "Number or description of signals"
      }
    ],
    "actions": {
      "SIs": ["Specific action for System Integrators"],
      "SDC_ISVs": ["Specific action for ISVs and SDC partners"]
    },
    "priority_notes": [
      "Urgent observation requiring immediate attention"
    ]
  },
  "timestampUtc": "ISO 8601 timestamp"
}

RULES:
1. Output ONLY the JSON object - no markdown, no explanations, no code blocks
2. Include 3-5 top stories
3. Group by relevant Microsoft solution areas
4. Make actions specific and actionable
5. Only include priority_notes for truly urgent items

Focus on:
- Business impact for Microsoft partners
- Technical opportunities and risks
- Competitive intelligence
- Security and compliance updates
```

#### Add Knowledge Sources (Optional)

To give the agent context, add knowledge sources:

1. Click **Knowledge** in the agent configuration
2. Add sources:
   - **Public websites**: Tech news sites, Microsoft blogs
   - **SharePoint**: Internal event materials
   - **Files**: Event schedules, speaker lists

### 3.4 Add Queue a new build Node

1. Click **+** after Agent node
2. Select **Call an action** → **Azure DevOps**
3. Choose **Queue a new build**

#### Configure the Action

| Field | Value | Notes |
|-------|-------|-------|
| **Connection** | Your Azure DevOps connection | Created in Step 2 |
| **Project Name** | Your project name | e.g., `EventAgent` |
| **Definition Id** | Your pipeline ID | Number from pipeline URL |
| **Source Branch** | `refs/heads/main` | Or your default branch |

#### Parameters Field (CRITICAL)

This is the most important configuration. Use this expression:

```
{"agentPayload": "@{base64(body('Agent')?['result'])}"}
```

**How to enter this:**

1. Click in the **Parameters** field
2. Click the **fx** (formula) button
3. Enter the expression above
4. Click **OK**

**Alternative using concat:**
```
concat('{"agentPayload": "', base64(body('Agent')?['result']), '"}')
```

**What this does:**
- `body('Agent')?['result']` — Gets the JSON output from the Agent node
- `base64()` — Encodes it as base64 (required for safe transmission)
- The JSON wrapper sends it as the `agentPayload` parameter

---

## Step 4: Test the Workflow

### 4.1 Test in Copilot Studio

1. Click **Test** (play button) in the top right
2. Trigger the workflow manually
3. Watch each node execute

### 4.2 Verify in Azure DevOps

1. Go to your Azure DevOps project
2. Click **Pipelines**
3. You should see a new run triggered
4. Check the run logs for the payload

### 4.3 Check the Dashboard

After pipeline completes:

```bash
# Check the deployed report
curl https://YOUR_APP.azurecontainerapps.io/state
```

---

## Troubleshooting

### "Parameters value is not valid JSON"

**Cause**: Expression syntax error

**Fix**: Ensure quotes and brackets match exactly:
```
{"agentPayload": "@{base64(body('Agent')?['result'])}"}
```

### Pipeline runs but payload is empty

**Cause**: Agent node not outputting to `result`

**Fix**: 
1. Check Agent node outputs are configured
2. Verify the agent produces valid JSON
3. Test agent output in isolation first

### "The action failed" error

**Cause**: Azure DevOps connection or permission issue

**Fix**:
1. Re-authenticate the Azure DevOps connection
2. Verify your account has pipeline run permissions
3. Check the pipeline exists with the correct ID

### Agent produces markdown instead of JSON

**Cause**: Instructions not strict enough

**Fix**: Add to agent instructions:
```
CRITICAL: Output ONLY raw JSON. 
Never wrap in ```json code blocks.
Never add explanations before or after.
```

---

## Advanced Configuration

### Adding Input Parameters

To make the workflow accept parameters (e.g., event name):

1. In Start node, add **Input parameters**
2. Reference them in Agent instructions: `Analyze the event: @{triggerBody()?['eventName']}`

### Scheduled Execution

1. Edit Start node
2. Select **Schedule** trigger
3. Configure:
   - Frequency: Daily/Weekly
   - Time: 9:00 AM
   - Timezone: Your timezone

### Error Handling

Add a condition after Queue a new build:

```
If Queue a new build succeeded
  → Send success notification
Else
  → Send failure alert
```

---

## Expression Reference

| Expression | Description |
|------------|-------------|
| `body('Agent')?['result']` | Agent's output as string |
| `base64(...)` | Encode as base64 |
| `triggerBody()?['field']` | Input parameter value |
| `utcNow()` | Current UTC timestamp |

---

## Complete Workflow JSON Export

For reference, here's the workflow structure:

```yaml
Workflow: Generate Executive Report
├── Start
│   └── Trigger: Manual
├── Agent
│   ├── Model: GPT (Copilot)
│   ├── Instructions: [Executive brief JSON prompt]
│   └── Output: result (JSON string)
└── Queue a new build
    ├── Connection: Azure DevOps
    ├── Project: {your-project}
    ├── Definition Id: {your-pipeline-id}
    ├── Source Branch: refs/heads/main
    └── Parameters: {"agentPayload": "@{base64(body('Agent')?['result'])}"}
```

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
