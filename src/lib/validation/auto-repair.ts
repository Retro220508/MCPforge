/**
 * Auto-Repair System
 * Provides automatic fixes for common MCP server issues
 */

import { ValidationIssue } from './mcp-validator';
import { RuntimeIssue } from './runtime-validator';

export interface RepairSuggestion {
  issueType: string;
  description: string;
  fix: string;
  confidence: 'high' | 'medium' | 'low';
  canAutoApply: boolean;
}

export interface RepairResult {
  applied: boolean;
  originalCode: string;
  repairedCode: string;
  changes: string[];
  remainingIssues: number;
}

export class AutoRepair {
  /**
   * Get repair suggestions for issues
   */
  static getSuggestions(
    codeIssues: ValidationIssue[],
    runtimeIssues: RuntimeIssue[]
  ): RepairSuggestion[] {
    const suggestions: RepairSuggestion[] = [];

    // Code repair suggestions
    codeIssues.forEach((issue) => {
      const suggestion = this.getCodeRepairSuggestion(issue);
      if (suggestion) {
        suggestions.push(suggestion);
      }
    });

    // Runtime repair suggestions
    runtimeIssues.forEach((issue) => {
      const suggestion = this.getRuntimeRepairSuggestion(issue);
      if (suggestion) {
        suggestions.push(suggestion);
      }
    });

    return suggestions;
  }

  /**
   * Get code repair suggestion
   */
  private static getCodeRepairSuggestion(
    issue: ValidationIssue
  ): RepairSuggestion | null {
    // Missing shebang
    if (issue.message.includes('shebang')) {
      return {
        issueType: 'missing-shebang',
        description: 'Add shebang line for Node.js execution',
        fix: 'Add "#!/usr/bin/env node" as the first line',
        confidence: 'high',
        canAutoApply: true,
      };
    }

    // Missing try-catch
    if (issue.message.includes('try-catch')) {
      return {
        issueType: 'missing-error-handling',
        description: 'Wrap async operations in try-catch blocks',
        fix: issue.suggestedFix || 'Add try-catch error handling',
        confidence: 'high',
        canAutoApply: true,
      };
    }

    // Hardcoded credentials
    if (issue.message.includes('credentials')) {
      return {
        issueType: 'hardcoded-credentials',
        description: 'Move credentials to environment variables',
        fix: 'Replace hardcoded values with process.env.VARIABLE_NAME',
        confidence: 'medium',
        canAutoApply: false,
      };
    }

    // Missing tool handlers
    if (issue.message.includes('tool handlers')) {
      return {
        issueType: 'missing-tool-handlers',
        description: 'Add MCP tool handlers',
        fix: `Add:\nserver.setRequestHandler(CallToolRequestSchema, async (request) => {\n  // Handle tool calls\n});`,
        confidence: 'medium',
        canAutoApply: false,
      };
    }

    // Console.log usage
    if (issue.message.includes('console.log')) {
      return {
        issueType: 'console-log-usage',
        description: 'Replace console.log with MCP logging',
        fix: 'Use server.sendLoggingMessage() instead',
        confidence: 'high',
        canAutoApply: true,
      };
    }

    // Any type usage
    if (issue.message.includes('any')) {
      return {
        issueType: 'any-type-usage',
        description: 'Replace "any" with specific types',
        fix: 'Define proper TypeScript interfaces',
        confidence: 'low',
        canAutoApply: false,
      };
    }

    return null;
  }

  /**
   * Get runtime repair suggestion
   */
  private static getRuntimeRepairSuggestion(
    issue: RuntimeIssue
  ): RepairSuggestion | null {
    // npm cache issue
    if (issue.message.includes('npm cache')) {
      return {
        issueType: 'npm-cache-issue',
        description: 'Configure writable npm cache directory',
        fix: 'Set environment: HOME=/tmp npm_config_cache=/tmp/.npm',
        confidence: 'high',
        canAutoApply: true,
      };
    }

    // Temp directory issue
    if (issue.message.includes('Temporary directory')) {
      return {
        issueType: 'temp-directory-issue',
        description: 'Set writable temporary directory',
        fix: 'Set HOME=/tmp before execution',
        confidence: 'high',
        canAutoApply: true,
      };
    }

    // tsx not installed
    if (issue.message.includes('tsx')) {
      return {
        issueType: 'tsx-not-installed',
        description: 'Preinstall tsx for faster execution',
        fix: 'Run: npm install -g tsx',
        confidence: 'high',
        canAutoApply: true,
      };
    }

    // Network access
    if (issue.message.includes('Network')) {
      return {
        issueType: 'network-access-issue',
        description: 'Preinstall dependencies to avoid network calls',
        fix: 'Install dependencies before execution instead of using npx',
        confidence: 'medium',
        canAutoApply: false,
      };
    }

    return null;
  }

