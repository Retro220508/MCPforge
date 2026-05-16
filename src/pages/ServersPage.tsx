import { useState } from 'react';
import {
  Server,
  Search,
  Filter,
  Plus,
  Eye,
  Trash2,
  Globe,
  Lock,
  Clock,
  Activity,
  Code2,
  MoreVertical,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Zap,
  Download,
} from 'lucide-react';
import { cn } from '../utils/cn';
import { useAppStore } from '../store/appStore';
import { formatRelativeTime, formatDate, formatCount } from '../utils/formatters';
import type { MCPServer, ServerStatus } from '../types/mcp.types';

const STATUS_CONFIG: Record<ServerStatus, { label: string; bg: string; text: string; dot: string; icon: typeof CheckCircle2 }> = {
  deployed: { label: 'Deployed', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500 animate-pulse', icon: CheckCircle2 },
  draft: { label: 'Draft', bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400', icon: Clock },
  compiling: { label: 'Compiling', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500 animate-pulse', icon: AlertTriangle },
  failed: { label: 'Failed', bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500', icon: XCircle },
};

function ServerDetailPanel({
  server,
  onClose,
  onDelete,
}: {
  server: MCPServer;
  onClose: () => void;
  onDelete: (id: string) => void;
}) {
  const [tab, setTab] = useState<'overview' | 'code' | 'logs'>('overview');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(server.generated_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([server.generated_code], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${server.name.toLowerCase()}.ts`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const status = STATUS_CONFIG[server.status];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end" onClick={onClose}>
      <div
        className="h-full w-full max-w-2xl overflow-hidden bg-white shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-slate-200 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100">
                <Server className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">{server.name}</h2>
                <p className="text-xs text-slate-400">{server.description || 'No description'}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              ✕
            </button>
          </div>

          <div className="mt-3 flex items-center gap-3 flex-wrap">
            <span className={cn('flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold', status.bg, status.text)}>
              <span className={cn('h-1.5 w-1.5 rounded-full', status.dot)} />
              {status.label}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-400">
              {server.is_public ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
              {server.is_public ? 'Public' : 'Private'}
            </span>
            <span className="text-xs text-slate-400">Region: {server.deployment_region}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          {(['overview', 'code', 'logs'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'border-b-2 px-5 py-3 text-sm font-semibold capitalize transition-colors',
                tab === t ? 'border-violet-500 text-violet-700' : 'border-transparent text-slate-500 hover:text-slate-700'
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-auto">
          {tab === 'overview' && (
            <div className="p-6 space-y-5">
              {/* Metrics */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Tools', value: server.tool_count, icon: Zap },
                  { label: 'Invocations', value: formatCount(server.invocation_count), icon: Activity },
                  { label: 'Quality Score', value: server.validation_score ? `${server.validation_score}/100` : '—', icon: CheckCircle2 },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="rounded-xl border border-slate-200 p-3 text-center">
                    <Icon className="mx-auto mb-1.5 h-4 w-4 text-slate-400" />
                    <p className="text-lg font-black text-slate-900">{value}</p>
                    <p className="text-xs text-slate-400">{label}</p>
                  </div>
                ))}
              </div>

              {/* Timeline */}
              <div className="rounded-xl border border-slate-200 p-4 space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Timeline</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Created</span>
                    <span className="font-medium text-slate-900">{formatDate(server.created_at, 'MMM d, yyyy HH:mm')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Last updated</span>
                    <span className="font-medium text-slate-900">{formatRelativeTime(server.updated_at)}</span>
                  </div>
                  {server.last_invoked_at && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Last invoked</span>
                      <span className="font-medium text-slate-900">{formatRelativeTime(server.last_invoked_at)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Environment variables */}
              {server.environment_variables.length > 0 && (
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Environment Variables</p>
                  <div className="space-y-2">
                    {server.environment_variables.map((envVar) => (
                      <div key={envVar.name} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                        <code className="text-xs font-mono font-semibold text-slate-800">{envVar.name}</code>
                        <code className="text-xs font-mono text-slate-400">
                          {envVar.isSecret ? '●●●●●●●●' : envVar.value || 'not set'}
                        </code>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Claude Desktop config */}
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Claude Desktop Config</p>
                <pre className="rounded-lg bg-slate-950 p-3 text-xs text-slate-300 overflow-x-auto">
{`{
  "mcpServers": {
    "${server.name.toLowerCase()}": {
      "command": "node",
      "args": ["path/to/${server.name.toLowerCase()}.js"],
      "env": {
        ${server.environment_variables.map(e => `"${e.name}": "your_value"`).join(',\n        ')}
      }
    }
  }
}`}
                </pre>
              </div>
            </div>
          )}

          {tab === 'code' && (
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-900 px-4 py-2">
                <span className="text-xs text-slate-400 font-mono">{server.name.toLowerCase()}.ts</span>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  >
                    {copied ? '✓ Copied' : 'Copy'}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  >
                    <Download className="h-3 w-3" />
                    Download
                  </button>
                </div>
              </div>
              <pre className="flex-1 overflow-auto bg-slate-950 p-5 text-xs leading-relaxed text-slate-300">
                <code>{server.generated_code}</code>
              </pre>
            </div>
          )}

          {tab === 'logs' && (
            <div className="p-6">
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-900 px-4 py-2">
                  <span className="text-xs text-slate-400 font-mono">Invocation logs</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {server.invocation_count === 0 ? (
                    <div className="py-8 text-center">
                      <Activity className="mx-auto h-8 w-8 text-slate-200 mb-2" />
                      <p className="text-sm text-slate-400">No invocations yet</p>
                    </div>
                  ) : (
                    Array.from({ length: Math.min(server.invocation_count, 5) }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 px-4 py-3">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">Tool invoked successfully</p>
                          <p className="text-xs text-slate-400">~{Math.floor(Math.random() * 200 + 50)}ms response time</p>
                        </div>
                        <span className="text-xs text-slate-400">
                          {formatRelativeTime(new Date(Date.now() - i * 30 * 60 * 1000).toISOString())}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="border-t border-slate-200 px-6 py-4 flex justify-between">
          <button
            onClick={() => { onDelete(server.id); onClose(); }}
            className="flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Delete Server
          </button>
        </div>
      </div>
    </div>
  );
}

interface ServersPageProps {
  onNavigate: (view: string) => void;
}

export default function ServersPage({ onNavigate }: ServersPageProps) {
  const { state, dispatch } = useAppStore();
  const { servers } = state;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ServerStatus | 'all'>('all');
  const [selectedServer, setSelectedServer] = useState<MCPServer | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const filtered = servers.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.description || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">My MCP Servers</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {servers.length} server{servers.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <button
          onClick={() => onNavigate('forge')}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm"
        >
          <Plus className="h-4 w-4" />
          New Server
        </button>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search servers..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
          />
        </div>

        <div className="flex gap-2">
          <Filter className="h-4 w-4 self-center text-slate-400" />
          {(['all', 'deployed', 'draft', 'failed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                'rounded-lg px-3 py-2 text-xs font-semibold capitalize transition-all',
                statusFilter === status
                  ? 'bg-violet-100 text-violet-700'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Server list */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
          <Server className="mx-auto h-12 w-12 text-slate-200 mb-4" />
          <h3 className="text-base font-bold text-slate-900">
            {search || statusFilter !== 'all' ? 'No matching servers' : 'No servers yet'}
          </h3>
          <p className="mt-2 text-sm text-slate-400">
            {search || statusFilter !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Build your first MCP server from a natural language description'}
          </p>
          <button
            onClick={() => onNavigate('forge')}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white"
          >
            <Zap className="h-4 w-4" />
            Build Your First Server
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((server) => {
            const status = STATUS_CONFIG[server.status];
            return (
              <div
                key={server.id}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-violet-200 hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100">
                    <Server className="h-5 w-5 text-violet-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-base font-bold text-slate-900 truncate">{server.name}</p>
                        <p className="text-sm text-slate-400 truncate">{server.description || 'No description'}</p>
                      </div>

                      <div className="relative flex-shrink-0 flex items-center gap-2">
                        <span className={cn('flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold', status.bg, status.text)}>
                          <span className={cn('h-1.5 w-1.5 rounded-full', status.dot)} />
                          {status.label}
                        </span>

                        <button
                          onClick={() => setMenuOpenId(menuOpenId === server.id ? null : server.id)}
                          className="rounded-lg p-1.5 text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-slate-100"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        {menuOpenId === server.id && (
                          <>
                            <div className="fixed inset-0" onClick={() => setMenuOpenId(null)} />
                            <div className="absolute right-0 top-8 z-50 w-40 rounded-xl border border-slate-200 bg-white shadow-lg">
                              <button
                                onClick={() => { setSelectedServer(server); setMenuOpenId(null); }}
                                className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                              >
                                <Eye className="h-3.5 w-3.5" /> View Details
                              </button>
                              <button
                                onClick={() => { setMenuOpenId(null); }}
                                className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                              >
                                <Code2 className="h-3.5 w-3.5" /> View Code
                              </button>
                              <button
                                onClick={() => { handleDelete(server.id); setMenuOpenId(null); }}
                                className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-3.5 w-3.5" /> Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-4 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Zap className="h-3 w-3" />
                        {server.tool_count} tools
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Activity className="h-3 w-3" />
                        {formatCount(server.invocation_count)} calls
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        {server.is_public ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                        {server.is_public ? 'Public' : 'Private'}
                      </span>
                      {server.validation_score && (
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <CheckCircle2 className="h-3 w-3" />
                          Score: {server.validation_score}/100
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="h-3 w-3" />
                        {formatRelativeTime(server.updated_at)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedServer(server)}
                    className="hidden flex-shrink-0 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 opacity-0 transition-all group-hover:opacity-100 hover:bg-slate-50 sm:flex"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail panel */}
      {selectedServer && (
        <ServerDetailPanel
          server={selectedServer}
          onClose={() => setSelectedServer(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
