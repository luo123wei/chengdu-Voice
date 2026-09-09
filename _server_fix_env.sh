#!/bin/bash
# 服务器上执行
set -e

echo '=== PM2 版本 ==='
pm2 -v || true

echo ''
echo '=== 写入 ecosystem(含 env_file 属性) ==='
cat > /var/www/geoscope/ecosystem.config.js <<'ECOEOF'
module.exports = {
  apps: [
    {
      name: 'geoscope-1',
      script: 'node_modules/.bin/next',
      args: 'start --port 5001',
      cwd: '/var/www/geoscope',
      instances: 1,
      exec_mode: 'fork',
      env_file: '.env.production',
      env: {
        NODE_ENV: 'production',
        NEXT_PUBLIC_APP_URL: 'http://223.6.254.101:5000',
        NODE_OPTIONS: '--dns-result-order=ipv4first'
      },
      max_memory_restart: '512M',
      error_file: '/var/log/geoscope-error.log',
      out_file: '/var/log/geoscope-out.log',
      merge_logs: true,
      time: true
    },
    {
      name: 'geoscope-2',
      script: 'node_modules/.bin/next',
      args: 'start --port 5002',
      cwd: '/var/www/geoscope',
      instances: 1,
      exec_mode: 'fork',
      env_file: '.env.production',
      env: {
        NODE_ENV: 'production',
        NEXT_PUBLIC_APP_URL: 'http://223.6.254.101:5000',
        NODE_OPTIONS: '--dns-result-order=ipv4first'
      },
      max_memory_restart: '512M',
      error_file: '/var/log/geoscope-2-error.log',
      out_file: '/var/log/geoscope-2-out.log',
      merge_logs: true,
      time: true
    }
  ]
};
ECOEOF

echo '=== 删除旧进程,重新启动 ==='
cd /var/www/geoscope
pm2 delete geoscope-1 geoscope-2 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
sleep 6

CPID=$(pm2 pid geoscope-1)
echo ''
echo "=== 进程 PID=$CPID 的环境变量中是否有ADMIN ==="
OUT=$(cat /proc/$CPID/environ 2>/dev/null | tr '\0' '\n' | grep -E 'ADMIN|CAPTCHA' | head -10)
if [ -n "$OUT" ]; then
  echo "✓ 有环境变量:"
  echo "$OUT"
else
  echo "✗ env_file 没有生效,改用方案2:在 env 块里显式指定 ADMIN 变量"
  # 方案2:把 ADMIN_EMAIL / ADMIN_PASSWORD_HASH / ADMIN_USER_IDS 显式加到 env 对象
  ADMIN_EMAIL=$(grep '^ADMIN_EMAIL=' /var/www/geoscope/.env.production | cut -d= -f2-)
  ADMIN_PASSWORD_HASH=$(grep '^ADMIN_PASSWORD_HASH=' /var/www/geoscope/.env.production | cut -d= -f2-)
  ADMIN_USER_IDS=$(grep '^ADMIN_USER_IDS=' /var/www/geoscope/.env.production | cut -d= -f2-)
  cat > /var/www/geoscope/ecosystem.config.js <<ECOEOF2
module.exports = {
  apps: [
    {
      name: 'geoscope-1',
      script: 'node_modules/.bin/next',
      args: 'start --port 5001',
      cwd: '/var/www/geoscope',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        NEXT_PUBLIC_APP_URL: 'http://223.6.254.101:5000',
        NODE_OPTIONS: '--dns-result-order=ipv4first',
        ADMIN_EMAIL: '$ADMIN_EMAIL',
        ADMIN_PASSWORD_HASH: '$ADMIN_PASSWORD_HASH',
        ADMIN_USER_IDS: '$ADMIN_USER_IDS'
      },
      max_memory_restart: '512M',
      error_file: '/var/log/geoscope-error.log',
      out_file: '/var/log/geoscope-out.log',
      merge_logs: true,
      time: true
    },
    {
      name: 'geoscope-2',
      script: 'node_modules/.bin/next',
      args: 'start --port 5002',
      cwd: '/var/www/geoscope',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        NEXT_PUBLIC_APP_URL: 'http://223.6.254.101:5000',
        NODE_OPTIONS: '--dns-result-order=ipv4first',
        ADMIN_EMAIL: '$ADMIN_EMAIL',
        ADMIN_PASSWORD_HASH: '$ADMIN_PASSWORD_HASH',
        ADMIN_USER_IDS: '$ADMIN_USER_IDS'
      },
      max_memory_restart: '512M',
      error_file: '/var/log/geoscope-2-error.log',
      out_file: '/var/log/geoscope-2-out.log',
      merge_logs: true,
      time: true
    }
  ]
};
ECOEOF2
  echo "写入了新的ecosystem(显式env),重启..."
  pm2 delete geoscope-1 geoscope-2
  pm2 start ecosystem.config.js
  pm2 save
  sleep 6
  CPID2=$(pm2 pid geoscope-1)
  echo "新 PID=$CPID2,检查 environ:"
  cat /proc/$CPID2/environ 2>/dev/null | tr '\0' '\n' | grep ADMIN | head -10
fi