  /**
   * Apply automatic repairs to code
   */
  static applyRepairs(code: string, issues: ValidationIssue[]): RepairResult {
    let repairedCode = code;
    const changes: string[] = [];
    let appliedCount = 0;

    // Apply shebang fix
    const shebangIssue = issues.find((i) => i.message.includes('shebang'));
    if (shebangIssue) {
      if (!repairedCode.startsWith('#!')) {
        repairedCode = '#!/usr/bin/env node\n' + repairedCode;
        changes.push('Added shebang line');
        appliedCount++;
      }
    }

    // Apply try-catch fixes
    const tryCatchIssues = issues.filter((i) =>
      i.message.includes('try-catch')
    );
    if (tryCatchIssues.length > 0) {
      repairedCode = this.wrapAsyncInTryCatch(repairedCode);
      if (repairedCode !== code) {
        changes.push(`Added try-catch blocks for ${tryCatchIssues.length} async operation(s)`);
        appliedCount++;
      }
    }

    // Apply console.log fixes
    if (repairedCode.includes('console.log')) {
      const before = repairedCode;
      repairedCode = repairedCode.replace(
        /console\.log\((.*?)\)/g,
        'server.sendLoggingMessage({ level: "info", data: $1 })'
      );
      if (repairedCode !== before) {
        changes.push('Replaced console.log with MCP logging');
        appliedCount++;
      }
    }

    return {
      applied: appliedCount > 0,
      originalCode: code,
      repairedCode,
      changes,
      remainingIssues: issues.length - appliedCount,
    };
  }

  /**
   * Wrap async operations in try-catch
   */
  private static wrapAsyncInTryCatch(code: string): string {
    // This is a simplified implementation
    // In production, you'd use a proper AST parser
    const lines = code.split('\n');
    const result: string[] = [];
    let inTryCatch = false;
    let indentLevel = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Track try-catch blocks
      if (trimmed.startsWith('try')) {
        inTryCatch = true;
      } else if (trimmed.startsWith('catch')) {
        inTryCatch = false;
      }

      // Check for await without try-catch
      if (
        !inTryCatch &&
        (trimmed.includes('await ') || trimmed.includes('.then('))
      ) {
        const indent = line.match(/^\s*/)?.[0] || '';
        result.push(`${indent}try {`);
        result.push(line);
        
        // Look ahead for the end of the statement
        let j = i + 1;
        while (j < lines.length && !lines[j].trim().endsWith(';')) {
          result.push(lines[j]);
          j++;
        }
        if (j < lines.length) {
          result.push(lines[j]);
          i = j;
        }
        
        result.push(`${indent}} catch (error) {`);
        result.push(`${indent}  console.error('Error:', error);`);
        result.push(`${indent}  throw error;`);
        result.push(`${indent}}`);
      } else {
        result.push(line);
      }
    }

    return result.join('\n');
  }

  /**
   * Get execution command with fixes
   */
  static getFixedExecutionCommand(scriptPath: string): string {
    return `HOME=/tmp npm_config_cache=/tmp/.npm tsx "${scriptPath}"`;
  }

  /**
   * Get setup script for runtime environment
   */
  static getRuntimeSetupScript(): string {
    return `#!/bin/bash
# MCP Server Runtime Setup Script

# Set writable directories
export HOME=/tmp
export npm_config_cache=/tmp/.npm

# Create necessary directories
mkdir -p /tmp/.npm
mkdir -p /tmp/mcp-test

# Preinstall dependencies (recommended)
echo "Installing dependencies..."
npm install -g tsx typescript @modelcontextprotocol/sdk

echo "Runtime environment ready!"
`;
  }

  /**
   * Format repair suggestions for display
   */
  static formatSuggestions(suggestions: RepairSuggestion[]): string {
    if (suggestions.length === 0) {
      return 'No repair suggestions available.';
    }

    const lines: string[] = [];
    lines.push('=== Auto-Repair Suggestions ===\n');

    suggestions.forEach((suggestion, idx) => {
      const autoApply = suggestion.canAutoApply ? '✓ Auto-fixable' : '✗ Manual fix required';
      const confidence = `Confidence: ${suggestion.confidence.toUpperCase()}`;
      
      lines.push(`${idx + 1}. ${suggestion.description}`);
      lines.push(`   ${autoApply} | ${confidence}`);
      lines.push(`   Fix: ${suggestion.fix}\n`);
    });

    return lines.join('\n');
  }
}

// Made with Bob
