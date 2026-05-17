# MCPForge - AI-Powered MCP Server Generator

Production-ready SaaS platform for generating Model Context Protocol (MCP) servers using natural language.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **AI:** NVIDIA NIM (Llama 3.1 models)
- **Payments:** Stripe
- **Analytics:** PostHog
- **Styling:** Tailwind CSS + shadcn/ui
- **Deployment:** Vercel

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   # Fill in your API keys
   ```

3. **Set up Supabase:**
   ```bash
   npx supabase init
   npx supabase start
   npx supabase db push
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```


## NVIDIA NIM Integration

This project uses NVIDIA NIM (NVIDIA Inference Microservices) for AI-powered features. NVIDIA NIM provides access to state-of-the-art language models with enterprise-grade performance and reliability.

### Getting Your NVIDIA NIM API Key

1. Visit [NVIDIA Build](https://build.nvidia.com/)
2. Sign in or create a free account
3. Navigate to your API keys section
4. Generate a new API key (starts with `nvapi-`)
5. Add it to your `.env.local` file:
   ```bash
   NVIDIA_NIM_API_KEY=nvapi-your_actual_key_here
   ```

### Available Models

- **Primary Model:** `meta/llama-3.1-70b-instruct` - For complex reasoning and detailed responses
- **Fast Model:** `meta/llama-3.1-8b-instruct` - For quick responses and simple tasks

### API Usage Example

```typescript
import { nvidiaNimClient } from '@/lib/nvidia-nim';

// Generate with primary model
const response = await nvidiaNimClient.generateWithPrimaryModel(
  "Explain quantum computing",
  "You are a helpful AI assistant"
);

// Generate with fast model
const quickResponse = await nvidiaNimClient.generateWithFastModel(
  "What is 2+2?",
  "You are a math tutor"
);
```

### API Endpoint

Test the AI generation endpoint:
```bash
curl -X POST http://localhost:3000/api/ai/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Write a haiku about coding",
    "model": "fast"
  }'
```

5. **Open [http://localhost:3000](http://localhost:3000)**

## Project Structure

```
mcpforge/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   ├── lib/             # Utilities and integrations
│   ├── types/           # TypeScript definitions
│   └── hooks/           # Custom React hooks
├── supabase/
│   ├── migrations/      # Database migrations
│   └── functions/       # Edge functions
└── scripts/             # Automation scripts
```

## Features

- 🤖 AI-powered MCP server generation
- 🔐 Secure authentication with Supabase
- 💳 Stripe subscription billing
- ✅ Real-time code validation
- 📊 Usage analytics with PostHog
- 🚀 One-click deployment
- 📝 Automated blog generation
- 🔄 Social media broadcasting

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run type-check` - Run TypeScript checks
- `npm run format` - Format code with Prettier
- `npm run db:push` - Push database migrations

## License

MIT
