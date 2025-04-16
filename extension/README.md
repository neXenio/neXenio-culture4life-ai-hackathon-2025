# MCP-LLM Bridge

A TypeScript implementation that connects local LLMs (via Ollama) to Model Context Protocol (MCP) servers. This bridge allows open-source models to use the same tools and capabilities as Claude, enabling powerful local AI assistants.

## Overview

This project bridges local Large Language Models with MCP servers that provide various capabilities like:
- Filesystem operations

The bridge translates between the LLM's outputs and the MCP's JSON-RPC protocol, allowing any Ollama-compatible model to use these tools just like Claude does.

## Current Setup

- **LLM**: Using Qwen 2.5 7B (qwen2.5-coder:7b-instruct) through Ollama
- **MCPs**:
  - Filesystem operations (`@modelcontextprotocol/server-filesystem`)
  - Brave Search (`@modelcontextprotocol/server-brave-search`)
  - GitHub (`@modelcontextprotocol/server-github`)
  - Memory (`@modelcontextprotocol/server-memory`)
  - Flux image generation (`@patruff/server-flux`)
  - Gmail & Drive (`@patruff/server-gmail-drive`)

## Architecture

- **Bridge**: Core component that manages tool registration and execution
- **LLM Client**: Handles Ollama interactions and formats tool calls
- **MCP Client**: Manages MCP server connections and JSON-RPC communication
- **Tool Router**: Routes requests to appropriate MCP based on tool type

### Key Features
- Multi-MCP support with dynamic tool routing
- Structured output validation for tool calls
- Automatic tool detection from user prompts
- Robust process management for Ollama
- Detailed logging and error handling

## Setup

1. Install Ollama and required model:
```bash
ollama pull qwen2.5-coder:7b-instruct
```
[docker]
```bash
docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama

docker exec -it ollama ollama pull qwen2.5-coder:7b-instruct
```

2. Configure credentials:
   - Set the first `args` on `bridge_config.json` to point to your filesystem executable
   - Set the directory that the filesystem is allowed to access in the `allowedDirectory` argument

## Configuration

The bridge is configured through `bridge_config.json`:
- MCP server definitions
- LLM settings (model, temperature, etc.)
- Tool permissions and paths

Example:
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "node",
      "args": ["path/to/server-filesystem/dist/index.js"],
      "allowedDirectory": "workspace/path"
    },
    // ... other MCP configurations
  },
  "llm": {
    "model": "qwen2.5-coder:7b-instruct",
    "baseUrl": "http://localhost:11434"
  }
}
```

## Usage

1. Start the extension:
– Open the debug tab on vscode
– Click on Run Extension

### Response Processing

Responses are processed through multiple stages:
1. LLM generates structured tool calls
2. Bridge validates and routes to appropriate MCP
3. MCP executes operation and returns result
4. Bridge formats response for user

## Extended Capabilities
This bridge effectively brings Claude's tool capabilities to local models:
- Filesystem manipulation

All while running completely locally with open-source models.

## Related Projects

This bridge integrates with the broader Claude ecosystem:
- Model Context Protocol (MCP)
- Claude Desktop Configuration
- Ollama Project
– Ollama MCP Bridge
- Various MCP server implementations

The result is a powerful local AI assistant that can match many of Claude's capabilities while running entirely on your own hardware.
