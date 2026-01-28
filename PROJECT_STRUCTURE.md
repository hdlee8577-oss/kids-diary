# 프로젝트 구조 가이드

## 📁 전체 디렉토리 구조

```
kids-diary/
├── src/
│   ├── app/                    # Next.js App Router 페이지
│   │   ├── layout.tsx          # 루트 레이아웃 (헤더, 사이드바 포함)
│   │   ├── page.tsx           # 홈페이지 (/)
│   │   ├── globals.css        # 전역 스타일
│   │   ├── api/               # API 라우트
│   │   │   ├── photos/        # 사진 CRUD
│   │   │   ├── diary/         # 일기 CRUD
│   │   │   ├── artworks/      # 작품 CRUD
│   │   │   ├── site-settings/ # 사이트 설정 저장/조회
│   │   │   ├── profile-photo/ # 프로필 사진 업로드
│   │   │   └── user/menu-settings/ # 메뉴 커스터마이징
│   │   ├── photos/            # 사진첩 페이지
│   │   │   ├── page.tsx       # 목록 페이지
│   │   │   └── [id]/         # 상세/수정 페이지
│   │   ├── diary/             # 일기장 페이지
│   │   │   ├── page.tsx       # 목록 페이지
│   │   │   └── [id]/         # 상세 페이지
│   │   ├── artworks/          # 작품활동 페이지
│   │   ├── auth/              # 로그인/회원가입
│   │   ├── settings/menu/     # 메뉴 커스터마이징 설정
│   │   ├── timeline/          # 타임라인 뷰
│   │   └── stats/             # 통계 뷰
│   ├── components/            # React 컴포넌트
│   │   ├── layout/            # 레이아웃 컴포넌트
│   │   │   ├── SiteHeader.tsx    # 상단 헤더 (로고, 메뉴, 설정)
│   │   │   └── DynamicNav.tsx   # 동적 네비게이션 (데스크톱)
│   │   ├── home/              # 홈페이지 컴포넌트
│   │   │   └── HomeHero.tsx      # 메인 히어로 섹션
│   │   ├── settings/          # 설정 관련
│   │   │   └── SettingsSidebar.tsx # 설정 사이드바
│   │   └── shared/            # 공통 컴포넌트
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Field.tsx
│   │       └── ...
│   ├── config/                # 설정 파일
│   │   ├── menuModules.ts     # 메뉴 모듈 정의
│   │   └── menuPresets.ts     # 메뉴 프리셋
│   ├── hooks/                 # Custom Hooks
│   │   ├── useSupabaseUser.ts      # Supabase 사용자 인증
│   │   └── useUserMenuSettings.ts  # 메뉴 설정 관리
│   ├── lib/                   # 유틸리티 라이브러리
│   │   ├── supabase/          # Supabase 클라이언트
│   │   └── admin/             # 관리자 토큰
│   ├── stores/                # 상태 관리 (Zustand)
│   │   └── siteSettingsStore.ts    # 사이트 설정 상태
│   ├── theme/                 # 테마 시스템
│   │   ├── ThemeProvider.tsx       # 테마 프로바이더
│   │   └── applyThemeToDom.ts      # DOM에 테마 적용
│   └── Site.config.ts         # 사이트 기본 설정
└── docs/                      # SQL 마이그레이션 파일
    ├── supabase-content.sql
    ├── supabase-menu-settings.sql
    └── ...
```

---

## 🏗️ 프레임 구조 (레이아웃)

### 전체 레이아웃 흐름

```
┌─────────────────────────────────────┐
│  SiteHeader (고정 헤더)            │
│  - 로고/제목                        │
│  - DynamicNav (데스크톱 메뉴)      │
│  - 햄버거 버튼 (모바일)            │
│  - 설정 버튼                        │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  SettingsSidebar (오른쪽 사이드바)  │
│  - 설정 패널 (토글 가능)            │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  {children}                         │
│  - 각 페이지 콘텐츠                 │
│  - max-w-5xl 중앙 정렬              │
└─────────────────────────────────────┘
```

