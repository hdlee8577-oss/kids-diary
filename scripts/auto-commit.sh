#!/bin/bash
# 자동 Git Commit 스크립트

# 현재 디렉토리로 이동
cd "$(dirname "$0")/.." || exit 1

# 변경사항 확인
if [ -z "$(git status --porcelain)" ]; then
  echo "변경사항이 없습니다."
  exit 0
fi

# 변경된 파일 목록 가져오기
CHANGED_FILES=$(git status --porcelain | awk '{print $2}' | head -5)
FILE_LIST=$(echo "$CHANGED_FILES" | tr '\n' ', ' | sed 's/,$//')

# 커밋 메시지 생성
if [ ${#FILE_LIST} -gt 100 ]; then
  FILE_LIST="${FILE_LIST:0:97}..."
fi

COMMIT_MSG="Update: $FILE_LIST"

# 모든 변경사항 스테이징
git add -A

# 커밋
if git commit -m "$COMMIT_MSG" 2>&1; then
  echo "✅ 자동 커밋 완료: $COMMIT_MSG"
  exit 0
else
  echo "❌ 커밋 실패"
  exit 1
fi
