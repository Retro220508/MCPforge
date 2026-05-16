import { CheckCircle2, X, Zap, ArrowRight, Shield } from 'lucide-react';
import { cn } from '../utils/cn';
import { useAppStore } from '../store/appStore';

interface PricingPageProps {
  onNavigate: (view: string) => void;
}

const FREE_FEATURES = [
  '2 MCP servers',
  '50 invocations / month',
  'stdio transport',
  'Basic validation',
  'Community support',
  'Download generated code',
];

const PRO_FEATURES = [
  'Unlimited MCP servers',
  'Unlimited invocations',
  'All transport types (stdio, SSE, HTTP)',
  '5-layer validation pipeline',
  'Encrypted secret vault',
  'Custom webhook integrations',
  'Advanced analytics & logs',
  'Priority AI generation queue',
  'Version history & diffs',
  'Public server registry',
  'Team collaboration (coming soon)',
  'Priority support',
];

const FREE_MISSING = [
  'Secret vault encryption',
  'Advanced analytics',
  'SSE / HTTP transport',
  'Custom webhooks',
];

export default function PricingPage({ onNavigate }: PricingPageProps) {
  const { state, dispatch } = useAppStore();
  const isLoggedIn = !!state.user;
  const isPro = state.user?.billing_plan === 'pro';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-sm font-medium text-violet-700 mb-5">
            <Shield className="h-3.5 w-3.5" />
            Simple, transparent pricing
          </div>
          <h1 className="text-4xl font-black text-slate-900 sm:text-5xl">
            Start free. Scale when ready.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-500">
            No hidden fees. No usage surprises. Cancel anytime.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          {/* Free Plan */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">Free</h2>
              <p className="mt-1 text-sm text-slate-500">Perfect for exploration and personal projects</p>
              <div className="mt-4 flex items-end gap-1">
                <span className="text-4xl font-black text-slate-900">$0</span>
                <span className="mb-1 text-slate-400">/month</span>
              </div>
            </div>

            <button
              onClick={() => onNavigate(isLoggedIn ? 'dashboard' : 'forge')}
              className="mb-6 w-full rounded-xl border border-slate-200 bg-slate-50 py-3 text-sm font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-100"
            >
              {isLoggedIn && !isPro ? 'Current Plan' : 'Get Started Free'}
            </button>

            <div className="space-y-3">
              {FREE_FEATURES.map((f) => (
                <div key={f} className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-500" />
                  <span className="text-sm text-slate-700">{f}</span>
                </div>
              ))}
              {FREE_MISSING.map((f) => (
                <div key={f} className="flex items-center gap-3 opacity-40">
                  <X className="h-4 w-4 flex-shrink-0 text-slate-400" />
                  <span className="text-sm text-slate-500">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pro Plan */}
          <div className="relative rounded-2xl border border-violet-300 bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 p-8 shadow-2xl shadow-violet-200">
            {/* Popular badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-4 py-1 text-xs font-black uppercase tracking-wider text-amber-900">
              Most Popular
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-white">Pro</h2>
              <p className="mt-1 text-sm text-violet-200">Everything you need to build at scale</p>
              <div className="mt-4 flex items-end gap-1">
                <span className="text-4xl font-black text-white">$19</span>
                <span className="mb-1 text-violet-300">/month</span>
              </div>
              <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1">
                <Zap className="h-3 w-3 text-amber-300" />
                <span className="text-xs font-semibold text-amber-200">7-day free trial included</span>
              </div>
            </div>

            <button
              onClick={() => {
                if (isPro) {
                  onNavigate('settings');
                } else {
                  dispatch({ type: 'OPEN_UPGRADE_MODAL', payload: 'manual' });
                }
              }}
              className={cn(
                'mb-6 w-full rounded-xl py-3 text-sm font-bold transition-all',
                isPro
                  ? 'bg-white/20 text-white hover:bg-white/30'
                  : 'bg-white text-violet-700 hover:bg-violet-50 shadow-lg'
              )}
            >
              {isPro ? 'Current Plan ✓' : 'Start Free Trial →'}
            </button>

            <div className="space-y-3">
              {PRO_FEATURES.map((f) => (
                <div key={f} className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-300" />
                  <span className="text-sm text-violet-100">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ callout */}
        <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h3 className="text-xl font-bold text-slate-900">Have questions?</h3>
          <p className="mt-2 text-sm text-slate-500">
            Check our FAQ section on the homepage or reach out to our team.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={() => onNavigate('marketing')}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Read FAQ
            </button>
            <button
              onClick={() => onNavigate('forge')}
              className="flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
            >
              <Zap className="h-4 w-4" />
              Try for Free Now
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
