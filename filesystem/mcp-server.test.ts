// tests/mcp-server.test.ts
import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

describe("MCP Server", () => {
  let serverProcess: ChildProcessWithoutNullStreams;
  let tempDir: string;
  let accumulatedStdout = "";
  let serverStdin: NodeJS.WritableStream;

  function sendRPCMessage(message: any): Promise<string> {
    return new Promise((resolve) => {
      accumulatedStdout = "";
      serverStdin.write(JSON.stringify(message) + "\n");

      setTimeout(() => {
        resolve(accumulatedStdout);
      }, 100);
    });
  }

  beforeAll(async () => {
    // Create a temporary directory and resolve its real path
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "mcp-server-test-"));
    tempDir = fs.realpathSync(tempDir); // <-- Ensure the real path is used

    // Create a sample file inside the temporary directory.
    const testFilePath = path.join(tempDir, "test.txt");
    fs.writeFileSync(testFilePath, "Hello, MCP server!", "utf-8");

    // Adjust the path to your built MCP server file.
    const serverScriptPath = path.resolve(__dirname, "./dist/index.js");

    serverProcess = spawn("node", [serverScriptPath, tempDir], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    serverStdin = serverProcess.stdin;

    serverProcess.stdout.on("data", (data: Buffer) => {
      accumulatedStdout += data.toString();
    });

    await new Promise((resolve) => {
      serverProcess.stderr.on("data", (data: Buffer) => {
        if (data.toString().includes("Secure MCP Filesystem Server running")) {
          resolve(null);
        }
      });
    });
  });

  afterAll(() => {
    if (serverProcess) serverProcess.kill();
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("should list allowed directories", async () => {
    const message = {
      jsonrpc: "2.0",
      method: "tools/call",
      params: {
        name: "list_allowed_directories",
      },
      id: 1,
    };

    const responseStr = await sendRPCMessage(message);
    const responseLine = responseStr.trim().split("\n").pop() || "";
    const response = JSON.parse(responseLine);

    expect(response.result.content[0].text).toContain(tempDir);
  });

  it("should read a file", async () => {
    const filePath = path.join(tempDir, "test.txt");

    const message = {
      jsonrpc: "2.0",
      method: "tools/call",
      params: {
        name: "read_file",
        arguments: { path: filePath },
      },
      id: 2,
    };

    const responseStr = await sendRPCMessage(message);
    const responseLine = responseStr.trim().split("\n").pop() || "";
    const response = JSON.parse(responseLine);

    expect(response.result.content[0].text).toBe("Hello, MCP server!");
  });

  it("should read a file with natural language", async () => {
    const filePath = path.join(tempDir, "test.txt");

    const message = `Read the complete contents of the file: '${filePath}'`;

    const responseStr = await sendRPCMessage(message);
    const responseLine = responseStr.trim().split("\n").pop() || "";
    const response = JSON.parse(responseLine);

    expect(response.result.content[0].text).toBe("Hello, MCP server!");
  });

  it("should write a file", async () => {
    const filePath = path.join(tempDir, "output.txt");
    const content = "Written by test";

    const message = {
      jsonrpc: "2.0",
      method: "tools/call",
      params: {
        name: "write_file",
        arguments: { path: filePath, content },
      },
      id: 3,
    };

    await sendRPCMessage(message);

    const writtenContent = fs.readFileSync(filePath, "utf-8");
    expect(writtenContent).toBe(content);
  });
});
