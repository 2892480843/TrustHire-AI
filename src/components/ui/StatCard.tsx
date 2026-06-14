import { clsx } from "clsx";
import type { LucideIcon } from "lucide-react";

const colorMap: Record<string, string> = {
  primary: "bg-[#dff8ec] text-emerald-700",
  accent: "bg-[#dcf6f4] text-teal-700",
  green: "bg-[#dff8ec] text-emerald-700",
  orange: "bg-[#fff1df] text-amber-700",
  red: "bg-[#ffe7e4] text-red-700"
};

export function StatCard({
  label,
  value,
  trend,
  icon: Icon,
  color = "primary",
  className
}: {
  label: string;
  value: string | number;
  trend?: string;
  icon: LucideIcon;
  color?: string;
  className?: string;
}) {
  return (
    <div className={clsx("clay-stat-card", className)}>
      <div className="flex items-center gap-4">
        <div className={clsx("grid h-12 w-12 place-items-center rounded-[1.25rem] shadow-[inset_5px_5px_12px_rgba(112,132,127,0.1),inset_-6px_-6px_14px_rgba(255,255,255,0.74)]", colorMap[color] ?? colorMap.primary)}>
          <Icon size={25} strokeWidth={2} />
        </div>
        <div>
          <div className="text-sm font-medium text-stone-600">{label}</div>
          <div className="mt-1 text-3xl font-black leading-none text-stone-950 tabular-nums">{value}</div>
          {trend && <div className="mt-2 text-xs font-medium text-emerald-600">{trend}</div>}
        </div>
      </div>
    </div>
  );
}