### 주요 컴포넌트 역할

#### 1. **SiteHeader** (`src/components/layout/SiteHeader.tsx`)
- **위치**: 상단 고정 (`sticky top-0`, z-50)
- **기능**:
  - 로고/제목 표시 (아이 이름 + "의 성장기록")
  - 데스크톱: 가로 메뉴 표시 (DynamicNav)
  - 모바일: 햄버거 버튼 → 오른쪽 슬라이드 사이드 메뉴 (Portal, z-100)
  - 로그인 상태 표시
  - 설정 버튼 (데스크톱만)
- **모바일 메뉴 특징**:
  - React Portal로 `document.body`에 직접 렌더링
  - 오른쪽에서 슬라이드 애니메이션
  - 오버레이 배경 클릭 시 닫기
  - 메뉴 외부 클릭 감지

#### 2. **DynamicNav** (`src/components/layout/DynamicNav.tsx`)
- **위치**: 데스크톱 헤더 내부
- **기능**:
  - 사용자 메뉴 설정에 따라 동적으로 네비게이션 생성
  - 활성 페이지 하이라이트
  - 메뉴 순서 및 활성화 모듈 반영

#### 3. **HomeHero** (`src/components/home/HomeHero.tsx`)
- **위치**: 홈페이지 메인 섹션
- **기능**:
  - 프로필 사진 표시 및 편집
  - 생일/나이 정보 표시 (타임존 문제 해결됨)
  - 사진첩/일기장 바로가기 버튼
  - 주요 기능 소개 카드
- **프로필 사진 편집 기능**:
  - 마우스 드래그로 위치 이동
  - 터치 제스처 지원 (모바일)
  - 트랙패드 핀치 줌 (Ctrl+휠)
  - 확대/가로/세로 슬라이더 제공
  - 실시간 미리보기 및 자동 저장
  - 데이터 저장: `profilePhotoZoom`, `profilePhotoOffsetX`, `profilePhotoOffsetY`

#### 4. **SettingsSidebar** (`src/components/settings/SettingsSidebar.tsx`)
- **위치**: SiteHeader 내부
- **기능**:
  - 사용자 설정에 따라 메뉴 동적 표시
  - 데스크톱: 가로 메뉴 리스트
  - 모바일: SiteHeader의 햄버거 버튼으로 제어

#### 3. **SettingsSidebar** (`src/components/settings/SettingsSidebar.tsx`)
- **위치**: 오른쪽 사이드바 (토글 가능)
- **기능**:
  - 프로필 설정 (아이 이름, 생일, 소개, 프로필 사진)
  - 테마 설정 (색상, 폰트, 레이아웃, 홈 분위기)
  - 썸네일 사이즈 설정

#### 5. **ThemeProvider** (`src/theme/ThemeProvider.tsx`)
- **위치**: 최상위 래퍼
- **기능**:
  - 전역 테마 상태 관리
  - CSS 변수 동적 업데이트
  - 초기 설정 로드

---

## 📄 페이지 구조

### 홈페이지 (`/`)
- **파일**: `src/app/page.tsx`
- **컴포넌트**: `HomeHero`
- **내용**:
  - 프로필 섹션 (사진, 이름, 생일/나이)
  - 소개 문구
  - 빠른 액션 버튼 (사진첩 보기, 일기장 쓰기)
  - 기능 소개 카드
- **프로필 사진 편집**:
  - 드래그로 위치 조정
  - 트랙패드/휠로 확대/축소
  - 슬라이더로 세밀한 조정

### 사진첩 (`/photos`)
- **파일**: `src/app/photos/page.tsx`
- **기능**:
  - 사진 목록 그리드 표시 (모바일 2열, 데스크톱 3열)
  - 다중 파일 업로드 지원
  - 썸네일 클릭 → 상세 페이지
  - 여러 개 선택 삭제
  - 개별 삭제
- **모바일 최적화**: 헤더 버튼 세로 배치, 터치 친화적 간격

### 사진 상세 (`/photos/[id]`)
- **파일**: `src/app/photos/[id]/page.tsx`
- **기능**: 큰 이미지 표시, 삭제 버튼

