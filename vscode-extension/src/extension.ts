import * as dotenv from "dotenv";
// Load environment variables from .env file
dotenv.config();
import * as vscode from "vscode";
import { mcpHandleAnalyzeVariableNameCommand } from "./commands/mcpAnalyzeVariableName";
import { ollamaHandleAnalyzeVariableNameCommand } from "./commands/ollamaAnalyzeVariableName";
import { mcpHandleReviewGherkinCommand } from "./commands/gherkinReview";

// This method is called when your extension is activated.
export function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "ollama-vscode-ext-template" is now active!'
  );

  // Register the command using the extracted handler.
  const disposables = [];
  disposables.push(
    vscode.commands.registerCommand(
      "ollama-vscode-ext-template.mcp-analyze-variable-name",
      mcpHandleAnalyzeVariableNameCommand
    )
  );
  disposables.push(
    vscode.commands.registerCommand(
      "ollama-vscode-ext-template.ollama-analyze-variable-name",
      ollamaHandleAnalyzeVariableNameCommand
    )
  );
  disposables.push(
    vscode.commands.registerCommand(
      "ollama-vscode-ext-template.mcp-review_gherkin", 
      mcpHandleReviewGherkinCommand)
  );

  for (let disposable of disposables) context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated.
export function deactivate() {}
