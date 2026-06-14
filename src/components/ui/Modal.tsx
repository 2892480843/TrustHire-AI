import type { ReactNode } from "react";
import { X } from "lucide-react";
import { clsx } from "clsx";

interface ModalProps {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  size?: "md" | "lg" | "xl";
}

const sizeClass: Record<NonNullable<ModalProps["size"]>, string> = {
  md: "max-w-xl",
  lg: "max-w-3xl",
  xl: "max-w-5xl"
};

export function Modal({ title, children, footer, onClose, size = "lg" }: ModalProps) {
  const titleId = `${title.replace(/\s+/g, "-")}-dialog-title`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#243047]/24 px-4 py-6">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={clsx("clay-card max-h-[86dvh] w-full overflow-hidden rounded-[2rem]", sizeClass[size])}
      >
        <header className="clay-card-header flex items-center justify-between gap-4 border-b px-5 py-4">
          <h2 id={titleId} className="text-lg font-black text-stone-950">
            {title}
          </h2>
          <button
            type="button"
            aria-label="关闭弹窗"
            onClick={onClose}
            className="clay-ghost-button grid h-10 w-10 place-items-center p-0 text-stone-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
          >
            <X size={18} />
          </button>
        </header>
        <div className="max-h-[calc(86dvh-132px)] overflow-y-auto p-5">{children}</div>
        {footer && <footer className="clay-card-header flex flex-wrap justify-end gap-3 border-t px-5 py-4">{footer}</footer>}
      </section>
    </div>
  );
}
