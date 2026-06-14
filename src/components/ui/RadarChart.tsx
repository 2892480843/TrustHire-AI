import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart as RechartsRadarChart,
  Tooltip
} from "recharts";

interface RadarDatum {
  subject: string;
  candidate: number;
  standard: number;
}

export function RadarChart({ data, height = 260 }: { data: RadarDatum[]; height?: number }) {
  return (
    <div className="flex justify-center overflow-hidden" style={{ height }}>
      <RechartsRadarChart data={data} width={Math.max(320, height + 80)} height={height} outerRadius="72%">
          <PolarGrid stroke="#dbe4f5" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: "#334155", fontSize: 12 }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 10 }} />
          <Radar name="该候选人" dataKey="candidate" stroke="#059669" fill="#059669" fillOpacity={0.22} strokeWidth={2} isAnimationActive={false} />
          <Radar name="岗位基准" dataKey="standard" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.08} strokeDasharray="4 4" isAnimationActive={false} />
          <Tooltip />
      </RechartsRadarChart>
    </div>
  );
}
