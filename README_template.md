# AI Assistant Hackathon 2025

Welcome to the hackathon. In this repo you'll find the 


## Ollama

Ollama is a lightweight tool that lets you run large language models (LLMs) locally on your computer.

### Setup

1. Install Ollama and required model:
```bash
ollama pull qwen2.5-coder:7b-instruct

```
[docker]
```bash
docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama

docker exec -it ollama ollama pull qwen2.5-coder:7b-instruct
```

## VSCode Extension

The `vscode-extension` contains an extension that runs a command that copies a few editor lines and feed them to a LLM.
The main parts of the extension are the `extension.ts` initialization script, `mcp-client` which setups the tools and communication with the MCP servers, and the `commands` folder which defines the extension's features.

### Setup

1. Go inside the `vscode-extension` dir and run `npm install`:

```bash 
cd vscode-extension
npm install
```


## Filesystem

### Setup

1. Go inside the `filesystem` dir and run `npm install`:

```bash 
cd filesystem
npm install
```

2. To watch for changes run:

```bash
npm run watch
```
