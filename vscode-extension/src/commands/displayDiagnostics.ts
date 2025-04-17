import * as vscode from "vscode";
import { analyzeVariableName } from "./mcpAnalyzeVariableName";

function convertToDiagnostic(raw: {
  text: string;
  range: {
    start: { line: number; character: number };
    end: { line: number; character: number };
  };
  severity: "error" | "warning" | "information" | "hint";
}): vscode.Diagnostic {
  const severityMap: Record<string, vscode.DiagnosticSeverity> = {
    error: vscode.DiagnosticSeverity.Error,
    warning: vscode.DiagnosticSeverity.Warning,
    information: vscode.DiagnosticSeverity.Information,
    hint: vscode.DiagnosticSeverity.Hint,
  };

  return {
    message: raw.text,
    range: new vscode.Range(
      new vscode.Position(raw.range.start.line, raw.range.start.character),
      new vscode.Position(raw.range.end.line, raw.range.end.character)
    ),
    severity: severityMap[raw.severity],
  };
}

export async function displayDiagnostics() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("No active editor found.");
    return;
  }

  const document = editor.document;

  const diagnostics = await analyzeVariableName(document);
  const mappedDiagnostics = diagnostics.map(convertToDiagnostic);

  const diagnosticCollection =
    vscode.languages.createDiagnosticCollection("commentChecker");

  if (diagnostics !== null)
    diagnosticCollection.set(document.uri, mappedDiagnostics);
}
