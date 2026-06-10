# EventAgent

**AI-powered Event Intelligence Dashboard** — A complete solution that connects Microsoft Copilot Studio to Azure Container Apps via Azure DevOps pipelines, enabling real-time executive reporting with AI-generated insights.

## What You'll Build

A workflow that:
1. Analyzes event signals using a Copilot Studio AI agent
2. Generates structured executive reports
3. Deploys automatically to Azure Container Apps
4. Displays a branded executive dashboard

![Copilot Studio Workflow](docs/workflow-screenshot.png)

## Prerequisites

- Azure subscription
- Azure DevOps organization
- Microsoft Copilot Studio license
- Git installed locally

---

## Part 1: Azure Infrastructure Setup

### 1.1 Create Resource Group

```bash
az login

# Set variables (customize these)
RESOURCE_GROUP="rg-eventagent"
LOCATION="eastus2"
ACR_NAME="acreventagent$(openssl rand -hex 4)"  # Must be globally unique
CONTAINER_APP_NAME="ca-eventagent"
CONTAINER_APP_ENV="cae-eventagent"

# Create resource group
az group create --name $RESOURCE_GROUP --location $LOCATION
```

### 1.2 Create Azure Container Registry (ACR)

```bash
# Create ACR
az acr create \
  --resource-group $RESOURCE_GROUP \
  --name $ACR_NAME \
  --sku Basic \
  --admin-enabled true

# Get ACR credentials (save these for later)
az acr credential show --name $ACR_NAME
```

### 1.3 Create Container Apps Environment

```bash
# Create Container Apps environment
az containerapp env create \
  --name $CONTAINER_APP_ENV \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION
```

### 1.4 Build and Push Initial Image

```bash
# Clone this repo
git clone https://github.com/AndressaSiqueira/EventAgent.git
cd EventAgent

# Build and push to ACR
az acr build \
  --registry $ACR_NAME \
  --image eventagent-webhook:initial \
  --file Dockerfile .
```

### 1.5 Create Container App

```bash
# Get ACR login server
ACR_LOGIN_SERVER=$(az acr show --name $ACR_NAME --query loginServer -o tsv)
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query "passwords[0].value" -o tsv)

# Create Container App
az containerapp create \
  --name $CONTAINER_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --environment $CONTAINER_APP_ENV \
  --image "$ACR_LOGIN_SERVER/eventagent-webhook:initial" \
  --registry-server $ACR_LOGIN_SERVER \
  --registry-username $ACR_NAME \
  --registry-password $ACR_PASSWORD \
  --target-port 8080 \
  --ingress external \
  --min-replicas 0 \
  --max-replicas 3

# Get your app URL
az containerapp show \
  --name $CONTAINER_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query properties.configuration.ingress.fqdn -o tsv
```

Save the URL — this is your dashboard endpoint!

---

## Part 2: Azure DevOps Setup

### 2.1 Create Azure DevOps Project

1. Go to https://dev.azure.com
2. Create a new project (e.g., `EventAgent`)
3. Initialize with a Git repo

### 2.2 Create Service Connections

Navigate to **Project Settings → Service connections**

#### ACR Service Connection

1. Click **New service connection** → **Docker Registry**
2. Select **Azure Container Registry**
3. Choose your subscription and ACR
4. Name it: `EventAgent-ACR-SC`

#### Azure Resource Manager Service Connection

1. Click **New service connection** → **Azure Resource Manager**
2. Select **Service principal (automatic)**
3. Choose your subscription and resource group
4. Name it: `EventAgent-AzureRM-SC`

### 2.3 Push Code to Azure DevOps

```bash
# Add Azure DevOps as remote
git remote add azdo https://dev.azure.com/{YOUR_ORG}/{YOUR_PROJECT}/_git/{YOUR_REPO}

# Push
git push azdo main
```

### 2.4 Update Pipeline Variables

Edit `azure-pipelines.yml` with your values:

```yaml
variables:
  - name: containerRegistryServiceConnection
    value: EventAgent-ACR-SC              # Your ACR service connection name
  - name: azureSubscriptionServiceConnection
    value: EventAgent-AzureRM-SC          # Your Azure RM service connection name
  - name: acrLoginServer
    value: YOUR_ACR_NAME.azurecr.io       # Your ACR login server
  - name: resourceGroup
    value: rg-eventagent                  # Your resource group
  - name: containerAppName
    value: ca-eventagent                  # Your container app name
```

### 2.5 Create Pipeline

1. Go to **Pipelines → New Pipeline**
2. Select **Azure Repos Git**
3. Select your repository
4. Select **Existing Azure Pipelines YAML file**
5. Choose `/azure-pipelines.yml`
6. Run the pipeline to verify it works

