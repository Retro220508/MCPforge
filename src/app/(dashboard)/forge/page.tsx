'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Zap,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  AlertCircle,
  Terminal,
  Shield,
  Package,
  Key,
  Plus,
  X,
  Loader2,
  Save,
  Download,
  Play,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const EXAMPLE_PROMPTS = [
  'Build a GitHub MCP server with PR review and issue creation tools',
  'Create a Jira MCP with ticket search, creation, and status updates',
  'Build a Slack MCP for sending messages and reading channels',
  'Create a Linear MCP with issue management and project tracking',
];

const PROMPT_TEMPLATES = [
  {
    id: 'github',
    name: 'GitHub Integration',
    desc: 'PR reviews, issues, CI status',
    icon: '🐙',
    prompt: 'Build a GitHub MCP server with tools for reviewing pull requests, creating issues, and checking CI status',
    envVarHints: ['GITHUB_TOKEN'],
  },
  {
    id: 'slack',
    name: 'Slack Bot',
    desc: 'Messages, channels, users',
    icon: '💬',
    prompt: 'Create a Slack MCP server with tools for sending messages, listing channels, and managing users',
    envVarHints: ['SLACK_BOT_TOKEN'],
  },
  {
    id: 'database',
    name: 'Database Query',
    desc: 'SQL queries, schema info',
    icon: '🗄️',
    prompt: 'Build a PostgreSQL MCP server with tools for executing queries, listing tables, and getting schema information',
    envVarHints: ['DATABASE_URL'],
  },
];

const GENERATION_STEPS = [
  { label: 'Analyzing prompt...', pct: 15 },
  { label: 'Generating TypeScript code...', pct: 60 },
  { label: 'Validating structure...', pct: 85 },
  { label: 'Finalizing...', pct: 100 },
];

type GenerationState = 'idle' | 'generating' | 'validating' | 'complete' | 'error';

interface EnvironmentVariable {
  name: string;
  value: string;
  isSecret: boolean;
}

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

export default function ForgePage() {
  const [prompt, setPrompt] = useState('');
  const [envVars, setEnvVars] = useState<EnvironmentVariable[]>([]);
  const [genState, setGenState] = useState<GenerationState>('idle');
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'validation' | 'test'>('code');
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [serverName, setServerName] = useState('');
  const [serverDescription, setServerDescription] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [testToolName, setTestToolName] = useState('');
  const [testToolArgs, setTestToolArgs] = useState('{}');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Rotate placeholder text
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % EXAMPLE_PROMPTS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(Math.max(ta.scrollHeight, 96), 400)}px`;
  }, [prompt]);

  const handleGenerate = async () => {
    if (prompt.trim().length < 10) return;

    setGenState('generating');
    setProgress(0);
    setGeneratedCode('');

    try {
      // Step 1: Analyzing prompt
      setProgressLabel(GENERATION_STEPS[0].label);
      setProgress(GENERATION_STEPS[0].pct);
      await new Promise((r) => setTimeout(r, 800));

      // Step 2: Generate code with real AI
      setProgressLabel(GENERATION_STEPS[1].label);
      setProgress(30);

      // Build environment variables context
      const envContext = envVars.length > 0
        ? `\n\nRequired environment variables:\n${envVars.map(v => `- ${v.name}: ${v.isSecret ? '(secret)' : v.value}`).join('\n')}`
        : '';

      const systemPrompt = `You are an expert MCP (Model Context Protocol) server developer. Generate production-ready, type-safe TypeScript code for MCP servers.

CRITICAL: You MUST follow this EXACT structure and API pattern:

