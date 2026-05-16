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
      // Simulate generation pipeline
      for (let i = 0; i < GENERATION_STEPS.length; i++) {
        const step = GENERATION_STEPS[i];
        setProgressLabel(step.label);

        const stepDuration = [800, 3500, 1200, 600][i];
        const startPct = i === 0 ? 0 : GENERATION_STEPS[i - 1].pct;
        const endPct = step.pct;
        const frames = 30;
        
        for (let f = 0; f <= frames; f++) {
          await new Promise((r) => setTimeout(r, stepDuration / frames));
          setProgress(startPct + ((endPct - startPct) * f) / frames);
        }
      }

      // Mock generated code
      const mockCode = `#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

// Initialize MCP server
const server = new Server(
  {
    name: 'custom-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool: example_tool
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'example_tool',
        description: 'An example tool generated from your prompt',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'The query parameter',
            },
          },
          required: ['query'],
        },
      },
    ],
  };
});

server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'example_tool') {
    const { query } = args as { query: string };
    return {
      content: [
        {
          type: 'text',
          text: \`Processed query: \${query}\`,
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
`;

      setGeneratedCode(mockCode);
      setGenState('complete');
    } catch (err) {
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
                    <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                      <Check className="h-5 w-5 flex-shrink-0 text-emerald-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-emerald-900">Validation Passed</p>
                        <p className="mt-1 text-sm text-emerald-700">
                          Code quality score: 97/100 — Ready to deploy
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-bold text-slate-900">Detected Dependencies</h3>
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                          <Package className="h-3 w-3" />
                          @modelcontextprotocol/sdk
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                          <Package className="h-3 w-3" />
                          zod
                        </span>
                      </div>
                    </div>
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
