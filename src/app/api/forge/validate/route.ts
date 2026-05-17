import { NextRequest, NextResponse } from 'next/server';
import {
  MCPValidator,
  RuntimeValidator,
  ConfidenceScorer,
  AutoRepair,
} from '@/lib/validation';

/**
 * POST /api/forge/validate
 * 
 * Validate generated MCP server code with comprehensive analysis
 * Separates code quality issues from runtime environment issues
 * 
 * Request body:
 * {
 *   "code": "string - the TypeScript code to validate",
 *   "includeAutoRepair": "boolean - whether to include auto-repair suggestions (optional)"
 * }
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, includeAutoRepair = true } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Code is required and must be a string' },
        { status: 400 }
      );
    }

    // Perform code validation
    const codeValidation = MCPValidator.validate(code);

    // Perform runtime validation
    const runtimeValidation = await RuntimeValidator.validate();

    // Calculate confidence score
    const confidenceScore = ConfidenceScorer.calculate(
      codeValidation,
      runtimeValidation
    );

    // Generate auto-repair suggestions if requested
    let repairSuggestions = null;
    if (includeAutoRepair) {
      repairSuggestions = AutoRepair.getSuggestions(
        codeValidation.issues,
        runtimeValidation.issues
      );
    }

    // Separate issues by type for better UX
    const issuesByType = {
      codeQuality: {
        syntax: codeValidation.issues.filter((i) => i.category === 'syntax'),
        mcpCompliance: codeValidation.issues.filter(
          (i) => i.category === 'mcp-compliance'
        ),
        security: codeValidation.issues.filter((i) => i.category === 'security'),
        bestPractices: codeValidation.issues.filter(
          (i) => i.category === 'best-practice'
        ),
      },
      runtime: {
        environment: runtimeValidation.issues.filter(
          (i) => i.category === 'environment'
        ),
        dependencies: runtimeValidation.issues.filter(
          (i) => i.category === 'dependencies'
        ),
        permissions: runtimeValidation.issues.filter(
          (i) => i.category === 'permissions'
        ),
        network: runtimeValidation.issues.filter((i) => i.category === 'network'),
      },
    };

    // Count issues by severity
    const severityCounts = {
      critical: [
        ...codeValidation.issues,
        ...runtimeValidation.issues,
      ].filter((i) => i.severity === 'critical').length,
      high: [
        ...codeValidation.issues,
        ...runtimeValidation.issues,
      ].filter((i) => i.severity === 'high').length,
      medium: [
        ...codeValidation.issues,
        ...runtimeValidation.issues,
      ].filter((i) => i.severity === 'medium').length,
      low: [
        ...codeValidation.issues,
        ...runtimeValidation.issues,
      ].filter((i) => i.severity === 'low').length,
    };

    return NextResponse.json({
      success: true,
      validation: {
        // Overall status
        isValid: codeValidation.isValid,
        canExecute: confidenceScore.canExecute,
        
        // Scores and metrics
        score: codeValidation.score,
        confidenceScore: confidenceScore.overall,
        rating: confidenceScore.rating,
        
        // Detailed metrics
        metrics: {
          code: codeValidation.metrics,
          runtime: {
            confidence: runtimeValidation.confidence,
          },
          breakdown: confidenceScore.breakdown,
        },
        
        // Issues separated by type
        issues: issuesByType,
        severityCounts,
        
        // Detected patterns
        detectedPatterns: codeValidation.detectedPatterns,
        runtimeEnvironment: runtimeValidation.environment,
        
        // Dependencies
        dependencies: codeValidation.dependencies,
        
        // Recommendations
        recommendations: confidenceScore.recommendations,
        
        // Auto-repair suggestions
        repairSuggestions,
        
        // Summary for display
        summary: {
          totalIssues: codeValidation.issues.length + runtimeValidation.issues.length,
          codeIssues: codeValidation.issues.length,
          runtimeIssues: runtimeValidation.issues.length,
          autoFixableIssues: [
            ...codeValidation.issues,
            ...runtimeValidation.issues,
          ].filter((i) => i.autoFixAvailable).length,
        },
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error validating code:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to validate code',
        details: error instanceof Error ? error.message : 'Unknown error',
        type: 'validation_error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/forge/validate
 * 
 * Get information about the validation endpoint
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/forge/validate',
    method: 'POST',
    description: 'Validate MCP server code with comprehensive analysis',
    features: [
      'Code quality validation (syntax, MCP compliance, security)',
      'Runtime environment validation',
      'Execution confidence scoring',
      'Auto-repair suggestions',
      'Separated code vs runtime issues',
    ],
    parameters: {
      code: 'string - The TypeScript code to validate (required)',
      includeAutoRepair: 'boolean - Include auto-repair suggestions (optional, default: true)',
    },
    response: {
      validation: {
        isValid: 'boolean - Whether code passes validation',
        canExecute: 'boolean - Whether code can be safely executed',
        score: 'number - Code quality score (0-100)',
        confidenceScore: 'number - Overall execution confidence (0-100)',
        rating: 'string - Rating: excellent, good, fair, poor, critical',
        metrics: 'object - Detailed score breakdown',
        issues: 'object - Issues separated by type and category',
        recommendations: 'array - Actionable recommendations',
        repairSuggestions: 'array - Auto-repair suggestions',
      },
    },
  });
}

// Made with Bob
