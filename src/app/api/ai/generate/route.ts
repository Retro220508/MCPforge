import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/forge/validate
 * 
 * Validate generated MCP server code for syntax and security issues
 * 
 * Request body:
 * {
 *   "code": "string - the TypeScript code to validate"
 * }
 */

interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  line?: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

interface ValidationResult {
  valid: boolean;
  score: number;
  issues: ValidationIssue[];
  dependencies: string[];
  hasShebang: boolean;
  hasMcpImports: boolean;
  hasServerSetup: boolean;
  hasToolHandlers: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Code is required and must be a string' },
        { status: 400 }
      );
    }

    const result = validateCode(code);

    return NextResponse.json({
      success: true,
      validation: result,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error validating code:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to validate code',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function validateCode(code: string): ValidationResult {
  const issues: ValidationIssue[] = [];
  const lines = code.split('\n');
  
  // Check for shebang
  const hasShebang = lines[0]?.trim().startsWith('#!');
  if (!hasShebang) {
    issues.push({
      type: 'warning',
      message: 'Missing shebang line (#!/usr/bin/env node)',
      line: 1,
      severity: 'low'
    });
  }

  // Check for MCP imports
  const hasMcpImports = code.includes('@modelcontextprotocol/sdk');
  if (!hasMcpImports) {
    issues.push({
      type: 'error',
      message: 'Missing @modelcontextprotocol/sdk import',
      severity: 'critical'
    });
  }

  // Check for Server setup
  const hasServerSetup = code.includes('new Server(') || code.includes('Server(');
  if (!hasServerSetup) {
    issues.push({
      type: 'error',
      message: 'Missing MCP Server initialization',
      severity: 'critical'
    });
  }

  // Check for tool handlers
  const hasToolHandlers = code.includes('setRequestHandler') && 
                          (code.includes('tools/list') || code.includes('tools/call'));
  if (!hasToolHandlers) {
    issues.push({
      type: 'warning',
      message: 'No tool handlers detected',
      severity: 'medium'
    });
  }

  // Security checks - dangerous patterns
  const dangerousPatterns = [
    { pattern: /eval\s*\(/g, message: 'Use of eval() is dangerous', severity: 'critical' as const },
    { pattern: /Function\s*\(/g, message: 'Use of Function constructor is dangerous', severity: 'critical' as const },
    { pattern: /exec\s*\(/g, message: 'Use of exec() requires careful review', severity: 'high' as const },
    { pattern: /child_process/g, message: 'Child process usage requires security review', severity: 'high' as const },
    { pattern: /fs\.unlink|fs\.rm/g, message: 'File deletion requires careful validation', severity: 'high' as const },
    { pattern: /process\.env\[/g, message: 'Dynamic env access should be validated', severity: 'medium' as const },
  ];

  dangerousPatterns.forEach(({ pattern, message, severity }) => {
    const matches = code.match(pattern);
    if (matches) {
      lines.forEach((line, idx) => {
        if (pattern.test(line)) {
          issues.push({
            type: severity === 'critical' ? 'error' : 'warning',
            message,
            line: idx + 1,
            severity
          });
        }
      });
    }
  });

  // Check for basic syntax issues
  const syntaxIssues = checkBasicSyntax(code, lines);
  issues.push(...syntaxIssues);

  // Extract dependencies
  const dependencies = extractDependencies(code);

  // Calculate score (0-100)
  let score = 100;
  issues.forEach(issue => {
    switch (issue.severity) {
      case 'critical': score -= 20; break;
      case 'high': score -= 10; break;
      case 'medium': score -= 5; break;
      case 'low': score -= 2; break;
    }
  });
  score = Math.max(0, Math.min(100, score));

  const valid = issues.filter(i => i.type === 'error').length === 0;

  return {
    valid,
    score,
    issues,
    dependencies,
    hasShebang,
    hasMcpImports,
    hasServerSetup,
    hasToolHandlers,
  };
}

function checkBasicSyntax(code: string, lines: string[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Check for unmatched braces
  const openBraces = (code.match(/{/g) || []).length;
  const closeBraces = (code.match(/}/g) || []).length;
  if (openBraces !== closeBraces) {
    issues.push({
      type: 'error',
      message: `Unmatched braces: ${openBraces} opening, ${closeBraces} closing`,
      severity: 'critical'
    });
  }

  // Check for unmatched parentheses
  const openParens = (code.match(/\(/g) || []).length;
  const closeParens = (code.match(/\)/g) || []).length;
  if (openParens !== closeParens) {
    issues.push({
      type: 'error',
      message: `Unmatched parentheses: ${openParens} opening, ${closeParens} closing`,
      severity: 'critical'
    });
  }

  // Check for async/await usage
  const hasAsync = code.includes('async ');
  const hasAwait = code.includes('await ');
  if (hasAwait && !hasAsync) {
    issues.push({
      type: 'warning',
      message: 'Using await without async function',
      severity: 'high'
    });
  }

  // Check for proper error handling
  const hasTryCatch = code.includes('try') && code.includes('catch');
  const hasAsyncOperations = code.includes('await') || code.includes('.then(');
  if (hasAsyncOperations && !hasTryCatch) {
    issues.push({
      type: 'warning',
      message: 'Async operations without try-catch error handling',
      severity: 'medium'
    });
  }

  return issues;
}

function extractDependencies(code: string): string[] {
  const deps = new Set<string>();
  
  // Match import statements
  const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
  let match;
  
  while ((match = importRegex.exec(code)) !== null) {
    const dep = match[1];
    // Only include external packages (not relative imports)
    if (!dep.startsWith('.') && !dep.startsWith('/')) {
      // Extract package name (handle scoped packages)
      const pkgName = dep.startsWith('@') 
        ? dep.split('/').slice(0, 2).join('/')
        : dep.split('/')[0];
      deps.add(pkgName);
    }
  }

  // Match require statements
  const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((match = requireRegex.exec(code)) !== null) {
    const dep = match[1];
    if (!dep.startsWith('.') && !dep.startsWith('/')) {
      const pkgName = dep.startsWith('@') 
        ? dep.split('/').slice(0, 2).join('/')
        : dep.split('/')[0];
      deps.add(pkgName);
    }
  }

  return Array.from(deps).sort();
}

// Made with Bob
