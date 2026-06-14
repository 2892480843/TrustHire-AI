import type { ReactNode } from "react";
import { ShieldCheck, Sparkles } from "lucide-react";
import { clsx } from "clsx";

export function PageHeader({
  title,
  subtitle,
  actions,
  compact = false
}: {
  title: string;
  subtitle: string;
  actions?: ReactNode;
  compact?: boolean;
}) {
  return (
    <section className="clay-page-header relative overflow-hidden px-5 py-5 sm:px-6">
      <div className="pointer-events-none absolute right-6 top-5 hidden h-24 w-24 rounded-full bg-[#d9ceff]/48 shadow-[inset_12px_12px_24px_rgba(126,112,158,0.1),inset_-12px_-12px_24px_rgba(255,255,255,0.72)] md:block" />
      <div className="pointer-events-none absolute bottom-4 right-32 hidden h-16 w-16 rounded-[45%_55%_46%_54%] bg-[#c7f0dc]/66 shadow-[inset_9px_9px_18px_rgba(93,146,119,0.1),inset_-10px_-10px_20px_rgba(255,255,255,0.7)] lg:block" />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="clay-mini-chip mb-3 text-emerald-700">
            <ShieldCheck size={14} />
            可信 AI 招聘工作台
          </div>
          <h1 className={clsx("font-black tracking-normal text-slate-950 text-balance", compact ? "text-2xl sm:text-3xl" : "text-2xl sm:text-4xl")}>{title}</h1>
          <p className="mt-3 max-w-3xl text-sm font-medium leading-6 text-slate-600 sm:text-base">{subtitle}</p>
        </div>
        {actions && (
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end [&>button]:w-full sm:[&>button]:w-auto">
            <div className="clay-mini-chip hidden text-emerald-700 lg:flex">
              <Sparkles size={15} />
              决策链路可追溯
            </div>
            {actions}
          </div>
        )}
      </div>
    </section>
  );
}
