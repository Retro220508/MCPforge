/**
 * Core TypeScript type definitions for the MCPForge MCP generation pipeline.
 * All types are fully documented and production-ready.
 */

/** Transport layer options for MCP server communication */
export type TransportType = 'stdio' | 'sse' | 'http';

/** Billing plan tiers */
export type BillingPlan = 'free' | 'pro';

/** Lifecycle status of an MCP server */
export type ServerStatus = 'draft' | 'compiling' | 'deployed' | 'failed';

/** Output type produced by an MCP tool */
export type ToolOutputType = 'text' | 'json' | 'binary' | 'stream';

/** Severity level for validation issues */
export type ValidationSeverity = 'error' | 'warning' | 'info';

/** Estimated readiness for deployment */
export type ReadinessLevel = 'not-ready' | 'needs-work' | 'ready' | 'excellent';

/** Upgrade modal trigger context */
export type UpgradeTrigger = 'quota_exceeded' | 'feature_locked' | 'manual';

/**
 * Environment variable definition — value may be masked for secrets.
 */
export interface EnvironmentVariable {
  /** Variable name, must match /^[A-Z_][A-Z0-9_]*$/ */
  name: string;
  /** Variable value (masked as '***' for secret vars in API responses) */
  value: string;
  /** Whether this value should be encrypted at rest */
  isSecret: boolean;
}

/**
 * JSON Schema representation of a Zod schema for a tool's input parameters.
 */
export interface JSONSchema {
  type: string;
  properties?: Record<string, JSONSchemaProperty>;
  required?: string[];
  description?: string;
}

export interface JSONSchemaProperty {
  type: string;
  description?: string;
  enum?: string[];
  minimum?: number;
  maximum?: number;
  pattern?: string;
}

/**
 * Definition of a single MCP tool exported by a server.
 */
export interface MCPToolDefinition {
  /** Tool name in snake_case, validated against /^[a-z_][a-z0-9_]*$/ */
  name: string;
  /** Human-readable description, 10-200 characters */
  description: string;
  /** JSON Schema for the tool's input parameters */
  inputSchema: JSONSchema;
  /** Output format produced by this tool */
  outputType: ToolOutputType;
  /** Whether this tool requires authentication */
  authRequired: boolean;
  /** Estimated latency in milliseconds */
  estimatedLatencyMs: number;
}

/**
 * Definition of an MCP resource exposed by a server.
 */
export interface MCPResourceDefinition {
  uri: string;
  name: string;
  description: string;
  mimeType?: string;
}

/**
 * Definition of an MCP prompt template.
 */
export interface MCPPromptDefinition {
  name: string;
  description: string;
  arguments?: Array<{ name: string; description: string; required: boolean }>;
}

/**
 * Server capabilities advertisement.
 */
export interface ServerCapabilities {
  tools: boolean;
  resources: boolean;
  prompts: boolean;
  streaming: boolean;
}

/**
 * Complete configuration for a generated MCP server.
 */
export interface MCPServerConfig {
  /** Unique server identifier */
  serverId: string;
  /** Human-readable server name */
  serverName: string;
  /** Semantic version string */
  version: string;
  /** Transport layer implementation */
  transport: 'StdioServerTransport' | 'SSEServerTransport' | 'HttpServerTransport';
  /** All tools exposed by this server */
  tools: MCPToolDefinition[];
  /** All resources exposed by this server */
  resources: MCPResourceDefinition[];
  /** All prompt templates defined by this server */
  prompts: MCPPromptDefinition[];
  /** Environment variables required at runtime */
  environmentVariables: EnvironmentVariable[];
  /** Advertised server capabilities */
  capabilities: ServerCapabilities;
}

/**
 * Request payload for the MCP generation pipeline.
 */
export interface GenerationRequest {
  /** Natural language description of the MCP server to generate */
  userPrompt: string;
  /** Existing server ID if updating rather than creating */
  serverId?: string;
  /** Environment variables to include in the generated server */
  environmentVariables: EnvironmentVariable[];
  /** Preferred transport layer */
  preferredTransport: TransportType;
  /** Whether to use streaming response from AI */
  enableStreaming: boolean;
}

/**
 * Syntax error found during code validation.
 */