### 사진 수정 (`/photos/[id]/edit`)
- **파일**: `src/app/photos/[id]/edit/page.tsx`
- **기능**: 썸네일 위치 조정

### 일기장 (`/diary`)
- **파일**: `src/app/diary/page.tsx`
- **기능**:
  - 일기 목록 (날짜, 제목만 표시)
  - 일기 추가 팝업
  - 여러 개 선택 삭제
  - 개별 삭제
- **모바일 최적화**: 헤더 버튼 세로 배치

### 일기 상세 (`/diary/[id]`)
- **파일**: `src/app/diary/[id]/page.tsx`
- **기능**: 전체 내용 표시, 삭제 버튼

### 작품 모음 (`/artworks`)
- **파일**: `src/app/artworks/page.tsx`
- **기능**:
  - 작품 목록 그리드 (모바일 2열, 데스크톱 3열)
  - 이미지 파일 또는 URL 링크로 추가
  - 유튜브 동영상 자동 썸네일 추출
  - 카테고리/학년 분류
  - 엄마의 한마디 (mom_note)
  - 여러 개 선택 삭제
- **URL 링크 기능**:
  - "원본 영상 보기" / "원본 링크 열기" 배지 클릭으로 외부 링크 이동
  - 동영상 썸네일 중앙에 플레이 버튼 오버레이
- **모바일 최적화**: 헤더 버튼 세로 배치, 터치 친화적 그리드

### 작품 상세 (`/artworks/[id]`)
- **파일**: `src/app/artworks/[id]/page.tsx`
- **기능**:
  - 작품 이미지 표시 (max-w-2xl로 크기 제한)
  - 동영상인 경우 썸네일 클릭 시 원본 URL로 이동
  - 작품 정보 (제목, 설명, 날짜, 카테고리, 학년)
  - 엄마의 한마디 표시
  - 삭제 기능

### 타임라인 (`/timeline`)
- **파일**: `src/app/timeline/page.tsx`
- **기능**:
  - 사진과 일기를 날짜별로 통합 표시
  - 필터링 (전체/사진/일기)
  - 날짜별 그룹화
- **모바일 최적화**: 필터 버튼 배치 개선

### 통계 (`/stats`)
- **파일**: `src/app/stats/page.tsx`
- **기능**: 통계 대시보드

### 메뉴 설정 (`/settings/menu`)
- **파일**: `src/app/settings/menu/page.tsx`
- **기능**: 메뉴 커스터마이징 (프리셋, 모듈 선택, 순서 조정)

---

## 🗄️ 데이터베이스 구조

### Supabase 테이블

#### 1. **photos** (사진)
```sql
- id: UUID
- site_id: TEXT (사용자 ID)
- title: TEXT
- image_path: TEXT
- image_url: TEXT
- taken_at: DATE
- thumb_pos_x: NUMERIC (썸네일 X 위치)
- thumb_pos_y: NUMERIC (썸네일 Y 위치)
- created_at: TIMESTAMPTZ
```

#### 2. **diary_entries** (일기)
```sql
- id: UUID
- site_id: TEXT (사용자 ID)
- title: TEXT
- content: TEXT
- entry_date: DATE
- created_at: TIMESTAMPTZ
```

#### 3. **artworks** (작품)
```sql
- id: UUID
- site_id: TEXT
- title: TEXT
- description: TEXT
- image_url: TEXT (썸네일 또는 이미지 URL)
- image_path: TEXT (Storage 경로, 파일 업로드 시)
- url: TEXT (외부 링크: 유튜브, 블로그 등)
- type: TEXT ('image' | 'video' | 'writing' | 'link')
- category: TEXT ('Art', 'STEM', 'Writing', 'Music', 'Other')
- grade: TEXT ('Pre-K', 'K', '1st', ..., '12th')
- tags: JSONB []
- mom_note: TEXT (엄마의 한마디)
- artwork_date: DATE
- created_at: TIMESTAMPTZ
```
**참고**: 유튜브 URL 입력 시 자동으로 썸네일 추출 (`lib/utils/urlThumbnail.ts`)

