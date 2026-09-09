#!/bin/bash
# 服务器端部署脚本
set -e
echo "=== 1. 上传到服务器的文件移动到正确位置 ==="
# 期望 /tmp/deploy 目录下有 auth-guard.ts  login/route.ts  login/page.tsx  captcha/route.ts  ecosystem.config.js  .env.production
ls /tmp/deploy

echo ""
echo "=== 2. 复制覆盖 ==="
cp /tmp/deploy/auth-guard.ts               /var/www/geoscope/src/lib/auth-guard.ts
cp /tmp/deploy/route_login.ts              /var/www/geoscope/src/app/api/auth/login/route.ts
cp /tmp/deploy/route_captcha.ts            /var/www/geoscope/src/app/api/auth/captcha/route.ts
cp /tmp/deploy/page_login.tsx              /var/www/geoscope/src/app/login/page.tsx
cp /tmp/deploy/ecosystem.config.js         /var/www/geoscope/ecosystem.config.js
cp /tmp/deploy/env.production              /var/www/geoscope/.env.production
echo "done"

echo ""
echo "=== 3. build ==="
cd /var/www/geoscope && npm run build 2>&1 | tail -8

echo ""
echo "=== 4. PM2 delete + start (强制重新加载 env, 不能 restart) ==="
pm2 delete geoscope-1 geoscope-2 2>/dev/null || true
cd /var/www/geoscope && pm2 start ecosystem.config.js
pm2 save
sleep 8

echo ""
echo "=== 5. 检查 environ 里 CAPTCHA_SECRET ==="
CPID=$(pm2 pid geoscope-1)
echo "PID: $CPID"
cat /proc/$CPID/environ 2>/dev/null | tr '\0' '\n' | grep CAPTCHA_SECRET

echo ""
echo "=== 6. 真实验证登录(end-to-end Node脚本) ==="
cat > /tmp/e2e_final.js <<'EOF'
const crypto = require('crypto');
const fs = require('fs');
const http = require('http');
const cp = require('child_process');

const SECRET = '5dd9f5b2373e226eb1081c06b00182f189e04dd196f694120fae2a7d4b8cc5b5';
const PASSWORD = 'Ks8&fM3!wZdP#qR5v';

function request(method, path, body) {
  return new Promise((res, rej) => {
    const pd = body ? JSON.stringify(body) : null;
    const r = http.request({ hostname:'127.0.0.1', port:5001, method, path,
      headers: pd ? { 'Content-Type':'application/json', 'Content-Length': Buffer.byteLength(pd)} : {} },
      resp => { let b=''; resp.setEncoding('utf8'); resp.on('data', c=>b+=c); resp.on('end', ()=>res({s:resp.statusCode,h:resp.headers,body:b}));
    });
    r.on('error', rej);
    if (pd) r.write(pd);
    r.end();
  });
}

(async function(){
  // 获取 captcha
  const r1 = await request('GET', '/api/auth/captcha');
  const cid = r1.h['x-captcha-id'];
  console.error('[HTTP captcha]:', r1.s, 'cid len:', (cid||'').length);

  // 解密 captchaId
  const buf = Buffer.from(cid, 'base64url');
  const d = crypto.createDecipheriv('aes-256-gcm', Buffer.from(SECRET, 'hex'), buf.subarray(0,12));
  d.setAuthTag(buf.subarray(12,28));
  const answer = JSON.parse(Buffer.concat([d.update(buf.subarray(28)), d.final()]).toString('utf8')).a;
  console.error('[captcha answer]:', answer);

  // 真实登录
  const r2 = await request('POST', '/api/auth/login', { email:'admin@geoscope.com', password:PASSWORD, captcha:answer, captchaId:cid });
  console.log('[login HTTP]:', r2.s);
  console.log('[login body]:', r2.body);
  try {
    const o = JSON.parse(r2.body);
    if (r2.s === 200 && o.success) {
      console.log('\n✅ 登录成功!');
    } else {
      console.log('\n❌ 登录失败');
      process.exit(1);
    }
  } catch(e){ console.log('\n❌ 非JSON响应'); process.exit(1); }
})().catch(e => { console.error(e); process.exit(1); });
EOF
cd /var/www/geoscope
node /tmp/e2e_final.js 2>&1
