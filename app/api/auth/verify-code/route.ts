import { NextRequest, NextResponse } from 'next/server';

async function verifyCodeInDatabase(email: string, code: string): Promise<boolean> {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 获取最新的验证码记录（避免 .single() 在多条记录时报错）
    const { data, error } = await supabase
      .from('verification_codes')
      .select('*')
      .ilike('email', email.toLowerCase())
      .order('created_at', { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) {
      console.error('[Auth] Code not found in database:', error?.message);
      return false;
    }

    const record = data[0];

    if (record.code !== code) {
      console.log('[Auth] Code mismatch');
      return false;
    }

    if (new Date(record.expires_at) < new Date()) {
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
  const fallbackUser = {
    id: `user-${Date.now()}`,
    email,
    name: email.split('@')[0],
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    orderIds: [],
  };

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 尝试获取现有用户
    const { data: existingUsers, error: queryError } = await supabase
      .from('users')
      .select('*')
      .ilike('email', email.toLowerCase())
      .limit(1);

    if (existingUsers && existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      // 更新最后登录时间
      await supabase
        .from('users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', existingUser.id);

      return {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name || email.split('@')[0],
        createdAt: existingUser.created_at,
        lastLoginAt: new Date().toISOString(),
        orderIds: existingUser.order_ids || [],
      };
    }

    // 创建新用户
    const newUserId = `user-${Date.now()}`;
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        id: newUserId,
        email,
        name: email.split('@')[0],
        created_at: new Date().toISOString(),
        last_login_at: new Date().toISOString(),
      })
      .select('*')
      .limit(1);

    if (insertError || !newUser || newUser.length === 0) {
      console.error('[Auth] Failed to create user:', insertError?.message);
      return fallbackUser;
    }

    const user = newUser[0];
    return {
      id: user.id,
      email: user.email,
      name: user.name || email.split('@')[0],
      createdAt: user.created_at,
      lastLoginAt: user.last_login_at,
      orderIds: user.order_ids || [],
    };
  } catch (err: any) {
    console.error('[Auth] User operation error:', err.message);
    return fallbackUser;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required' }, { status: 400 });
    }

    console.log(`[Auth] Verifying code for: ${email}`);

    // 验证验证码（3秒超时）
    const verifyPromise = verifyCodeInDatabase(email, code);
    const verifyTimeout = new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 3000));
    const isValid = await Promise.race([verifyPromise, verifyTimeout]);

    if (!isValid) {
      return NextResponse.json({ error: '验证码无效或已过期，请重新发送验证码' }, { status: 401 });
    }

    // 获取或创建用户（3秒超时，超时返回临时用户）
    const userPromise = getOrCreateUser(email);
    const userTimeout = new Promise<any>((resolve) => setTimeout(() => resolve({
      id: `user-${Date.now()}`,
      email,
      name: email.split('@')[0],
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      orderIds: [],
    }), 3000));
    const user = await Promise.race([userPromise, userTimeout]);

    console.log(`[Auth] Login successful for: ${email}`);
    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error('Failed to verify code:', error);
    return NextResponse.json({ error: '验证失败，请重试' }, { status: 500 });
  }
}