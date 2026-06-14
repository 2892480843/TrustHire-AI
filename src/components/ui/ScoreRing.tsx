import { clsx } from "clsx";

interface ScoreRingProps {
  value: number;
  size?: number;
  label?: string;
  suffix?: string;
  color?: string;
  className?: string;
}

export function ScoreRing({ value, size = 168, label, suffix = "/100", color = "#059669", className }: ScoreRingProps) {
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference * (value / 100);

  return (
    <div className={clsx("clay-inset-panel relative inline-grid place-items-center rounded-full p-2", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90 drop-shadow-sm">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#eef3ea" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeWidth={stroke}
          strokeDasharray={`${dash} ${circumference - dash}`}
        />
      </svg>
      <div className="absolute text-center">
        {label && <div className="mb-1 text-xs font-bold text-slate-500">{label}</div>}
        <div className="text-5xl font-black leading-none text-slate-950">{value}</div>
        <div className="mt-1 text-lg font-semibold text-slate-500">{suffix}</div>
      </div>
    </div>
  );
}
