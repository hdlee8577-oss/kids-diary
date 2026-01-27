"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/shared/Button";
import { Field } from "@/components/shared/Field";
import { Input } from "@/components/shared/Input";

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!supabaseBrowserClient) {
      setError("Supabase 환경변수가 설정되지 않아 로그인 기능을 사용할 수 없습니다.");
      return;
    }

    if (!email || !password) {
      setError("이메일과 비밀번호를 입력해 주세요.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const { error: signUpError } = await supabaseBrowserClient.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        setMessage("회원가입이 완료되었어요. 메일함에서 인증 메일을 확인해 주세요.");
      } else {
        const { error: signInError } = await supabaseBrowserClient.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        // 로그인 성공 시 홈 페이지로 리다이렉트
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인/회원가입 중 오류가 발생했어요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-12 sm:px-6 sm:py-16">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text)] sm:text-3xl">
          로그인 / 회원가입
        </h1>
        <p className="mt-3 text-sm leading-6 text-black/70">
          테스트 단계에서는 이메일 + 비밀번호 방식으로 간단하게 로그인해요.
        </p>
      </header>

      {!supabaseBrowserClient && (
        <div className="rounded-[var(--radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY 환경변수를 먼저 설정해 주세요.
        </div>
      )}

      <section className="rounded-[var(--radius)] border border-black/5 bg-[var(--color-surface)]/80 p-5 shadow-sm">
        <div className="mb-4 flex gap-2">
          <Button
            type="button"
            variant={mode === "signin" ? "primary" : "secondary"}
            onClick={() => setMode("signin")}
          >
            로그인
          </Button>
          <Button
            type="button"
            variant={mode === "signup" ? "primary" : "secondary"}
            onClick={() => setMode("signup")}
          >
            회원가입
          </Button>
        </div>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <Field label="이메일">
            <Input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              placeholder="you@example.com"
            />
          </Field>
          <Field label="비밀번호">
            <Input
              type="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              placeholder="최소 6자 이상"
            />
          </Field>

          {error && (
            <p className="text-sm font-medium text-red-600">
              {error}
            </p>
          )}
          {message && (
            <p className="text-sm font-medium text-emerald-700">
              {message}
            </p>
          )}

          <Button type="submit" disabled={loading || !supabaseBrowserClient}>
            {loading ? "처리 중..." : mode === "signup" ? "회원가입" : "로그인"}
          </Button>
        </form>
      </section>

      <section className="rounded-[var(--radius)] border border-black/5 bg-white/60 p-4 text-xs text-black/60">
        <p className="font-semibold text-[var(--color-text)]">설정 방법 메모</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>Supabase 프로젝트 생성 후 Authentication에서 Email/Password 로그인 허용</li>
          <li>프로젝트 설정에서 URL과 anon public key 확인</li>
          <li>
            `.env.local`에{" "}
            <code className="rounded bg-black/5 px-1 py-0.5">NEXT_PUBLIC_SUPABASE_URL</code>,{" "}
            <code className="rounded bg-black/5 px-1 py-0.5">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{" "}
            추가
          </li>
          <li>개발 서버 재시작 후 다시 시도</li>
        </ol>
      </section>
    </main>
  );
}

