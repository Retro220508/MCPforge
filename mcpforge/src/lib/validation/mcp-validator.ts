/**
 * MCP Server Code Validator
 * Validates generated MCP server code for correctness and compliance
 */

export interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  category: 'syntax' | 'mcp-compliance' | 'security' | 'best-practice';
  message: string;
  line?: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  autoFixAvailable?: boolean;
  suggestedFix?: string;
}

export interface ValidationResult {
  isValid: boolean;
  score: number;
  issues: ValidationIssue[];
  metrics: {
    syntax: number;
    mcpCompliance: number;
    security: number;
    bestPractices: number;
  };
  detectedPatterns: {
    hasToolHandlers: boolean;
    hasResourceHandlers: boolean;
    hasPromptHandlers: boolean;
    hasErrorHandling: boolean;
    hasDependencyValidation: boolean;
  };
  dependencies: string[];
}

export class MCPValidator {
  /**
   * Validate MCP server code
   */
  static validate(code: string): ValidationResult {
    const issues: ValidationIssue[] = [];
    const detectedPatterns = this.detectPatterns(code);

    // Syntax validation
    this.validateSyntax(code, issues);

    // MCP compliance validation
    this.validateMCPCompliance(code, issues, detectedPatterns);

    // Security validation
    this.validateSecurity(code, issues);

    // Best practices validation
    this.validateBestPractices(code, issues);

    // Extract dependencies
    const dependencies = this.extractDependencies(code);

    // Calculate scores
    const metrics = this.calculateMetrics(issues);
    const score = this.calculateOverallScore(metrics);

    return {
      isValid: issues.filter((i) => i.type === 'error').length === 0,
      score,
      issues,
      metrics,
      detectedPatterns,
      dependencies,
    };
  }

  /**
   * Detect MCP patterns in code - IMPROVED DETECTION
   */
  private static detectPatterns(code: string) {
    return {
      // Check for actual MCP handler patterns, not just string matching
      hasToolHandlers:
        code.includes('setRequestHandler') &&
        (code.includes('CallToolRequestSchema') ||
          code.includes('ListToolsRequestSchema') ||
          code.includes("'tools/call'") ||
          code.includes('"tools/call"') ||
          code.includes("'tools/list'") ||
          code.includes('"tools/list"')),

      hasResourceHandlers:
        code.includes('setRequestHandler') &&
        (code.includes('ListResourcesRequestSchema') ||
          code.includes('ReadResourceRequestSchema') ||
          code.includes("'resources/list'") ||
          code.includes('"resources/list"')),

      hasPromptHandlers:
        code.includes('setRequestHandler') &&
        (code.includes('ListPromptsRequestSchema') ||
          code.includes('GetPromptRequestSchema') ||
          code.includes("'prompts/list'") ||
          code.includes('"prompts/list"')),

      hasErrorHandling:
        (code.includes('try') && code.includes('catch')) ||
        code.includes('.catch('),

      hasDependencyValidation:
        code.includes('zod') ||
        code.includes('z.object') ||
        code.includes('validate') ||
        code.includes('schema'),
    };
  }

