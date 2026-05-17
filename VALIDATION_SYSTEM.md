# MCP Forge Validation System

## Overview

The MCP Forge validation system provides comprehensive code quality analysis, runtime environment validation, and execution confidence scoring for generated MCP servers. This document describes the improvements made to address validation accuracy and runtime reliability issues.

## Key Improvements

### 1. **Improved MCP Pattern Detection** ✅

**Problem:** The original validator used simplistic string matching that produced false negatives.

**Solution:** Enhanced pattern detection that checks for actual MCP SDK patterns:

```typescript
// OLD (incorrect)
hasToolHandlers: code.includes('tool handler')

// NEW (correct)
hasToolHandlers: 
  code.includes('setRequestHandler') &&
  (code.includes('CallToolRequestSchema') ||
   code.includes('ListToolsRequestSchema') ||
   code.includes("'tools/call'"))
```

**Location:** [`mcpforge/src/lib/validation/mcp-validator.ts`](mcpforge/src/lib/validation/mcp-validator.ts)

### 2. **Separated Validation Concerns** ✅

**Problem:** Code quality issues were mixed with runtime environment issues, confusing users.

**Solution:** Split validation into distinct categories:

- **Code Validation** - Syntax, MCP compliance, security, best practices
- **Runtime Validation** - Environment setup, dependencies, permissions, network

**Benefits:**
- Users can distinguish between "my code is bad" vs "the sandbox is broken"
- More actionable error messages
- Better debugging experience

**Location:** 
- Code: [`mcpforge/src/lib/validation/mcp-validator.ts`](mcpforge/src/lib/validation/mcp-validator.ts)
- Runtime: [`mcpforge/src/lib/validation/runtime-validator.ts`](mcpforge/src/lib/validation/runtime-validator.ts)

### 3. **Execution Confidence Scoring** ✅

**Problem:** Binary pass/fail didn't provide enough insight into code quality.

**Solution:** Multi-dimensional confidence scoring:

```typescript
{
  overall: 85,
  breakdown: {
    syntax: 95,
    mcpCompliance: 90,
    security: 80,
    bestPractices: 75,
    runtimeEnvironment: 85
  },
  rating: 'good',
  canExecute: true
}
```

**Features:**
- Weighted scoring (MCP compliance and security weighted higher)
- Visual indicators for UI display
- Clear execution readiness flag

**Location:** [`mcpforge/src/lib/validation/confidence-scorer.ts`](mcpforge/src/lib/validation/confidence-scorer.ts)

### 4. **Auto-Repair System** ✅

**Problem:** Users received errors but no guidance on how to fix them.

**Solution:** Intelligent auto-repair suggestions:

```typescript
{
  issueType: 'missing-error-handling',
  description: 'Wrap async operations in try-catch blocks',
  fix: 'Add try-catch error handling',
  confidence: 'high',
  canAutoApply: true
}
```

**Capabilities:**
- Automatic shebang addition
- Try-catch wrapping for async operations
- Console.log → MCP logging conversion
- Environment variable suggestions

**Location:** [`mcpforge/src/lib/validation/auto-repair.ts`](mcpforge/src/lib/validation/auto-repair.ts)

### 5. **Improved Runtime Environment Handling** ✅

**Problem:** Test failures due to sandbox filesystem issues (ENOENT errors, npm cache failures).

**Solution:** Proper environment setup:

```typescript
const testEnv: NodeJS.ProcessEnv = {
  ...process.env,
  HOME: tempDir,                    // Writable home directory
  npm_config_cache: join(tempDir, '.npm'),  // Writable npm cache
  TMPDIR: tempDir,                  // Writable temp directory
};
```

**Features:**
- Automatic tsx detection (preinstalled vs npx)
- Proper error categorization (code, runtime, environment, timeout)
- Detailed environment issue detection
- Actionable suggestions for each error type

**Location:** [`mcpforge/src/app/api/forge/test/route.ts`](mcpforge/src/app/api/forge/test/route.ts)

### 6. **Enhanced Error Categorization** ✅

**Problem:** All test failures reported as generic "test failed".

**Solution:** Specific error types with targeted suggestions:

| Error Type | Description | Suggestions |
|------------|-------------|-------------|
| `code` | Invalid code or parameters | Fix syntax errors |
| `runtime` | Code execution error | Add error handling |
| `environment` | Sandbox/filesystem issue | Set HOME=/tmp, configure npm cache |
| `timeout` | Execution exceeded limit | Optimize code, check for loops |
| `unknown` | Unexpected error | General troubleshooting |

**Location:** [`mcpforge/src/app/api/forge/test/route.ts`](mcpforge/src/app/api/forge/test/route.ts:35-36)

## API Endpoints

### POST `/api/forge/validate`

Validates MCP server code with comprehensive analysis.

**Request:**
```json
{
  "code": "string",
  "includeAutoRepair": true
}
```

