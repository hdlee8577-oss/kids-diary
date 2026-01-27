#!/bin/bash
# 자동 Git Push 스크립트
# 네트워크가 연결될 때까지 재시도

MAX_RETRIES=10
RETRY_DELAY=5

echo "Git push 자동 시도 중..."

for i in $(seq 1 $MAX_RETRIES); do
  echo "[시도 $i/$MAX_RETRIES] Git push 시도 중..."
  
  if git push 2>&1; then
    echo "✅ Git push 성공!"
    exit 0
  fi
  
  if [ $i -lt $MAX_RETRIES ]; then
    echo "⏳ $RETRY_DELAY초 후 재시도..."
    sleep $RETRY_DELAY
  fi
done

echo "❌ Git push 실패. 네트워크 연결을 확인해주세요."
exit 1
