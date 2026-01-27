# 수익화 및 판매 전략 가이드

## 🎯 결론: **URL 기반 + 사용자 계정 + Stripe 결제**

---

## 📊 판매 모델 비교

### 옵션 1: URL 기반 (현재 구조) ❌
**방식:** 각 사용자마다 고유 URL (`yoursite.com/user123`)

**장점:**
- 간단한 구현
- 공유 용이

**단점:**
- ❌ 사용자 관리 어려움
- ❌ 결제 시스템 복잡
- ❌ 보안 문제 (URL 추측 가능)
- ❌ 확장성 낮음

**결론:** MVP용으로는 OK, 실제 서비스에는 부적합

---

### 옵션 2: 사용자 계정 + 결제 (추천) ✅
**방식:** 이메일/비밀번호 로그인 + Stripe 결제

**장점:**
- ✅ 표준적인 SaaS 모델
- ✅ 결제 시스템 통합 용이
- ✅ 사용자 관리 쉬움
- ✅ 보안 강화
- ✅ 확장성 높음

**단점:**
- 구현이 약간 복잡 (하지만 Supabase로 쉽게)

**결론:** **이걸로 가세요!** 🎯

---

## 🏗️ 추천 아키텍처

### 구조
```
사용자 → 로그인 (Supabase Auth) → 계정 확인 → 결제 상태 확인 → 서비스 이용
```

### 데이터베이스 구조
```sql
-- 사용자 계정 (Supabase Auth 자동 생성)
auth.users (Supabase가 관리)

-- 사용자 프로필 및 구독 정보
user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  full_name TEXT,
  subscription_tier TEXT, -- 'free', 'premium'
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT, -- 'active', 'canceled', 'past_due'
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
)

-- 사진/일기 데이터 (기존 구조 유지)
photos (
  id, 
  user_id UUID REFERENCES auth.users(id), -- site_id 대신 user_id 사용
  title, image_url, ...
)

diary_entries (
  id,
  user_id UUID REFERENCES auth.users(id), -- site_id 대신 user_id 사용
  title, content, ...
)
```

---

## 💳 결제 시스템: Stripe (추천)

### 왜 Stripe?
1. **가장 널리 사용됨**
   - 전 세계 SaaS의 80% 이상 사용
   - 한국 카드 지원 (Visa, Mastercard, 국내 카드)

2. **구현이 쉬움**
   - Next.js 통합 예제 많음
   - Supabase와 잘 맞음

3. **수수료**
   - 2.9% + $0.30 (국제 카드)
   - 한국 카드도 지원

4. **기능**
   - 구독 관리 자동화
   - 환불 처리
   - 세금 계산
   - 다국어 지원

---

## 🚀 구현 단계

### Phase 1: 사용자 인증 추가

#### 1.1 Supabase Auth 설정

**Supabase Dashboard에서:**
1. Authentication → Providers 활성화
   - Email (기본)
   - Google (선택)
   - Apple (선택)

2. Email Templates 커스터마이징
   - 한국어로 변경
   - 브랜딩 추가

#### 1.2 코드 구현

**`src/lib/auth/client.ts` (새 파일)**
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 로그인
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

// 회원가입
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  return { data, error }
}

