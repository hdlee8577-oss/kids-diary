# 구현 우선순위 가이드

## ✅ Phase 1 완료 (커스터마이즈 시스템)
- ✅ 메뉴 모듈 정의 (`menuModules.ts`)
- ✅ 프리셋 정의 (`menuPresets.ts`)
- ✅ DB 스키마 (`user_menu_settings` 테이블)
- ✅ API 라우트 (`/api/user/menu-settings`)
- ✅ Hook (`useUserMenuSettings`)
- ✅ 동적 네비게이션 (`DynamicNav`)
- ✅ 메뉴 설정 페이지 (`/settings/menu`)

---

## 🚀 Phase 2: 각 모듈 상세 페이지 구현

### 현재 완성된 모듈 ✅
- ✅ **사진첩** (`/photos`) - 완전 구현됨
- ✅ **일기장** (`/diary`) - 완전 구현됨

---

## 📋 다음 단계: 우선순위별 구현 가이드

### 🎯 **1단계: 가장 간단한 모듈부터 (빠른 성과)**

#### 1-1. 타임라인 모듈 (3일) ⭐⭐⭐
**왜 먼저?** 기존 데이터를 활용하므로 DB 스키마가 필요 없음

**작업 내용:**
- 페이지: `/timeline/page.tsx`
- 기존 `photos`, `diary` 데이터를 시간순으로 통합 표시
- 날짜별 그룹화
- 타입별 필터링 (사진/일기)

**구현 순서:**
1. `/app/timeline/page.tsx` 생성
2. 기존 API에서 데이터 가져오기 (`/api/photos`, `/api/diary`)
3. 날짜순 정렬 및 그룹화
4. 카드형 UI로 표시

---

#### 1-2. 통계 모듈 (4일) ⭐⭐⭐⭐
**왜 먼저?** 기존 데이터 활용, 차트 라이브러리만 추가하면 됨

**작업 내용:**
- 페이지: `/stats/page.tsx`
- 사진 수, 일기 수 통계
- 월별/년별 트렌드 차트
- Chart.js 또는 Recharts 사용

**구현 순서:**
1. 차트 라이브러리 설치 (`npm install recharts`)
2. `/app/stats/page.tsx` 생성
3. 기존 API에서 데이터 가져오기
4. 통계 계산 및 차트 렌더링

---

### 🎯 **2단계: 사진첩과 유사한 구조 (재사용 가능)**

#### 2-1. 작품 모음 모듈 (4일) ⭐⭐⭐
**왜 먼저?** `photos` 모듈과 거의 동일한 구조, 재사용 가능

**작업 내용:**
- DB 스키마: `artworks` 테이블 (photos와 유사)
- API: `/api/artworks` (GET, POST, PATCH, DELETE)
- 페이지: `/artworks/page.tsx`, `/artworks/[id]/page.tsx`
- 사진 업로드, 제목, 날짜, 재료, 설명

**구현 순서:**
1. DB 스키마 생성 (`docs/supabase-artworks.sql`)
2. API 라우트 생성 (`/app/api/artworks/route.ts`)
3. 목록 페이지 (`/app/artworks/page.tsx`) - photos 페이지 복사 후 수정
4. 상세 페이지 (`/app/artworks/[id]/page.tsx`) - photos 상세 페이지 복사 후 수정

---

#### 2-2. 상장/인증서 모듈 (3일) ⭐⭐
**왜 먼저?** 작품 모음과 유사한 구조

**작업 내용:**
- DB 스키마: `awards` 테이블
- API: `/api/awards`
- 페이지: `/awards/page.tsx`, `/awards/[id]/page.tsx`
- 사진 업로드, 제목, 날짜, 기관, 카테고리

**구현 순서:**
1. DB 스키마 생성
2. API 라우트 생성
3. 목록/상세 페이지 생성 (artworks와 유사)

---

### 🎯 **3단계: 새로운 구조 (기록형 모듈)**

#### 3-1. 성장 기록 모듈 (3일) ⭐⭐⭐
**작업 내용:**
- DB 스키마: `growth_records` 테이블
- API: `/api/growth`
- 페이지: `/growth/page.tsx`
- 키, 몸무게, 발자국 입력
- 차트 시각화 (성장 곡선)

