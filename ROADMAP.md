# Pathfinder Kids - 개발 로드맵

## 📊 현재 상태 분석

### ✅ 이미 구현된 기능
- ✅ 사진 업로드 및 저장 (Supabase Storage)
- ✅ 일기 작성 및 관리
- ✅ 프로필 설정 (아이 이름, 소개, 생년월일)
- ✅ 테마 커스터마이징
- ✅ 섬네일 위치 조정
- ✅ 다중 파일 업로드
- ✅ 반응형 디자인
- ✅ 메뉴 커스터마이징 시스템 (프리셋 + 동적 네비게이션)
- ✅ 타임라인 뷰 (`/timeline`) - 사진/일기 통합
- ✅ 간단 통계 뷰 (`/stats`) - 총 개수, 최근 30일, 월별 추이

### ❌ 비즈니스 모델 대비 부족한 기능
- ❌ 학년별 분류 (Pre-K ~ 12th Grade)
- ❌ 분야별 분류 (STEM, Art, Sports, Writing 등)
- ❌ AI OCR (손글씨 텍스트 변환)
- ❌ 성장 타임라인 비교 기능
- ❌ 포트폴리오 PDF 내보내기
- ❌ 프라이빗 공유 기능
- ❌ "Mom's Note" 섹션
- ❌ 검색 기능
- ❌ 필터링 기능
- ❌ AI 감정/발달 요약 기능 (육아 일기를 기반으로 오늘 아이 상태를 한 줄로 요약)
- ❌ 카드형 SNS/카톡 공유 기능 (일기를 예쁜 카드 이미지로 만들어 공유)

---

## 🎯 Phase 1: 핵심 구조 개선 (우선순위 높음)

### 1.1 데이터베이스 스키마 확장

**현재 스키마:**
```sql
photos(id, site_id, title, image_url, taken_at, thumb_pos_x, thumb_pos_y, created_at)
diary_entries(id, site_id, title, content, entry_date, created_at)
```

**개선된 스키마:**
```sql
-- 사진/작품 테이블 확장
photos(
  id, site_id, title, image_url, taken_at,
  grade,           -- 'Pre-K', 'K', '1st', '2nd', ... '12th'
  category,        -- 'STEM', 'Art', 'Sports', 'Writing', 'Other'
  tags,            -- JSONB 배열: ['자화상', '수학', '과학실험']
  mom_note,        -- TEXT: 엄마의 코멘트
  ocr_text,        -- TEXT: AI OCR로 변환된 텍스트 (일기/에세이용)
  created_at
)

-- 일기 테이블 확장
diary_entries(
  id, site_id, title, content, entry_date,
  grade,           -- 학년 정보
  category,        -- 'Writing', 'Journal', 'Essay'
  tags,            -- JSONB 배열
  mom_note,        -- 엄마의 코멘트
  ocr_text,        -- 손글씨 OCR 텍스트
  created_at
)

-- 새 테이블: 카테고리 정의
categories(
  id, site_id, name, icon, color, created_at
)

-- 새 테이블: 공유 링크
share_links(
  id, site_id, item_type, item_id, token, expires_at, created_at
)
```

### 1.2 UI 구조 개선

**현재 구조:**
```
/ (홈)
/photos (사진첩)
/diary (일기장)
```

**개선된 구조:**
```
/ (대시보드 - 학년별/분야별 요약)
/portfolio (포트폴리오 뷰)
  /portfolio/grade/[grade] (학년별)
  /portfolio/category/[category] (분야별)
  /portfolio/timeline/[tag] (타임라인 비교)
/photos (사진첩)
  /photos?grade=1st&category=Art (필터링)
/diary (일기장)
  /diary?grade=2nd&category=Writing
/upload (통합 업로드 페이지)
  - 사진/작품 업로드
  - 일기 작성
  - 학년, 분야, 태그 선택
/share/[token] (공유 링크)
```

---

## 🚀 Phase 2: 핵심 기능 추가

### 2.1 학년별/분야별 분류 시스템

**구현 내용:**
1. 업로드 시 학년 선택 드롭다운
2. 분야 선택 (STEM, Art, Sports, Writing, Other)
3. 태그 입력 (자동완성)
4. 필터링 UI (사이드바 또는 상단)

**파일 구조:**
```
src/
  app/
    photos/
      page.tsx (필터링 추가)
    diary/
      page.tsx (필터링 추가)
  components/
    portfolio/
      GradeFilter.tsx
      CategoryFilter.tsx
      TagInput.tsx
      FilterSidebar.tsx
```

### 2.2 "Mom's Note" 기능

**구현 내용:**
- 사진/일기 상세 페이지에 "엄마의 한마디" 섹션 추가
- 업로드 시 또는 나중에 추가 가능
- 이모지 지원

