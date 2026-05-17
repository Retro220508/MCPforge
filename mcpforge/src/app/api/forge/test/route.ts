import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink, mkdir, rm } from 'fs/promises';
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
 * Improved with better error handling and environment setup
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
  errorType?: 'code' | 'runtime' | 'environment' | 'timeout' | 'unknown';
  executionTime: number;
  toolResponse?: any;
  environmentIssues?: string[];
  suggestions?: string[];
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let tempDir: string | null = null;
  let tempFile: string | null = null;
  let testClientFile: string | null = null;

  try {
    const body: TestRequest = await request.json();
    const { code, toolName, toolArgs } = body;

    // Validate inputs
    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { 
          error: 'Code is required and must be a string',
          errorType: 'code',
        },
        { status: 400 }
      );
    }

    if (!toolName || typeof toolName !== 'string') {
      return NextResponse.json(
        { 
          error: 'Tool name is required and must be a string',
          errorType: 'code',
        },
        { status: 400 }
      );
    }

    // Create a temporary directory for the test
    const testId = randomBytes(16).toString('hex');
    tempDir = join(tmpdir(), `mcp-test-${testId}`);
    
    try {
      await mkdir(tempDir, { recursive: true });
    } catch (mkdirError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create temporary directory',
          errorType: 'environment',
          executionTime: Date.now() - startTime,
          environmentIssues: [
            'Temporary directory not writable',
            'Sandbox filesystem may be misconfigured',
          ],
          suggestions: [
            'Set HOME=/tmp before execution',
            'Ensure writable temporary directory exists',
          ],
        },
        { status: 500 }
      );
    }

    // Write the code to a temporary file
    tempFile = join(tempDir, 'server.ts');
    await writeFile(tempFile, code, 'utf-8');

    // Create a test client script that will invoke the tool
    const testClientCode = `
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function testServer() {
  try {
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

    process.exit(0);
  } catch (error) {
    console.error('Test error:', error.message);
    console.error('Error type:', error.constructor.name);
    process.exit(1);
  }
}

testServer();
`;

    testClientFile = join(tempDir, 'test-client.ts');
    await writeFile(testClientFile, testClientCode, 'utf-8');

    // Execute the test with improved environment setup
    const timeout = 10000; // 10 seconds
    let output = '';
    let error = '';

    try {
      // Set up proper environment variables
      const testEnv: NodeJS.ProcessEnv = {
        ...process.env,
        NODE_ENV: 'test',
        HOME: tempDir, // Use temp dir as HOME to avoid permission issues
        npm_config_cache: join(tempDir, '.npm'), // Set npm cache to temp dir
        TMPDIR: tempDir,
      };

      // Try to use preinstalled tsx first, fall back to npx
      let command = '';
      try {
        // Check if tsx is available
        await execAsync('tsx --version', { timeout: 2000 });
        command = `tsx "${testClientFile}"`;
      } catch {
        // tsx not installed, use npx (slower but works)
        command = `npx tsx "${testClientFile}"`;
      }

      const { stdout, stderr } = await execAsync(command, {
        cwd: tempDir,
        timeout,
        env: testEnv,
      });

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
        message: 'Test executed successfully',
      });

    } catch (execError: any) {
      const executionTime = Date.now() - startTime;

      // Categorize the error
      let errorType: TestResult['errorType'] = 'unknown';
      let environmentIssues: string[] = [];
      let suggestions: string[] = [];

      // Check if it's a timeout
      if (execError.killed && execError.signal === 'SIGTERM') {
        errorType = 'timeout';
        suggestions.push('Optimize code to reduce execution time');
        suggestions.push('Check for infinite loops or blocking operations');
      }
      // Check for environment issues
      else if (
        execError.message?.includes('ENOENT') ||
        execError.message?.includes('no such file or directory') ||
        execError.message?.includes('mkdir')
      ) {
        errorType = 'environment';
        environmentIssues.push('Sandbox filesystem misconfigured');
        environmentIssues.push('Cannot create required directories');
        suggestions.push('Set HOME=/tmp before execution');
        suggestions.push('Ensure writable temporary directory');
        suggestions.push('Configure npm_config_cache=/tmp/.npm');
      }
      // Check for npm/network issues
      else if (
        execError.message?.includes('npm') ||
        execError.message?.includes('registry') ||
        execError.message?.includes('fetch')
      ) {
        errorType = 'environment';
        environmentIssues.push('npm registry access failed');
        environmentIssues.push('Network access may be restricted');
        suggestions.push('Preinstall tsx instead of using npx');
        suggestions.push('Run: npm install -g tsx typescript @modelcontextprotocol/sdk');
        suggestions.push('Use preinstalled dependencies to avoid network calls');
      }
      // Check for runtime errors
      else if (
        execError.message?.includes('Error:') ||
        execError.stderr?.includes('Error:')
      ) {
        errorType = 'runtime';
        suggestions.push('Check code for runtime errors');
        suggestions.push('Add proper error handling with try-catch blocks');
      }

      return NextResponse.json({
        success: false,
        error: execError.message || 'Test execution failed',
        errorType,
        executionTime,
        output: execError.stdout || '',
        stderr: execError.stderr || '',
        environmentIssues: environmentIssues.length > 0 ? environmentIssues : undefined,
        suggestions: suggestions.length > 0 ? suggestions : undefined,
      }, { status: errorType === 'timeout' ? 408 : 500 });
    }

  } catch (error) {
    console.error('Test API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to execute test',
        errorType: 'unknown',
        details: error instanceof Error ? error.message : 'Unknown error',
        executionTime: Date.now() - startTime,
        suggestions: [
          'Check if the code is valid TypeScript',
          'Ensure all required dependencies are available',
          'Verify the test environment is properly configured',
        ],
      },
      { status: 500 }
    );
  } finally {
    // Cleanup: Remove temporary files
    if (tempDir) {
      try {
        // Clean up all files in temp directory
        if (tempFile) await unlink(tempFile).catch(() => {});
        if (testClientFile) await unlink(testClientFile).catch(() => {});
        await rm(tempDir, { recursive: true, force: true }).catch(() => {});
      } catch (e) {
        // Ignore cleanup errors
        console.warn('Cleanup warning:', e);
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
    features: [
      'Improved error categorization (code, runtime, environment, timeout)',
      'Better environment setup (HOME, npm_config_cache)',
      'Automatic tsx detection (preinstalled vs npx)',
      'Detailed error suggestions',
      'Environment issue detection',
    ],
    parameters: {
      code: 'string - The TypeScript code to test',
      toolName: 'string - The tool to invoke',
      toolArgs: 'object - Arguments for the tool',
    },
    limits: {
      timeout: '10 seconds',
      maxCodeSize: '1MB',
    },
    errorTypes: {
      code: 'Invalid code or parameters',
      runtime: 'Code execution error',
      environment: 'Sandbox or filesystem issue',
      timeout: 'Execution exceeded time limit',
      unknown: 'Unexpected error',
    },
    recommendations: {
      preinstallDependencies: 'npm install -g tsx typescript @modelcontextprotocol/sdk',
      setEnvironment: 'HOME=/tmp npm_config_cache=/tmp/.npm',
      usePreinstalledTsx: 'Faster and more reliable than npx',
    },
  });
}

// Made with Bob
