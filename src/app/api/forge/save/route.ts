import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/forge/save
 * 
 * Save a generated MCP server to the database
 * 
 * Request body:
 * {
 *   "name": "string - server name",
 *   "description": "string - optional description",
 *   "prompt": "string - original prompt",
 *   "generatedCode": "string - the generated code",
 *   "validationScore": "number - validation score 0-100",
 *   "validationResult": "object - full validation result",
 *   "environmentVariables": "array - env vars needed"
 * }
 */

export async function POST(request: NextRequest) {
  try {
    // Get Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - please log in' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      name,
      description,
      prompt,
      generatedCode,
      validationScore,
      validationResult,
      environmentVariables,
    } = body;

    // Validate required fields
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Name is required and must be a string' },
        { status: 400 }
      );
    }

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      );
    }

    if (!generatedCode || typeof generatedCode !== 'string') {
      return NextResponse.json(
        { error: 'Generated code is required and must be a string' },
        { status: 400 }
      );
    }

    // Insert into database
    const { data, error } = await supabase
      .from('generated_servers')
      .insert({
        user_id: user.id,
        name: name.trim(),
        description: description?.trim() || null,
        prompt: prompt.trim(),
        generated_code: generatedCode,
        validation_score: validationScore || 0,
        validation_result: validationResult || null,
        environment_variables: environmentVariables || [],
        status: 'draft',
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { 
          error: 'Failed to save server',
          details: error.message
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      server: data,
      message: 'Server saved successfully',
    });

  } catch (error) {
    console.error('Error saving server:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to save server',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/forge/save
 * 
 * Get all saved servers for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Get Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - please log in' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Fetch servers
    const { data, error, count } = await supabase
      .from('generated_servers')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { 
          error: 'Failed to fetch servers',
          details: error.message
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      servers: data || [],
      total: count || 0,
      limit,
      offset,
    });

  } catch (error) {
    console.error('Error fetching servers:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch servers',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Made with Bob