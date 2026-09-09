const fs = require('fs');
const crypto = require('crypto');
const http = require('http');

// 模拟 PM2 env_file: 加载.env.production
fs.readFileSync('/var/www/geoscope/.env.production','utf8').split('\n').forEach(l => {
  const idx = l.indexOf('=');
  if (idx > 0 && !l.trim().startsWith('#')) {
    process.env[l.substring(0, idx).trim()] = l.substring(idx + 1).trim();
  }
});

console.error('[ENV] ADMIN_EMAIL:', process.env.ADMIN_EMAIL);
console.error('[ENV] ADMIN_PASSWORD_HASH present:', !!process.env.ADMIN_PASSWORD_HASH, 'length:', (process.env.ADMIN_PASSWORD_HASH || '').length);

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname: '127.0.0.1', port: 5001, method, path,
      headers: postData ? {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      } : {},
    }, (resp) => {
      let data = '';
      resp.setEncoding('utf8');
      resp.on('data', (c) => (data += c));
      resp.on('end', () => resolve({ status: resp.statusCode, headers: resp.headers, body: data }));
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

(async function main() {
  // 获取验证码
  const captchaResp = await request('GET', '/api/auth/captcha');
  const captchaId = captchaResp.headers['x-captcha-id'];
  console.error('[captcha] captchaId length:', (captchaId || '').length);

  // 解密 captchaId 拿到答案
  const SECRET = crypto.createHash('sha256').update(process.env.ADMIN_PASSWORD_HASH).digest('hex');
  let answer;
  try {
    const buf = Buffer.from(captchaId, 'base64url');
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const enc = buf.subarray(28);
    const d = crypto.createDecipheriv('aes-256-gcm', Buffer.from(SECRET, 'hex'), iv);
    d.setAuthTag(tag);
    const raw = Buffer.concat([d.update(enc), d.final()]).toString('utf8');
    answer = JSON.parse(raw).a;
  } catch (e) {
    console.error('[解密失败]', e.message);
    process.exit(1);
  }
  console.error('[captcha] 解密答案:', answer);

  // 真实登录
  const loginResp = await request('POST', '/api/auth/login', {
    email: 'admin@geoscope.com',
    password: 'Ks8&fM3!wZdP#qR5v',
    captcha: answer,
    captchaId: captchaId,
  });
  console.log('[login] HTTP status:', loginResp.status);
  console.log('[login] response body:', loginResp.body);
  if (loginResp.status === 200 && JSON.parse(loginResp.body).success) {
    console.log('\n✅ 登录成功!');
  } else {
    console.log('\n❌ 登录失败!');
  }
})().catch(e => { console.error(e); process.exit(1); });
