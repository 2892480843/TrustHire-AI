import { clsx } from "clsx";
import type { EvidenceLevel } from "../../types";

const styles: Record<EvidenceLevel, string> = {
  强证据: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  中证据: "bg-teal-50 text-teal-700 ring-teal-200",
  弱证据: "bg-orange-50 text-orange-700 ring-orange-200",
  缺证据: "bg-red-50 text-red-700 ring-red-200"
};

function normalizeLevel(level: string): EvidenceLevel {
  if (level.includes("强")) return "强证据";
  if (level.includes("中")) return "中证据";
  if (level.includes("弱")) return "弱证据";
  return "缺证据";
}

export function EvidenceBadge({ level, className }: { level: EvidenceLevel | string; className?: string }) {
  const normalized = normalizeLevel(level);
  return (
    <span className={clsx("clay-mini-chip inline-flex items-center gap-1 text-xs font-semibold", styles[normalized], className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {normalized}
    </span>
  );
}
