import * as vscode from "vscode";
import * as dotenv from "dotenv";
dotenv.config();

import { MCPLLMBridge } from "../mcp-client/bridge";
import { loadBridgeConfig } from "../mcp-client/config";
import { BridgeConfig } from "../mcp-client/types";
import { logger } from "../mcp-client/logger";

/**
 * Handles the 'analyzeVariableName' command.
 * It extracts the variable match from the document and initiates the analysis.
 */
export async function mcpHandleAnalyzeVariableNameCommand(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("No active editor found.");
    return;
  }

  const document = editor.document;
  const cursorPosition = editor.selection.active;
  const currentLine = cursorPosition.line;
  console.log("Current line:", currentLine);

  const variableMatch = findVariableMatch(document, currentLine);
  if (!variableMatch) {
    vscode.window.showErrorMessage(
      "No variable declaration found in the last 20 lines."
    );
    return;
  }

  try {
    const suggestion = await analyzeVariableName(
      document,
      variableMatch,
      currentLine
    );
    if (suggestion) {
      vscode.window.showInformationMessage(
        `Suggested variable name: ${suggestion}`
      );
    } else {
      vscode.window.showInformationMessage(
        `Variable name "${variableMatch[2]}" is good as is.`
      );
    }
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to call LLM: ${error}`);
  }
}

/**
 * Searches backwards up to 20 lines from the current line for a variable declaration.
 *
 * @param document - The VS Code text document.
 * @param currentLine - The current line number in the document.
 * @returns The RegExp match array if a variable declaration is found, otherwise null.
 */
function findVariableMatch(
  document: vscode.TextDocument,
  currentLine: number
): RegExpMatchArray | null {
  for (let i = currentLine; i >= Math.max(0, currentLine - 20); i--) {
    const lineText = document.lineAt(i).text;
    const regex = /\b(let|const|var)\s+(\w+)\s*=\s*(.+)/;
    const match = regex.exec(lineText);
    if (match) {
      return match;
    }
  }
  return null;
}

/**
 * Analyze a variable name by sending a prompt to the local LLM via Ollama.
 *
 * @param document - The VS Code text document.
 * @param variableMatch - The RegExp match array containing the variable info.
 *                        Assumes the variable name is at index 2 and the value at index 3.
 * @param currentLine - The current line number where the variable is declared.
 * @returns A promise that resolves with the suggestion (string or null) from the LLM.
 */
export async function analyzeVariableName(
  document: vscode.TextDocument,
  variableMatch: RegExpMatchArray,
  currentLine: number
): Promise<string | null> {
  const prompt = preparePrompt(document, variableMatch, currentLine);

  // Initialize the Ollama client.
  try {
    const response = await MCPanalyzeVariableName(prompt);

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

/**
 * Prepares the prompt to be sent to the LLM.
 *
 * @param document - The VS Code text document.
 * @param variableMatch - The RegExp match array containing the variable details.
 *                        Assumes the variable name is at index 2 and the value at index 3.
 * @param currentLine - The line number where the variable is declared.
 * @returns The prepared prompt string.
 */
function preparePrompt(
  document: vscode.TextDocument,
  variableMatch: RegExpMatchArray,
  currentLine: number
): string {
  const variableName = variableMatch[2];
  const variableValue = variableMatch[3].trim();

  // Gather context: previous 20 lines (or up to the beginning of the document)
  const contextStartLine = Math.max(0, currentLine - 20);
  const contextLines: string[] = [];
  for (let i = contextStartLine; i <= currentLine; i++) {
    contextLines.push(document.lineAt(i).text);
  }
  const contextText = contextLines.join("\n");

  return `You are an API that returns responses in a JSON format. Only respond with JSON, and nothing else.
  Based on the variable {variable} below and the previous 20 lines of code on the context {context}, and the allowed dir files you have, also understanding that this is a vscode extension MCP project, analyze if the variable name semantically represents what value the variable is carrying and suggest a new name if not. The object should only return the new suggested variable name if the previous name is bad.
  
  {variable}
  Name: ${variableName}
  Value: ${variableValue}
  
  {context}
  ${contextText}
  
  Do not output anything else other than the JSON object:
  {"suggestion": string | null }`;
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

export async function MCPanalyzeVariableName(
  prompt: string
): Promise<string | undefined> {
  try {
    const bridge = await createConfiguredBridge();
    const initialized = await bridge.initialize();

    if (!initialized) {
      throw new Error("Failed to initialize bridge");
    }

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
