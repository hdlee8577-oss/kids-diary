# 일기 사진 첨부 기능

## ✨ 기능 개요

일기 작성 시 최대 4개의 사진을 콜라주 형태로 첨부할 수 있습니다.

---

## 🎨 콜라주 레이아웃

### 1개 사진
```
┌────────────────┐
│                │
│    16:9 비율   │
│                │
└────────────────┘
```

### 2개 사진
```
┌───────┬───────┐
│ 1:1   │ 1:1   │
│       │       │
└───────┴───────┘
```

### 3개 사진
```
┌───────┬───────┐
│ 1:1   │ 1:1   │
│       │       │
├───────┴───────┤
│      1:1      │
│               │
└───────────────┘
```

### 4개 사진
```
┌───────┬───────┐
│ 1:1   │ 1:1   │
│       │       │
├───────┼───────┤
│ 1:1   │ 1:1   │
│       │       │
└───────┴───────┘
```

---

## 📋 구현 상세

### DB 스키마
```sql
ALTER TABLE public.diary_entries
ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}';
```

### API 변경사항

#### GET /api/diary
```typescript
type DiaryRow = {
  id: string;
  title: string;
  content: string;
  entry_date: string;
  photos: string[]; // ← 추가
  created_at: string;
};
```

#### POST /api/diary
```typescript
{
  title: string;
  content: string;
  entryDate: string;
  photos: string[]; // ← 추가 (max 4)
}
```

#### PATCH /api/diary/[id]
```typescript
{
  title?: string;
  content?: string;
  entryDate?: string;
  photos?: string[]; // ← 추가 (max 4)
}
```

---

## 🎯 UI/UX

### 일기 작성 폼
1. **사진 업로드 영역**:
   - 점선 테두리 박스
   - 클릭하여 파일 선택
   - 드래그 앤 드롭 (브라우저 기본)
   - 최대 4개 제한

2. **미리보기 그리드**:
   - 실시간 미리보기
   - 호버 시 X 버튼 표시
   - 개수에 따라 자동 레이아웃 변경

### 일기 목록 카드
- 작은 썸네일로 미리보기
- 최대 4개 표시
- 1개: 1열, 2개: 2열, 3개: 3열, 4개: 2x2

### 일기 상세 페이지
- 큰 사이즈로 콜라주 표시
- 본문 위에 배치
- 사진 클릭 시 원본 크기 보기 (구현 예정)

---

## 🔧 기술 구현

### 사진 업로드 프로세스
1. 사용자가 파일 선택
2. `/api/photos` POST로 Storage 업로드
3. 반환된 URL을 photos 배열에 추가
4. 최대 4개까지만 허용

### 레이아웃 로직
```typescript
const gridClass = 
  photos.length === 1 ? 'grid-cols-1' :
  photos.length === 2 ? 'grid-cols-2' :
  photos.length === 3 ? 'grid-cols-2' : // 마지막은 col-span-2
  'grid-cols-2'; // 4개는 2x2
```

### Aspect Ratio
- **1개**: 16:9 (가로로 넓게)
- **2-4개**: 1:1 (정사각형)

---

## 📌 TODO (향후 개선)

- [ ] 사진 순서 변경 (드래그 앤 드롭)
- [ ] 사진 클릭 시 라이트박스 뷰어
- [ ] 사진 캡션 추가
- [ ] 일기 편집 시 사진 추가/삭제
- [ ] 사진 압축 (용량 최적화)

---

## 🎉 완료!

일기가 더욱 생동감 있고 추억을 담기 좋은 형태로 변경되었습니다.
