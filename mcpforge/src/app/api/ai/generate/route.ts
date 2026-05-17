import { NextRequest, NextResponse } from 'next/server';
import { nvidiaNimClient } from '@/lib/nvidia-nim';

/**
 * POST /api/ai/generate
 * 
 * Generate AI completions using NVIDIA NIM API
 * 
 * Request body:
 * {
 *   "prompt": "Your prompt here",
 *   "systemPrompt": "Optional system prompt",
 *   "model": "primary" | "fast" (optional, defaults to "primary"),
 *   "temperature": 0.7 (optional),
 *   "maxTokens": 1024 (optional)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      prompt, 
      systemPrompt, 
      model = 'primary',
      temperature,
      maxTokens 
    } = body;

    // Validate required fields
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      );
    }

    // Validate model selection
    if (model !== 'primary' && model !== 'fast') {
      return NextResponse.json(
        { error: 'Model must be either "primary" or "fast"' },
        { status: 400 }
      );
    }

    // Generate completion using the appropriate model
    let completion: string;
    
    if (model === 'fast') {
      completion = await nvidiaNimClient.generateWithFastModel(
        prompt,
        systemPrompt,
        { temperature, maxTokens }
      );
    } else {
      completion = await nvidiaNimClient.generateWithPrimaryModel(
        prompt,
        systemPrompt,
        { temperature, maxTokens }
      );
    }

    // Return the completion
    return NextResponse.json({
      success: true,
      completion,
      model: model === 'fast' 
        ? nvidiaNimClient.getModels().fast 
        : nvidiaNimClient.getModels().primary,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error generating AI completion:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      // Check for API key errors
      if (error.message.includes('NVIDIA_NIM_API_KEY')) {
        return NextResponse.json(
          { 
            error: 'NVIDIA NIM API key is not configured',
            details: 'Please set the NVIDIA_NIM_API_KEY environment variable'
          },
          { status: 500 }
        );
      }

      // Check for API errors
      if (error.message.includes('NVIDIA NIM API error')) {
        return NextResponse.json(
          { 
            error: 'NVIDIA NIM API error',
            details: error.message
          },
          { status: 502 }
        );
      }
    }

    // Generic error response
    return NextResponse.json(
      { 
        error: 'Failed to generate completion',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/generate
 * 
 * Get information about available models
 */
export async function GET() {
  try {
    const models = nvidiaNimClient.getModels();
    
    return NextResponse.json({
      success: true,
      models: {
        primary: {
          name: models.primary,
          description: 'Larger, more capable model for complex tasks',
          recommended_for: ['Complex reasoning', 'Long-form content', 'Detailed analysis']
        },
        fast: {
          name: models.fast,
          description: 'Smaller, faster model for simple tasks',
          recommended_for: ['Quick responses', 'Simple queries', 'Real-time interactions']
        }
      },
      endpoint: '/api/ai/generate',
      methods: ['POST'],
    });
  } catch (error) {
    console.error('Error fetching model information:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch model information',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Made with Bob