// 로그아웃
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// 현재 사용자
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
```

**`src/app/login/page.tsx` (새 파일)**
```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/lib/auth/client";
import { Input } from "@/components/shared/Input";
import { Button } from "@/components/shared/Button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const { data, error: authError } = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password);

    if (authError) {
      setError(authError.message);
      return;
    }

    if (data?.user) {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <main className="mx-auto w-full max-w-md px-4 py-12">
      <h1 className="text-2xl font-semibold mb-6">
        {isSignUp ? "회원가입" : "로그인"}
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          placeholder="이메일"
          required
        />
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
          placeholder="비밀번호"
          required
        />
        
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        
        <Button type="submit" className="w-full">
          {isSignUp ? "회원가입" : "로그인"}
        </Button>
      </form>

      <button
        onClick={() => setIsSignUp(!isSignUp)}
        className="mt-4 text-sm text-[var(--color-primary)]"
      >
        {isSignUp ? "이미 계정이 있으신가요?" : "계정이 없으신가요?"}
      </button>
    </main>
  );
}
```

---

### Phase 2: 사용자 프로필 테이블 생성

**`docs/supabase-user-profiles.sql` (새 파일)**
```sql
-- 사용자 프로필 테이블
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'inactive')),
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 사용자 생성 시 프로필 자동 생성 (Trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS (Row Level Security) 설정
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);
```

---

### Phase 3: Stripe 결제 통합

#### 3.1 Stripe 계정 생성
1. https://stripe.com 가입
2. Dashboard → API Keys 확인
3. Test Mode로 시작 (나중에 Live로 전환)

#### 3.2 환경 변수 추가
**`.env.local`**
```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... (나중에)
```

#### 3.3 Stripe 설치
```bash
npm install stripe @stripe/stripe-js
```

#### 3.4 결제 페이지 생성

**`src/app/pricing/page.tsx` (새 파일)**
```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shared/Button";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function PricingPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubscribe() {
    setLoading(true);
    
    // 결제 세션 생성 API 호출
    const res = await fetch("/api/stripe/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        priceId: "price_premium_monthly", // Stripe에서 생성한 가격 ID
      }),
    });

    const { sessionId } = await res.json();
    const stripe = await stripePromise;
    
    // Stripe Checkout으로 리다이렉트
    await stripe?.redirectToCheckout({ sessionId });
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-12">요금제</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* 무료 플랜 */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">무료</h2>
          <div className="text-3xl font-bold mb-4">$0<span className="text-lg">/월</span></div>
          <ul className="space-y-2 mb-6">
            <li>✅ 기본 저장 (100개 작품)</li>
            <li>✅ 기본 분류</li>
            <li>✅ 기본 검색</li>
          </ul>
          <Button variant="secondary" className="w-full" disabled>
            현재 플랜
          </Button>
        </div>

        {/* 프리미엄 플랜 */}
        <div className="border-2 border-[var(--color-primary)] rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">프리미엄</h2>
          <div className="text-3xl font-bold mb-4">$9.99<span className="text-lg">/월</span></div>
          <ul className="space-y-2 mb-6">
            <li>✅ 무제한 저장</li>
            <li>✅ PDF 포트폴리오 내보내기</li>
            <li>✅ AI OCR 기능</li>
            <li>✅ 고급 필터링</li>
            <li>✅ 우선 지원</li>
          </ul>
          <Button 
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full"
          >
            {loading ? "처리 중..." : "구독하기"}
          </Button>
        </div>
      </div>
    </main>
  );
}
```

#### 3.5 Stripe Checkout API

**`src/app/api/stripe/create-checkout-session/route.ts` (새 파일)**
```typescript
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

