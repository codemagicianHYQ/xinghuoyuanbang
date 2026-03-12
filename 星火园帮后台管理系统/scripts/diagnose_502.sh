#!/bin/bash
# 502 诊断脚本 - 在服务器上运行此脚本定位问题
# 用法: bash diagnose_502.sh 或 chmod +x diagnose_502.sh && ./diagnose_502.sh

echo "========== 1. 检查 Node 是否监听 1112 端口 =========="
ss -tlnp | grep 1112
if [ $? -ne 0 ]; then
  echo "⚠️ 未发现 1112 端口监听！Node 可能未启动或使用了其他端口"
  echo "当前所有 Node 相关监听:"
  ss -tlnp | grep node || netstat -tlnp 2>/dev/null | grep node || echo "无法获取"
else
  echo "✅ 1112 端口正在监听"
fi

echo ""
echo "========== 2. 直接请求 Node 后端（绕过 Nginx） =========="
curl -s -o /tmp/curl_result.txt -w "HTTP状态:%{http_code} 耗时:%{time_total}s\n" \
  -X POST http://127.0.0.1:1112/admin/api/v1/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"1850336901@qq.com","password":"hyq/\\911"}' \
  --connect-timeout 5 --max-time 10

echo "响应内容（前500字符）:"
head -c 500 /tmp/curl_result.txt
echo ""

echo ""
echo "========== 3. 最近 Nginx 错误日志（502 相关） =========="
if [ -f /var/log/nginx/error.log ]; then
  grep -E "502|1112|connect|upstream" /var/log/nginx/error.log | tail -20
else
  echo "无法读取 /var/log/nginx/error.log"
fi

echo ""
echo "========== 4. PM2 进程与端口 =========="
pm2 list 2>/dev/null || echo "pm2 未安装或未找到"
echo ""
echo "========== 5. .env 中的 SERVER_PORT =========="
grep -E "SERVER_PORT|PORT" /opt/星火园帮后台管理系统/.env 2>/dev/null || grep -E "SERVER_PORT|PORT" .env 2>/dev/null || echo "未找到 .env"
