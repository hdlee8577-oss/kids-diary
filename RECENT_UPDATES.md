# 최근 업데이트 내역

## 2026년 1월 27일 업데이트

### 📱 모바일 UX 대폭 개선

#### 1. 햄버거 메뉴 구현
- **위치**: 헤더 오른쪽 (모바일에서만 표시)
- **동작**: 오른쪽에서 슬라이드되는 사이드 메뉴
- **기술**: React Portal로 `document.body`에 직접 렌더링 (z-index 100)
- **내용**: 
  - 동적 네비게이션 메뉴
  - 설정 버튼
  - 로그인/로그아웃

#### 2. 모바일 목록 레이아웃 최적화
- 헤더 버튼 영역을 모바일에서 세로 배치
- 그리드 간격 조정 (3열 → 2열, gap 간격 최적화)
- 손가락으로 터치하기 편한 크기로 카드 조정

### 🖼️ 프로필 사진 편집 기능

#### 인터랙티브 편집
- **마우스 드래그**: 사진 위에서 드래그하여 위치 이동
- **터치 제스처**: 모바일에서 손가락 드래그로 위치 조정
- **트랙패드 줌**: 맥북에서 핀치 제스처(Ctrl+휠)로 확대/축소
- **슬라이더**: 확대, 가로, 세로 위치를 슬라이더로 미세 조정

#### 데이터 저장
- `SiteProfile`에 새 필드 추가:
  - `profilePhotoZoom`: 확대 배율 (1~2.5)
  - `profilePhotoOffsetX`: 가로 이동 (-50~50%)
  - `profilePhotoOffsetY`: 세로 이동 (-50~50%)
- 실시간 저장 및 새로고침 후에도 유지

### 📅 생일/나이 표시 개선
- **포맷 변경**: "생일 (나이세)" 형식으로 한 줄 표시
  - 예: "2018년 6월 19일 (10세)"
- **타임존 문제 해결**: 날짜 문자열 직접 파싱으로 UTC 변환 이슈 제거

### 🎨 작품 모음 기능 강화

#### URL 링크 지원
- 작품 카드에 "원본 영상 보기" / "원본 링크 열기" 배지 추가
- 클릭 시 새 탭에서 실제 URL로 이동
- 카드 클릭은 여전히 상세 페이지로 이동

#### 동영상 UI 개선
- 유튜브 등 동영상 썸네일 중앙에 플레이 버튼 오버레이
- 리스트 뷰와 상세 페이지 모두 적용
- 상세 페이지 썸네일 클릭 시 원본 동영상 페이지로 이동

#### 썸네일 크기 최적화
- 상세 페이지 이미지 최대 너비 제한 (max-w-2xl)
- 저해상도 이미지 깨짐 현상 완화

### 🛠️ 개발자 경험 개선

#### 자동 커밋 스크립트
- **위치**: `scripts/auto-commit.sh`
- **사용법**: `npm run commit`
- **기능**: 변경사항 자동 감지 및 커밋 (변경 파일명 기반 메시지 생성)

---

## 📦 신규 파일

```
scripts/
  └── auto-commit.sh          # 자동 커밋 스크립트

docs/
  └── PROJECT_STRUCTURE.md    # 프로젝트 구조 문서
  └── UI_FRAME_STRUCTURE.md   # UI 프레임 구조 문서
  └── RECENT_UPDATES.md       # (이 파일) 최근 업데이트 내역
```

---

## 🔧 수정된 파일

### 컴포넌트
- `src/components/layout/SiteHeader.tsx`
  - 햄버거 메뉴 버튼 추가
  - 모바일 슬라이드 메뉴 (Portal 사용)
  - z-index 100으로 메인 콘텐츠 위에 표시

- `src/components/home/HomeHero.tsx`
  - 프로필 사진 드래그/줌 이벤트 핸들러
  - 생일/나이 표시 로직 개선
  - 메뉴 버튼 색상 통일

### 페이지
- `src/app/photos/page.tsx` - 모바일 그리드 최적화
- `src/app/diary/page.tsx` - 모바일 헤더 레이아웃 개선
- `src/app/artworks/page.tsx` - URL 링크 및 동영상 UI 추가, 모바일 최적화
- `src/app/artworks/[id]/page.tsx` - 썸네일 링크 연결, 크기 조정
- `src/app/timeline/page.tsx` - 모바일 필터 버튼 배치 개선

### 설정 타입
- `src/Site.config.ts`
  - `SiteProfile`에 프로필 사진 편집 필드 추가
  - `profilePhotoZoom`, `profilePhotoOffsetX`, `profilePhotoOffsetY`

### 설정
- `package.json` - `commit` 스크립트 추가

---

## 🎯 주요 개선 포인트

### 1. 모바일 퍼스트 디자인
- 햄버거 메뉴로 모바일 네비게이션 개선
- 버튼과 카드 크기 터치 친화적으로 조정
- 헤더 레이아웃 반응형 개선

### 2. 인터랙티브 편집 UX
- 프로필 사진을 직접 드래그/줌으로 조정
- 실시간 미리보기 및 자동 저장
- 데스크톱/모바일 모두 최적화

### 3. 멀티미디어 지원 강화
- 유튜브 동영상 썸네일 자동 추출
- 동영상 플레이 버튼 UI
- 외부 링크 클릭 가능

### 4. 타임존 문제 해결
- 생일 날짜 표시 정확도 개선
- 로컬 날짜로 직접 파싱

---

## 📚 관련 문서

- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - 전체 프로젝트 구조
- [UI_FRAME_STRUCTURE.md](./UI_FRAME_STRUCTURE.md) - UI 프레임 구조
- [CUSTOMIZATION_SYSTEM.md](./CUSTOMIZATION_SYSTEM.md) - 커스터마이징 시스템
- [MOBILE_MENU_OPTIONS.md](./MOBILE_MENU_OPTIONS.md) - 모바일 메뉴 옵션
- [HOW_TO_TEST.md](./HOW_TO_TEST.md) - 테스트 가이드
