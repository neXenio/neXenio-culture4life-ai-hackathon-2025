import * as dotenv from "dotenv";
// Load environment variables from .env file
dotenv.config();
import * as vscode from "vscode";
import { mcpHandleAnalyzeVariableNameCommand } from "./commands/mcpAnalyzeVariableName";
import { ollamaHandleAnalyzeVariableNameCommand } from "./commands/ollamaAnalyzeVariableName";
import { mcpHandleAnalyzeFunctionCommentCommand } from "./commands/mcpAnalyzeFunctionComment";

// This method is called when your extension is activated.
export function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "ollama-vscode-ext-template" is now active!'
  );

  // Register the command using the extracted handler.
  const disposables = [];
  
  // Debug logging for command registration
  console.log("Registering commands...");
  
  disposables.push(
    vscode.commands.registerCommand(
      "ollama-vscode-ext-template.mcp-analyze-variable-name",
      mcpHandleAnalyzeVariableNameCommand
    )
  );
  console.log("Registered mcp-analyze-variable-name command");
  
  disposables.push(
    vscode.commands.registerCommand(
      "ollama-vscode-ext-template.ollama-analyze-variable-name",
      ollamaHandleAnalyzeVariableNameCommand
    )
  );
  console.log("Registered ollama-analyze-variable-name command");
  
  disposables.push(
    vscode.commands.registerCommand(
      "ollama-vscode-ext-template.mcp-analyze-function-comment",
      mcpHandleAnalyzeFunctionCommentCommand
    )
  );
  console.log("Registered mcp-analyze-function-comment command");

  for (let disposable of disposables) context.subscriptions.push(disposable);
  console.log("All commands registered successfully");
}

// This method is called when your extension is deactivated.
export function deactivate() {}
