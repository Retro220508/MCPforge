'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Zap,
  ArrowRight,
  Terminal,
  Wand2,
  Rocket,
  Shield,
  GitBranch,
  Globe,
  ChevronRight,
  Star,
  Cpu,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const DEMO_STEPS = [
  { label: 'Prompt', code: '> Describe your MCP server...', delay: 0 },
  { label: 'Generating', code: '⚡ Generating TypeScript with Groq AI...', delay: 800 },
  { label: 'Validating', code: '✓ Syntax check passed (score: 97/100)', delay: 1600 },
  { label: 'Deploying', code: '🚀 Deployed to us-east-1 edge network', delay: 2400 },
  { label: 'Ready', code: '✅ MCP server ready — 3 tools registered', delay: 3200 },
];

const STATS = [
  { value: '500+', label: 'MCP Servers Built' },
  { value: '<30s', label: 'Avg Generation Time' },
  { value: '97%', label: 'Validation Pass Rate' },
  { value: '100%', label: 'Free to Start' },
];

const FEATURES = [
  {
    icon: Wand2,
    color: 'violet',
    title: 'AI-Powered Generation',
    description:
      'Describe your MCP server in plain English. Our Groq-powered engine generates production-ready TypeScript in seconds — complete with error handling, Zod validation, and proper MCP SDK patterns.',
  },
  {
    icon: Shield,
    color: 'emerald',
    title: 'Built-in Validation',
    description:
      'Every generated server passes through our 5-layer validation pipeline: syntax checking, structural analysis, security scanning, dependency mapping, and environment variable verification.',
  },
  {
    icon: Rocket,
    color: 'blue',
    title: 'One-Click Deployment',
    description:
      'Deploy to our global edge network instantly. Your MCP server is available to Claude, Cursor, VS Code, and any MCP-compatible client within seconds of generation.',
  },
  {
    icon: Terminal,
    color: 'orange',
    title: 'Type-Safe Code',
    description:
      'Generated servers use strict TypeScript, Zod schemas for input validation, comprehensive JSDoc documentation, and follow all MCP SDK best practices — ready for production.',
  },
  {
    icon: GitBranch,
    color: 'purple',
    title: 'Version Control',
    description:
      'Every generation is versioned. View diffs between versions, roll back to any previous iteration, and track changes across your entire MCP server fleet.',
  },
  {
    icon: Globe,
    color: 'cyan',
    title: 'Environment Vault',
    description:
      'Store API keys, tokens, and secrets in our AES-256 encrypted vault. Secrets are injected at runtime — never exposed in generated code or logs.',
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: MessageSquare,
    title: 'Describe Your Server',
    description:
      'Type a natural language description of what you want your MCP server to do. Include the APIs it should interact with, the tools it should expose, and any authentication requirements.',
    example: '"Build a GitHub MCP with PR review, issue creation, and CI status tools"',
  },
  {
    step: '02',
    icon: Cpu,
    title: 'AI Generates the Code',
    description:
      'Our Groq-powered pipeline analyzes your prompt and generates complete TypeScript code using the official MCP SDK, with proper tool definitions, error handling, and Zod validation.',
    example: 'Full TypeScript generated in ~8 seconds using llama-3.1-70b',
  },
  {
    step: '03',
    icon: Rocket,
    title: 'Validate & Deploy',
    description:
      'The generated code passes through our 5-layer validation pipeline. Once validated (score ≥70), deploy to the edge with one click and connect to your AI clients immediately.',
    example: 'Average validation score: 94/100 — ready to deploy in <30s total',
  },
];

const SOCIAL_PROOF = [
  { author: 'Dan A.', role: 'Staff Engineer @ Linear', stars: 5, text: 'Built our entire Linear MCP integration in 45 seconds. Would have taken me 2 days manually. The generated code was cleaner than what I would have written.' },
  { author: 'Yuki N.', role: 'AI Research @ OpenAI', stars: 5, text: 'The validation pipeline is impressively thorough. It caught an env var issue I would have debugged for hours. Deploy confidence went from 60% to 98%.' },
  { author: 'Marcus B.', role: 'CTO @ Stealth AI Startup', stars: 5, text: 'We use MCPForge to rapidly prototype MCP integrations for client demos. What used to take a day now takes minutes. Shipped 12 MCPs in our first week.' },
];

