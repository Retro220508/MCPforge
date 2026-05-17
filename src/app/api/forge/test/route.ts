import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomBytes } from 'crypto';

const execAsync = promisify(exec);

/**
 * POST /api/forge/test
 * 
 * Test a generated MCP server by executing it with sample input
 * 
 * Request body:
 * {
 *   "code": "string - the TypeScript code to test",
 *   "toolName": "string - the tool to invoke",
 *   "toolArgs": "object - arguments for the tool"
 * }
 */

interface TestRequest {
  code: string;
  toolName: string;
  toolArgs: Record<string, any>;
}

interface TestResult {
  success: boolean;
  output?: string;
  error?: string;
  executionTime: number;
  toolResponse?: any;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let tempDir: string | null = null;
  let tempFile: string | null = null;

  try {
    const body: TestRequest = await request.json();
    const { code, toolName, toolArgs } = body;

    // Validate inputs
    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Code is required and must be a string' },
        { status: 400 }
      );
    }

    if (!toolName || typeof toolName !== 'string') {
      return NextResponse.json(
        { error: 'Tool name is required and must be a string' },
        { status: 400 }
      );
    }

    // Create a temporary directory for the test
    const testId = randomBytes(16).toString('hex');
    tempDir = join(tmpdir(), `mcp-test-${testId}`);
    await mkdir(tempDir, { recursive: true });

    // Write the code to a temporary file
    tempFile = join(tempDir, 'server.ts');
    await writeFile(tempFile, code, 'utf-8');

    // Create a test client script that will invoke the tool
    const testClientCode = `
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';

async function testServer() {
  try {
    // Start the server process
    const serverProcess = spawn('tsx', ['${tempFile.replace(/\\/g, '\\\\')}'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Create client transport
    const transport = new StdioClientTransport({
      command: 'tsx',
      args: ['${tempFile.replace(/\\/g, '\\\\')}']
    });

    // Create client
    const client = new Client({
      name: 'test-client',
      version: '1.0.0'
    }, {
      capabilities: {}
    });

    // Connect to server
    await client.connect(transport);

    // List available tools
    const toolsList = await client.request({
      method: 'tools/list'
    }, {});

    console.log('Available tools:', JSON.stringify(toolsList));

    // Call the specified tool
    const result = await client.request({
      method: 'tools/call',
      params: {
        name: '${toolName}',
        arguments: ${JSON.stringify(toolArgs)}
      }
    }, {});

    console.log('Tool result:', JSON.stringify(result));

    // Close connection
    await client.close();
    serverProcess.kill();

    process.exit(0);
  } catch (error) {
    console.error('Test error:', error.message);
    process.exit(1);
  }
}

testServer();
`;

    const testClientFile = join(tempDir, 'test-client.ts');
    await writeFile(testClientFile, testClientCode, 'utf-8');

    // Execute the test with a timeout
    const timeout = 10000; // 10 seconds
    let output = '';
    let error = '';

    try {
      const { stdout, stderr } = await execAsync(
        `npx tsx "${testClientFile}"`,
        {
          cwd: tempDir,
          timeout,
          env: {
            ...process.env,
            NODE_ENV: 'test'
          }
        }
      );

      output = stdout;
      error = stderr;

      // Parse the output to extract tool result
      let toolResponse = null;
      const toolResultMatch = output.match(/Tool result: ({.*})/);
      if (toolResultMatch) {
        try {
          toolResponse = JSON.parse(toolResultMatch[1]);
        } catch (e) {
          // Could not parse tool result
        }
      }

      const executionTime = Date.now() - startTime;

      return NextResponse.json({
        success: true,
        output,
        error: error || undefined,
        executionTime,
        toolResponse,
        message: 'Test executed successfully'
      });

    } catch (execError: any) {
      const executionTime = Date.now() - startTime;

      // Check if it's a timeout
      if (execError.killed && execError.signal === 'SIGTERM') {
        return NextResponse.json({
          success: false,
          error: 'Test execution timed out (10s limit)',
          executionTime,
          output: execError.stdout || '',
        }, { status: 408 });
      }

      // Other execution errors
      return NextResponse.json({
        success: false,
        error: execError.message || 'Test execution failed',
        executionTime,
        output: execError.stdout || '',
        stderr: execError.stderr || '',
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Test API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to execute test',
        details: error instanceof Error ? error.message : 'Unknown error',
        executionTime: Date.now() - startTime
      },
      { status: 500 }
    );
  } finally {
    // Cleanup: Remove temporary files
    if (tempFile) {
      try {
        await unlink(tempFile);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    if (tempDir) {
      try {
        await unlink(join(tempDir, 'test-client.ts'));
        await unlink(tempDir);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }
}

/**
 * GET /api/forge/test
 * 
 * Get information about the test endpoint
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/forge/test',
    method: 'POST',
    description: 'Test a generated MCP server by executing it with sample input',
    parameters: {
      code: 'string - The TypeScript code to test',
      toolName: 'string - The tool to invoke',
      toolArgs: 'object - Arguments for the tool'
    },
    limits: {
      timeout: '10 seconds',
      maxCodeSize: '1MB'
    }
  });
}

// Made with Bob