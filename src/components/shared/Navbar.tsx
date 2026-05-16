import { Zap, Menu, X, Bell, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../utils/cn';
import { useAppStore } from '../../store/appStore';
import { getInitials, stringToColor } from '../../utils/formatters';

interface NavbarProps {
  onNavigate: (view: string) => void;
  currentView: string;
}

export default function Navbar({ onNavigate, currentView }: NavbarProps) {
  const { state, dispatch } = useAppStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const isMarketing = !state.user;

  const navLinks = isMarketing
    ? [
        { label: 'Features', view: 'marketing' },
        { label: 'Pricing', view: 'pricing' },
        { label: 'Blog', view: 'blog' },
      ]
    : [];

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <button
          onClick={() => onNavigate(state.user ? 'dashboard' : 'marketing')}
          className="flex items-center gap-2.5 font-bold text-slate-900"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 shadow-sm shadow-violet-200">
            <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-lg tracking-tight">
            MCP<span className="text-violet-600">Forge</span>
          </span>
        </button>

        {/* Desktop nav links (marketing) */}
        {isMarketing && (
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <button
                key={link.view}
                onClick={() => onNavigate(link.view)}
                className={cn(
                  'rounded-lg px-3.5 py-2 text-sm font-medium transition-colors',
                  currentView === link.view
                    ? 'bg-violet-50 text-violet-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                {link.label}
              </button>
            ))}
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-3">
          {isMarketing ? (
            <>
              <button
                onClick={() => onNavigate('dashboard')}
                className="hidden text-sm font-medium text-slate-600 hover:text-slate-900 sm:block"
              >
                Sign in
              </button>
              <button
                onClick={() => onNavigate('dashboard')}
                className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-violet-700 hover:shadow-md"
              >
                Get Started Free
              </button>
            </>
          ) : (
            <>
              {/* Notifications */}
              <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700">
                <Bell className="h-5 w-5" />
                {state.notifications.length > 0 && (
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-violet-500" />
                )}
              </button>

              {/* Plan badge */}
              {state.user?.billing_plan === 'free' && (
                <button
                  onClick={() => dispatch({ type: 'OPEN_UPGRADE_MODAL', payload: 'manual' })}
                  className="hidden items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 transition-all hover:border-violet-300 hover:bg-violet-100 sm:flex"
                >
                  <Zap className="h-3.5 w-3.5" />
                  Upgrade to Pro
                </button>
              )}

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 rounded-lg p-1 hover:bg-slate-100"
                >
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: stringToColor(state.user?.full_name || 'User') }}
                  >
                    {getInitials(state.user?.full_name || 'User')}
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>

                {profileOpen && (
                  <>
                    <div className="fixed inset-0" onClick={() => setProfileOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 w-56 rounded-xl border border-slate-200 bg-white shadow-lg">
                      <div className="border-b border-slate-100 px-4 py-3">
                        <p className="text-sm font-semibold text-slate-900">
                          {state.user?.full_name}
                        </p>
                        <p className="text-xs text-slate-500 capitalize">
                          {state.user?.billing_plan} plan
                        </p>
                      </div>
                      <div className="p-1">
                        <button
                          onClick={() => { onNavigate('settings'); setProfileOpen(false); }}
                          className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        >
                          Settings
                        </button>
                        <button
                          onClick={() => { dispatch({ type: 'SET_USER', payload: null }); onNavigate('marketing'); setProfileOpen(false); }}
                          className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && isMarketing && (
        <div className="border-t border-slate-100 bg-white px-4 py-3 md:hidden">
          {navLinks.map((link) => (
            <button
              key={link.view}
              onClick={() => { onNavigate(link.view); setMobileOpen(false); }}
              className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {link.label}
            </button>
          ))}
          <div className="mt-2 border-t border-slate-100 pt-2">
            <button
              onClick={() => { onNavigate('dashboard'); setMobileOpen(false); }}
              className="w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white"
            >
              Get Started Free
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