**데이터 구조:**
```typescript
type PhotoItem = {
  // ... 기존 필드
  mom_note?: string;
  mom_note_date?: string;
}
```

### 2.3 검색 기능

**구현 내용:**
- 전역 검색바 (헤더에 추가)
- 제목, 태그, Mom's Note, OCR 텍스트 검색
- 실시간 검색 결과

**API:**
```
GET /api/search?q=자화상&type=photos,diary
```

---

## 🎨 Phase 3: 고급 기능

### 3.1 성장 타임라인 비교

**구현 내용:**
- 같은 태그(예: "자화상")를 가진 작품들을 시간순으로 나열
- 슬라이더로 비교
- "1학년 vs 3학년" 비교 뷰

**페이지:**
```
/portfolio/timeline/[tag]
```

**컴포넌트:**
```
src/components/portfolio/
  TimelineComparison.tsx
  BeforeAfterSlider.tsx
```

### 3.2 AI OCR 기능 (손글씨 텍스트 변환)

**구현 방법:**
1. **옵션 A: Tesseract.js (클라이언트 사이드)**
   - 무료, 오프라인
   - 한글 인식률 낮음

2. **옵션 B: Google Cloud Vision API**
   - 유료, 높은 정확도
   - 한글 지원 우수

3. **옵션 C: Supabase Edge Function + 외부 API**
   - 서버 사이드 처리
   - API 키 보안

**구현 단계:**
1. 업로드 시 OCR 옵션 체크박스
2. 이미지 → OCR API 호출
3. 결과를 `ocr_text` 필드에 저장
4. 검색에 포함

**파일:**
```
src/app/api/photos/[id]/ocr/route.ts
src/components/photos/OCRButton.tsx
```

### 3.3 포트폴리오 PDF 내보내기

**구현 내용:**
- 선택한 작품들을 PDF로 생성
- 커스터마이징 가능한 레이아웃
- 학년별/분야별 자동 구성

**라이브러리:**
- `jspdf` + `html2canvas`
- 또는 `@react-pdf/renderer`

**API:**
```
POST /api/portfolio/export
Body: { items: string[], layout: 'timeline' | 'grid', ... }
Response: PDF blob
```

**컴포넌트:**
```
src/components/portfolio/
  ExportModal.tsx
  PDFPreview.tsx
```

### 3.4 프라이빗 공유 기능

**구현 내용:**
- 특정 앨범/작품에 대한 공유 링크 생성
- 만료일 설정
- 비밀번호 옵션
- 조부모님용 간단한 뷰

**API:**
```
POST /api/share/create
Body: { item_type: 'photo' | 'diary', item_id: string, expires_in_days: number }
Response: { token: string, url: string }

GET /api/share/[token]
Response: 공유된 컨텐츠
```

**페이지:**
```
/share/[token]
```

### 3.5 AI 감정/발달 요약 기능

**구현 내용:**
- 사용자가 작성한 육아 일기를 기반으로
  - 오늘 우리 아이의 감정 상태를 한 줄로 요약
  - 반복되는 패턴(예: “최근 1주일 동안 피곤/짜증 키워드가 많음”) 간단 코멘트
- 일기 작성 후, 또는 일기 목록 상단에 요약 영역 표시

**API (예시):**
```ts
POST /api/ai/diary-summary
Body: { entries: { id: string; content: string; created_at: string; }[] }
Response: { todaySummary: string; trendSummary?: string }
```

**페이지/컴포넌트:**
```
src/app/diary/page.tsx                  // 요약 배너 표시
src/app/api/ai/diary-summary/route.ts   // 요약 생성 API (외부 LLM 연동)
src/components/diary/DiarySummary.tsx   // 요약 UI 컴포넌트
```

**주의사항:**
- 초기에는 “서버에서만 호출되는 내부용 API + 관리자/테스터 전용”으로 시작
- 나중에 유료 플랜(구독자)에게만 노출하는 기능으로 확장 가능

---

## 📱 Phase 4: UX 개선

### 4.1 대시보드 개선

**현재:** 단순 홈페이지
**개선:** 
- 학년별 통계 (작품 수, 일기 수)
- 최근 업로드
- 성장 하이라이트
- 빠른 액션 버튼

### 4.2 업로드 플로우 개선

**현재:** 사진첩/일기장 각각 업로드
**개선:**
- 통합 업로드 페이지 (`/upload`)
- 드래그 앤 드롭
- 일괄 태그/학년 설정
- 업로드 진행률 표시

### 4.3 모바일 최적화

- 카메라 직접 촬영
- 빠른 업로드
- 터치 제스처

### 4.4 카드형 SNS 공유 기능

**구현 내용:**
- 선택한 일기를 “이미지 카드”로 변환해서 카톡/인스타 등으로 공유
- 배경 색/폰트/스티커(이모지)를 간단히 커스터마이징
- 모바일에서 “이미지로 저장하기” 버튼 제공