export async function POST(req: Request) {
  try {
    const { priceId } = await req.json();
    
    // 현재 사용자 확인 (Supabase Auth)
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const { data: { user } } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 사용자 프로필 확인/생성
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // Stripe Customer 생성 또는 조회
    let customerId = profile?.stripe_customer_id;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      customerId = customer.id;

      // 프로필에 저장
      await supabase
        .from("user_profiles")
        .upsert({
          id: user.id,
          stripe_customer_id: customerId,
        });
    }

    // Checkout Session 생성
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      metadata: {
        user_id: user.id,
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

#### 3.6 Webhook 처리 (구독 상태 업데이트)

**`src/app/api/stripe/webhook/route.ts` (새 파일)**
```typescript
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // 구독 생성/갱신
  if (event.type === "checkout.session.completed" || 
      event.type === "customer.subscription.updated") {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;

    // 사용자 프로필 업데이트
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("stripe_customer_id", customerId)
      .single();

    if (profile) {
      await supabase
        .from("user_profiles")
        .update({
          subscription_tier: "premium",
          subscription_status: subscription.status,
          stripe_subscription_id: subscription.id,
          subscription_expires_at: new Date(
            subscription.current_period_end * 1000
          ).toISOString(),
        })
        .eq("id", profile.id);
    }
  }

  // 구독 취소
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("stripe_customer_id", customerId)
      .single();

    if (profile) {
      await supabase
        .from("user_profiles")
        .update({
          subscription_tier: "free",
          subscription_status: "canceled",
        })
        .eq("id", profile.id);
    }
  }

  return NextResponse.json({ received: true });
}
```

---

## 🔐 사용자별 데이터 분리

### 기존 코드 수정

**`src/app/api/photos/route.ts` 수정**
```typescript
// 기존: site_id 사용
// 변경: user_id 사용

export async function GET(req: Request) {
  // 현재 사용자 확인
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // user_id로 필터링
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .eq("user_id", user.id) // site_id 대신 user_id
    .order("created_at", { ascending: false });
    
  // ...
}
```

---

## 📱 사용자 플로우

### 신규 사용자
1. **회원가입** (`/signup`)
   - 이메일/비밀번호 입력
   - Supabase Auth로 계정 생성
   - 자동으로 `free` 플랜 할당

2. **대시보드** (`/`)
   - 무료 플랜으로 시작
   - 기본 기능 사용 가능

3. **업그레이드** (`/pricing`)
   - "프리미엄으로 업그레이드" 버튼 클릭
   - Stripe Checkout으로 결제
   - 자동으로 `premium` 플랜 활성화

### 기존 사용자
1. **로그인** (`/login`)
   - 이메일/비밀번호 입력
   - 대시보드로 이동

2. **서비스 이용**
   - 구독 상태에 따라 기능 제한/허용

---

## 💰 가격 전략

### 추천 가격
- **무료:** 기본 기능 (100개 작품, 기본 분류)
- **프리미엄:** $9.99/월 또는 $99/년 (2개월 무료)

### 대안 가격
- **$4.99/월** (더 저렴, 더 많은 사용자)
- **$14.99/월** (더 높은 가치, 적은 사용자)

**추천:** $9.99/월로 시작, 피드백 받고 조정

---

## 🎯 판매 방법 요약

### 1. 사용자 계정 시스템
- ✅ 이메일/비밀번호 로그인 (Supabase Auth)
- ✅ 각 사용자별 데이터 분리
- ✅ 보안 강화

### 2. 결제 시스템
- ✅ Stripe Checkout (가장 표준)
- ✅ 구독 관리 자동화
- ✅ 한국 카드 지원

### 3. 사용자 플로우
- ✅ 회원가입 → 무료 시작 → 업그레이드
- ✅ URL 공유는 나중에 (공유 기능)

---

## 📋 체크리스트

### Phase 1: 인증 (Week 1)
- [ ] Supabase Auth 설정
- [ ] 로그인/회원가입 페이지
- [ ] 사용자 프로필 테이블 생성
- [ ] 기존 코드를 user_id 기반으로 변경

### Phase 2: 결제 (Week 2)
- [ ] Stripe 계정 생성
- [ ] 가격 설정 (Stripe Dashboard)
- [ ] 결제 페이지 생성
- [ ] Checkout API 구현
- [ ] Webhook 처리

### Phase 3: 구독 관리 (Week 3)
- [ ] 구독 상태 확인 미들웨어
- [ ] 기능 제한 로직
- [ ] 구독 취소/갱신 처리

---

## 🚀 다음 단계

1. **Supabase Auth 활성화**
2. **로그인 페이지 만들기**
3. **Stripe 계정 생성**
4. **결제 플로우 구현**

어떤 것부터 시작할까요?
