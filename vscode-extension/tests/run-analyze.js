#!/usr/bin/env node
// This script calls our TypeScript function to analyze comments

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get file path from command line args
const filePath = process.argv[2];

if (!filePath) {
  console.error('Please provide a file path');
  process.exit(1);
}

// Read the file content
const fileContent = fs.readFileSync(filePath, 'utf8');

// Create a temporary TypeScript file that calls our function
const tempTsFile = path.join(__dirname, 'temp-analysis.ts');

const scriptContent = `
import { analyzeRedundantComments } from '../src/commands/mcpAnalyzeFunctionComment';

async function main() {
  try {
    const fileContent = \`${fileContent.replace(/`/g, '\\`')}\`;
    const result = await analyzeRedundantComments(fileContent);
    console.log(result);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main().catch(console.error);
`;

fs.writeFileSync(tempTsFile, scriptContent);

try {
  // Execute the TypeScript file
  const result = execSync(`npx ts-node ${tempTsFile}`, { 
    cwd: path.join(__dirname, '..'),
    stdio: 'pipe'
  });
  
  console.log(result.toString());
} catch (error) {
  console.error('Error executing TypeScript:', error.message);
  process.exit(1);
} finally {
  // Clean up
  fs.unlinkSync(tempTsFile);
} 