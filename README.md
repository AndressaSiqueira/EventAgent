# AgentOps

Pipeline no Azure DevOps para receber dados do agente do Copilot Studio e atualizar uma aplicacao no Azure Container Apps.

## Por que Azure Container Apps (em vez de Web App)

Para este caso de uso (eventos/webhook + deploy frequente), Azure Container Apps e a melhor opcao porque:

1. Trabalha nativamente com imagens Docker e revisoes.
2. Facilita rollback por revisao.
3. Escala melhor para carga variavel de eventos.
4. Atualizacao por pipeline e direta com `az containerapp update`.

## Estrutura

- `src/server.js`: receptor HTTP para eventos do Copilot Studio.
- `Dockerfile`: imagem da aplicacao Node.js.
- `azure-pipelines.yml`: build, push e deploy para Container Apps.
- `docs/copilot-studio-agent-setup.md`: configuracao do agente, action HTTP e body enviado ao Azure DevOps.

## Pre-requisitos

1. Um Azure Container Registry (ACR).
2. Um Azure Container App criado.
3. Service Connections no Azure DevOps:
	 - `containerRegistryServiceConnection`
	 - `azureSubscriptionServiceConnection`
4. Variaveis de pipeline configuradas:
	 - `acrLoginServer` (ex.: `meuacr.azurecr.io`)
	 - `resourceGroup`
	 - `containerAppName`

## Como o fluxo funciona

1. O Copilot Studio (normalmente via Power Automate) chama a API de run do pipeline no Azure DevOps.
2. O payload do agente e enviado em `templateParameters.agentPayload`.
3. O pipeline:
	 - builda e publica imagem no ACR
	 - atualiza o Container App com a nova imagem
	 - grava o payload em base64 na variavel de ambiente `COPILOT_AGENT_PAYLOAD_B64`

## Exemplo de chamada da execucao do pipeline

Use um token com permissao de executar pipeline no Azure DevOps.

```bash
curl -X POST "https://dev.azure.com/{organization}/{project}/_apis/pipelines/{pipelineId}/runs?api-version=7.1" \
	-H "Content-Type: application/json" \
	-H "Authorization: Basic $(printf ":%s" "$AZDO_PAT" | base64)" \
	-d '{
		"templateParameters": {
			"agentPayload": "{\"conversationId\":\"abc-123\",\"action\":\"refresh\"}"
		}
	}'
```

## Rodando localmente

```bash
npm install
npm start
```

Endpoints:

- `GET /health`
- `GET /state`
- `POST /agent-event`

Se definir `AGENT_SHARED_SECRET`, envie o header `x-agent-secret` no `POST /agent-event`.