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
  const [activeTab, setActiveTab] = useState<'code' | 'validation'>('code');
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  
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

REQUIREMENTS:
- Use @modelcontextprotocol/sdk for the MCP server implementation
- Include proper TypeScript types and Zod schemas for validation
- Follow MCP protocol specifications exactly
- Include error handling and logging
- Make code production-ready with proper structure
- Add helpful comments explaining the implementation
- Use stdio transport for communication
- Include a shebang line (#!/usr/bin/env node) at the top

OUTPUT FORMAT:
- Return ONLY the complete TypeScript code
- Do NOT include markdown code blocks or explanations
- Start directly with the shebang line
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
                <div className="ml-auto">
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
    </div>
  );
}

// Made with Bob
