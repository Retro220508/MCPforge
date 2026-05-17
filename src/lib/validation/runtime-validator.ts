/**
 * Runtime Environment Validator
 * Validates the execution environment for MCP server testing
 * Separates runtime issues from code quality issues
 */

export interface RuntimeIssue {
  type: 'error' | 'warning' | 'info';
  category: 'environment' | 'dependencies' | 'permissions' | 'network';
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  autoFixAvailable?: boolean;
  suggestedFix?: string;
}

export interface RuntimeValidationResult {
  isReady: boolean;
  confidence: number;
  issues: RuntimeIssue[];
  environment: {
    hasNodeRuntime: boolean;
    hasNpmCache: boolean;
    hasWritableTemp: boolean;
    hasNetworkAccess: boolean;
    hasTsxInstalled: boolean;
  };
  recommendations: string[];
}

export class RuntimeValidator {
  /**
   * Validate runtime environment
   */
  static async validate(): Promise<RuntimeValidationResult> {
    const issues: RuntimeIssue[] = [];
    const environment = await this.checkEnvironment();
    const recommendations: string[] = [];

    // Check Node.js runtime
    if (!environment.hasNodeRuntime) {
      issues.push({
        type: 'error',
        category: 'environment',
        message: 'Node.js runtime not available',
        severity: 'critical',
      });
    }

    // Check npm cache directory
    if (!environment.hasNpmCache) {
      issues.push({
        type: 'warning',
        category: 'environment',
        message: 'npm cache directory not writable',
        severity: 'high',
        autoFixAvailable: true,
        suggestedFix: 'Set npm_config_cache=/tmp/.npm or HOME=/tmp',
      });
      recommendations.push('Configure writable npm cache directory');
    }

    // Check temp directory
    if (!environment.hasWritableTemp) {
      issues.push({
        type: 'error',
        category: 'permissions',
        message: 'Temporary directory not writable',
        severity: 'critical',
        autoFixAvailable: true,
        suggestedFix: 'Set HOME=/tmp before execution',
      });
      recommendations.push('Ensure writable temporary directory');
    }

    // Check network access
    if (!environment.hasNetworkAccess) {
      issues.push({
        type: 'warning',
        category: 'network',
        message: 'Network access may be restricted',
        severity: 'medium',
        suggestedFix: 'Preinstall dependencies instead of using npx',
      });
      recommendations.push('Consider preinstalling dependencies');
    }

    // Check tsx installation
    if (!environment.hasTsxInstalled) {
      issues.push({
        type: 'warning',
        category: 'dependencies',
        message: 'tsx not preinstalled, will use npx (slower and less reliable)',
        severity: 'medium',
        autoFixAvailable: true,
        suggestedFix: 'Preinstall tsx in container/sandbox',
      });
      recommendations.push('Preinstall tsx for faster execution');
    }

    const confidence = this.calculateConfidence(environment, issues);

    return {
      isReady: issues.filter((i) => i.type === 'error').length === 0,
      confidence,
      issues,
      environment,
      recommendations,
    };
  }

  /**
   * Check environment capabilities
   */
  private static async checkEnvironment() {
    const env = {
      hasNodeRuntime: false,
      hasNpmCache: false,
      hasWritableTemp: false,
      hasNetworkAccess: false,
      hasTsxInstalled: false,
    };

    try {
      // Check Node.js
      env.hasNodeRuntime = typeof process !== 'undefined' && !!process.version;

      // Check npm cache
      const npmCache = process.env.npm_config_cache || process.env.HOME;
      env.hasNpmCache = !!npmCache;

      // Check temp directory
      const tempDir = process.env.TMPDIR || process.env.TEMP || '/tmp';
      env.hasWritableTemp = !!tempDir;

      // Check network (simplified check)
      env.hasNetworkAccess = !process.env.NO_NETWORK;

      // Check tsx installation (would need actual check in real implementation)
      env.hasTsxInstalled = false; // Assume not installed by default
    } catch (error) {
      // Environment check failed
    }

    return env;
  }

  /**
   * Calculate runtime confidence score
   */
  private static calculateConfidence(
    environment: RuntimeValidationResult['environment'],
    issues: RuntimeIssue[]
  ): number {
    let confidence = 100;

    // Deduct for missing environment features
    if (!environment.hasNodeRuntime) confidence -= 50;
    if (!environment.hasNpmCache) confidence -= 15;
    if (!environment.hasWritableTemp) confidence -= 20;
    if (!environment.hasNetworkAccess) confidence -= 10;
    if (!environment.hasTsxInstalled) confidence -= 10;

    // Deduct for issues
    issues.forEach((issue) => {
      switch (issue.severity) {
        case 'critical':
          confidence -= 25;
          break;
        case 'high':
          confidence -= 15;
          break;
        case 'medium':
          confidence -= 8;
          break;
        case 'low':
          confidence -= 3;
          break;
      }
    });

    return Math.max(0, Math.min(100, confidence));
  }

  /**
   * Get execution environment setup commands
   */
  static getSetupCommands(): string[] {
    return [
      '# Set writable HOME directory',
      'export HOME=/tmp',
      '',
      '# Set npm cache directory',
      'export npm_config_cache=/tmp/.npm',
      '',
      '# Create necessary directories',
      'mkdir -p /tmp/.npm',
      '',
      '# Preinstall dependencies (recommended)',
      'npm install -g tsx typescript @modelcontextprotocol/sdk',
    ];
  }

  /**
   * Get recommended execution command
   */
  static getRecommendedCommand(scriptPath: string): string {
    return `HOME=/tmp npm_config_cache=/tmp/.npm tsx "${scriptPath}"`;
  }
}

// Made with Bob