#### 4. **site_settings** (사이트 설정)
```sql
- site_id: TEXT (PRIMARY KEY, 사용자 ID)
- settings: JSONB {
    profile: {
      childName: string,
      intro: string,
      birthDate?: string,
      profilePhotoUrl?: string,
      profilePhotoShape?: 'circle' | 'square' | 'rounded',
      profilePhotoZoom?: number (1~2.5),
      profilePhotoOffsetX?: number (-50~50%),
      profilePhotoOffsetY?: number (-50~50%)
    },
    theme: {
      colors: { primary, background, surface, text },
      radiusPx: number,
      font: string,
      layout: { mode, thumbnailSize },
      homeMood: { accentColor1, accentColor2, character, preset }
    }
  }
- updated_at: TIMESTAMPTZ
```

#### 5. **user_menu_settings** (메뉴 설정)
```sql
- id: UUID
- user_id: TEXT (사용자 ID)
- enabled_modules: JSONB [] (활성화된 메뉴 ID 배열)
- menu_order: JSONB [] (메뉴 순서)
- role_mode: TEXT ('parent' | 'child' | 'both')
- age_in_months: INTEGER
- preset: TEXT
- created_at, updated_at: TIMESTAMPTZ
```

### Storage 버킷
- **photos**: 사진 파일 저장
- **artworks**: 작품 이미지 저장
- **profile-photos**: 프로필 사진 저장

---

## 🔄 데이터 흐름

### 1. 사용자 인증
```
사용자 로그인
  ↓
useSupabaseUser() Hook
  ↓
user.id → siteId로 사용
  ↓
모든 API 호출에 siteId 포함
```

### 2. 설정 로드
```
페이지 로드
  ↓
layout.tsx에서 getInitialSettings()
  ↓
ThemeProvider에 전달
  ↓
siteSettingsStore에 저장
  ↓
전역 CSS 변수 업데이트
```

### 3. 메뉴 표시
```
useUserMenuSettings() Hook
  ↓
DB에서 enabled_modules, menu_order 조회
  ↓
DynamicNav에서 필터링 및 정렬
  ↓
헤더에 표시
```

### 4. 데이터 CRUD
```
페이지 컴포넌트
  ↓
API 라우트 호출 (/api/photos, /api/diary 등)
  ↓
Supabase Admin Client로 DB 접근
  ↓
site_id로 필터링하여 사용자별 데이터 분리
```

---

## 🎨 상태 관리

### Zustand Stores

#### **siteSettingsStore** (`src/stores/siteSettingsStore.ts`)
- `profile`: 프로필 정보
  - 기본: `childName`, `intro`, `birthDate`
  - 사진: `profilePhotoUrl`, `profilePhotoShape`
  - 편집: `profilePhotoZoom`, `profilePhotoOffsetX`, `profilePhotoOffsetY`
- `theme`: 테마 설정 (색상, 폰트, 레이아웃 등)
- `setProfile()`: 프로필 업데이트 (부분 업데이트 지원)
- `setTheme()`: 테마 업데이트
- `resetToDefault()`: 기본값으로 리셋

#### **useUserMenuSettings** (`src/hooks/useUserMenuSettings.ts`)
- `enabledModules`: 활성화된 메뉴 ID 배열
- `menuOrder`: 메뉴 순서
- `roleMode`: 역할 모드
- `updateSettings()`: 설정 저장

---

## 🔌 API 엔드포인트

### 사진 관련
- `GET /api/photos?siteId=...` - 목록 조회
- `POST /api/photos` - 사진 추가
- `GET /api/photos/[id]` - 상세 조회
- `PUT /api/photos/[id]` - 수정
- `DELETE /api/photos/[id]` - 삭제

### 일기 관련
- `GET /api/diary?siteId=...` - 목록 조회
- `POST /api/diary` - 일기 추가
- `GET /api/diary/[id]` - 상세 조회
- `PUT /api/diary/[id]` - 수정
- `DELETE /api/diary/[id]` - 삭제

