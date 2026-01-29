# 애니메이션 가이드

## 🎬 프로젝트에 적용된 애니메이션 시스템

### 📦 사용 라이브러리
- `framer-motion@12.29.2`

---

## 🎯 애니메이션 패턴

### 1. 페이지 로드 애니메이션

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  {/* 페이지 콘텐츠 */}
</motion.div>
```

**효과**: 페이지가 아래에서 위로 부드럽게 나타남

---

### 2. 순차 애니메이션 (Staggered)

```tsx
{items.map((item, index) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05, duration: 0.3 }}
  >
    {item.content}
  </motion.div>
))}
```

**효과**: 요소들이 하나씩 순차적으로 나타남 (메뉴, 카드 리스트)

---

### 3. 버튼 애니메이션

```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  클릭하세요
</motion.button>
```

**효과**:
- 호버: 5% 확대
- 클릭: 5% 축소 (피드백)

---

### 4. 카드 호버 애니메이션

```tsx
<motion.article
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  whileHover={{ y: -4, transition: { duration: 0.2 } }}
>
  {/* 카드 콘텐츠 */}
</motion.article>
```

**효과**:
- 로드: 페이드인 + 살짝 확대
- 호버: 위로 4px 들어올려짐

---

### 5. 뒤로가기 버튼 애니메이션

```tsx
<motion.div whileHover={{ x: -4 }}>
  <ArrowLeft className="w-4 h-4" />
  뒤로가기
</motion.div>
```

**효과**: 호버 시 왼쪽으로 4px 이동 (방향성 표시)

---

### 6. 진행 바 애니메이션

```tsx
<motion.div
  initial={{ width: 0 }}
  animate={{ width: `${percentage}%` }}
  transition={{ duration: 0.8, ease: "easeOut" }}
  style={{ background: 'var(--color-primary)' }}
/>
```

**효과**: 차트 바가 좌→우로 채워짐

---

### 7. 드롭다운 메뉴 애니메이션

```tsx
{isOpen && (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 10 }}
  >
    {/* 메뉴 내용 */}
  </motion.div>
)}
```

**효과**: 메뉴가 위에서 아래로 나타남

---

## 📋 페이지별 적용 현황

### 홈 페이지 (`/`)
- ✅ 섹션 페이드인
- ✅ 제목 슬라이드업
- ✅ 버튼 호버/탭
- ✅ 카드 호버
- ✅ Sparkles 아이콘 펄스 애니메이션

### 목록 페이지 (`/photos`, `/diary`, `/artworks`, `/timeline`)
- ✅ 헤더 페이드인
- ✅ 버튼 호버/탭
- ✅ 카드 로드 애니메이션
- ✅ 카드 호버 들어올리기
- ✅ 메뉴 드롭다운 애니메이션

### 상세 페이지 (`/photos/[id]`, `/diary/[id]`, `/artworks/[id]`)
- ✅ 전체 컨테이너 페이드인
- ✅ 뒤로가기 버튼 호버
- ✅ 제목 영역 순차 애니메이션
- ✅ 이미지/콘텐츠 영역 스케일 애니메이션

### 통계 페이지 (`/stats`)
- ✅ 헤더 페이드인
- ✅ 카드 순차 애니메이션
- ✅ 차트 바 너비 애니메이션
- ✅ 카드 호버 효과

### 헤더 네비게이션
- ✅ 메뉴 아이템 순차 로드
- ✅ 호버/탭 애니메이션
- ✅ 활성 메뉴 강조

---

## 🎨 애니메이션 원칙

### Timing (타이밍)
- **페이지 로드**: 0.5-0.6초
- **호버**: 0.2초
- **탭**: 즉시 (0.1초 이하)
- **차트**: 0.8초
- **순차 딜레이**: 0.05초 간격

### Easing (이징)
- **기본**: `ease-out` (자연스러운 감속)
- **호버**: 기본값 (spring)
- **차트**: `easeOut` (부드러운 진입)

### Scale (크기)
- **버튼 호버**: 1.05 (5% 확대)
- **버튼 탭**: 0.95 (5% 축소)
- **카드 호버**: 1.02 (2% 확대)

### Distance (거리)
- **Y 이동**: 20px (페이지), -4px (카드)
- **X 이동**: -4px (뒤로가기)

---

## 🎨 기존 디자인 문제점 (해결됨)

### ❌ 문제 (Before)
1. **너무 평면적** - 그림자, 깊이감 없음 → ✅ 해결
2. **단조로운 색상** - 기본 Tailwind 색상만 사용 → ✅ 해결
3. **애니메이션 부재** - 정적이고 생동감 없음 → ✅ 해결
4. **아이콘 부재** - 이모지만 사용 (비전문적) → ✅ 해결
5. **타이포그래피 단순** - 폰트 변화 없음 → ⚠️ 부분 해결

---