export interface SyntaxError {
  /** 1-indexed line number */
  line: number;
  /** 1-indexed column number */
  column: number;
  /** Human-readable error message */
  message: string;
  /** TypeScript diagnostic code */
  code: number;
  /** Severity level */
  severity: 'error' | 'warning';
}

/**
 * Structural warning about MCP-specific patterns.
 */
export interface StructuralWarning {
  type: 'missing_export' | 'missing_transport' | 'missing_error_handling' | 'missing_validation';
  message: string;
  suggestion: string;
}

/**
 * Security flag raised by the code scanner.
 */
export interface SecurityFlag {
  type: 'eval_usage' | 'hardcoded_secret' | 'dangerous_import' | 'sensitive_logging';
  line?: number;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  remediation: string;
}

/**
 * Report on environment variable usage in generated code.
 */
export interface EnvVarReport {
  /** Env vars used in code that were declared in the request */
  used: string[];
  /** Env vars used in code but NOT declared (will break at runtime) */
  undeclared: string[];
  /** Env vars declared but not referenced in code (possibly unused) */
  unused: string[];
}

/**
 * Complete validation report from the code analysis pipeline.
 */
export interface ValidationReport {
  /** Whether all critical checks passed */
  passed: boolean;
  /** TypeScript syntax errors */
  syntaxErrors: SyntaxError[];
  /** MCP structural warnings */
  structuralWarnings: StructuralWarning[];
  /** Missing required exports */
  missingExports: string[];
  /** npm packages detected in imports */
  detectedDependencies: string[];
  /** Security issues detected */
  securityFlags: SecurityFlag[];
  /** Environment variable analysis */
  envVarReport: EnvVarReport;
  /** Overall quality score (0-100) */
  score: number;
  /** Estimated readiness level */
  readinessLevel: ReadinessLevel;
  /** Actionable improvement suggestions */
  suggestions: string[];
  /** Whether the code is safe to deploy */
  canDeploy: boolean;
}

/**
 * Token usage data from an AI inference call.
 */
export interface TokenUsage {
  /** Tokens used in the prompt/context */
  promptTokens: number;
  /** Tokens generated in the completion */
  completionTokens: number;
  /** Total tokens (prompt + completion) */
  totalTokens: number;
  /** Estimated cost in USD */
  estimatedCostUSD: number;
  /** Model identifier used for this request */
  modelUsed: string;
}

/**
 * Complete result of an MCP generation operation.
 */
export interface GenerationResult {
  /** Whether generation succeeded */
  success: boolean;
  /** Raw generated TypeScript code */
  generatedCode: string;
  /** Parsed server configuration */
  config: MCPServerConfig;
  /** Full validation report */
  validationReport: ValidationReport;
  /** Token consumption data */
  tokenUsage: TokenUsage;
  /** Total time from request to completion in milliseconds */
  generationTimeMs: number;
  /** Whether this result was served from cache */
  cacheHit: boolean;
  /** Unique server ID (new or existing) */
  serverId: string;
  /** Generated README markdown content */
  readme?: string;
}

/**
 * Profile data for a registered user.
 */
export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  stripe_customer_id: string | null;
  billing_plan: BillingPlan;
  mcp_server_count: number;
  monthly_invocation_count: number;
  api_key: string;
  created_at: string;
  updated_at: string;
}

/**
 * MCP server record as stored in the database.
 */
export interface MCPServer {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  generated_code: string;
  status: ServerStatus;
  environment_variables: EnvironmentVariable[];
  tool_count: number;
  resource_count: number;
  last_invoked_at: string | null;
  deployment_region: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  invocation_count: number;
  validation_score: number | null;
  readme_content: string | null;
}

/** Data broadcast when a server is deployed */
export interface DeploymentBroadcastData {
  serverId: string;
  serverName: string;
  userId: string;
  deploymentTimeMs: number;
  toolCount: number;
  isPublic: boolean;
}

/** Prompt template for quick-start generation */
export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  prompt: string;
  icon: string;
  category: string;
  envVarHints: string[];
}

/** Pagination cursor for list endpoints */
export interface PaginationCursor {
  cursor?: string;
  limit: number;
  hasMore: boolean;
  total: number;
}
