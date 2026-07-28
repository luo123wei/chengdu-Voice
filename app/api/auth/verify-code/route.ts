import { NextRequest, NextResponse } from 'next/server';

async function verifyCodeInDatabase(email: string, code: string): Promise<boolean> {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data, error } = await supabase
      .from('verification_codes')
      .select('*')
      .ilike('email', email.toLowerCase())
      .single();
    
    if (error || !data) {
      console.error('[Auth] Code not found in database:', error?.message);
      return false;
    }
    
    if (data.code !== code) {
      console.log('[Auth] Code mismatch');
      return false;
    }
    
    if (new Date(data.expires_at) < new Date()) {
      console.log('[Auth] Code expired');
      return false;
    }
    
    console.log('[Auth] Code verified successfully');
    return true;
  } catch (err: any) {
    console.error('[Auth] Verification error:', err.message);
    return false;
  }
}

async function getOrCreateUser(email: string): Promise<any> {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Try to get existing user
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .ilike('email', email.toLowerCase())
      .single();
    
    if (existingUser) {
      // Update last login
      await supabase
        .from('users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', existingUser.id);
      
      return {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
        createdAt: existingUser.created_at,
        lastLoginAt: existingUser.last_login_at,
        orderIds: existingUser.order_ids || [],
      };
    }
    
    // Create new user
    const newUserId = `user-${Date.now()}`;
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        id: newUserId,
        email,
        created_at: new Date().toISOString(),
        last_login_at: new Date().toISOString(),
        order_ids: [],
      })
      .select('*')
      .single();
    
    if (error) {
      console.error('[Auth] Failed to create user:', error.message);
      // Return a basic user object even if database fails
      return {
        id: newUserId,
        email,
        name: email.split('@')[0],
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        orderIds: [],
      };
    }
    
    return {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      createdAt: newUser.created_at,
      lastLoginAt: newUser.last_login_at,
      orderIds: newUser.order_ids || [],
    };
  } catch (err: any) {
    console.error('[Auth] User operation error:', err.message);
    // Return a basic user object
    return {
      id: `user-${Date.now()}`,
      email,
      name: email.split('@')[0],
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      orderIds: [],
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();
    
    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required' }, { status: 400 });
    }

    // Verify code with timeout
    const verifyPromise = verifyCodeInDatabase(email, code);
    const verifyTimeout = new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 5000));
    const isValid = await Promise.race([verifyPromise, verifyTimeout]);
    
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 401 });
    }

    // Get or create user with timeout
    const userPromise = getOrCreateUser(email);
    const userTimeout = new Promise<any>((resolve) => setTimeout(() => resolve({
      id: `user-${Date.now()}`,
      email,
      name: email.split('@')[0],
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      orderIds: [],
    }), 5000));
    const user = await Promise.race([userPromise, userTimeout]);

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error('Failed to verify code:', error);
    return NextResponse.json({ error: 'Failed to verify code' }, { status: 500 });
  }
}