"use client";

import { useSiteSettingsStore } from "@/stores/siteSettingsStore";

function Bear() {
  return (
    <svg viewBox="0 0 120 120" aria-hidden>
      <circle cx="34" cy="36" r="16" fill="var(--color-accent-a)" />
      <circle cx="86" cy="36" r="16" fill="var(--color-accent-a)" />
      <circle cx="60" cy="62" r="40" fill="var(--color-accent-b)" opacity="0.9" />
      <circle cx="46" cy="60" r="6" fill="#111827" opacity="0.75" />
      <circle cx="74" cy="60" r="6" fill="#111827" opacity="0.75" />
      <path
        d="M60 66c-6 0-10 4-10 8 0 6 6 10 10 10s10-4 10-10c0-4-4-8-10-8Z"
        fill="#111827"
        opacity="0.25"
      />
      <path
        d="M50 80c4 6 16 6 20 0"
        stroke="#111827"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.35"
      />
    </svg>
  );
}

function Bunny() {
  return (
    <svg viewBox="0 0 120 120" aria-hidden>
      <rect x="22" y="8" width="22" height="52" rx="11" fill="var(--color-accent-a)" />
      <rect x="76" y="8" width="22" height="52" rx="11" fill="var(--color-accent-a)" />
      <circle cx="60" cy="66" r="38" fill="var(--color-accent-b)" opacity="0.9" />
      <circle cx="48" cy="64" r="5" fill="#111827" opacity="0.75" />
      <circle cx="72" cy="64" r="5" fill="#111827" opacity="0.75" />
      <path
        d="M60 70c-3 0-6 2-6 5 0 4 4 7 6 7s6-3 6-7c0-3-3-5-6-5Z"
        fill="#111827"
        opacity="0.25"
      />
      <path
        d="M52 82c4 5 12 5 16 0"
        stroke="#111827"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.35"
      />
    </svg>
  );
}

function Dino() {
  return (
    <svg viewBox="0 0 120 120" aria-hidden>
      <path
        d="M28 78c0-24 14-44 36-44 18 0 28 10 28 24 0 18-12 32-30 32H28v-12Z"
        fill="var(--color-accent-a)"
        opacity="0.95"
      />
      <circle cx="70" cy="56" r="5" fill="#111827" opacity="0.75" />
      <path
        d="M40 86c10 6 26 6 36 0"
        stroke="#111827"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.28"
      />
      <path
        d="M34 80l10-10 8 10 8-10 10 10"
        stroke="var(--color-accent-b)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      />
    </svg>
  );
}

function Cat() {
  return (
    <svg viewBox="0 0 120 120" aria-hidden>
      <path
        d="M28 46l10-14 10 10h24l10-10 10 14v20c0 22-14 36-30 36S28 88 28 66V46Z"
        fill="var(--color-accent-b)"
        opacity="0.92"
      />
      <circle cx="50" cy="64" r="5" fill="#111827" opacity="0.75" />
      <circle cx="70" cy="64" r="5" fill="#111827" opacity="0.75" />
      <path
        d="M60 70c-3 0-5 2-5 4 0 3 3 6 5 6s5-3 5-6c0-2-2-4-5-4Z"
        fill="#111827"
        opacity="0.25"
      />
      <path
        d="M44 74h-10M44 78h-12M76 74h10M76 78h12"
        stroke="#111827"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.25"
      />
    </svg>
  );
}

export function Mascot({ className = "" }: { className?: string }) {
  const mascot = useSiteSettingsStore((s) => s.theme.cute.mascot);
  const Comp = mascot === "bunny" ? Bunny : mascot === "dino" ? Dino : mascot === "cat" ? Cat : Bear;
  return <div className={className}><Comp /></div>;
}