  /**
   * Validate syntax
   */
  private static validateSyntax(code: string, issues: ValidationIssue[]): void {
    const lines = code.split('\n');

    // Check for unmatched braces
    const openBraces = (code.match(/{/g) || []).length;
    const closeBraces = (code.match(/}/g) || []).length;
    if (openBraces !== closeBraces) {
      issues.push({
        type: 'error',
        category: 'syntax',
        message: `Unmatched braces: ${openBraces} opening, ${closeBraces} closing`,
        severity: 'critical',
      });
    }

    // Check for unmatched parentheses
    const openParens = (code.match(/\(/g) || []).length;
    const closeParens = (code.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      issues.push({
        type: 'error',
        category: 'syntax',
        message: `Unmatched parentheses: ${openParens} opening, ${closeParens} closing`,
        severity: 'critical',
      });
    }

    // Check for unmatched brackets
    const openBrackets = (code.match(/\[/g) || []).length;
    const closeBrackets = (code.match(/\]/g) || []).length;
    if (openBrackets !== closeBrackets) {
      issues.push({
        type: 'error',
        category: 'syntax',
        message: `Unmatched brackets: ${openBrackets} opening, ${closeBrackets} closing`,
        severity: 'critical',
      });
    }

    // Check for await without async
    const hasAwait = code.includes('await ');
    const hasAsync = code.includes('async ');
    if (hasAwait && !hasAsync) {
      issues.push({
        type: 'error',
        category: 'syntax',
        message: 'Using await without async function',
        severity: 'high',
      });
    }

    // Check for shebang
    if (!lines[0]?.trim().startsWith('#!')) {
      issues.push({
        type: 'warning',
        category: 'best-practice',
        message: 'Missing shebang line (#!/usr/bin/env node)',
        line: 1,
        severity: 'low',
        autoFixAvailable: true,
        suggestedFix: 'Add "#!/usr/bin/env node" as the first line',
      });
    }
  }

  /**
   * Validate MCP compliance
   */
  private static validateMCPCompliance(
    code: string,
    issues: ValidationIssue[],
    patterns: ReturnType<typeof MCPValidator.detectPatterns>
  ): void {
    // Check for MCP SDK import
    if (!code.includes('@modelcontextprotocol/sdk')) {
      issues.push({
        type: 'error',
        category: 'mcp-compliance',
        message: 'Missing @modelcontextprotocol/sdk import',
        severity: 'critical',
      });
    }

    // Check for Server initialization
    if (!code.includes('new Server(') && !code.includes('Server(')) {
      issues.push({
        type: 'error',
        category: 'mcp-compliance',
        message: 'Missing MCP Server initialization',
        severity: 'critical',
      });
    }

    // Check for tool handlers - IMPROVED CHECK
    if (!patterns.hasToolHandlers) {
      issues.push({
        type: 'warning',
        category: 'mcp-compliance',
        message:
          'No tool handlers detected. Check for setRequestHandler with CallToolRequestSchema or ListToolsRequestSchema',
        severity: 'medium',
        suggestedFix:
          'Add tool handlers using server.setRequestHandler(CallToolRequestSchema, async (request) => {...})',
      });
    } else {
      // Positive confirmation when handlers are found
      issues.push({
        type: 'info',
        category: 'mcp-compliance',
        message: '✅ Tool handlers detected (ListToolsRequestSchema and/or CallToolRequestSchema)',
        severity: 'low',
      });
    }

    // Check for server.connect()
    if (!code.includes('server.connect(') && !code.includes('.connect(')) {
      issues.push({
        type: 'error',
        category: 'mcp-compliance',
        message: 'Missing server.connect() call',
        severity: 'high',
      });
    }

    // Check for transport setup
    if (
      !code.includes('StdioServerTransport') &&
      !code.includes('SSEServerTransport')
    ) {
      issues.push({
        type: 'warning',
        category: 'mcp-compliance',
        message: 'No transport layer detected (StdioServerTransport or SSEServerTransport)',
        severity: 'medium',
      });
    }
  }

  /**
   * Validate security
   */
  private static validateSecurity(code: string, issues: ValidationIssue[]): void {
    const lines = code.split('\n');

    // Dangerous patterns
    const dangerousPatterns = [
      {
        pattern: /eval\s*\(/g,
        message: 'Use of eval() is dangerous and should be avoided',
        severity: 'critical' as const,
      },
      {
        pattern: /Function\s*\(/g,
        message: 'Use of Function constructor is dangerous',
        severity: 'critical' as const,
      },
      {
        pattern: /exec\s*\(/g,
        message: 'Use of exec() requires careful security review',
        severity: 'high' as const,
      },
      {
        pattern: /child_process/g,
        message: 'Child process usage requires security review',
        severity: 'high' as const,
      },
      {
        pattern: /fs\.unlink|fs\.rm/g,
        message: 'File deletion requires careful validation',
        severity: 'high' as const,
      },
      {
        pattern: /process\.env\[/g,
        message: 'Dynamic environment variable access should be validated',
        severity: 'medium' as const,
      },
    ];

    dangerousPatterns.forEach(({ pattern, message, severity }) => {
      lines.forEach((line, idx) => {
        if (pattern.test(line)) {
          issues.push({
            type: severity === 'critical' ? 'error' : 'warning',
            category: 'security',
            message,
            line: idx + 1,
            severity,
          });
        }
      });
    });

    // Check for hardcoded credentials
    const credentialPatterns = [
      /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/gi,
      /password\s*[:=]\s*['"][^'"]+['"]/gi,
      /secret\s*[:=]\s*['"][^'"]+['"]/gi,
      /token\s*[:=]\s*['"][^'"]+['"]/gi,
    ];

    credentialPatterns.forEach((pattern) => {
      if (pattern.test(code)) {
        issues.push({
          type: 'error',
          category: 'security',
          message: 'Potential hardcoded credentials detected',
          severity: 'critical',
          suggestedFix: 'Use environment variables instead: process.env.API_KEY',
        });
      }
    });
  }

  /**
   * Validate API-specific patterns (Slack, etc.)
   */
  private static validateAPIPatterns(code: string, issues: ValidationIssue[]): void {
    // Slack API validation
    if (code.includes('slack.com/api')) {
      // Check for Slack API "ok" field validation
      if (code.includes('response.ok') && !code.includes('data.ok')) {
        issues.push({
          type: 'warning',
          category: 'best-practice',
          message: 'Slack API may return {ok: false} with HTTP 200. Check data.ok field in addition to response.ok',
          severity: 'medium',
          suggestedFix: 'Add: const data = await response.json(); if (!data.ok) throw new Error(data.error);',
        });
      }

      // Check for Slack invite API format
      if (code.includes('conversations.invite') && code.includes('users: [')) {
        issues.push({
          type: 'info',
          category: 'best-practice',
          message: 'Slack invite API expects users as comma-separated string, not array. Verify API format.',
          severity: 'low',
          suggestedFix: 'Use: users: "U123,U456" instead of users: ["U123", "U456"]',
        });
      }

      // Check for pagination handling
      if (!code.includes('cursor') && !code.includes('next_cursor')) {
        issues.push({
          type: 'info',
          category: 'best-practice',
          message: 'Slack API pagination not detected. Consider handling cursor-based pagination for large datasets.',
          severity: 'low',
        });
      }

      // Check for rate limiting
      if (!code.includes('rate') && !code.includes('retry') && !code.includes('429')) {
        issues.push({
          type: 'info',
          category: 'best-practice',
          message: 'No rate limiting detected. Consider handling Slack API rate limits (429 responses).',
          severity: 'low',
        });
      }
    }
  }

  /**
   * Validate best practices
   */
  private static validateBestPractices(
    code: string,
    issues: ValidationIssue[]
  ): void {
    // Check API-specific patterns first
    this.validateAPIPatterns(code, issues);
    const lines = code.split('\n');

    // Check for error handling around async operations - CORRECT CHECK
    const asyncOperations = [
      { pattern: /await\s+fetch\s*\(/g, operation: 'fetch' },
      { pattern: /await\s+\w+\.\w+\s*\(/g, operation: 'async call' },
    ];

    asyncOperations.forEach(({ pattern, operation }) => {
      lines.forEach((line, idx) => {
        if (pattern.test(line)) {
          // Check if this line is within a try-catch block
          const beforeLines = lines.slice(Math.max(0, idx - 10), idx).join('\n');
          const afterLines = lines.slice(idx, Math.min(lines.length, idx + 10)).join('\n');
          
          const hasTryCatch =
            beforeLines.includes('try') && afterLines.includes('catch');

          if (!hasTryCatch) {
            issues.push({
              type: 'warning',
              category: 'best-practice',
              message: `Async ${operation} without try-catch error handling`,
              line: idx + 1,
              severity: 'medium',
              autoFixAvailable: true,
              suggestedFix: `Wrap in try-catch block:\ntry {\n  ${line.trim()}\n} catch (error) {\n  // Handle error\n}`,
            });
          }
        }
      });
    });

    // Check for console.log in production code
    if (code.includes('console.log')) {
      issues.push({
        type: 'info',
        category: 'best-practice',
        message: 'Consider using proper logging instead of console.log',
        severity: 'low',
        suggestedFix: 'Use server.sendLoggingMessage() for MCP-compliant logging',
      });
    }

    // Check for proper TypeScript types
    if (code.includes(': any')) {
      issues.push({
        type: 'info',
        category: 'best-practice',
        message: 'Avoid using "any" type, use specific types instead',
        severity: 'low',
      });
    }

    // Check for input validation
    const hasInputValidation =
      code.includes('zod') ||
      code.includes('validate') ||
      code.includes('schema') ||
      code.includes('typeof') ||
      code.includes('instanceof');

    if (!hasInputValidation) {
      issues.push({
        type: 'warning',
        category: 'best-practice',
        message: 'No input validation detected. Consider using Zod or similar',
        severity: 'medium',
        suggestedFix: 'Add input validation using Zod schemas',
      });
    }
  }

  /**
   * Extract dependencies from code
   */
  private static extractDependencies(code: string): string[] {
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

  /**
   * Calculate metrics from issues
   */
  private static calculateMetrics(issues: ValidationIssue[]) {
    const categoryScores = {
      syntax: 100,
      mcpCompliance: 100,
      security: 100,
      bestPractices: 100,
    };

    issues.forEach((issue) => {
      const deduction = this.getDeduction(issue.severity);
      const category = this.mapCategory(issue.category);
      categoryScores[category] = Math.max(0, categoryScores[category] - deduction);
    });

    return {
      syntax: categoryScores.syntax,
      mcpCompliance: categoryScores.mcpCompliance,
      security: categoryScores.security,
      bestPractices: categoryScores.bestPractices,
    };
  }

  /**
   * Calculate overall score
   */
  private static calculateOverallScore(metrics: {
    syntax: number;
    mcpCompliance: number;
    security: number;
    bestPractices: number;
  }): number {
    // Weighted average - more conservative scoring
    const weights = {
      syntax: 0.25,
      mcpCompliance: 0.35,
      security: 0.25,
      bestPractices: 0.15,
    };

    return Math.round(
      metrics.syntax * weights.syntax +
        metrics.mcpCompliance * weights.mcpCompliance +
        metrics.security * weights.security +
        metrics.bestPractices * weights.bestPractices
    );
  }

  /**
   * Get score deduction for severity
   */
  private static getDeduction(severity: string): number {
    switch (severity) {
      case 'critical':
        return 25;
      case 'high':
        return 15;
      case 'medium':
        return 8;
      case 'low':
        return 3;
      default:
        return 0;
    }
  }

  /**
   * Map issue category to metric category
   */
  private static mapCategory(
    category: string
  ): 'syntax' | 'mcpCompliance' | 'security' | 'bestPractices' {
    switch (category) {
      case 'syntax':
        return 'syntax';
      case 'mcp-compliance':
        return 'mcpCompliance';
      case 'security':
        return 'security';
      case 'best-practice':
        return 'bestPractices';
      default:
        return 'bestPractices';
    }
  }
}

// Made with Bob