### 작품 관련
- `GET /api/artworks?siteId=...` - 목록 조회
- `POST /api/artworks` - 작품 추가
- `GET /api/artworks/[id]` - 상세 조회
- `PUT /api/artworks/[id]` - 수정
- `DELETE /api/artworks/[id]` - 삭제

### 설정 관련
- `GET /api/site-settings?userId=...` - 설정 조회
- `POST /api/site-settings` - 설정 저장
- `POST /api/profile-photo` - 프로필 사진 업로드
- `GET /api/user/menu-settings?userId=...` - 메뉴 설정 조회
- `POST /api/user/menu-settings` - 메뉴 설정 저장

---

## 🎯 주요 개념

### siteId vs userId
- **과거**: `siteId = "default"` (단일 사이트)
- **현재**: `siteId = user.id` (사용자별 분리)
- **목적**: 각 사용자마다 독립적인 데이터 보관

### 메뉴 커스터마이징
- **프리셋**: 나이/상황별 미리 정의된 메뉴 조합
- **커스텀**: 사용자가 직접 메뉴 선택 및 순서 조정
- **동적 네비게이션**: 설정에 따라 헤더 메뉴 자동 업데이트

### 테마 시스템
- **CSS 변수**: `--color-primary`, `--color-background` 등
- **런타임 업데이트**: 설정 변경 시 즉시 DOM에 반영
- **프리셋**: warm, cool, playful, calm 등

---

## 📱 반응형 구조

### 데스크톱 (sm 이상)
- 가로 메뉴 표시
- 설정 버튼 헤더에 표시
- 최대 너비: `max-w-5xl`

### 모바일 (sm 미만)
- 햄버거 버튼으로 메뉴 접근
- 오른쪽 사이드 메뉴 슬라이드
- 설정은 메뉴 하단에 포함

---

## 🔐 인증 시스템

### Supabase Auth
- **로그인**: `/auth` 페이지
- **Hook**: `useSupabaseUser()`
- **상태**: 로그인/로그아웃 시 자동 업데이트
- **데이터 분리**: `user.id`를 `siteId`로 사용

---

## 🛠️ 개발 도구 및 스크립트

### NPM 스크립트
```bash
npm run dev        # 개발 서버 실행
npm run build      # 프로덕션 빌드
npm run start      # 프로덕션 서버 실행
npm run lint       # ESLint 실행
npm run migrate    # DB 마이그레이션 실행
npm run commit     # 자동 커밋 (변경사항 감지 및 커밋)
```

### 유틸리티 스크립트
- **scripts/auto-commit.sh**: 자동 커밋 스크립트
  - 변경된 파일 자동 감지
  - 파일명 기반 커밋 메시지 생성
  - 사용법: `npm run commit` 또는 `bash scripts/auto-commit.sh`

- **scripts/auto-push.sh**: 자동 푸시 스크립트
  - 네트워크 연결 재시도
  - 최대 10회 재시도

- **scripts/run-migration.ts**: DB 마이그레이션 실행
  - SQL 파일 실행
  - 사용법: `npm run migrate`

---

## 🎨 최근 주요 업데이트 (2026.01.27)

### 1. 모바일 UX 개선
- 햄버거 메뉴 구현 (Portal, z-100)
- 모바일 목록 레이아웃 최적화
- 터치 친화적 버튼 및 간격 조정

### 2. 프로필 사진 인터랙티브 편집
- 드래그로 위치 이동
- 트랙패드 핀치 줌
- 슬라이더로 세밀 조정
- 실시간 저장

### 3. 작품 모음 멀티미디어 지원
- URL 링크 클릭 가능
- 유튜브 동영상 플레이 버튼 오버레이
- 상세 페이지 썸네일 링크 연결

### 4. 생일/나이 표시 개선
- 타임존 문제 해결 (로컬 날짜 파싱)
- 한 줄 포맷: "2018년 6월 19일 (10세)"

---

이 구조를 참고하시면 대화가 더 수월할 것입니다!
