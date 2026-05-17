/**
 * Validation System Type Definitions
 * Centralized types for the validation system
 */

// ============================================================================
// Code Validation Types
// ============================================================================

export interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  category: 'syntax' | 'mcp-compliance' | 'security' | 'best-practice';
  message: string;
  line?: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  autoFixAvailable?: boolean;
  suggestedFix?: string;
}

export interface ValidationMetrics {
  syntax: number;
  mcpCompliance: number;
  security: number;
  bestPractices: number;
}

export interface DetectedPatterns {
  hasToolHandlers: boolean;
  hasResourceHandlers: boolean;
  hasPromptHandlers: boolean;
  hasErrorHandling: boolean;
  hasDependencyValidation: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  score: number;
  issues: ValidationIssue[];
  metrics: ValidationMetrics;
  detectedPatterns: DetectedPatterns;
  dependencies: string[];
}

// ============================================================================
// Runtime Validation Types
// ============================================================================

export interface RuntimeIssue {
  type: 'error' | 'warning' | 'info';
  category: 'environment' | 'dependencies' | 'permissions' | 'network';
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  autoFixAvailable?: boolean;
  suggestedFix?: string;
}

export interface RuntimeEnvironment {
  hasNodeRuntime: boolean;
  hasNpmCache: boolean;
  hasWritableTemp: boolean;
  hasNetworkAccess: boolean;
  hasTsxInstalled: boolean;
}

export interface RuntimeValidationResult {
  isReady: boolean;
  confidence: number;
  issues: RuntimeIssue[];
  environment: RuntimeEnvironment;
  recommendations: string[];
}

// ============================================================================
// Confidence Scoring Types
// ============================================================================

export interface ConfidenceBreakdown {
  syntax: number;
  mcpCompliance: number;
  security: number;
  bestPractices: number;
  runtimeEnvironment: number;
}

export type ConfidenceRating = 'excellent' | 'good' | 'fair' | 'poor' | 'critical';

export interface ConfidenceScore {
  overall: number;
  breakdown: ConfidenceBreakdown;
  rating: ConfidenceRating;
  canExecute: boolean;
  recommendations: string[];
}

// ============================================================================
// Auto-Repair Types
// ============================================================================

export type RepairConfidence = 'high' | 'medium' | 'low';

export interface RepairSuggestion {
  issueType: string;
  description: string;
  fix: string;
  confidence: RepairConfidence;
  canAutoApply: boolean;
}

export interface RepairResult {
  applied: boolean;
  originalCode: string;
  repairedCode: string;
  changes: string[];
  remainingIssues: number;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ValidationAPIResponse {
  success: boolean;
  validation: {
    isValid: boolean;
    canExecute: boolean;
    score: number;
    confidenceScore: number;
    rating: ConfidenceRating;
    metrics: {
      code: ValidationMetrics;
      runtime: {
        confidence: number;
      };
      breakdown: ConfidenceBreakdown;
    };
    issues: {
      codeQuality: {
        syntax: ValidationIssue[];
        mcpCompliance: ValidationIssue[];
        security: ValidationIssue[];
        bestPractices: ValidationIssue[];
      };
      runtime: {
        environment: RuntimeIssue[];
        dependencies: RuntimeIssue[];
        permissions: RuntimeIssue[];
        network: RuntimeIssue[];
      };
    };
    severityCounts: {
      critical: number;
      high: number;
      medium: number;
      low: number;
    };
    detectedPatterns: DetectedPatterns;
    runtimeEnvironment: RuntimeEnvironment;
    dependencies: string[];
    recommendations: string[];
    repairSuggestions: RepairSuggestion[] | null;
    summary: {
      totalIssues: number;
      codeIssues: number;
      runtimeIssues: number;
      autoFixableIssues: number;
    };
  };
  timestamp: string;
}

export type TestErrorType = 'code' | 'runtime' | 'environment' | 'timeout' | 'unknown';

export interface TestAPIResponse {
  success: boolean;
  output?: string;
  error?: string;
  errorType?: TestErrorType;
  executionTime: number;
  toolResponse?: any;
  environmentIssues?: string[];
  suggestions?: string[];
  stderr?: string;
  message?: string;
}

// ============================================================================
// UI Display Types
// ============================================================================

export type IssueColor = 'red' | 'orange' | 'yellow' | 'blue';
export type ScoreColor = 'green' | 'yellow' | 'orange' | 'red';

export interface IssueDisplay {
  icon: string;
  color: IssueColor;
  label: string;
}

export interface ScoreDisplay {
  value: number;
  color: ScoreColor;
  label: string;
  description: string;
}

// ============================================================================
// Utility Types
// ============================================================================

export type IssueSeverity = 'critical' | 'high' | 'medium' | 'low';
export type IssueType = 'error' | 'warning' | 'info';
export type IssueCategory = 
  | 'syntax' 
  | 'mcp-compliance' 
  | 'security' 
  | 'best-practice'
  | 'environment'
  | 'dependencies'
  | 'permissions'
  | 'network';

// Made with Bob
