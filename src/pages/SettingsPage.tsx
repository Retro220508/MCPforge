import { useState } from 'react';
import {
  User,
  CreditCard,
  Key,
  Bell,
  Shield,
  Copy,
  Eye,
  EyeOff,
  CheckCircle2,
  Zap,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { cn } from '../utils/cn';
import { useAppStore } from '../store/appStore';
import { formatDate } from '../utils/formatters';
import { PLAN_LIMITS } from '../utils/constants';

type SettingsTab = 'profile' | 'billing' | 'api' | 'notifications';

interface SettingsPageProps {
  onNavigate?: (view: string) => void;
}

export default function SettingsPage({ onNavigate: _onNavigate }: SettingsPageProps) {
  const { state, dispatch } = useAppStore();
  const { user } = state;

  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [name, setName] = useState(user?.full_name ?? '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyCopied, setApiKeyCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const plan = user?.billing_plan ?? 'free';
  const isPro = plan === 'pro';
  const serverLimit = PLAN_LIMITS[plan].servers;
  const invocationLimit = PLAN_LIMITS[plan].invocations;

  const handleSaveProfile = () => {
    if (!user) return;
    dispatch({ type: 'SET_USER', payload: { ...user, full_name: name } });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: Date.now().toString(),
        type: 'success',
        title: 'Profile updated',
        message: 'Your profile has been saved successfully.',
        timestamp: new Date().toISOString(),
      },
    });
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(user?.api_key ?? '');
    setApiKeyCopied(true);
    setTimeout(() => setApiKeyCopied(false), 2000);
  };

  const TABS = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'billing' as const, label: 'Billing', icon: CreditCard },
    { id: 'api' as const, label: 'API Keys', icon: Key },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900">Settings</h1>
        <p className="mt-0.5 text-sm text-slate-500">Manage your account, billing, and API access</p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar tabs */}
        <div className="w-full lg:w-48 flex-shrink-0">
          <nav className="space-y-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                  activeTab === id
                    ? 'bg-violet-50 text-violet-700 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                <Icon className={cn('h-4 w-4', activeTab === id ? 'text-violet-600' : 'text-slate-400')} />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-4">
                <h2 className="text-base font-bold text-slate-900">Profile Information</h2>
                <p className="text-xs text-slate-400">Update your name and account details</p>
              </div>
              <div className="p-6 space-y-5">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-400 to-indigo-500 text-xl font-black text-white">
                    {(user?.full_name ?? 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{user?.full_name}</p>
                    <p className="text-xs text-slate-400 capitalize">{plan} plan · Member since {user?.created_at ? formatDate(user.created_at, 'MMM yyyy') : 'Unknown'}</p>
                  </div>
                </div>

                {/* Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value="alex@example.com"
                      disabled
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed"
                    />
                    <p className="mt-1 text-xs text-slate-400">Email cannot be changed. Contact support if needed.</p>
                  </div>
                </div>

                <button
                  onClick={handleSaveProfile}
                  className={cn(
                    'flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all',
                    saved
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-violet-600 text-white hover:bg-violet-700'
                  )}
                >
                  {saved ? (
                    <><CheckCircle2 className="h-4 w-4" /> Saved!</>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-4">
              {/* Current plan */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-6 py-4">
                  <h2 className="text-base font-bold text-slate-900">Current Plan</h2>
                </div>
                <div className="p-6">
                  <div className={cn(
                    'flex items-center justify-between rounded-xl p-4',
                    isPro ? 'bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200' : 'bg-slate-50 border border-slate-200'
                  )}>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-xl',
                        isPro ? 'bg-violet-100' : 'bg-slate-200'
                      )}>
                        <Zap className={cn('h-5 w-5', isPro ? 'text-violet-600' : 'text-slate-500')} />
                      </div>
                      <div>
                        <p className="text-base font-bold text-slate-900 capitalize">{plan} Plan</p>
                        <p className="text-xs text-slate-500">
                          {isPro
                            ? 'Unlimited servers · All features'
                            : `${user?.mcp_server_count ?? 0} of ${serverLimit} servers used`}
                        </p>
                      </div>
                    </div>
                    {isPro ? (
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                        Active
                      </span>
                    ) : (
                      <button
                        onClick={() => dispatch({ type: 'OPEN_UPGRADE_MODAL', payload: 'manual' })}
                        className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold text-white hover:bg-violet-700"
                      >
                        <Zap className="h-3.5 w-3.5" />
                        Upgrade to Pro
                      </button>
                    )}
                  </div>

                  {/* Usage summary */}
                  <div className="mt-5 grid grid-cols-2 gap-4">
                    <div className="rounded-xl border border-slate-200 p-4">
                      <p className="text-xs text-slate-500 mb-1">MCP Servers</p>
                      <p className="text-xl font-black text-slate-900">
                        {user?.mcp_server_count ?? 0}
                        <span className="text-sm font-normal text-slate-400">
                          {isPro ? ' (unlimited)' : ` / ${serverLimit}`}
                        </span>
                      </p>
                      {!isPro && (
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-violet-500"
                            style={{ width: `${Math.min(100, ((user?.mcp_server_count ?? 0) / (serverLimit as number)) * 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="rounded-xl border border-slate-200 p-4">
                      <p className="text-xs text-slate-500 mb-1">Monthly Invocations</p>
                      <p className="text-xl font-black text-slate-900">
                        {user?.monthly_invocation_count ?? 0}
                        <span className="text-sm font-normal text-slate-400">
                          {isPro ? ' (unlimited)' : ` / ${invocationLimit}`}
                        </span>
                      </p>
                      {!isPro && (
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-blue-500"
                            style={{ width: `${Math.min(100, ((user?.monthly_invocation_count ?? 0) / (invocationLimit as number)) * 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Plan comparison */}
              {!isPro && (
                <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-6">
                  <h3 className="text-base font-bold text-violet-900">Why upgrade to Pro?</h3>
                  <div className="mt-3 space-y-2">
                    {[
                      'Unlimited MCP servers',
                      'Unlimited invocations per month',
                      'SSE & HTTP transport types',
                      'Encrypted secret vault',
                      'Advanced analytics',
                      '7-day free trial',
                    ].map((feature) => (
                      <div key={feature} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-violet-600" />
                        <span className="text-sm text-violet-800">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => dispatch({ type: 'OPEN_UPGRADE_MODAL', payload: 'manual' })}
                    className="mt-5 flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-700"
                  >
                    <Zap className="h-4 w-4" />
                    Start 7-Day Free Trial — $19/mo
                  </button>
                </div>
              )}

              {isPro && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Manage Subscription</p>
                      <p className="text-xs text-slate-400">Update payment method, download invoices</p>
                    </div>
                    <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                      <ExternalLink className="h-4 w-4" />
                      Billing Portal
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'api' && (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-4">
                <h2 className="text-base font-bold text-slate-900">API Keys</h2>
                <p className="text-xs text-slate-400">Use your API key to authenticate direct API calls</p>
              </div>
              <div className="p-6 space-y-5">
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800">
                      Keep your API key secret. Do not share it or commit it to version control.
                      Rotate it immediately if you believe it has been compromised.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Secret API Key
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        value={user?.api_key ?? ''}
                        readOnly
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-10 font-mono text-sm text-slate-700"
                      />
                      <button
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <button
                      onClick={copyApiKey}
                      className={cn(
                        'flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all',
                        apiKeyCopied
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      )}
                    >
                      {apiKeyCopied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {apiKeyCopied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-700 mb-2">Example usage</p>
                  <pre className="rounded-xl bg-slate-950 p-4 text-xs text-slate-300 overflow-x-auto">
{`curl -X POST https://mcpforge.dev/api/forge/generate \\
  -H "Authorization: Bearer ${showApiKey ? (user?.api_key ?? 'YOUR_API_KEY') : 'mcpf_***'}" \\
  -H "Content-Type: application/json" \\
  -d '{"userPrompt": "Build a GitHub MCP server"}'`}
                  </pre>
                </div>

                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50">
                    <RefreshCw className="h-4 w-4" />
                    Rotate API Key
                  </button>
                  <p className="text-xs text-slate-400">Rotating invalidates your current key immediately</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-4">
                <h2 className="text-base font-bold text-slate-900">Notification Preferences</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {[
                  { label: 'Server deployment status', desc: 'Notify when a server is deployed or fails', key: 'deployment' },
                  { label: 'Quota warnings', desc: 'Alert when approaching usage limits', key: 'quota' },
                  { label: 'Security alerts', desc: 'Notify about security issues in generated code', key: 'security' },
                  { label: 'New features', desc: 'Product updates and new capabilities', key: 'features' },
                  { label: 'Weekly digest', desc: 'Weekly summary of your MCP server activity', key: 'digest' },
                ].map(({ label, desc, key }) => (
                  <div key={key} className="flex items-center justify-between px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{label}</p>
                      <p className="text-xs text-slate-400">{desc}</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input type="checkbox" defaultChecked={key !== 'digest'} className="sr-only peer" />
                      <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-all peer-checked:bg-violet-600 peer-checked:after:translate-x-full" />
                    </label>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-100 px-6 py-4">
                <button
                  onClick={() => dispatch({ type: 'ADD_NOTIFICATION', payload: { id: Date.now().toString(), type: 'success', title: 'Preferences saved', message: 'Your notification preferences have been updated.', timestamp: new Date().toISOString() } })}
                  className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
