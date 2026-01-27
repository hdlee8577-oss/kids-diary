#!/usr/bin/env node
/**
 * 마이그레이션 실행 스크립트
 * 
 * 실행 방법:
 *   npm run migrate
 * 
 * 또는 직접:
 *   npx tsx scripts/run-migration.ts
 */

const adminToken = process.env.ADMIN_TOKEN || "";

if (!adminToken) {
  console.error("❌ ADMIN_TOKEN 환경변수가 필요합니다.");
  console.error("   .env.local 파일에 ADMIN_TOKEN을 설정하거나");
  console.error("   환경변수로 전달해주세요: ADMIN_TOKEN=... npm run migrate");
  process.exit(1);
}

async function runMigration() {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

  console.log(`🔄 마이그레이션 확인 중... (${baseUrl})`);

  try {
    const res = await fetch(`${baseUrl}/api/migrate`, {
      method: "POST",
      headers: {
        "x-admin-token": adminToken,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (res.ok) {
      console.log("✅", data.message || "마이그레이션 완료!");
      return;
    }

    if (data.sql) {
      console.error("❌ 마이그레이션이 필요합니다.");
      console.error("\n다음 SQL을 Supabase SQL Editor에서 실행하세요:\n");
      console.log("```sql");
      console.log(data.sql);
      console.log("```\n");
      console.log("실행 후 다시 이 스크립트를 실행하면 확인됩니다.");
    } else {
      console.error("❌ 오류:", data.error || "알 수 없는 오류");
    }

    process.exit(1);
  } catch (err) {
    console.error("❌ 요청 실패:", err);
    console.error("\n로컬에서 실행하려면:");
    console.error("  1. npm run dev 로 서버 실행");
    console.error("  2. 다른 터미널에서 npm run migrate");
    process.exit(1);
  }
}

runMigration();