**Response:**
```json
{
  "success": true,
  "validation": {
    "isValid": true,
    "canExecute": true,
    "score": 90,
    "confidenceScore": 85,
    "rating": "good",
    "metrics": {
      "code": {
        "syntax": 95,
        "mcpCompliance": 90,
        "security": 85,
        "bestPractices": 80
      },
      "runtime": {
        "confidence": 85
      },
      "breakdown": {
        "syntax": 95,
        "mcpCompliance": 90,
        "security": 85,
        "bestPractices": 80,
        "runtimeEnvironment": 85
      }
    },
    "issues": {
      "codeQuality": {
        "syntax": [],
        "mcpCompliance": [],
        "security": [],
        "bestPractices": []
      },
      "runtime": {
        "environment": [],
        "dependencies": [],
        "permissions": [],
        "network": []
      }
    },
    "recommendations": [],
    "repairSuggestions": []
  }
}
```

### POST `/api/forge/test`

Tests MCP server execution with improved error handling.

**Request:**
```json
{
  "code": "string",
  "toolName": "string",
  "toolArgs": {}
}
```

**Response (Success):**
```json
{
  "success": true,
  "output": "...",
  "executionTime": 1234,
  "toolResponse": {}
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Test execution failed",
  "errorType": "environment",
  "executionTime": 1234,
  "environmentIssues": [
    "npm registry access failed",
    "Network access may be restricted"
  ],
  "suggestions": [
    "Preinstall tsx instead of using npx",
    "Run: npm install -g tsx typescript @modelcontextprotocol/sdk"
  ]
}
```

## Validation Categories

### Code Quality Issues

1. **Syntax** - Unmatched braces, parentheses, await without async
2. **MCP Compliance** - Missing SDK imports, server setup, handlers
3. **Security** - eval(), hardcoded credentials, dangerous patterns
4. **Best Practices** - Error handling, input validation, logging

### Runtime Issues

1. **Environment** - Filesystem permissions, writable directories
2. **Dependencies** - Missing packages, npm access
3. **Permissions** - File system access, process permissions
4. **Network** - Registry access, external API calls

## Scoring System

### Overall Score Calculation

```typescript
weights = {
  syntax: 0.20,
  mcpCompliance: 0.25,  // Higher weight
  security: 0.20,        // Higher weight
  bestPractices: 0.10,
  runtimeEnvironment: 0.25
}
```

### Severity Deductions

- **Critical:** -25 points
- **High:** -15 points
- **Medium:** -8 points
- **Low:** -3 points

### Rating Thresholds

- **Excellent:** 90-100
- **Good:** 75-89
- **Fair:** 60-74
- **Poor:** 40-59
- **Critical:** 0-39

## Usage Examples

### Basic Validation

```typescript
import { MCPValidator } from '@/lib/validation';

const result = MCPValidator.validate(code);
console.log(`Score: ${result.score}/100`);
console.log(`Valid: ${result.isValid}`);
```

### Full Validation with Confidence

```typescript
import { 
  MCPValidator, 
  RuntimeValidator, 
  ConfidenceScorer 
} from '@/lib/validation';

const codeValidation = MCPValidator.validate(code);
const runtimeValidation = await RuntimeValidator.validate();
const confidence = ConfidenceScorer.calculate(
  codeValidation, 
  runtimeValidation
);

console.log(`Can Execute: ${confidence.canExecute}`);
console.log(`Confidence: ${confidence.overall}%`);
```

### Auto-Repair

```typescript
import { AutoRepair } from '@/lib/validation';

const suggestions = AutoRepair.getSuggestions(
  codeValidation.issues,
  runtimeValidation.issues
);

const repairResult = AutoRepair.applyRepairs(code, codeValidation.issues);
if (repairResult.applied) {
  console.log('Applied fixes:', repairResult.changes);
}
```

## Recommendations for Production

### 1. Preinstall Dependencies

```bash
npm install -g tsx typescript @modelcontextprotocol/sdk
```

**Benefits:**
- Faster execution (no npx download)
- More reliable (no network dependency)
- Better error messages

### 2. Configure Environment

```bash
export HOME=/tmp
export npm_config_cache=/tmp/.npm
mkdir -p /tmp/.npm
```

**Benefits:**
- Avoids permission errors
- Proper npm cache location
- Consistent behavior

### 3. Use Preinstalled tsx

```typescript
// Instead of
await execAsync(`npx tsx "${scriptPath}"`);

// Use
await execAsync(`tsx "${scriptPath}"`);
```

## File Structure

```
mcpforge/src/lib/validation/
├── index.ts                  # Exports
├── mcp-validator.ts          # Code quality validation
├── runtime-validator.ts      # Runtime environment validation
├── confidence-scorer.ts      # Execution confidence scoring
└── auto-repair.ts            # Auto-repair suggestions

mcpforge/src/app/api/forge/
├── validate/
│   └── route.ts             # Validation API endpoint
└── test/
    └── route.ts             # Test execution API endpoint

mcpforge/src/types/
└── validation.types.ts      # TypeScript type definitions
```

## Future Enhancements

1. **AST-based validation** - Use TypeScript compiler API for deeper analysis
2. **Dependency version checking** - Verify compatible package versions
3. **Performance profiling** - Detect performance bottlenecks
4. **Security scanning** - Integration with npm audit
5. **Custom rule engine** - User-defined validation rules
6. **Batch validation** - Validate multiple servers at once

## Contributing

When adding new validation rules:

1. Add the rule to the appropriate validator
2. Include severity level and category
3. Provide clear error messages
4. Add auto-fix suggestion if possible
5. Update tests and documentation

## License

Part of the MCP Forge project.