import { clsx } from "clsx";

interface ProgressBarProps {
  value: number;
  color?: string;
  label?: string;
  rightLabel?: string;
  className?: string;
}

export function ProgressBar({ value, color = "#059669", label, rightLabel, className }: ProgressBarProps) {
  return (
    <div className={clsx("space-y-2", className)}>
      {(label || rightLabel) && (
        <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
          <span>{label}</span>
          <span className="font-bold text-slate-700">{rightLabel ?? `${value}%`}</span>
        </div>
      )}
      <div className="clay-progress">
        <span
          className="transition-[width] duration-700"
          style={{ width: `${value}%`, background: `linear-gradient(90deg, ${color}, #b8d7ff, #d9ceff)` }}
        />
      </div>
    </div>
  );
}
