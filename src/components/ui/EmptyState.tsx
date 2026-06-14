import type { ReactNode } from "react";
import { ArrowRight, Route } from "lucide-react";
import { clsx } from "clsx";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
  nextStep?: string;
  value?: string;
}

export function EmptyState({ title, description, action, className, nextStep, value }: EmptyStateProps) {
  return (
    <div className={clsx("clay-card rounded-[2rem] p-6 text-sm leading-6 text-slate-600", className)}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-[1.25rem] bg-[#dff8ec] text-emerald-700 shadow-[8px_10px_20px_rgba(105,146,128,0.14),inset_4px_4px_10px_rgba(90,142,117,0.1),inset_-5px_-5px_12px_rgba(255,255,255,0.78)]">
            <Route size={18} />
          </div>
          <div className="mt-3 font-black text-slate-950">{title}</div>
          <p className="mt-1 max-w-2xl">{description}</p>
          {(nextStep || value) && (
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {nextStep && (
                <div className="clay-inset-panel px-3 py-2">
                  <div className="text-xs font-bold text-sky-700">下一步动作</div>
                  <div className="mt-1 font-semibold text-slate-800">{nextStep}</div>
                </div>
              )}
              {value && (
                <div className="clay-inset-panel px-3 py-2">
                  <div className="text-xs font-bold text-emerald-700">业务价值</div>
                  <div className="mt-1 font-semibold text-slate-800">{value}</div>
                </div>
              )}
            </div>
          )}
        </div>
        {action && (
          <div className="shrink-0">
            {action}
            <div className="mt-3 hidden items-center gap-2 text-xs font-bold text-blue-700 sm:flex">
              <ArrowRight size={14} />
              流程继续向前
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
