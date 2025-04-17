import * as vscode from "vscode";
import * as dotenv from "dotenv";
dotenv.config();

import { MCPLLMBridge } from "../mcp-client/bridge";
import { loadBridgeConfig } from "../mcp-client/config";
import { BridgeConfig } from "../mcp-client/types";
import { logger } from "../mcp-client/logger";

/**
 * Handles the 'analyzeFunctionComment' command.
 * It extracts the function and its comment from the document and initiates the analysis.
 */
export async function mcpHandleAnalyzeFunctionCommentCommand(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("No active editor found.");
    return;
  }

  const document = editor.document;
  const cursorPosition = editor.selection.active;
  const currentLine = cursorPosition.line;

  const functionMatch = findFunctionMatch(document, currentLine);
  if (!functionMatch) {
    vscode.window.showErrorMessage(
      "No function declaration with comments found in the file."
    );
    return;
  }

  try {
    const analysis = await analyzeFunctionComment(
      document,
      functionMatch,
      functionMatch.line
    );
    
    if (analysis) {
      const message = [
        analysis.isCommentNecessary ? "Comment is necessary." : "Comment is not necessary.",
        analysis.suggestedFunctionName ? `Suggested function name: ${analysis.suggestedFunctionName}` : "Current function name is good."
      ].join("\n");
      
      vscode.window.showInformationMessage(message);
    }
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to analyze function comment: ${error}`);
  }
}

/**
 * Searches the entire file for a function declaration with comments.
 *
 * @param document - The VS Code text document.
 * @param currentLine - The current line number in the document (used as a starting point).
 * @returns Object containing the function name, comment, and line number if found, otherwise null.
 */
function findFunctionMatch(
  document: vscode.TextDocument,
  currentLine: number
): { functionName: string; comment: string; line: number } | null {
  // Search through all lines in the document
  for (let i = 0; i < document.lineCount - 1; i++) {
    const lineText = document.lineAt(i).text;
    const nextLineText = document.lineAt(i + 1).text;
    
    // Check if current line is a comment and next line is a function declaration
    if (lineText.trim().startsWith('//') && 
        (nextLineText.includes('function') || nextLineText.includes('async function'))) {
      
      // Extract the comment text (remove the // prefix and trim)
      const comment = lineText.trim().substring(2).trim();
      
      // Extract the function name using regex
      const functionMatch = nextLineText.match(/(?:async\s+)?function\s+(\w+)/);
      if (functionMatch && functionMatch[1]) {
        return {
          functionName: functionMatch[1],
          comment: comment,
          line: i + 1
        };
      }
    }
  }
  
  return null;
}

/**
 * Analyze a function's comment and name by sending a prompt to the local LLM via Ollama.
 *
 * @param document - The VS Code text document.
 * @param functionMatch - The RegExp match array containing the function info.
 * @param currentLine - The current line number where the function is declared.
 * @returns A promise that resolves with the analysis result.
 */
export async function analyzeFunctionComment(
  document: vscode.TextDocument,
  functionMatch: { functionName: string; comment: string; line: number },
  currentLine: number
): Promise<{ isCommentNecessary: boolean; suggestedFunctionName: string | null } | null> {
  const prompt = preparePrompt(document, functionMatch, currentLine);

  try {
    const response = await MCPanalyzeFunctionComment(prompt);
    console.log("Response from LLM:", response);
    
    if (!response) {
      throw new Error("Empty response from LLM");
    }
    
    const result = JSON.parse(response);
    return {
      isCommentNecessary: result.isCommentNecessary,
      suggestedFunctionName: result.suggestedFunctionName || null
    };
  } catch (error) {
    vscode.window.showErrorMessage(`Error analyzing function comment: ${error}`);
    return null;
  }
}

/**
 * Prepares the prompt to be sent to the LLM.
 */
function preparePrompt(
  document: vscode.TextDocument,
  functionMatch: { functionName: string; comment: string; line: number },
  currentLine: number
): string {
  const comment = functionMatch.comment;
  const functionName = functionMatch.functionName;

  // Get the function body
  const functionBody = getFunctionBody(document, functionMatch.line);

  return `You are an API that returns responses in a JSON format. Only respond with JSON, and nothing else.
  Analyze the following function and its comment:
  
  Function Name: ${functionName}
  Comment: ${comment}
  Function Body: ${functionBody}
  
  Determine if the comment is necessary and if the function name could be improved to be more descriptive.
  Consider that:
  1. Comments should only be necessary if the function's purpose isn't clear from its name and implementation
  2. Function names should be self-descriptive and follow best practices
  
  Return a JSON object with:
  {
    "isCommentNecessary": boolean,
    "suggestedFunctionName": string | null
  }`;
}

/**
 * Gets the function body from the document.
 */
function getFunctionBody(
  document: vscode.TextDocument,
  startLine: number
): string {
  let body = "";
  let braceCount = 0;
  let i = startLine;

  while (i < document.lineCount) {
    const line = document.lineAt(i).text;
    body += line + "\n";
    
    braceCount += (line.match(/{/g) || []).length;
    braceCount -= (line.match(/}/g) || []).length;
    
    if (braceCount === 0) {
      break;
    }
    i++;
  }

  return body;
}

/**
 * Creates and configures a bridge instance with the given config
 */
async function createConfiguredBridge(): Promise<MCPLLMBridge> {
  const configFile = await loadBridgeConfig();

  const bridgeConfig: BridgeConfig = {
    mcpServer: configFile.mcpServers.filesystem,
    mcpServerName: "filesystem",
    mcpServers: configFile.mcpServers,
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

export async function MCPanalyzeFunctionComment(
  prompt: string
): Promise<string | undefined> {
  try {
    const bridge = await createConfiguredBridge();
    const initialized = await bridge.initialize();

    if (!initialized) {
      throw new Error("Failed to initialize bridge");
    }

    try {
      logger.info("Processing function analysis...");
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

/**
 * Analyzes a file's comments and identifies redundant ones
 * 
 * @param fileContent The content of the file to analyze
 * @returns A JSON string with the analysis result including removedComments and modifiedCode
 */
export async function analyzeRedundantComments(
  fileContent: string
): Promise<string | undefined> {
  const prompt = `You are an API that returns responses in a JSON format. Only respond with JSON, and nothing else.
  Analyze the following code and identify comments that are redundant and should be removed.
  A comment is redundant if:
  1. It simply repeats what the code already clearly expresses
  2. It contains outdated or incorrect information
  3. It states the obvious that any programmer would know
  
  Here is the code to analyze:
  
  ${fileContent}
  
  Return a JSON with:
  {
    "removedComments": [line_numbers_of_comments_to_remove],
    "modifiedCode": "code with redundant comments removed"
  }`;

  try {
    const response = await MCPanalyzeFunctionComment(prompt);
    return response;
  } catch (error) {
    logger.error(`Error analyzing redundant comments: ${error}`);
    return undefined;
  }
} 