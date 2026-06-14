import type { ReactNode } from "react";
import { clsx } from "clsx";

type CardVariant = "default" | "panel" | "hero" | "dark" | "soft";

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  action?: ReactNode;
  variant?: CardVariant;
}

const variants: Record<CardVariant, string> = {
  default: "clay-card border-white/70 bg-white/70",
  panel: "clay-card border-white/70 bg-white/64",
  hero: "clay-card border-white/70 bg-[linear-gradient(145deg,#f8fff7_0%,#eef8ff_50%,#f8f0ff_100%)]",
  dark: "clay-card border-white/60 bg-[linear-gradient(145deg,#edf9f1_0%,#eef5ff_54%,#f7efff_100%)] text-slate-950",
  soft: "clay-inset-panel border-white/60"
};

const headerVariants: Record<CardVariant, string> = {
  default: "clay-card-header text-slate-950",
  panel: "clay-card-header text-slate-950",
  hero: "clay-card-header text-slate-950",
  dark: "clay-card-header text-slate-950",
  soft: "border-white/40 bg-transparent text-slate-950"
};

export function Card({ children, className, title, action, variant = "default" }: CardProps) {
  return (
    <section className={clsx("overflow-hidden rounded-[2rem] border", variants[variant], className)}>
      {(title || action) && (
        <header className={clsx("flex items-center justify-between gap-4 border-b px-5 py-4", headerVariants[variant])}>
          {title ? <h2 className="text-sm font-black tracking-wide">{title}</h2> : <span />}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
