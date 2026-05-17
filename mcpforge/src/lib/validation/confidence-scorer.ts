/**
 * Execution Confidence Scorer
 * Provides detailed confidence metrics for MCP server execution
 */

import { ValidationResult } from './mcp-validator';
import { RuntimeValidationResult } from './runtime-validator';

export interface ConfidenceScore {
  overall: number;
  breakdown: {
    syntax: number;
    mcpCompliance: number;
    security: number;
    bestPractices: number;
    runtimeEnvironment: number;
  };
  rating: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  canExecute: boolean;
  recommendations: string[];
}

export class ConfidenceScorer {
  /**
   * Calculate comprehensive confidence score
   */
  static calculate(
    codeValidation: ValidationResult,
    runtimeValidation: RuntimeValidationResult
  ): ConfidenceScore {
    const breakdown = {
      syntax: codeValidation.metrics.syntax,
      mcpCompliance: codeValidation.metrics.mcpCompliance,
      security: codeValidation.metrics.security,
      bestPractices: codeValidation.metrics.bestPractices,
      runtimeEnvironment: runtimeValidation.confidence,
    };

    // Weighted overall score
    const weights = {
      syntax: 0.20,
      mcpCompliance: 0.25,
      security: 0.20,
      bestPractices: 0.10,
      runtimeEnvironment: 0.25,
    };

    const overall = Math.round(
      breakdown.syntax * weights.syntax +
        breakdown.mcpCompliance * weights.mcpCompliance +
        breakdown.security * weights.security +
        breakdown.bestPractices * weights.bestPractices +
        breakdown.runtimeEnvironment * weights.runtimeEnvironment
    );

    const rating = this.getRating(overall);
    const canExecute = this.canExecute(codeValidation, runtimeValidation);
    const recommendations = this.getRecommendations(
      codeValidation,
      runtimeValidation,
      breakdown
    );

    return {
      overall,
      breakdown,
      rating,
      canExecute,
      recommendations,
    };
  }

  /**
   * Get rating based on score
   */
  private static getRating(
    score: number
  ): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 60) return 'fair';
    if (score >= 40) return 'poor';
    return 'critical';
  }

  /**
   * Determine if code can be executed
   */
  private static canExecute(
    codeValidation: ValidationResult,
    runtimeValidation: RuntimeValidationResult
  ): boolean {
    // Must have valid code
    if (!codeValidation.isValid) return false;

    // Must have ready runtime
    if (!runtimeValidation.isReady) return false;

    // Must not have critical security issues
    const criticalSecurityIssues = codeValidation.issues.filter(
      (i) => i.category === 'security' && i.severity === 'critical'
    );
    if (criticalSecurityIssues.length > 0) return false;

    // Must have minimum MCP compliance
    if (codeValidation.metrics.mcpCompliance < 50) return false;

    return true;
  }

  /**
   * Generate recommendations
   */
  private static getRecommendations(
    codeValidation: ValidationResult,
    runtimeValidation: RuntimeValidationResult,
    breakdown: ConfidenceScore['breakdown']
  ): string[] {
    const recommendations: string[] = [];

    // Code quality recommendations
    if (breakdown.syntax < 80) {
      recommendations.push('Fix syntax errors before execution');
    }

    if (breakdown.mcpCompliance < 70) {
      recommendations.push('Improve MCP protocol compliance');
      if (!codeValidation.detectedPatterns.hasToolHandlers) {
        recommendations.push('Add tool handlers using setRequestHandler');
      }
      if (!codeValidation.detectedPatterns.hasErrorHandling) {
        recommendations.push('Add try-catch blocks for error handling');
      }
    }

    if (breakdown.security < 80) {
      recommendations.push('Address security concerns before deployment');
      const criticalSecurity = codeValidation.issues.filter(
        (i) => i.category === 'security' && i.severity === 'critical'
      );
      if (criticalSecurity.length > 0) {
        recommendations.push(
          `Fix ${criticalSecurity.length} critical security issue(s)`
        );
      }
    }

    if (breakdown.bestPractices < 70) {
      recommendations.push('Follow TypeScript and MCP best practices');
    }

    // Runtime recommendations
    if (breakdown.runtimeEnvironment < 80) {
      recommendations.push(...runtimeValidation.recommendations);
    }

    // Specific auto-fix recommendations
    const autoFixableIssues = [
      ...codeValidation.issues.filter((i) => i.autoFixAvailable),
      ...runtimeValidation.issues.filter((i) => i.autoFixAvailable),
    ];

    if (autoFixableIssues.length > 0) {
      recommendations.push(
        `${autoFixableIssues.length} issue(s) have auto-fix available`
      );
    }

    // Dependency recommendations
    if (codeValidation.dependencies.length > 0) {
      const externalDeps = codeValidation.dependencies.filter(
        (d) => d !== '@modelcontextprotocol/sdk'
      );
      if (externalDeps.length > 0) {
        recommendations.push(
          `Verify ${externalDeps.length} external dependencies are installed`
        );
      }
    }

    return recommendations;
  }

  /**
   * Get detailed report
   */
  static getDetailedReport(score: ConfidenceScore): string {
    const lines: string[] = [];

    lines.push('=== Execution Confidence Report ===\n');
    lines.push(`Overall Score: ${score.overall}/100 (${score.rating.toUpperCase()})`);
    lines.push(`Can Execute: ${score.canExecute ? 'YES' : 'NO'}\n`);

    lines.push('Score Breakdown:');
    lines.push(`  Syntax:              ${score.breakdown.syntax}/100`);
    lines.push(`  MCP Compliance:      ${score.breakdown.mcpCompliance}/100`);
    lines.push(`  Security:            ${score.breakdown.security}/100`);
    lines.push(`  Best Practices:      ${score.breakdown.bestPractices}/100`);
    lines.push(`  Runtime Environment: ${score.breakdown.runtimeEnvironment}/100\n`);

    if (score.recommendations.length > 0) {
      lines.push('Recommendations:');
      score.recommendations.forEach((rec, idx) => {
        lines.push(`  ${idx + 1}. ${rec}`);
      });
    }

    return lines.join('\n');
  }

  /**
   * Get visual confidence indicator
   */
  static getVisualIndicator(score: number): string {
    const filled = Math.round(score / 10);
    const empty = 10 - filled;
    return '█'.repeat(filled) + '░'.repeat(empty) + ` ${score}%`;
  }

  /**
   * Get color code for UI display
   */
  static getColorCode(
    rating: ConfidenceScore['rating']
  ): 'green' | 'yellow' | 'orange' | 'red' {
    switch (rating) {
      case 'excellent':
      case 'good':
        return 'green';
      case 'fair':
        return 'yellow';
      case 'poor':
        return 'orange';
      case 'critical':
        return 'red';
    }
  }
}

// Made with Bob
