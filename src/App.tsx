import { useReducer, useEffect, useState } from 'react';
import { AppContext, appReducer, MOCK_SERVERS, MOCK_USER } from './store/appStore';
import type { AppState } from './store/appStore';
import Navbar from './components/shared/Navbar';
import Sidebar from './components/shared/Sidebar';
import ToastContainer from './components/shared/Toast';
import UpgradeModal from './components/billing/UpgradeModal';
import MarketingPage from './pages/MarketingPage';
import PricingPage from './pages/PricingPage';
import DashboardPage from './pages/DashboardPage';
import ForgePage from './pages/ForgePage';
import ServersPage from './pages/ServersPage';
import SettingsPage from './pages/SettingsPage';

const INITIAL_STATE: AppState = {
  user: null,
  servers: [],
  isLoading: false,
  activeView: 'marketing',
  notifications: [],
  upgradeModal: { open: false, trigger: 'manual' },
};

export default function App() {
  const [state, dispatch] = useReducer(appReducer, INITIAL_STATE);
  const [isInitialized, setIsInitialized] = useState(false);

  // Simulate initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const handleNavigate = (view: string) => {
    // If navigating to a protected view without a user, "log in" with mock user
    const protectedViews = ['dashboard', 'forge', 'servers', 'settings'];
    if (protectedViews.includes(view) && !state.user) {
      dispatch({ type: 'SET_USER', payload: MOCK_USER });
      dispatch({ type: 'SET_SERVERS', payload: MOCK_SERVERS });
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          title: 'Welcome to MCPForge!',
          message: 'Demo mode: Explore the full dashboard experience.',
          timestamp: new Date().toISOString(),
        },
      });
    }
    dispatch({ type: 'SET_VIEW', payload: view as AppState['activeView'] });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isAuthenticated = !!state.user;
  const isMarketingView = ['marketing', 'pricing', 'blog'].includes(state.activeView);
  const showSidebar = isAuthenticated && !isMarketingView;

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-200">
            <svg className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-2 w-2 rounded-full bg-violet-400 animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      <div className="flex min-h-screen flex-col bg-slate-50 font-['Inter',sans-serif]">
        <Navbar onNavigate={handleNavigate} currentView={state.activeView} />

        <div className={`flex flex-1 ${showSidebar ? '' : ''}`}>
          {showSidebar && (
            <Sidebar onNavigate={handleNavigate} currentView={state.activeView} />
          )}

          <main className="flex-1 overflow-hidden">
            {/* Marketing views */}
            {state.activeView === 'marketing' && (
              <MarketingPage onNavigate={handleNavigate} />
            )}
            {state.activeView === 'pricing' && (
              <PricingPage onNavigate={handleNavigate} />
            )}
            {state.activeView === 'blog' && (
              <BlogPage onNavigate={handleNavigate} />
            )}

            {/* App views */}
            {state.activeView === 'dashboard' && (
              <DashboardPage onNavigate={handleNavigate} />
            )}
            {state.activeView === 'forge' && (
              <ForgePage onNavigate={handleNavigate} />
            )}
            {state.activeView === 'servers' && (
              <ServersPage onNavigate={handleNavigate} />
            )}
            {state.activeView === 'settings' && (
              <SettingsPage onNavigate={handleNavigate} />
            )}
          </main>
        </div>

        {/* Global components */}
        <ToastContainer />
        <UpgradeModal
          open={state.upgradeModal.open}
          trigger={state.upgradeModal.trigger}
          onClose={() => dispatch({ type: 'CLOSE_UPGRADE_MODAL' })}
        />
      </div>
    </AppContext.Provider>
  );
}

// Inline blog page for completeness
function BlogPage({ onNavigate }: { onNavigate: (view: string) => void }) {
  const BLOG_POSTS = [
    { slug: 'build-github-mcp', title: 'Build a GitHub MCP Server in 30 Seconds', date: '2025-01-15', readTime: '5 min read', views: 2841, category: 'Tutorial' },
    { slug: 'jira-mcp-cursor', title: 'Auto-Generate a Jira MCP Engine for Cursor IDE', date: '2025-01-12', readTime: '7 min read', views: 1923, category: 'Tutorial' },
    { slug: 'mcp-protocol-guide', title: 'Model Context Protocol: The Complete Developer Guide', date: '2025-01-10', readTime: '12 min read', views: 5102, category: 'Guide' },
    { slug: 'slack-mcp-claude', title: 'Deploy a Slack MCP Server for Claude Desktop', date: '2025-01-08', readTime: '6 min read', views: 1456, category: 'Tutorial' },
    { slug: 'notion-mcp-ai', title: 'Connect Notion to Any AI Client with MCP', date: '2025-01-05', readTime: '8 min read', views: 3207, category: 'Integration' },
    { slug: 'mcp-vs-plugins', title: 'MCP vs AI Plugins: What Developers Need to Know in 2025', date: '2025-01-02', readTime: '10 min read', views: 4891, category: 'Comparison' },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-black text-slate-900">MCPForge Blog</h1>
        <p className="mt-3 text-lg text-slate-500">
          Tutorials, guides, and insights for MCP server development
        </p>
      </div>

      <div className="space-y-4">
        {BLOG_POSTS.map((post) => (
          <div
            key={post.slug}
            className="flex items-center gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-violet-200 hover:shadow-md cursor-pointer"
            onClick={() => onNavigate('marketing')}
          >
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 text-2xl">
              {post.category === 'Tutorial' ? '📖' : post.category === 'Guide' ? '🗺️' : post.category === 'Integration' ? '🔗' : '⚖️'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="rounded-full bg-violet-50 px-2 py-0.5 text-xs font-semibold text-violet-700">
                  {post.category}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 truncate">{post.title}</h3>
              <p className="mt-0.5 text-xs text-slate-400">
                {post.date} · {post.readTime} · {post.views.toLocaleString()} views
              </p>
            </div>
            <span className="text-slate-400">→</span>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 p-8 text-center">
        <h2 className="text-xl font-black text-white">Ready to build your first MCP server?</h2>
        <p className="mt-2 text-sm text-violet-200">
          Stop reading, start building. Your first server is free.
        </p>
        <button
          onClick={() => onNavigate('forge')}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-violet-700 hover:bg-violet-50"
        >
          Build for Free →
        </button>
      </div>
    </div>
  );
}
