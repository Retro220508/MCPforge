import type { PromptTemplate } from '../types/mcp.types';

/** Plan limits */
export const PLAN_LIMITS = {
  free: { servers: 2, invocations: 50 },
  pro: { servers: Infinity, invocations: Infinity },
} as const;

/** Prompt templates for quick-start generation */
export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'github',
    name: 'GitHub',
    description: 'PR reviews, issues & repos',
    icon: '🐙',
    category: 'Developer Tools',
    prompt:
      'Build a GitHub MCP server that can list repositories, create and manage issues, fetch pull request details, post comments on PRs, and check CI/CD status. Use GitHub REST API with a personal access token.',
    envVarHints: ['GITHUB_TOKEN', 'GITHUB_ORG'],
  },
  {
    id: 'jira',
    name: 'Jira',
    description: 'Issue tracking & sprints',
    icon: '📋',
    category: 'Project Management',
    prompt:
      'Create a Jira MCP server that can search issues with JQL, create issues, update issue status and assignees, manage sprints, and fetch project boards. Authenticate using email and API token.',
    envVarHints: ['JIRA_BASE_URL', 'JIRA_EMAIL', 'JIRA_API_TOKEN'],
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Messages & channels',
    icon: '💬',
    category: 'Communication',
    prompt:
      'Generate a Slack MCP server that can send messages to channels, create threads, list channels, fetch message history, manage user presence, and post rich formatted blocks.',
    envVarHints: ['SLACK_BOT_TOKEN', 'SLACK_SIGNING_SECRET'],
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Pages, databases & blocks',
    icon: '📝',
    category: 'Productivity',
    prompt:
      'Build a Notion MCP server with tools to search pages and databases, create and update pages, append blocks to pages, query database entries with filters, and manage Notion workspace content.',
    envVarHints: ['NOTION_API_KEY', 'NOTION_DATABASE_ID'],
  },
  {
    id: 'linear',
    name: 'Linear',
    description: 'Issues, cycles & teams',
    icon: '⚡',
    category: 'Project Management',
    prompt:
      'Create a Linear MCP server that manages issues, cycles, and projects. Include tools to create issues, update priority and status, list team issues, search with filters, and manage project milestones.',
    envVarHints: ['LINEAR_API_KEY', 'LINEAR_TEAM_ID'],
  },
  {
    id: 'aws',
    name: 'AWS',
    description: 'S3, EC2 & CloudWatch',
    icon: '☁️',
    category: 'Cloud',
    prompt:
      'Generate an AWS MCP server with tools for S3 bucket operations (list, upload, download, delete), EC2 instance management (list, start, stop), and CloudWatch log querying. Use AWS SDK with region configuration.',
    envVarHints: ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION'],
  },
];

/** Example prompts for textarea placeholder rotation */
export const EXAMPLE_PROMPTS = [
  'Build a Jira issue tracker MCP with API token authentication and sprint management',
  'Create a GitHub PR reviewer MCP that summarizes code changes and suggests improvements',
  'Generate a Slack notification MCP with channel management and rich message formatting',
  'Build a Linear project tracker MCP with webhook support and priority management',
  'Create a Notion database MCP with full CRUD operations and rich text support',
  'Generate an AWS S3 MCP server for file operations with presigned URL generation',
  'Build a Stripe payment MCP with invoice management and subscription tracking',
  'Create a Datadog monitoring MCP that queries metrics and manages alerts',
];

/** Allowed npm packages in generated MCP servers */
export const ALLOWED_PACKAGES = new Set([
  '@modelcontextprotocol/sdk',
  'zod',
  'axios',
  'node-fetch',
  'date-fns',
  'lodash',
  'uuid',
  'nanoid',
  'dotenv',
  '@aws-sdk/client-s3',
  '@aws-sdk/client-ec2',
  'stripe',
  '@slack/web-api',
  '@octokit/rest',
  '@notionhq/client',
  '@linear/sdk',
  'openai',
  'groq-sdk',
]);

/** Packages blocked due to security or operational risks */
export const BLOCKED_PACKAGES = new Set([
  'child_process',
  'fs-extra',
  'shelljs',
  'execa',
  'vm2',
  'serialize-javascript',
]);

/** Navigation items for the sidebar */
export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'New Server', path: '/forge', icon: 'Wand2' },
  { label: 'My Servers', path: '/servers', icon: 'Server' },
  { label: 'Settings', path: '/settings', icon: 'Settings' },
] as const;
