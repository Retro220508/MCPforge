import {
  LayoutDashboard,
  Wand2,
  Server,
  Settings,
  Zap,
  ChevronRight,
  Activity,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAppStore } from '../../store/appStore';
import { PLAN_LIMITS } from '../../utils/constants';

interface SidebarProps {
  onNavigate: (view: string) => void;
  currentView: string;
}

const NAV_ITEMS = [
  { label: 'Dashboard', view: 'dashboard', icon: LayoutDashboard },
  { label: 'New Server', view: 'forge', icon: Wand2 },
  { label: 'My Servers', view: 'servers', icon: Server },
  { label: 'Settings', view: 'settings', icon: Settings },
];

export default function Sidebar({ onNavigate, currentView }: SidebarProps) {
  const { state, dispatch } = useAppStore();
  const { user } = state;
  const plan = user?.billing_plan ?? 'free';
  const serverLimit = PLAN_LIMITS[plan].servers;
  const serverCount = user?.mcp_server_count ?? 0;
  const invocationCount = user?.monthly_invocation_count ?? 0;
  const invocationLimit = PLAN_LIMITS[plan].invocations;

  return (
    <aside className="hidden w-56 flex-shrink-0 flex-col border-r border-slate-200 bg-slate-50 lg:flex">
      <div className="flex flex-1 flex-col gap-1 p-3">
        {NAV_ITEMS.map(({ label, view, icon: Icon }) => (
          <button
            key={view}
            onClick={() => onNavigate(view)}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
              currentView === view
                ? 'bg-white text-violet-700 shadow-sm shadow-slate-200 ring-1 ring-slate-200'
                : 'text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm hover:shadow-slate-200'
            )}
          >
            <Icon className={cn('h-4 w-4', currentView === view ? 'text-violet-600' : 'text-slate-400')} />
            {label}
            {view === 'forge' && (
              <span className="ml-auto rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] font-bold text-violet-600">
                NEW
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Usage stats */}
      <div className="border-t border-slate-200 p-3">
        {plan === 'free' && (
          <div className="mb-3 rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-violet-700">Servers Used</span>
              <span className="text-xs font-bold text-violet-900">
                {serverCount}/{serverLimit}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-violet-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all"
                style={{ width: `${Math.min(100, (serverCount / (serverLimit as number)) * 100)}%` }}
              />
            </div>
            <button
              onClick={() => dispatch({ type: 'OPEN_UPGRADE_MODAL', payload: 'manual' })}
              className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-violet-600 py-2 text-xs font-semibold text-white transition-colors hover:bg-violet-700"
            >
              <Zap className="h-3 w-3" />
              Upgrade to Pro
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        )}

        {plan === 'pro' && (
          <div className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500">
                <Zap className="h-3 w-3 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-800">Pro Plan</p>
                <p className="text-xs text-emerald-600">Unlimited servers</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5" />
              <span>Invocations</span>
            </div>
            <span className="font-medium text-slate-700">
              {invocationCount}{plan === 'free' ? `/${invocationLimit}` : ''}
            </span>
          </div>
          {plan === 'free' && (
            <div className="h-1 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  invocationCount / (invocationLimit as number) > 0.8
                    ? 'bg-amber-500'
                    : 'bg-slate-400'
                )}
                style={{ width: `${Math.min(100, (invocationCount / (invocationLimit as number)) * 100)}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
