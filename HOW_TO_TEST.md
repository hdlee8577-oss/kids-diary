# 작업 확인 방법 가이드

## ✅ 생성된 파일들 확인

### 1. 메뉴 모듈 정의
```bash
cat src/config/menuModules.ts
```
- 15개 메뉴 모듈이 정의되어 있어야 함
- photos, diary, artworks, awards 등

### 2. 프리셋 정의
```bash
cat src/config/menuPresets.ts
```
- 6개 프리셋이 정의되어 있어야 함
- baby, toddler, preschool, elementary, teen, custom

### 3. DB 스키마
```bash
cat docs/supabase-menu-settings.sql
```
- user_menu_settings 테이블 생성 SQL

### 4. API 라우트
```bash
cat src/app/api/user/menu-settings/route.ts
```
- GET/POST 엔드포인트

### 5. Hook
```bash
cat src/hooks/useUserMenuSettings.ts
```
- 설정 불러오기/저장하기 Hook

### 6. 동적 네비게이션
```bash
cat src/components/layout/DynamicNav.tsx
```
- 활성화된 메뉴만 표시하는 컴포넌트

### 7. 설정 페이지
```bash
cat src/app/settings/menu/page.tsx
```
- 메뉴 설정 UI

---

## 🌐 브라우저에서 확인

### Step 1: 개발 서버 실행
```bash
npm run dev
```

### Step 2: 브라우저에서 접속
1. `http://localhost:3000` 접속
2. 헤더의 메뉴 확인 (현재는 기본 메뉴만 표시될 수 있음)

### Step 3: 설정 페이지 접속
1. `http://localhost:3000/settings/menu` 접속
2. 다음을 확인:
   - ✅ 프리셋 선택 버튼들이 보이는가?
   - ✅ 메뉴 체크박스들이 보이는가?
   - ✅ 나이 입력 필드가 보이는가?

### Step 4: 설정 테스트
1. 프리셋 선택 (예: "유치원 (4-5세)")
2. 메뉴가 자동으로 선택되는지 확인
3. "저장" 버튼 클릭
4. 홈으로 돌아가서 헤더 메뉴 확인

---

## ⚠️ 주의: DB 마이그레이션 필요

### 설정을 저장하려면 DB 테이블이 필요합니다!

**Supabase Dashboard에서 실행:**
1. Supabase Dashboard 접속
2. SQL Editor 열기
3. `docs/supabase-menu-settings.sql` 파일 내용 복사
4. 실행 (Run)

**또는 터미널에서:**
```bash
# 파일 내용 확인
cat docs/supabase-menu-settings.sql
```

---

## 🔍 Git으로 확인

### 최신 커밋 확인
```bash
git log --oneline -5
```

다음 커밋이 보여야 함:
- `d827e28` - 커스터마이즈 시스템 Phase 1 완성
- `35a9b0d` - 작업 상태 추적 파일 추가

### 변경된 파일 확인
```bash
git show d827e28 --name-only
```

다음 파일들이 생성/수정되었어야 함:
- `src/config/menuModules.ts` (새 파일)
- `src/config/menuPresets.ts` (새 파일)
- `docs/supabase-menu-settings.sql` (새 파일)
- `src/app/api/user/menu-settings/route.ts` (새 파일)
- `src/hooks/useUserMenuSettings.ts` (새 파일)
- `src/components/layout/DynamicNav.tsx` (새 파일)
- `src/app/settings/menu/page.tsx` (새 파일)
- `src/components/layout/SiteHeader.tsx` (수정)

---

## 🧪 테스트 시나리오

### 시나리오 1: 프리셋 선택
1. `/settings/menu` 접속
2. "유치원 (4-5세)" 프리셋 클릭
3. 메뉴가 자동으로 선택되는지 확인
4. 저장
5. 헤더에 선택한 메뉴만 표시되는지 확인

### 시나리오 2: 직접 선택
1. `/settings/menu` 접속
2. "직접 설정" 모드
3. 원하는 메뉴만 체크박스로 선택
4. 저장
5. 헤더에 선택한 메뉴만 표시되는지 확인

### 시나리오 3: 나이 기반 추천
1. `/settings/menu` 접속
2. 나이 입력: 48 (4세)
3. 자동으로 "유치원" 프리셋이 추천되는지 확인

---

## ❌ 문제 해결

### 문제: 설정 페이지가 안 보여요
**해결:**
- 개발 서버가 실행 중인지 확인
- `npm run dev` 실행

### 문제: 저장이 안 돼요
**해결:**
- DB 마이그레이션이 실행되었는지 확인
- Supabase Dashboard에서 `user_menu_settings` 테이블이 있는지 확인
- 브라우저 콘솔(F12)에서 에러 확인

### 문제: 헤더 메뉴가 안 바뀌어요
**해결:**
- 설정을 저장했는지 확인
- 페이지 새로고침
- 브라우저 콘솔에서 에러 확인

---

## 📝 빠른 확인 체크리스트

- [ ] `src/config/menuModules.ts` 파일이 있나요?
- [ ] `src/config/menuPresets.ts` 파일이 있나요?
- [ ] `src/app/settings/menu/page.tsx` 파일이 있나요?
- [ ] `src/components/layout/DynamicNav.tsx` 파일이 있나요?
- [ ] `SiteHeader.tsx`에 `DynamicNav`가 import되어 있나요?
- [ ] 개발 서버가 실행 중인가요?
- [ ] `/settings/menu` 페이지에 접속할 수 있나요?
- [ ] DB 마이그레이션을 실행했나요?

---

**지금 바로 확인해보세요!**
