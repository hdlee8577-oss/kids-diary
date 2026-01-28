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
- **위치**: 상단 고정 (`sticky top-0`)
- **기능**:
  - 로고/제목 표시 (아이 이름 + "의 성장기록")
  - 데스크톱: 가로 메뉴 표시
  - 모바일: 햄버거 버튼 → 오른쪽 사이드 메뉴
  - 로그인 상태 표시
  - 설정 버튼 (데스크톱만)

#### 2. **DynamicNav** (`src/components/layout/DynamicNav.tsx`)
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

#### 4. **ThemeProvider** (`src/theme/ThemeProvider.tsx`)
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
  - 프로필 섹션 (사진, 이름, 생일)
  - 소개 문구
  - 빠른 액션 버튼 (사진첩 보기, 일기장 쓰기)
  - 기능 소개 카드

### 사진첩 (`/photos`)
- **파일**: `src/app/photos/page.tsx`
- **기능**:
  - 사진 목록 그리드 표시
  - 사진 추가 버튼
  - 썸네일 클릭 → 상세 페이지
  - 여러 개 선택 삭제
  - 개별 삭제

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

### 일기 상세 (`/diary/[id]`)
- **파일**: `src/app/diary/[id]/page.tsx`
- **기능**: 전체 내용 표시, 삭제 버튼

### 작품활동 (`/artworks`)
- **파일**: `src/app/artworks/page.tsx`
- **기능**: 작품 목록, 추가, 수정, 삭제

### 타임라인 (`/timeline`)
- **파일**: `src/app/timeline/page.tsx`
- **기능**: 사진과 일기를 날짜별로 통합 표시

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
- image_url: TEXT (또는 external_url)
- artwork_type: TEXT ('image', 'url', 'writing')
- external_url: TEXT (유튜브 등)
- artwork_date: DATE
- created_at: TIMESTAMPTZ
```

#### 4. **site_settings** (사이트 설정)
```sql
- id: UUID
- site_id: TEXT (사용자 ID)
- settings: JSONB {
    profile: {
      childName, intro, birthDate, 
      profilePhotoUrl, profilePhotoShape
    },
    theme: {
      colors, radiusPx, font, layout, homeMood
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
- `profile`: 프로필 정보 (이름, 생일, 사진 등)
- `theme`: 테마 설정 (색상, 폰트, 레이아웃 등)
- `setProfile()`: 프로필 업데이트
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

이 구조를 참고하시면 대화가 더 수월할 것입니다!