REQUIRED IMPORTS (use these exact imports):
\`\`\`typescript
#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
\`\`\`

REQUIRED SERVER STRUCTURE (follow this pattern exactly):
1. Initialize Server with name and version
2. Use server.setRequestHandler() for 'tools/list' - returns array of tool definitions
3. Use server.setRequestHandler() for 'tools/call' - handles tool execution
4. Each tool must have: name, description, inputSchema (JSON Schema format)
5. Use StdioServerTransport for communication
6. Wrap in async main() function with error handling

EXAMPLE STRUCTURE TO FOLLOW:
\`\`\`typescript
#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server(
  {
    name: 'example-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'example_tool',
        description: 'Description of what this tool does',
        inputSchema: {
          type: 'object',
          properties: {
            param1: {
              type: 'string',
              description: 'Description of param1',
            },
          },
          required: ['param1'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'example_tool') {
    // Tool implementation here
    return {
      content: [
        {
          type: 'text',
          text: 'Tool result',
        },
      ],
    };
  }

  throw new Error(\`Unknown tool: \${name}\`);
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP server running on stdio');
}

main().catch(console.error);
\`\`\`

REQUIREMENTS:
- Use ONLY the imports and patterns shown above
- DO NOT use createServer, createLogger, or other non-existent APIs
- Each tool should have proper error handling
- Use environment variables for API keys/tokens (process.env.VARIABLE_NAME)
- Add comments explaining each tool's purpose
- Include proper TypeScript types where needed

OUTPUT FORMAT:
- Return ONLY the complete TypeScript code
- Do NOT include markdown code blocks or explanations
- Start directly with the shebang line (#!/usr/bin/env node)
- End with the main() function call`;

      const userPrompt = `Generate a complete MCP server with the following requirements:

${prompt}${envContext}

Generate the complete, production-ready TypeScript code now.`;

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userPrompt,
          systemPrompt,
          model: 'primary',
          temperature: 0.3,
          maxTokens: 3000
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Failed to generate code');
      }

      const data = await response.json();
      let generatedCode = data.completion;

      // Clean up the response - remove markdown code blocks if present
      generatedCode = generatedCode
        .replace(/^```(?:typescript|ts|javascript|js)?\n/gm, '')
        .replace(/\n```$/gm, '')
        .trim();

      setProgress(GENERATION_STEPS[1].pct);
      await new Promise((r) => setTimeout(r, 500));

      // Step 3: Validating
      setProgressLabel(GENERATION_STEPS[2].label);
      setProgress(70);

      // Call validation API
      try {
        const validationResponse = await fetch('/api/forge/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: generatedCode })
        });

        if (validationResponse.ok) {
          const validationData = await validationResponse.json();
          setValidationResult(validationData.validation);
        } else {
          console.error('Validation failed:', await validationResponse.text());
        }
      } catch (validationError) {
        console.error('Validation error:', validationError);
        // Continue even if validation fails
      }

      setProgress(GENERATION_STEPS[2].pct);
      await new Promise((r) => setTimeout(r, 800));

      // Step 4: Finalizing
      setProgressLabel(GENERATION_STEPS[3].label);
      setProgress(GENERATION_STEPS[3].pct);
      await new Promise((r) => setTimeout(r, 400));

      setGeneratedCode(generatedCode);
      setGenState('complete');
    } catch (err) {
      console.error('Generation error:', err);
      setGenState('error');
    }
  };

  const handleCopy = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!generatedCode) return;
    
    const blob = new Blob([generatedCode], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${serverName || 'mcp-server'}.ts`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSave = async () => {
    if (!generatedCode || !serverName.trim()) {
      alert('Please provide a server name');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/forge/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: serverName,
          description: serverDescription,
          prompt,
          generatedCode,
          validationScore: validationResult?.score || 0,
          validationResult,
          environmentVariables: envVars,
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Failed to save server');
      }

      setSaved(true);
      setShowSaveDialog(false);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Save error:', error);
      alert(error instanceof Error ? error.message : 'Failed to save server');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!generatedCode || !testToolName.trim()) {
      alert('Please provide a tool name to test');
      return;
    }

    // Parse test arguments
    let parsedArgs: Record<string, any>;
    try {
      parsedArgs = JSON.parse(testToolArgs);
    } catch (e) {
      alert('Invalid JSON in tool arguments');
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/forge/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: generatedCode,
          toolName: testToolName,
          toolArgs: parsedArgs
        })
      });

      const data = await response.json();
      setTestResult(data);

      if (!response.ok) {
        console.error('Test failed:', data);
      }
    } catch (error) {
      console.error('Test error:', error);
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to execute test',
        executionTime: 0
      });
    } finally {
      setTesting(false);
    }
  };

  const addEnvVar = () => {
    setEnvVars([...envVars, { name: '', value: '', isSecret: false }]);
  };

  const updateEnvVar = (index: number, field: keyof EnvironmentVariable, value: string | boolean) => {
    const updated = [...envVars];
    updated[index] = { ...updated[index], [field]: value };
    setEnvVars(updated);
  };

  const removeEnvVar = (index: number) => {
    setEnvVars(envVars.filter((_, i) => i !== index));
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">MCP Forge</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Generate production-ready MCP servers with AI
          </p>
        </div>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-violet-600 hover:text-violet-800"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left column - Input */}
        <div className="space-y-6">
          {/* Prompt input */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-600" />
              <h2 className="text-lg font-bold text-slate-900">Describe Your Server</h2>
            </div>
            
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={EXAMPLE_PROMPTS[placeholderIdx]}
              disabled={genState === 'generating'}
              className="w-full resize-none rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50"
              rows={4}
            />

            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-slate-400">
                {prompt.length < 10 ? 'At least 10 characters required' : `${prompt.length} characters`}
              </p>
              <button
                onClick={handleGenerate}
                disabled={genState === 'generating' || prompt.length < 10}
                className={cn(
                  "flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-200 transition-all hover:shadow-xl",
                  (genState === 'generating' || prompt.length < 10) && "opacity-50 cursor-not-allowed"
                )}
              >
                {genState === 'generating' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Generate
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick templates */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-3 text-sm font-bold text-slate-900">Quick Start Templates</h3>
            <div className="space-y-2">
              {PROMPT_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setPrompt(template.prompt)}
                  disabled={genState === 'generating'}
                  className="flex w-full items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 text-left transition-all hover:border-violet-300 hover:bg-violet-50 disabled:opacity-50"
                >
                  <span className="text-2xl">{template.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{template.name}</p>
                    <p className="text-xs text-slate-500">{template.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Environment variables */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-violet-600" />
                <h2 className="text-lg font-bold text-slate-900">Environment Variables</h2>
              </div>
              <button
                onClick={addEnvVar}
                disabled={genState === 'generating'}
                className="flex items-center gap-1 text-sm font-medium text-violet-600 hover:text-violet-800 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>

            {envVars.length === 0 ? (
              <p className="text-sm text-slate-400">No environment variables added yet</p>
            ) : (
              <div className="space-y-2">
                {envVars.map((envVar, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={envVar.name}
                      onChange={(e) => updateEnvVar(index, 'name', e.target.value)}
                      placeholder="VAR_NAME"
                      className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                    />
                    <input
                      type={envVar.isSecret ? 'password' : 'text'}
                      value={envVar.value}
                      onChange={(e) => updateEnvVar(index, 'value', e.target.value)}
                      placeholder="value"
                      className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                    />
                    <button
                      onClick={() => updateEnvVar(index, 'isSecret', !envVar.isSecret)}
                      className={cn(
                        "rounded-lg p-2 transition-colors",
                        envVar.isSecret ? "bg-violet-100 text-violet-600" : "bg-slate-100 text-slate-400"
                      )}
                    >
                      <Shield className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removeEnvVar(index)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column - Output */}
        <div className="space-y-6">
          {/* Progress */}
          {genState === 'generating' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-violet-600" />
                <h2 className="text-lg font-bold text-slate-900">Generating...</h2>
              </div>
              <div className="space-y-2">
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-slate-500">{progressLabel}</p>
              </div>
            </div>
          )}

          {/* Generated code */}
          {genState === 'complete' && generatedCode && (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              {/* Tabs */}
              <div className="flex items-center border-b border-slate-200 bg-slate-50 px-4">
                <button
                  onClick={() => setActiveTab('code')}
                  className={cn(
                    "px-4 py-3 text-sm font-medium transition-colors border-b-2",
                    activeTab === 'code'
                      ? "border-violet-600 text-violet-600"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  )}
                >
                  <Terminal className="inline h-4 w-4 mr-1.5" />
                  Generated Code
                </button>
                <button
                  onClick={() => setActiveTab('validation')}
                  className={cn(
                    "px-4 py-3 text-sm font-medium transition-colors border-b-2",
                    activeTab === 'validation'
                      ? "border-violet-600 text-violet-600"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  )}
                >
                  <Shield className="inline h-4 w-4 mr-1.5" />
                  Validation
                </button>
                <button
                  onClick={() => setActiveTab('test')}
                  className={cn(
                    "px-4 py-3 text-sm font-medium transition-colors border-b-2",
                    activeTab === 'test'
                      ? "border-violet-600 text-violet-600"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  )}
                >
                  <Play className="inline h-4 w-4 mr-1.5" />
                  Test
                </button>
                <div className="ml-auto flex items-center gap-2">
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-white"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                  <button
                    onClick={() => setShowSaveDialog(true)}
                    disabled={saved}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-violet-600 hover:bg-violet-50 disabled:opacity-50"
                  >
                    {saved ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-600" />
                        Saved!
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-white"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {activeTab === 'code' ? (
                  <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-300">
                    <code>{generatedCode}</code>
                  </pre>
                ) : activeTab === 'test' ? (
                  <div className="space-y-4">
                    {/* Test Input Form */}
                    <div className="space-y-3">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                          Tool Name
                        </label>
                        <input
                          type="text"
                          value={testToolName}
                          onChange={(e) => setTestToolName(e.target.value)}
                          placeholder="e.g., example_tool"
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                          Tool Arguments (JSON)
                        </label>
                        <textarea
                          value={testToolArgs}
                          onChange={(e) => setTestToolArgs(e.target.value)}
                          placeholder='{"param1": "value1"}'
                          rows={3}
                          className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-mono text-slate-900 placeholder-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                        />
                      </div>
                      <button
                        onClick={handleTest}
                        disabled={testing || !testToolName.trim()}
                        className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
                      >
                        {testing ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Testing...
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4" />
                            Run Test
                          </>
                        )}
                      </button>
                    </div>

                    {/* Test Results */}
                    {testResult && (
                      <div className="mt-4 space-y-3">
                        <div className={cn(
                          "flex items-start gap-3 rounded-lg border p-4",
                          testResult.success
                            ? "border-emerald-200 bg-emerald-50"
                            : "border-red-200 bg-red-50"
                        )}>
                          {testResult.success ? (
                            <Check className="h-5 w-5 flex-shrink-0 text-emerald-600 mt-0.5" />
                          ) : (
                            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p className={cn(
                              "text-sm font-semibold",
                              testResult.success ? "text-emerald-900" : "text-red-900"
                            )}>
                              {testResult.success ? 'Test Passed' : 'Test Failed'}
                            </p>
                            <p className={cn(
                              "mt-1 text-sm",
                              testResult.success ? "text-emerald-700" : "text-red-700"
                            )}>
                              Execution time: {testResult.executionTime}ms
                            </p>
                          </div>
                        </div>

                        {testResult.error && (
                          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                            <p className="text-sm font-semibold text-red-900">Error</p>
                            <pre className="mt-2 overflow-x-auto text-xs text-red-700">
                              {testResult.error}
                            </pre>
                          </div>
                        )}

                        {testResult.output && (
                          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                            <p className="text-sm font-semibold text-slate-900">Output</p>
                            <pre className="mt-2 overflow-x-auto text-xs text-slate-700">
                              {testResult.output}
                            </pre>
                          </div>
                        )}

                        {testResult.toolResponse && (
                          <div className="rounded-lg border border-violet-200 bg-violet-50 p-4">
                            <p className="text-sm font-semibold text-violet-900">Tool Response</p>
                            <pre className="mt-2 overflow-x-auto text-xs text-violet-700">
                              {JSON.stringify(testResult.toolResponse, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {validationResult ? (
                      <>
                        {/* Validation Status */}
                        <div className={cn(
                          "flex items-start gap-3 rounded-lg border p-4",
                          validationResult.valid
                            ? "border-emerald-200 bg-emerald-50"
                            : "border-amber-200 bg-amber-50"
                        )}>
                          {validationResult.valid ? (
                            <Check className="h-5 w-5 flex-shrink-0 text-emerald-600 mt-0.5" />
                          ) : (
                            <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600 mt-0.5" />
                          )}
                          <div>
                            <p className={cn(
                              "text-sm font-semibold",
                              validationResult.valid ? "text-emerald-900" : "text-amber-900"
                            )}>
                              {validationResult.valid ? 'Validation Passed' : 'Validation Issues Found'}
                            </p>
                            <p className={cn(
                              "mt-1 text-sm",
                              validationResult.valid ? "text-emerald-700" : "text-amber-700"
                            )}>
                              Code quality score: {validationResult.score}/100
                              {validationResult.valid && ' — Ready to deploy'}
                            </p>
                          </div>
                        </div>

                        {/* Validation Issues */}
                        {validationResult.issues.length > 0 && (
                          <div className="space-y-2">
                            <h3 className="text-sm font-bold text-slate-900">
                              Issues ({validationResult.issues.length})
                            </h3>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {validationResult.issues.map((issue, idx) => (
                                <div
                                  key={idx}
                                  className={cn(
                                    "flex items-start gap-2 rounded-lg border p-3 text-sm",
                                    issue.type === 'error' && "border-red-200 bg-red-50",
                                    issue.type === 'warning' && "border-amber-200 bg-amber-50",
                                    issue.type === 'info' && "border-blue-200 bg-blue-50"
                                  )}
                                >
                                  <AlertCircle className={cn(
                                    "h-4 w-4 flex-shrink-0 mt-0.5",
                                    issue.type === 'error' && "text-red-600",
                                    issue.type === 'warning' && "text-amber-600",
                                    issue.type === 'info' && "text-blue-600"
                                  )} />
                                  <div className="flex-1 min-w-0">
                                    <p className={cn(
                                      "font-medium",
                                      issue.type === 'error' && "text-red-900",
                                      issue.type === 'warning' && "text-amber-900",
                                      issue.type === 'info' && "text-blue-900"
                                    )}>
                                      {issue.message}
                                    </p>
                                    {issue.line && (
                                      <p className="text-xs text-slate-500 mt-0.5">
                                        Line {issue.line}
                                      </p>
                                    )}
                                  </div>
                                  <span className={cn(
                                    "text-xs font-medium px-2 py-0.5 rounded-full",
                                    issue.severity === 'critical' && "bg-red-100 text-red-700",
                                    issue.severity === 'high' && "bg-orange-100 text-orange-700",
                                    issue.severity === 'medium' && "bg-amber-100 text-amber-700",
                                    issue.severity === 'low' && "bg-slate-100 text-slate-700"
                                  )}>
                                    {issue.severity}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Dependencies */}
                        {validationResult.dependencies.length > 0 && (
                          <div className="space-y-2">
                            <h3 className="text-sm font-bold text-slate-900">
                              Detected Dependencies ({validationResult.dependencies.length})
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {validationResult.dependencies.map((dep) => (
                                <span
                                  key={dep}
                                  className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                                >
                                  <Package className="h-3 w-3" />
                                  {dep}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Checklist */}
                        <div className="space-y-2">
                          <h3 className="text-sm font-bold text-slate-900">Code Structure</h3>
                          <div className="space-y-1.5">
                            {[
                              { label: 'Shebang line', value: validationResult.hasShebang },
                              { label: 'MCP SDK imports', value: validationResult.hasMcpImports },
                              { label: 'Server setup', value: validationResult.hasServerSetup },
                              { label: 'Tool handlers', value: validationResult.hasToolHandlers },
                            ].map((item) => (
                              <div key={item.label} className="flex items-center gap-2 text-sm">
                                {item.value ? (
                                  <Check className="h-4 w-4 text-emerald-600" />
                                ) : (
                                  <X className="h-4 w-4 text-slate-300" />
                                )}
                                <span className={item.value ? "text-slate-700" : "text-slate-400"}>
                                  {item.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8 text-slate-400">
                        <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No validation data available</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Empty state */}
          {genState === 'idle' && !generatedCode && (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50">
                <Sparkles className="h-8 w-8 text-violet-400" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Ready to generate</h3>
              <p className="mt-2 text-sm text-slate-500">
                Describe your MCP server above and click Generate to see the magic happen
              </p>
            </div>
          )}

          {/* Error state */}
          {genState === 'error' && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-900">Generation Failed</p>
                  <p className="mt-1 text-sm text-red-700">
                    An error occurred during code generation. Please try again.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Dialog Modal */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Save MCP Server</h3>
              <button
                onClick={() => setShowSaveDialog(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Server Name *
                </label>
                <input
                  type="text"
                  value={serverName}
                  onChange={(e) => setServerName(e.target.value)}
                  placeholder="e.g., GitHub MCP Server"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Description (optional)
                </label>
                <textarea
                  value={serverDescription}
                  onChange={(e) => setServerDescription(e.target.value)}
                  placeholder="Brief description of what this server does..."
                  rows={3}
                  className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !serverName.trim()}
                  className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Server
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Made with Bob