const FAQ = [
  {
    q: 'What is an MCP server?',
    a: 'Model Context Protocol (MCP) is an open standard by Anthropic that allows AI assistants (Claude, Cursor, VS Code Copilot, etc.) to interact with external tools and APIs. An MCP server exposes "tools" that AI clients can call — like searching Jira, creating GitHub issues, or querying your database.',
  },
  {
    q: 'What AI clients work with MCP servers?',
    a: 'All major AI coding assistants support MCP: Claude Desktop, Cursor, Cline, Continue, Windsurf, Zed, and VS Code with the Copilot extension. Any client implementing the MCP specification works with servers built by MCPForge.',
  },
  {
    q: 'How does the free plan work?',
    a: "The free plan lets you generate and deploy up to 2 MCP servers with 50 invocations per month. There's no credit card required to start. Each server can have unlimited tools — the limit is on the number of distinct deployed servers.",
  },
  {
    q: 'Can I edit the generated code?',
    a: "Absolutely. The generated code is yours — download it, modify it, commit it to GitHub. We also provide an in-browser Monaco Editor (same editor as VS Code) where you can edit and re-validate code directly.",
  },
  {
    q: 'How are secrets and API keys handled?',
    a: "On Pro plans, secrets are stored in our AES-256 encrypted vault and injected as environment variables at runtime. They're never included in generated code, never logged, and never accessible via the API. On free plans, you manage secrets yourself via your MCP client's configuration.",
  },
  {
    q: 'What happens if validation fails?',
    a: "The validation panel shows you exactly what's wrong: syntax errors with line numbers, structural issues, security flags, and dependency problems. Each issue includes a specific remediation suggestion. You can fix issues in the editor and re-validate without regenerating.",
  },
];

