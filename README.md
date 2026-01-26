# kids-diary

누구나 자신의 아이에 맞춰 커스터마이징할 수 있는 **성장 기록 프레임워크**.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

Pages:
- `/` 홈
- `/photos` 사진첩
- `/diary` 일기장

## Settings (Theme/Profile) + Supabase Persistence

이 프로젝트는 `Settings Sidebar`에서 바꾼 값(아이 이름/소개/생년월일/테마)을 **실시간 프리뷰**하고,
Supabase `site_settings` 테이블에 저장하도록 설계되어 있어요.

- **환경변수**: `.env.example` 참고
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY` (서버에서만 사용)
  - `ADMIN_TOKEN` (선택: POST 보호용, 설정/사진/일기 추가 시 필요)
- **테이블 생성 SQL**: `docs/supabase-site-settings.sql`
- **컨텐츠(사진/일기) SQL**: `docs/supabase-content.sql`

API:
- `GET /api/site-settings?siteId=default`
- `POST /api/site-settings` `{ siteId, settings }`

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
