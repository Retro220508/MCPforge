import {
  Server,
  Activity,
  TrendingUp,
  Plus,
  Wand2,
  Clock,
  CheckCircle2,
  XCircle,
  Zap,
  MoreVertical,
  Eye,
  Trash2,
  Globe,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '../utils/cn';
import { useAppStore } from '../store/appStore';
import { formatRelativeTime, formatCount } from '../utils/formatters';
import type { MCPServer } from '../types/mcp.types';
import { PLAN_LIMITS } from '../utils/constants';

const STATUS_CONFIG = {
  deployed: { label: 'Deployed', color: 'emerald', dot: 'animate-pulse' },
  draft: { label: 'Draft', color: 'slate', dot: '' },
  compiling: { label: 'Compiling', color: 'blue', dot: 'animate-pulse' },
  failed: { label: 'Failed', color: 'red', dot: '' },
} as const;

function ServerCard({
  server,
  onView,
  onDelete,
}: {
  server: MCPServer;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const status = STATUS_CONFIG[server.status];

  return (
    <div className="group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100">
              <Server className="h-4 w-4 text-violet-600" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900">{server.name}</p>
              <p className="truncate text-xs text-slate-400">{server.description || 'No description'}</p>
            </div>
          </div>
        </div>

        <div className="relative flex-shrink-0">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg p-1.5 text-slate-400 opacity-0 transition-all group-hover:opacity-100 hover:bg-slate-100 hover:text-slate-600"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-8 z-50 w-40 rounded-xl border border-slate-200 bg-white shadow-lg">
                <button
                  onClick={() => { onView(server.id); setMenuOpen(false); }}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <Eye className="h-3.5 w-3.5" /> View Code
                </button>
                <button
                  onClick={() => { onDelete(server.id); setMenuOpen(false); }}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Status & meta */}
      <div className="mt-3 flex items-center gap-3">
        <span
          className={cn(
            'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
            status.color === 'emerald' && 'bg-emerald-50 text-emerald-700',
            status.color === 'slate' && 'bg-slate-100 text-slate-600',
            status.color === 'blue' && 'bg-blue-50 text-blue-700',
            status.color === 'red' && 'bg-red-50 text-red-600',
          )}
        >
          <span className={cn('h-1.5 w-1.5 rounded-full', `bg-${status.color}-500`, status.dot)} />
          {status.label}
        </span>
        <span className="flex items-center gap-1 text-xs text-slate-400">
          {server.is_public ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
          {server.is_public ? 'Public' : 'Private'}
        </span>
      </div>

      {/* Stats */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-slate-50 p-2 text-center">
          <p className="text-base font-bold text-slate-900">{server.tool_count}</p>
          <p className="text-[10px] text-slate-400">Tools</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-2 text-center">
          <p className="text-base font-bold text-slate-900">{formatCount(server.invocation_count)}</p>
          <p className="text-[10px] text-slate-400">Calls</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-2 text-center">
          <p className="text-base font-bold text-slate-900">{server.validation_score ?? '—'}</p>
          <p className="text-[10px] text-slate-400">Score</p>
        </div>
      </div>

      {/* Last invoked */}
      <p className="mt-3 flex items-center gap-1 text-xs text-slate-400">
        <Clock className="h-3 w-3" />
        {server.last_invoked_at ? `Last used ${formatRelativeTime(server.last_invoked_at)}` : 'Never invoked'}
      </p>
    </div>
  );
}

interface DashboardPageProps {
  onNavigate: (view: string) => void;
}

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { state, dispatch } = useAppStore();
  const { user, servers } = state;
  const plan = user?.billing_plan ?? 'free';
  const serverLimit = PLAN_LIMITS[plan].servers;
  const invocationLimit = PLAN_LIMITS[plan].invocations;

  const handleDelete = (id: string) => {
    dispatch({ type: 'DELETE_SERVER', payload: id });
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: Date.now().toString(),
        type: 'success',
        title: 'Server deleted',
        message: 'The MCP server has been permanently removed.',
        timestamp: new Date().toISOString(),
      },
    });
  };

  const deployedCount = servers.filter((s) => s.status === 'deployed').length;
  const avgScore = servers.length
    ? Math.round(servers.reduce((sum, s) => sum + (s.validation_score ?? 0), 0) / servers.length)
    : 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.full_name?.split(' ')[0] ?? 'Developer';

  const METRICS = [
    {
      icon: Server,
      label: 'Total Servers',
      value: servers.length,
      sub: plan === 'free' ? `${serverLimit} max on free plan` : 'Unlimited on Pro',
      color: 'violet',
    },
    {
      icon: Activity,
      label: 'Invocations This Month',
      value: formatCount(user?.monthly_invocation_count ?? 0),
      sub: plan === 'free' ? `of ${invocationLimit} monthly limit` : 'Unlimited on Pro',
      color: 'blue',
    },
    {
      icon: CheckCircle2,
      label: 'Deployed Servers',
      value: deployedCount,
      sub: `${Math.round((deployedCount / Math.max(1, servers.length)) * 100)}% deployment rate`,
      color: 'emerald',
    },
    {
      icon: TrendingUp,
      label: 'Avg Validation Score',
      value: avgScore || '—',
      sub: avgScore >= 90 ? 'Excellent quality' : avgScore >= 70 ? 'Good quality' : 'Build more to see',
      color: 'amber',
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            {greeting}, {firstName} 👋
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {servers.length === 0
              ? "You haven't built any MCP servers yet. Let's change that!"
              : `You have ${servers.length} MCP server${servers.length !== 1 ? 's' : ''}. Keep building!`}
          </p>
        </div>
        <button
          onClick={() => {
            if (plan === 'free' && (user?.mcp_server_count ?? 0) >= 2) {
              dispatch({ type: 'OPEN_UPGRADE_MODAL', payload: 'quota_exceeded' });
            } else {
              onNavigate('forge');
            }
          }}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-violet-200 transition-all hover:shadow-md"
        >
          <Plus className="h-4 w-4" />
          New Server
        </button>
      </div>

      {/* Free tier banner */}
      {plan === 'free' && (user?.mcp_server_count ?? 0) >= 1 && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-violet-600" />
            <p className="text-sm font-medium text-violet-800">
              {2 - (user?.mcp_server_count ?? 0)} server slot{2 - (user?.mcp_server_count ?? 0) !== 1 ? 's' : ''} remaining on Free plan
            </p>
          </div>
          <button
            onClick={() => dispatch({ type: 'OPEN_UPGRADE_MODAL', payload: 'manual' })}
            className="flex items-center gap-1 text-xs font-bold text-violet-700 hover:text-violet-900"
          >
            Upgrade for unlimited <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {METRICS.map(({ icon: Icon, label, value, sub, color }) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className={cn(
              'mb-3 flex h-9 w-9 items-center justify-center rounded-xl',
              color === 'violet' && 'bg-violet-100',
              color === 'blue' && 'bg-blue-100',
              color === 'emerald' && 'bg-emerald-100',
              color === 'amber' && 'bg-amber-100',
            )}>
              <Icon className={cn(
                'h-4 w-4',
                color === 'violet' && 'text-violet-600',
                color === 'blue' && 'text-blue-600',
                color === 'emerald' && 'text-emerald-600',
                color === 'amber' && 'text-amber-600',
              )} />
            </div>
            <p className="text-2xl font-black text-slate-900">{value}</p>
            <p className="text-xs font-medium text-slate-700">{label}</p>
            <p className="mt-0.5 text-[11px] text-slate-400">{sub}</p>
          </div>
        ))}
      </div>

      {/* Servers grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Your MCP Servers</h2>
          {servers.length > 0 && (
            <button
              onClick={() => onNavigate('servers')}
              className="text-sm font-medium text-violet-600 hover:text-violet-800"
            >
              View all →
            </button>
          )}
        </div>

        {servers.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50">
              <Wand2 className="h-8 w-8 text-violet-400" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No servers yet</h3>
            <p className="mt-2 text-sm text-slate-500">
              Generate your first MCP server from a natural language description.
              <br />
              Takes about 30 seconds from prompt to deployed.
            </p>
            <button
              onClick={() => onNavigate('forge')}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-700"
            >
              <Zap className="h-4 w-4" />
              Build Your First Server
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {servers.map((server) => (
              <ServerCard
                key={server.id}
                server={server}
                onView={() => onNavigate('servers')}
                onDelete={handleDelete}
              />
            ))}

            {/* Add new server card */}
            <button
              onClick={() => {
                if (plan === 'free' && (user?.mcp_server_count ?? 0) >= 2) {
                  dispatch({ type: 'OPEN_UPGRADE_MODAL', payload: 'quota_exceeded' });
                } else {
                  onNavigate('forge');
                }
              }}
              className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-white p-8 text-slate-400 transition-all hover:border-violet-300 hover:bg-violet-50 hover:text-violet-500"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-dashed border-current">
                <Plus className="h-6 w-6" />
              </div>
              <span className="text-sm font-semibold">Build New Server</span>
            </button>
          </div>
        )}
      </div>

      {/* Recent activity */}
      {servers.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-bold text-slate-900">Recent Activity</h2>
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm divide-y divide-slate-100 overflow-hidden">
            {servers
              .filter((s) => s.last_invoked_at)
              .slice(0, 5)
              .map((server) => (
                <div key={server.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className={cn(
                    'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg',
                    server.status === 'deployed' ? 'bg-emerald-100' : 'bg-slate-100'
                  )}>
                    {server.status === 'deployed' ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {server.name} invoked
                    </p>
                    <p className="text-xs text-slate-400">
                      {server.invocation_count} total calls
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 flex-shrink-0">
                    {server.last_invoked_at ? formatRelativeTime(server.last_invoked_at) : '—'}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
