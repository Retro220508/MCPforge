/**
 * Global application state store using React context + useReducer.
 * In production this would connect to Supabase; here we use realistic mock data.
 */

import { createContext, useContext } from 'react';
import type { MCPServer, Profile, BillingPlan } from '../types/mcp.types';

export interface AppState {
  user: Profile | null;
  servers: MCPServer[];
  isLoading: boolean;
  activeView: 'marketing' | 'dashboard' | 'forge' | 'servers' | 'settings' | 'pricing' | 'blog';
  notifications: Notification[];
  upgradeModal: { open: boolean; trigger: 'quota_exceeded' | 'feature_locked' | 'manual' };
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
}

export type AppAction =
  | { type: 'SET_USER'; payload: Profile | null }
  | { type: 'SET_SERVERS'; payload: MCPServer[] }
  | { type: 'ADD_SERVER'; payload: MCPServer }
  | { type: 'UPDATE_SERVER'; payload: { id: string; updates: Partial<MCPServer> } }
  | { type: 'DELETE_SERVER'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_VIEW'; payload: AppState['activeView'] }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'DISMISS_NOTIFICATION'; payload: string }
  | { type: 'OPEN_UPGRADE_MODAL'; payload: AppState['upgradeModal']['trigger'] }
  | { type: 'CLOSE_UPGRADE_MODAL' }
  | { type: 'UPGRADE_PLAN'; payload: BillingPlan };

export const MOCK_SERVERS: MCPServer[] = [
  {
    id: 'srv_01',
    user_id: 'usr_demo',
    name: 'GitHubAssistant',
    description: 'Manages GitHub repos, PRs, and issues with full API coverage',
    generated_code: `#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) throw new Error("GITHUB_TOKEN environment variable is required");

const server = new Server({ name: "github-assistant", version: "1.0.0" }, {
  capabilities: { tools: {} }
});

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    { name: "list_repos", description: "List repositories for an organization or user", inputSchema: { type: "object", properties: { owner: { type: "string" } }, required: ["owner"] } },
    { name: "create_issue", description: "Create a new GitHub issue", inputSchema: { type: "object", properties: { owner: { type: "string" }, repo: { type: "string" }, title: { type: "string" }, body: { type: "string" } }, required: ["owner", "repo", "title"] } },
    { name: "get_pr_details", description: "Get pull request details and review status", inputSchema: { type: "object", properties: { owner: { type: "string" }, repo: { type: "string" }, pr_number: { type: "number" } }, required: ["owner", "repo", "pr_number"] } }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const headers = { Authorization: \`token \${GITHUB_TOKEN}\`, "Content-Type": "application/json" };
  
  try {
    if (name === "list_repos") {
      const res = await fetch(\`https://api.github.com/users/\${args.owner}/repos\`, { headers, signal: AbortSignal.timeout(30000) });
      const data = await res.json();
      return { content: [{ type: "text", text: JSON.stringify(data.map((r: any) => ({ name: r.name, stars: r.stargazers_count, language: r.language })), null, 2) }] };
    }
    throw new Error(\`Unknown tool: \${name}\`);
  } catch (err) {
    return { content: [{ type: "text", text: \`Error: \${err instanceof Error ? err.message : String(err)}\` }], isError: true };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
main().catch(console.error);`,
    status: 'deployed',
    environment_variables: [
      { name: 'GITHUB_TOKEN', value: '***', isSecret: true },
      { name: 'GITHUB_ORG', value: 'my-org', isSecret: false },
    ],
    tool_count: 3,
    resource_count: 0,
    last_invoked_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    deployment_region: 'us-east-1',
    is_public: false,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    invocation_count: 47,
    validation_score: 94,
    readme_content: null,
  },
  {
    id: 'srv_02',
    user_id: 'usr_demo',
    name: 'SlackMessenger',
    description: 'Send messages, manage channels, and interact with Slack workspace',
    generated_code: `#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

const SLACK_TOKEN = process.env.SLACK_BOT_TOKEN;
if (!SLACK_TOKEN) throw new Error("SLACK_BOT_TOKEN is required");

const server = new Server({ name: "slack-messenger", version: "1.0.0" }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    { name: "send_message", description: "Send a message to a Slack channel", inputSchema: { type: "object", properties: { channel: { type: "string" }, text: { type: "string" } }, required: ["channel", "text"] } },
    { name: "list_channels", description: "List all channels in the workspace", inputSchema: { type: "object", properties: {} } }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  return { content: [{ type: "text", text: "Tool executed successfully" }] };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
main().catch(console.error);`,
    status: 'deployed',
    environment_variables: [
      { name: 'SLACK_BOT_TOKEN', value: '***', isSecret: true },
      { name: 'SLACK_SIGNING_SECRET', value: '***', isSecret: true },
    ],
    tool_count: 2,
    resource_count: 0,
    last_invoked_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    deployment_region: 'us-east-1',
    is_public: true,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    invocation_count: 23,
    validation_score: 88,
    readme_content: null,
  },
];

export const MOCK_USER: Profile = {
  id: 'usr_demo',
  full_name: 'Alex Developer',
  avatar_url: null,
  stripe_customer_id: null,
  billing_plan: 'free',
  mcp_server_count: 2,
  monthly_invocation_count: 23,
  api_key: 'mcpf_demo_key_abc123xyz',
  created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  updated_at: new Date().toISOString(),
};

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_SERVERS':
      return { ...state, servers: action.payload };
    case 'ADD_SERVER':
      return {
        ...state,
        servers: [action.payload, ...state.servers],
        user: state.user
          ? { ...state.user, mcp_server_count: state.user.mcp_server_count + 1 }
          : null,
      };
    case 'UPDATE_SERVER':
      return {
        ...state,
        servers: state.servers.map((s) =>
          s.id === action.payload.id ? { ...s, ...action.payload.updates } : s
        ),
      };
    case 'DELETE_SERVER':
      return {
        ...state,
        servers: state.servers.filter((s) => s.id !== action.payload),
        user: state.user
          ? { ...state.user, mcp_server_count: Math.max(0, state.user.mcp_server_count - 1) }
          : null,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_VIEW':
      return { ...state, activeView: action.payload };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...state.notifications].slice(0, 10) };
    case 'DISMISS_NOTIFICATION':
      return { ...state, notifications: state.notifications.filter((n) => n.id !== action.payload) };
    case 'OPEN_UPGRADE_MODAL':
      return { ...state, upgradeModal: { open: true, trigger: action.payload } };
    case 'CLOSE_UPGRADE_MODAL':
      return { ...state, upgradeModal: { open: false, trigger: 'manual' } };
    case 'UPGRADE_PLAN':
      return {
        ...state,
        user: state.user ? { ...state.user, billing_plan: action.payload } : null,
        upgradeModal: { open: false, trigger: 'manual' },
      };
    default:
      return state;
  }
}

export const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function useAppStore() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppStore must be used within AppProvider');
  return ctx;
}
