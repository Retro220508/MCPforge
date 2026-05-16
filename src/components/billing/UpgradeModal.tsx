import { useEffect, useRef } from 'react';
import {
  X,
  Zap,
  Rocket,
  Lock,
  Server,
  BarChart3,
  Webhook,
  Shield,
  CheckCircle2,
  Star,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAppStore } from '../../store/appStore';

const FEATURES = [
  { icon: Server, label: 'Unlimited MCP Servers', sub: 'vs 2 on free plan' },
  { icon: Rocket, label: 'Priority AI Generation', sub: 'Skip the queue' },
  { icon: Shield, label: 'Encrypted Secret Vault', sub: 'AES-256 encryption' },
  { icon: Webhook, label: 'Custom Webhooks', sub: 'Event-driven integrations' },
  { icon: BarChart3, label: 'Advanced Analytics', sub: 'Full invocation logs' },
  { icon: Lock, label: 'Private Servers', sub: 'Team access control' },
];

const TESTIMONIALS = [
  {
    text: 'MCPForge Pro saved me 3 days of MCP server development. Just described what I needed and it generated perfect TypeScript.',
    author: 'Sarah K.',
    role: 'Senior Engineer @ Vercel',
  },
  {
    text: 'Went from idea to deployed MCP server in under 2 minutes. The validation pipeline caught issues I would have missed.',
    author: 'Marcus T.',
    role: 'AI Tooling Lead @ Anthropic',
  },
  {
    text: 'The secret vault integration alone is worth the upgrade. No more hardcoded API keys in my MCP configs.',
    author: 'Priya R.',
    role: 'Indie Dev & AI Builder',
  },
];

interface UpgradeModalProps {
  open: boolean;
  trigger: 'quota_exceeded' | 'feature_locked' | 'manual';
  onClose: () => void;
}

export default function UpgradeModal({ open, trigger, onClose }: UpgradeModalProps) {
  const { dispatch } = useAppStore();
  const ctaRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => ctaRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const headlines: Record<typeof trigger, { title: string; sub: string }> = {
    quota_exceeded: {
      title: "You've Built 2 Servers — Unlock Unlimited",
      sub: "You've hit the free plan limit. Upgrade to Pro and build as many MCP servers as you need.",
    },
    feature_locked: {
      title: 'This Feature Requires MCPForge Pro',
      sub: 'Unlock advanced capabilities with our Pro plan and supercharge your AI workflows.',
    },
    manual: {
      title: 'Upgrade to MCPForge Pro',
      sub: 'Everything you need to build, deploy, and scale MCP servers at production speed.',
    },
  };

  const { title, sub } = headlines[trigger];

  const handleUpgrade = () => {
    // Simulate successful upgrade (in production: Stripe checkout)
    dispatch({ type: 'UPGRADE_PLAN', payload: 'pro' });
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: Date.now().toString(),
        type: 'success',
        title: '🎉 Welcome to Pro!',
        message: 'Your account has been upgraded. Enjoy unlimited MCP servers!',
        timestamp: new Date().toISOString(),
      },
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl shadow-slate-900/20">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header gradient */}
        <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 px-8 py-8">
          <div className="absolute inset-0 opacity-10">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute h-px w-full bg-white/50"
                style={{ top: `${i * 5}%`, transform: `rotate(${-15 + i * 0.5}deg)` }}
              />
            ))}
          </div>
          <div className="relative flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Rocket className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{title}</h2>
              <p className="mt-1 text-sm text-violet-200">{sub}</p>
            </div>
          </div>

          {/* Price */}
          <div className="mt-5 flex items-end gap-2">
            <span className="text-4xl font-black text-white">$19</span>
            <span className="mb-1 text-lg text-violet-300">/month</span>
            <span className="mb-1 ml-2 rounded-full bg-emerald-400/20 px-2.5 py-1 text-xs font-bold text-emerald-300">
              7-DAY FREE TRIAL
            </span>
          </div>
          <p className="mt-1 text-xs text-violet-300">Billed monthly — cancel anytime</p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-2 gap-3 p-6 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, label, sub: subLabel }) => (
            <div
              key={label}
              className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-3"
            >
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-violet-100">
                <Icon className="h-4 w-4 text-violet-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800">{label}</p>
                <p className="text-[11px] text-slate-500">{subLabel}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="border-t border-slate-100 px-6 py-4">
          <p className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
            Loved by 500+ developers
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div key={t.author} className="rounded-xl border border-slate-100 p-3">
                <div className="flex gap-0.5 mb-1.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-[11px] leading-relaxed text-slate-600">"{t.text}"</p>
                <p className="mt-2 text-[10px] font-bold text-slate-700">{t.author}</p>
                <p className="text-[10px] text-slate-400">{t.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="border-t border-slate-100 px-6 pb-6 pt-4">
          <button
            ref={ctaRef}
            onClick={handleUpgrade}
            className={cn(
              'group flex w-full items-center justify-center gap-2 rounded-xl py-4',
              'bg-gradient-to-r from-violet-600 to-indigo-600 text-white',
              'text-base font-bold shadow-lg shadow-violet-200 transition-all',
              'hover:from-violet-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-violet-300',
              'focus:outline-none focus:ring-4 focus:ring-violet-300'
            )}
          >
            <Zap className="h-5 w-5" />
            Start 7-Day Free Trial
            <span className="ml-1 opacity-70 group-hover:opacity-100 transition-opacity">→</span>
          </button>

          <div className="mt-3 flex items-center justify-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-xs text-slate-500">No credit card required for trial</span>
            <span className="text-slate-300">·</span>
            <button
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-slate-600 underline"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
