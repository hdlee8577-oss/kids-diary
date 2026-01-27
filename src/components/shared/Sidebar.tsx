import type { ReactNode } from "react";

type Props = {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export function Sidebar({ isOpen, title, onClose, children }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <button
        type="button"
        aria-label="닫기"
        className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <aside className="absolute right-0 top-0 h-full w-[min(420px,100vw)] border-l border-black/10 bg-[var(--color-surface)]/90 shadow-xl backdrop-blur flex flex-col">
        <div className="flex items-start justify-between gap-3 p-5 pb-4 flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-[var(--color-text)]">
              {title}
            </h2>
            <p className="mt-0.5 text-xs text-black/50">
              변경사항은 실시간으로 미리보기되고 자동 저장돼요.
            </p>
          </div>
          <button
            type="button"
            className="rounded-[var(--radius)] px-2 py-1 text-sm text-black/60 hover:bg-black/5"
            onClick={onClose}
          >
            닫기
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 pb-5">
          <div className="grid gap-5">{children}</div>
        </div>
      </aside>
    </div>
  );
}

