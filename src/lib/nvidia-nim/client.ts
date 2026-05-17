/**
 * NVIDIA NIM API Client
 * 
 * This client provides a unified interface for interacting with NVIDIA's NIM API
 * for AI inference. It supports chat completions using various models.
 * 
 * @see https://build.nvidia.com/
 */

interface NvidiaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface NvidiaCompletionRequest {
  model: string;
  messages: NvidiaMessage[];
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  stream?: boolean;
}

interface NvidiaCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class NvidiaNimClient {
  private apiKey: string;
  private baseUrl: string;
  private primaryModel: string;
  private fastModel: string;

  constructor() {
    // Read from environment variables - never hardcode API keys
    this.apiKey = process.env.NVIDIA_NIM_API_KEY || '';
    this.baseUrl = process.env.NVIDIA_NIM_BASE_URL || 'https://integrate.api.nvidia.com/v1';
    this.primaryModel = process.env.NVIDIA_NIM_PRIMARY_MODEL || 'meta/llama-3.1-70b-instruct';
    this.fastModel = process.env.NVIDIA_NIM_FAST_MODEL || 'meta/llama-3.1-8b-instruct';

    if (!this.apiKey) {
      throw new Error('NVIDIA_NIM_API_KEY environment variable is not set');
    }
  }

  /**
   * Create a chat completion using the specified model
   */
  async createChatCompletion(
    messages: NvidiaMessage[],
    options: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
      topP?: number;
    } = {}
  ): Promise<string> {
    const model = options.model || this.primaryModel;
    
    const requestBody: NvidiaCompletionRequest = {
      model,
      messages,
      temperature: options.temperature ?? 0.7,
      top_p: options.topP ?? 0.9,
      max_tokens: options.maxTokens ?? 1024,
      stream: false,
    };

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`NVIDIA NIM API error (${response.status}): ${errorText}`);
      }

      const data: NvidiaCompletionResponse = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No completion choices returned from NVIDIA NIM API');
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error calling NVIDIA NIM API:', error);
      throw error;
    }
  }

  /**
   * Generate text using the primary (larger) model
   */
  async generateWithPrimaryModel(
    prompt: string,
    systemPrompt?: string,
    options?: { temperature?: number; maxTokens?: number }
  ): Promise<string> {
    const messages: NvidiaMessage[] = [];
    
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    
    messages.push({ role: 'user', content: prompt });

    return this.createChatCompletion(messages, {
      model: this.primaryModel,
      ...options,
    });
  }

  /**
   * Generate text using the fast (smaller) model
   */
  async generateWithFastModel(
    prompt: string,
    systemPrompt?: string,
    options?: { temperature?: number; maxTokens?: number }
  ): Promise<string> {
    const messages: NvidiaMessage[] = [];
    
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    
    messages.push({ role: 'user', content: prompt });

    return this.createChatCompletion(messages, {
      model: this.fastModel,
      ...options,
    });
  }

  /**
   * Get the configured models
   */
  getModels() {
    return {
      primary: this.primaryModel,
      fast: this.fastModel,
    };
  }
}

// Export a singleton instance
export const nvidiaNimClient = new NvidiaNimClient();

// Export types for use in other files
export type { NvidiaMessage, NvidiaCompletionRequest, NvidiaCompletionResponse };

// Made with Bob
