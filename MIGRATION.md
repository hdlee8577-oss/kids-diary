# 마이그레이션 가이드

## 섬네일 위치 기능 추가 마이그레이션

사진첩의 섬네일 위치 조정 기능을 사용하려면 Supabase 데이터베이스에 컬럼을 추가해야 합니다.

### 방법 1: Supabase Dashboard에서 실행 (권장)

1. [Supabase Dashboard](https://app.supabase.com) 접속
2. 프로젝트 선택
3. 왼쪽 메뉴에서 **SQL Editor** 클릭
4. 다음 SQL을 복사해서 실행:

```sql
alter table if exists public.photos
  add column if not exists thumb_pos_x numeric(5, 2) null default 50.0,
  add column if not exists thumb_pos_y numeric(5, 2) null default 50.0;
```

5. **Run** 버튼 클릭
6. 완료!

### 방법 2: 마이그레이션 파일 사용

프로젝트에 마이그레이션 파일이 준비되어 있습니다:
- `supabase/migrations/20250126_add_thumb_pos.sql`

Supabase CLI가 설치되어 있다면:
```bash
supabase db push
```

### 방법 3: 마이그레이션 확인 API 사용

로컬 서버 실행 후:
```bash
npm run dev
```

다른 터미널에서:
```bash
ADMIN_TOKEN=your_token npm run migrate
```

이 명령어는 마이그레이션이 필요한지 확인하고, 필요하면 SQL을 안내합니다.

## 확인

마이그레이션이 완료되었는지 확인하려면:

1. Supabase Dashboard → Table Editor → `photos` 테이블
2. 컬럼 목록에 `thumb_pos_x`, `thumb_pos_y`가 있는지 확인

또는 SQL Editor에서:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'photos' 
  AND column_name IN ('thumb_pos_x', 'thumb_pos_y');
```

## 주의사항

- 마이그레이션은 **안전**합니다 (`if not exists` 사용)
- 기존 데이터는 기본값(50.0, 50.0)으로 설정됩니다
- 마이그레이션 전에 백업을 권장합니다
