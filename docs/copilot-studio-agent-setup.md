# Copilot Studio Agent Setup

Este guia descreve como configurar o agente no Copilot Studio para acionar a pipeline do Azure DevOps e quais dados enviar no body da requisicao.

## Objetivo

O agente deve coletar o contexto da conversa, montar um payload JSON e chamar a pipeline `AgentOps-ContainerApp-CI` no Azure DevOps.

A pipeline criada neste projeto tem:

- Nome: `AgentOps-ContainerApp-CI`
- ID: `7`
- Projeto Azure DevOps: `AgentOps`
- Relative URI: `/AgentOps/_apis/pipelines/7/runs?api-version=7.1`

## O que configurar no Copilot Studio

Use a action `Send an HTTP request to Azure DevOps` com estes campos.

### Connection

- Organization Name: `ansiqueira0239`

### Parameters

- Method: `POST`
- Relative URI: `/AgentOps/_apis/pipelines/7/runs?api-version=7.1`

### Headers

- `Content-Type`: `application/json`

## Body da requisicao

O Azure DevOps espera o body no formato abaixo porque a pipeline usa `templateParameters.agentPayload`.

```json
{
  "templateParameters": {
    "agentPayload": "{\"source\":\"copilot-studio\",\"conversationId\":\"...\",\"userId\":\"...\",\"message\":\"...\",\"action\":\"refresh\"}"
  }
}
```

Observacao importante:

- `agentPayload` precisa ser uma string JSON escapada.
- A pipeline recebe essa string, converte em base64 e grava em `COPILOT_AGENT_PAYLOAD_B64` no Container App.

## Campos recomendados para enviar

Estes sao os campos mais uteis para a integracao inicial.

```json
{
  "source": "copilot-studio",
  "conversationId": "string",
  "userId": "string",
  "message": "string",
  "action": "refresh",
  "timestampUtc": "2026-06-09T21:00:00Z"
}
```

Descricao sugerida:

- `source`: identifica a origem do evento
- `conversationId`: correlacao da conversa
- `userId`: usuario que acionou o agente
- `message`: ultima mensagem do usuario
- `action`: operacao desejada no deploy ou atualizacao
- `timestampUtc`: horario do envio

## Instrucoes do agente

Use estas instrucoes no agente do Copilot Studio.

```text
Voce e um agente operacional responsavel por disparar atualizacoes no Azure DevOps para o projeto AgentOps.

Quando o usuario pedir para publicar, atualizar, sincronizar, redeployar ou refrescar o ambiente, voce deve:
1. Identificar a intencao operacional.
2. Coletar o contexto minimo da solicitacao.
3. Montar um payload JSON com source, conversationId, userId, message, action e timestampUtc.
4. Chamar a action do Azure DevOps que executa a pipeline AgentOps-ContainerApp-CI.
5. Confirmar ao usuario que a solicitacao foi enviada.

Regras:
- Nunca invente valores tecnicos se o usuario nao informou; use o contexto da conversa.
- Use action=refresh como padrao quando o usuario pedir atualizacao generica.
- Se faltar contexto critico, pergunte antes de chamar a pipeline.
- Seja objetivo ao informar sucesso ou falha.
```

## Configuracao recomendada da action

Nome sugerido da action no Copilot Studio:

- `Run AgentOps Azure DevOps Pipeline`

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
