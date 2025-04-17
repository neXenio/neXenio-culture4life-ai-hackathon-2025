import * as vscode from "vscode";
import * as dotenv from "dotenv";
dotenv.config();

import { MCPLLMBridge } from "../mcp-client/bridge";
import { loadBridgeConfig } from "../mcp-client/config";
import { BridgeConfig } from "../mcp-client/types";
import { logger } from "../mcp-client/logger";

/**
 * Handles the 'gherkinReview' command.
 * It extracts the current document and analyzes it in the context of all other .feature files in the workspace folder. 
 */
export async function mcpHandleReviewGherkinCommand(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("No active editor found.");
    return;
  }

  const document = editor.document;
  console.log("Current document:", document);

  try {
    const reviewResults = await reviewGherkin(
      document
    );
    if (reviewResults) {
      vscode.window.showInformationMessage(
        `Review Results: ${reviewResults}`
      );
    } else {
      vscode.window.showInformationMessage(
        `Document "${document.fileName}" is good as is.`
      );
    }
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to call LLM: ${error}`);
  }
}

/**
 * Analyze a gherkin file by sending a prompt to the local LLM via Ollama.
 *
 * @param document - The VS Code text document.
 * 
 * @returns A promise that resolves with the suggestion (string or null) from the LLM.
 */
export async function reviewGherkin(
  document: vscode.TextDocument,
): Promise<string | null> {
  const prompt = preparePrompt(document);

  // Initialize the Ollama client.
  try {
    const response = await MCPreviewGherkin(prompt);

    // Log and parse the JSON output.
    console.log("Response from LLM:", response);
    if (!response) {
      throw new Error("Empty response from LLM");
    }
    const result = JSON.parse(response);
    return result.suggestion || null;
  } catch (error) {
    vscode.window.showErrorMessage(`Error analyzing variable name: ${error}`);
    return null;
  }
}

/*
 * Prepares the prompt to be sent to the LLM.
 *
 * @param document - The VS Code text document.
 * 
 * @returns The prepared prompt string.
 */
function preparePrompt(
  document: vscode.TextDocument,
): string {
  return `You are an API that returns precise and professional responses in a JSON format. Only respond with JSON, and nothing else.
  Based on the Gherkin document {document} below and the allowed dir files you have,
  also understanding that this is a vscode extension MCP project,
  analyze if the document conforms to the style and naming conventions of the allowed dir files and suggest corrections if not.
  The resulting array should only contain individual objects for suggestions, if a line of the document is bad.

  {document}
  ${document.fileName}:
  ${document.getText()}
  
  Do not output anything else other than a JSON array, with one object per suggestion of the following format:
  {"line": number, "actual text": string, "suggested text": string }`;
}

/**
 * Creates and configures a bridge instance with the given config
 */
async function createConfiguredBridge(): Promise<MCPLLMBridge> {
  const configFile = await loadBridgeConfig();

  // Create bridge config with all MCPs
  const bridgeConfig: BridgeConfig = {
    mcpServer: configFile.mcpServers.filesystem, // Primary MCP
    mcpServerName: "filesystem",
    mcpServers: configFile.mcpServers, // All MCPs including Flux
    llmConfig: configFile.llm!,
    systemPrompt: configFile.systemPrompt,
  };

  logger.info(
    "Initializing bridge with MCPs:",
    Object.keys(configFile.mcpServers).join(", ")
  );

  const bridge = new MCPLLMBridge(bridgeConfig);
  const initialized = await bridge.initialize();

  if (!initialized) {
    throw new Error("Failed to initialize bridge");
  }

  return bridge;
}

export async function MCPreviewGherkin(
  prompt: string
): Promise<string | undefined> {
  try {
    const bridge = await createConfiguredBridge();

    try {
      logger.info("Processing user input...");
      logger.info("Prompt:", prompt);
      const response = await bridge.processMessage(prompt);
      logger.info("Received response from bridge");
      logger.info("Response:", response);
      return response;
    } catch (error: any) {
      logger.error(`Error occurred: ${error?.message || String(error)}`);
    }
  } catch (error: any) {
    logger.error(`Fatal error: ${error?.message || String(error)}`);
  }
}