**대략적인 흐름:**
1. 사용자가 일기 상세 페이지에서 “카드로 만들기” 버튼 클릭
2. 카드 편집 뷰에서 배경/폰트/스티커 선택
3. 클라이언트에서 HTML → 이미지 캡처 (html2canvas 등)
4. 생성된 이미지를 다운로드 또는 공유

**파일 구조 (예시):**
```ts
src/components/share/ShareCardEditor.tsx   // 카드 편집 UI
src/components/share/ShareCardPreview.tsx  // 미리보기
```

**사업적 포인트:**
- 무료 버전: 기본 카드 템플릿만 제공
- 유료 버전: 프리미엄 템플릿/폰트/스티커 제공, 워터마크 제거

---

## 🗂️ 권장 개발 순서

### Week 1-2: Phase 1 (구조 개선)
1. ✅ DB 스키마 확장 (마이그레이션)
2. ✅ 타입 정의 업데이트 (`Site.config.ts`)
3. ✅ 업로드 폼에 학년/분야/태그 필드 추가
4. ✅ 필터링 UI 추가

### Week 3-4: Phase 2 (핵심 기능)
1. ✅ Mom's Note 기능
2. ✅ 검색 기능
3. ✅ 대시보드 개선

### Week 5-6: Phase 3 (고급 기능)
1. ✅ 성장 타임라인 비교
2. ✅ OCR 기능 (Google Vision API)
3. ✅ PDF 내보내기

### Week 7: Phase 4 (UX 개선)
1. ✅ 공유 기능
2. ✅ 통합 업로드 페이지
3. ✅ 모바일 최적화

---

## 💡 즉시 시작 가능한 작업

### 1. DB 스키마 확장 (가장 먼저)
```sql
-- photos 테이블에 컬럼 추가
ALTER TABLE photos 
ADD COLUMN grade TEXT,
ADD COLUMN category TEXT,
ADD COLUMN tags JSONB DEFAULT '[]',
ADD COLUMN mom_note TEXT;

-- diary_entries 테이블에 컬럼 추가
ALTER TABLE diary_entries
ADD COLUMN grade TEXT,
ADD COLUMN category TEXT,
ADD COLUMN tags JSONB DEFAULT '[]',
ADD COLUMN mom_note TEXT;
```

### 2. 업로드 폼 개선
- 학년 선택 드롭다운
- 분야 선택 버튼
- 태그 입력 필드
- Mom's Note 텍스트 영역

### 3. 필터링 사이드바
- 학년 필터
- 분야 필터
- 태그 클라우드

---

## 🔧 기술 스택 추가 고려사항

### OCR
- **Tesseract.js**: 클라이언트 사이드, 무료, 한글 약함
- **Google Cloud Vision**: 서버 사이드, 유료, 한글 우수
- **Naver Clova OCR**: 한국어 특화, API 제공

### PDF 생성
- **@react-pdf/renderer**: React 컴포넌트 → PDF
- **jspdf + html2canvas**: HTML → PDF

### 검색
- **Supabase Full-text Search**: PostgreSQL 기본 기능
- **Algolia**: 고급 검색 (유료)

### 작은 유료화 실험 (커피값 모델)

**아이디어:**  
- 서비스 전체를 비싸게 받기보다, **“정말 가치 있는 일부 정보”**에만 아주 작은 금액을 붙여서 시작
- 예: AI가 분석해 주는 **우리 아이 맞춤형 성장 요약/리포트**에만 소액 과금

**예시 플로우:**  
- 기본 기능(사진/일기/타임라인/통계)은 무료로 제공
- 한 달에 1–2번, 아래와 같은 기능은 **소액 결제 후 사용 가능**:
  - AI가 최근 1개월 일기를 읽고, 아이의 감정/관심사/변화를 한 페이지로 정리
  - “요즘 우리 아이는 이런 점이 자라고 있어요” 같은 부모용 리포트 PDF
- 가격은 **“커피 한 잔 값” 수준**으로 시작 (예: 리포트 1회 $3~5 또는 월 $4.99)

**구현 위치 (후순위):**  
- Phase 3의 **AI 요약 기능**, Phase 3.3의 **포트폴리오/리포트 PDF**와 자연스럽게 연결  
- Stripe 구독/단건 결제와 연동해서,  
  - 무료 사용자: 요약 일부만 / 샘플 페이지만 보기  
  - 유료 사용자: 전체 리포트 + PDF 다운로드 + 공유 기능까지 제공

---

## 📝 다음 단계

1. **DB 마이그레이션 스크립트 작성**
2. **타입 정의 업데이트**
3. **업로드 폼에 새 필드 추가**
4. **필터링 UI 구현**

어떤 것부터 시작할까요?