**구현 순서:**
1. DB 스키마 생성
2. API 라우트 생성
3. 목록 페이지 (차트 포함)
4. 추가 폼

---

#### 3-2. 수면 기록 모듈 (2일) ⭐⭐
**작업 내용:**
- DB 스키마: `sleep_records` 테이블
- API: `/api/sleep`
- 페이지: `/sleep/page.tsx`
- 취침/기상 시간 입력
- 통계 (평균 수면 시간)

---

#### 3-3. 수유 기록 모듈 (2일) ⭐⭐
**작업 내용:**
- DB 스키마: `feeding_records` 테이블
- API: `/api/feeding`
- 페이지: `/feeding/page.tsx`
- 시간, 양, 종류 입력
- 일일 통계

---

#### 3-4. 건강 기록 모듈 (3일) ⭐⭐⭐
**작업 내용:**
- DB 스키마: `health_records` 테이블
- API: `/api/health`
- 페이지: `/health/page.tsx`
- 예방접종, 병원 기록, 증상
- 카테고리별 필터링

---

### 🎯 **4단계: 복잡한 모듈**

#### 4-1. 독서 기록 모듈 (4일) ⭐⭐⭐
**작업 내용:**
- DB 스키마: `books` 테이블
- API: `/api/books`
- 페이지: `/books/page.tsx`, `/books/[id]/page.tsx`
- 제목, 저자, 읽은 날짜, 별점, 리뷰
- 검색 기능
- 통계

---

#### 4-2. 활동 기록 모듈 (5일) ⭐⭐⭐⭐
**작업 내용:**
- DB 스키마: `activities` 테이블
- API: `/api/activities`
- 페이지: `/activities/page.tsx`
- STEM, Art, Sports, Writing 카테고리
- 학년별 분류
- 태그 시스템

---

#### 4-3. 포트폴리오 모듈 (7일) ⭐⭐⭐⭐
**작업 내용:**
- 기존 데이터 활용
- 페이지: `/portfolio/page.tsx`
- 학년별/분야별 작품 모음
- PDF 내보내기
- 레이아웃 커스터마이즈

---

#### 4-4. 공유 앨범 모듈 (4일) ⭐⭐⭐
**작업 내용:**
- DB 스키마: `shared_albums`, `share_links` 테이블
- API: `/api/shared`
- 페이지: `/shared/page.tsx`
- 앨범 생성, 링크 생성, 접근 제어

---

#### 4-5. 아이용 뷰 모듈 (3일) ⭐⭐
**작업 내용:**
- 페이지: `/kids/page.tsx`
- 간단한 UI (큰 버튼, 큰 글씨)
- 터치 친화적
- 부모 모드 전환

---

## 🎯 추천 시작 순서

### 옵션 A: 빠른 성과 (1-2주)
1. **타임라인** (3일) - 기존 데이터 활용
2. **통계** (4일) - 기존 데이터 활용
3. **작품 모음** (4일) - photos 재사용

**총: 약 11일 (2주)**

---

### 옵션 B: 완전한 기능 (1-2개월)
위의 모든 모듈을 순서대로 구현

**총: 약 6주 (풀타임 기준)**

---

## 💡 각 모듈 구현 시 공통 패턴

### 1. DB 스키마 생성
```sql
-- docs/supabase-[module-name].sql 파일 생성
CREATE TABLE IF NOT EXISTS [module_name] (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id TEXT NOT NULL,
  -- 모듈별 필드
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. API 라우트 생성
```typescript
// /app/api/[module-name]/route.ts
// GET, POST, PATCH, DELETE 구현
// photos API를 참고하여 작성
```

### 3. 페이지 생성
```typescript
// /app/[module-name]/page.tsx
// 목록 페이지 (photos 페이지 참고)
// /app/[module-name]/[id]/page.tsx
// 상세 페이지 (photos 상세 페이지 참고)
```

---

## 🚀 지금 바로 시작하기

**가장 쉬운 것부터: 타임라인 모듈**

다음 명령으로 시작하세요:
```
"타임라인 모듈을 구현해줘:
- /app/timeline/page.tsx 생성
- 기존 photos와 diary 데이터를 시간순으로 통합 표시
- 날짜별 그룹화
- 카드형 UI"
```