### 2.6 Get Pipeline ID

After creating the pipeline, note the **Definition ID** from the URL:
```
https://dev.azure.com/{org}/{project}/_build?definitionId=7
                                                         ^
                                                    This number
```

---

## Part 3: Copilot Studio Setup

### 3.1 Create New Agent

1. Go to https://copilotstudio.microsoft.com
2. Create a new agent
3. Name it "Event Intelligence Agent"

### 3.2 Add Azure DevOps Connection

1. Go to **Settings → Connections**
2. Add **Azure DevOps** connector
3. Authenticate with your Azure DevOps account

### 3.3 Create the Workflow

Build a workflow with 3 nodes:

```
[Start] → [Agent] → [Queue a new build]
```

![Workflow](docs/workflow-screenshot.png)

#### Start Node
- Trigger: Manual or scheduled

#### Agent Node
Configure the AI agent with these instructions:

```
You are an Event Intelligence Agent that analyzes technology event signals and produces executive briefs.

Your output MUST be a valid JSON object with this exact structure:

{
  "event_name": "Event Name",
  "executive_brief": {
    "top_5_stories": [
      {
        "title": "Story title",
        "why_it_matters": "Business impact",
        "implication": "What to do about it"
      }
    ],
    "stories_by_solution_area": [
      {
        "solution_area": "Azure AI",
        "key_message": "Summary",
        "notable_signals": "Count or description"
      }
    ],
    "actions": {
      "SIs": ["Action for System Integrators"],
      "SDC_ISVs": ["Action for ISVs"]
    },
    "priority_notes": ["Urgent observation"]
  },
  "timestampUtc": "2026-06-10T15:30:00Z"
}

Output ONLY the JSON object. No markdown, no explanations.
```

#### Queue a new build Node

Configure the Azure DevOps action:

| Field | Value |
|-------|-------|
| **Project Name** | Your Azure DevOps project |
| **Definition Id** | Your pipeline ID (e.g., `7`) |
| **Source Branch** | `refs/heads/main` |

**Parameters** (Critical Expression):

```
{"agentPayload": "@{base64(body('Agent')?['result'])}"}
```

Or use the expression builder:
```
concat('{"agentPayload": "', base64(body('Agent')?['result']), '"}')
```

### 3.4 Test the Workflow

1. Click **Test** in Copilot Studio
2. Run the workflow
3. Check Azure DevOps for a new pipeline run
4. Visit your Container App URL at `/report`

---

## Part 4: Verify Your Setup

### Check Endpoints

```bash
# Health check
curl https://YOUR_APP.azurecontainerapps.io/health
# Expected: {"status":"ok"}

# View current state
curl https://YOUR_APP.azurecontainerapps.io/state

# View executive report (browser)
open https://YOUR_APP.azurecontainerapps.io/report
```

---

## Project Structure

```
├── src/
│   ├── server.js           # Express server with API endpoints
│   └── report-template.js  # Executive HTML template
├── docs/
│   ├── copilot-studio-setup.md   # Detailed Copilot Studio guide
│   └── workflow-screenshot.png   # Workflow diagram
├── azure-pipelines.yml     # CI/CD pipeline
├── Dockerfile              # Multi-stage Node.js container
└── package.json            # Dependencies
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Redirects to `/report` |
| `/report` | GET | Executive HTML dashboard |
| `/state` | GET | JSON payload and metadata |
| `/health` | GET | Health check |

## Customization

### Change Branding

Edit `src/report-template.js`:
- Logo text in `.logo-text .brand`
- Badge text in `.header-badge`
- Colors in CSS `:root` variables

### Add Knowledge Sources

In Copilot Studio, add knowledge sources to the Agent node:
- RSS feeds for tech news
- SharePoint sites with event materials
- Public websites

---

## Troubleshooting

### Pipeline fails with "unauthorized"

- Verify service connection permissions
- Check ACR admin credentials are enabled

### Report shows "No report available"

- Check `/state` endpoint for payload
- Verify agent outputs valid JSON
- Check pipeline logs for encoding issues

### Agent output not appearing

- Ensure `base64()` expression is used in Parameters
- Verify agent node outputs `result` property

---

## Architecture

```
┌─────────────────────┐
│   Copilot Studio    │
│       Agent         │
│  (AI Analysis)      │
└──────────┬──────────┘
           │ executive_brief JSON
           ▼
┌─────────────────────┐
│   base64() encode   │
│   in Parameters     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Azure DevOps      │
│   Pipeline          │
│   (Build & Deploy)  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Azure Container   │
│   Registry (ACR)    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Azure Container   │
│   Apps              │
│   (Dashboard Host)  │
└─────────────────────┘
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

MIT