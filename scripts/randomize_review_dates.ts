import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ltdrwmvhsbzkoymiqspr.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1hZG1pbiIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE3MzYzNjg3ODZ9.placeholder';

const supabase = createClient(supabaseUrl, supabaseKey);

// 生成 2026年4月1日 到 8月10日 之间的随机日期
function randomDate(): string {
  const start = new Date('2026-04-01');
  const end = new Date('2026-08-10');
  const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return d.toISOString().split('T')[0];
}

async function main() {
  // 1. 读取所有评论
  const { data: reviews, error } = await supabase.from('reviews').select('id, nickname, date');
  if (error) {
    console.error('读取评论失败:', error);
    process.exit(1);
  }

  console.log(`共 ${reviews.length} 条评论待更新`);

  // 2. 逐条更新日期
  let success = 0;
  for (const review of reviews) {
    const newDate = randomDate();
    const { error: updateErr } = await supabase
      .from('reviews')
      .update({ date: newDate })
      .eq('id', review.id);

    if (updateErr) {
      console.error(`更新 ${review.id} 失败:`, updateErr);
    } else {
      console.log(`  ${review.id} | ${review.nickname} | ${review.date} → ${newDate}`);
      success++;
    }
  }

  console.log(`\n完成：${success}/${reviews.length} 条评论日期已更新`);
}

main().catch(console.error);