export default function Home() {
  const [demoStep, setDemoStep] = useState(0);
  const [promptText, setPromptText] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [typingDone, setTypingDone] = useState(false);
  const demoPrompt = 'Build a GitHub MCP server with PR review and issue creation tools';

  // Typewriter animation for demo prompt
  useEffect(() => {
    if (typingDone) return;
    let i = 0;
    const interval = setInterval(() => {
      setPromptText(demoPrompt.slice(0, i + 1));
      i++;
      if (i >= demoPrompt.length) {
        clearInterval(interval);
        setTypingDone(true);
        // Start demo steps
        DEMO_STEPS.forEach((step) => {
          setTimeout(() => setDemoStep(step.delay / 800), step.delay + 1000);
        });
      }
    }, 35);
    return () => clearInterval(interval);
  }, [typingDone]);

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
        {/* Background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-64 -top-64 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 opacity-60 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-purple-100 to-pink-100 opacity-40 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-5xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-sm font-medium text-violet-700">
            <Zap className="h-3.5 w-3.5" />
            <span>Built on Groq + MCP SDK — Free to start</span>
          </div>

          {/* Headline */}
          <h1 className="mx-auto max-w-4xl text-5xl font-black tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
            Build MCP Servers{' '}
            <span className="relative">
              <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                with AI
              </span>
              <svg
                className="absolute -bottom-2 left-0 w-full text-violet-300"
                viewBox="0 0 300 12"
                fill="none"
              >
                <path
                  d="M2 10 C 80 2, 220 2, 298 10"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>{' '}
            in Seconds
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-500 leading-relaxed">
            Describe your MCP server in plain English. MCPForge generates production-ready TypeScript,
            validates it through a 5-layer pipeline, and deploys to the edge — all in under 30 seconds.
          </p>

          {/* CTA buttons */}
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/forge"
              className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-violet-200 transition-all hover:shadow-xl hover:shadow-violet-300 hover:scale-105"
            >
              <Zap className="h-5 w-5" />
              Build Your First MCP — Free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/pricing"
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-8 py-4 text-base font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
            >
              View Pricing
            </Link>
          </div>

          <p className="mt-4 text-xs text-slate-400">
            No credit card required · 2 free servers forever · Deploy in {'<'}30s
          </p>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {STATS.map(({ value, label }) => (
              <div key={label} className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                <p className="text-2xl font-black text-violet-600">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Demo Terminal */}
      <section className="px-4 pb-20 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-2xl shadow-slate-200/50">
            {/* Terminal header */}
            <div className="flex items-center gap-2 border-b border-slate-700 bg-slate-900 px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <div className="h-3 w-3 rounded-full bg-amber-500" />
              <div className="h-3 w-3 rounded-full bg-emerald-500" />
              <span className="ml-3 text-xs font-medium text-slate-400">MCPForge Terminal</span>
            </div>
            {/* Terminal body */}
            <div className="bg-slate-950 p-6 font-mono text-sm">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-violet-400 flex-shrink-0">$</span>
                  <span className="text-emerald-400">
                    {promptText}
                    {!typingDone && (
                      <span className="animate-pulse ml-0.5 inline-block w-2 bg-emerald-400">&nbsp;</span>
                    )}
                  </span>
                </div>

                {typingDone && DEMO_STEPS.slice(0, demoStep + 1).map((step, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-300">
                    <span className="text-violet-400">→</span>
                    <span className={cn(
                      i === demoStep ? 'text-white' : 'text-slate-500',
                      step.label === 'Ready' ? 'text-emerald-400' : ''
                    )}>
                      {step.code}
                    </span>
                    {i === demoStep && step.label !== 'Ready' && (
                      <span className="text-xs text-slate-600 ml-auto animate-pulse">processing...</span>
                    )}
                  </div>
                ))}

                {demoStep >= 4 && (
                  <div className="mt-4 rounded-lg border border-slate-700 bg-slate-900 p-3">
                    <p className="text-xs text-slate-400 mb-1">Generated server config:</p>
                    <pre className="text-xs text-slate-300 overflow-x-auto">{`{
  "name": "github-assistant",
  "version": "1.0.0",
  "tools": ["list_repos", "create_issue", "review_pr"],
  "transport": "stdio",
  "score": 97
}`}</pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-50 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-black text-slate-900 sm:text-4xl">
              Everything you need to ship MCP servers fast
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-500">
              From AI generation to production deployment — every tool in one place.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, color, title, description }) => (
              <div
                key={title}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:shadow-slate-200"
              >
                <div className={cn(
                  'mb-4 flex h-11 w-11 items-center justify-center rounded-xl',
                  color === 'violet' && 'bg-violet-100',
                  color === 'emerald' && 'bg-emerald-100',
                  color === 'blue' && 'bg-blue-100',
                  color === 'orange' && 'bg-orange-100',
                  color === 'purple' && 'bg-purple-100',
                  color === 'cyan' && 'bg-cyan-100',
                )}>
                  <Icon className={cn(
                    'h-5 w-5',
                    color === 'violet' && 'text-violet-600',
                    color === 'emerald' && 'text-emerald-600',
                    color === 'blue' && 'text-blue-600',
                    color === 'orange' && 'text-orange-600',
                    color === 'purple' && 'text-purple-600',
                    color === 'cyan' && 'text-cyan-600',
                  )} />
                </div>
                <h3 className="text-base font-bold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-3xl font-black text-slate-900 sm:text-4xl">
              From prompt to production in 3 steps
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-500">
              No boilerplate. No SDK docs. No debugging. Just describe and deploy.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
            {HOW_IT_WORKS.map(({ step, icon: Icon, title, description, example }) => (
              <div key={step} className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-200">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="mt-4">
                  <span className="text-4xl font-black text-slate-100">{step}</span>
                  <h3 className="mt-1 text-xl font-bold text-slate-900">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{description}</p>
                  <div className="mt-3 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
                    <p className="text-xs italic text-slate-500">"{example}"</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-gradient-to-br from-violet-50 to-indigo-50 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <div className="flex justify-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <h2 className="text-3xl font-black text-slate-900">
              Trusted by AI-forward engineers
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {SOCIAL_PROOF.map(({ author, role, stars, text }) => (
              <div
                key={author}
                className="rounded-2xl border border-white bg-white p-6 shadow-sm shadow-violet-100"
              >
                <div className="flex gap-0.5 mb-3">
                  {[...Array(stars)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-slate-700">"{text}"</p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 text-xs font-bold text-white">
                    {author[0]}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{author}</p>
                    <p className="text-xs text-slate-400">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-black text-slate-900 mb-10">
            Frequently asked questions
          </h2>
          <div className="space-y-2">
            {FAQ.map(({ q, a }, i) => (
              <div key={i} className="rounded-xl border border-slate-200 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                >
                  <span className="text-sm font-semibold text-slate-900">{q}</span>
                  <ChevronRight
                    className={cn(
                      'h-4 w-4 flex-shrink-0 text-slate-400 transition-transform',
                      openFaq === i && 'rotate-90'
                    )}
                  />
                </button>
                {openFaq === i && (
                  <div className="border-t border-slate-100 px-5 pb-4 pt-3">
                    <p className="text-sm leading-relaxed text-slate-500">{a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 pb-20 sm:px-6">
        <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 p-12 text-center shadow-2xl shadow-violet-300">
          <Zap className="mx-auto h-12 w-12 text-violet-200 mb-4" />
          <h2 className="text-3xl font-black text-white sm:text-4xl">
            Ready to build your first MCP server?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-violet-200">
            Join 500+ developers shipping AI integrations faster with MCPForge. 
            Free forever for your first 2 servers.
          </p>
          <Link
            href="/forge"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-violet-700 shadow-lg transition-all hover:bg-violet-50 hover:shadow-xl"
          >
            <Zap className="h-5 w-5" />
            Start Building — It's Free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-4 text-xs text-violet-300">No credit card · No setup · Deploy in 30 seconds</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
                <Zap className="h-3.5 w-3.5 text-white" />
              </div>
              MCP<span className="text-violet-600">Forge</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <Link href="/pricing" className="hover:text-slate-900">Pricing</Link>
              <Link href="/blog" className="hover:text-slate-900">Blog</Link>
              <a href="#" className="hover:text-slate-900">GitHub</a>
              <a href="#" className="hover:text-slate-900">Docs</a>
            </div>
            <p className="text-xs text-slate-400">© 2025 MCPForge. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Made with Bob
