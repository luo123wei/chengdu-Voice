// 初始化虚拟评论系统：建表 + 建函数 + 手动跑一次
// 跑完后用 Supabase Integration → Cron（Dashboard UI）注册定时

const { createClient } = require('@supabase/supabase-js');

const URL = 'https://ltdrwmvhsbzkoymiqspr.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0ZHJ3bXZoc2J6a295bWlxc3ByIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDc4OTU1MCwiZXhwIjoyMTAwMzY1NTUwfQ.di5QgvXvegnPH5HbTbwvwqUPi3poccAxEdE-PUUnUSE';

const supabase = createClient(URL, KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function exec(sql) {
  const { data, error } = await supabase.from('_exec').select('*').rpc('_run', { sql });
  return { data, error };
}

async function run() {
  // Supabase JS v2 的原生方式是用 .rpc() 调存储过程，或者用 .query()
  // 最简单可靠的方式：通过 REST 的 /rpc 端点
  console.log('连接 Supabase...');

  // 直接用 fetch 调 Supabase REST API 执行 SQL
  const response = await fetch(`${URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
    },
    body: JSON.stringify({}),
  });
  console.log('测试连接:', response.status);

  // 换一个思路：用 supabase-js 直接 raw query
  // Supabase 不支持 raw SQL 执行，只能通过 rpc 或 from
  // 所以我们用一个已存在的表来验证连接
  const { data: products, error: pe } = await supabase.from('products').select('id, name_en').limit(1);
  if (pe) {
    console.error('❌ 连接失败:', pe.message);
    process.exit(1);
  }
  console.log('✅ 连接成功，products 表 OK:', products?.[0]?.name_en);

  // 现在通过 Supabase CLI 或者直接在本地用 psql 客户端都不行
  // 我们用 REST API 直接建表 — Supabase 不支持 raw SQL 通过 REST
  // 
  // 但是！Supabase 有一个隐藏功能：用 supabase.from('xxx') 配合 insert
  // 建表 DDL 必须通过 SQL Editor 或 psql
  //
  // 最靠谱方案：用 Supabase 的 supabase-js 的 .rpc() 调用一个已存在的函数
  // 但我们还没有任何函数...
  
  console.log('\n需要换方案 — 用 Node.js 连 Postgres 直连');
}

// 尝试用 pg 直连
async function runWithPg() {
  let pg;
  try { pg = require('pg'); } catch(e) {
    console.log('pg 未安装，正在安装...');
    const { execSync } = require('child_process');
    execSync('npm install pg --save', { stdio: 'inherit' });
    pg = require('pg');
  }

  const pool = new pg.Pool({
    connectionString: `${URL.replace('https://', 'postgresql://postgres:')}@db.ltdrwmvhsbzkoymiqspr.supabase.co:5432/postgres`,
    // 不行，Supabase Postgres 需要密码，不是 anon key
  });

  console.log('Supabase 不允许外部 psql 直连（除了 Supabase CLI 配置）');
  console.log('');
  console.log('=== 最靠谱方案：用 supabase-js 的 RPC 或直接写表 ===');
  console.log('我需要用 Supabase Dashboard SQL Editor 一次建好表和函数');
  console.log('但你那边跑 SQL Editor 总是报错...');
}

// 换个思路：用 supabase-js 的 admin API（通过 management API）
// 不行，这是数据库层面的 DDL

// 最终方案：写一个 Edge Function，部署到 Supabase，让 Edge Function 用 service_role 跑 DDL
// Edge Function 内可以用 createClient 跑任何 SQL
// 但 Edge Function 也得手动创建...

console.log('=== 结论 ===');
console.log('Supabase REST API 不支持 DDL（CREATE TABLE / CREATE FUNCTION）');
console.log('只能通过 SQL Editor 或 Supabase CLI');
console.log('');
console.log('让我换一种方式：生成正确的 SQL，逐条让你复制粘贴');
