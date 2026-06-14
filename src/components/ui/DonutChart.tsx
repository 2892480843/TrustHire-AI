import { Cell, Pie, PieChart, Tooltip } from "recharts";

interface DonutDatum {
  name: string;
  value: number;
  color: string;
}

export function DonutChart({
  data,
  center,
  height = 230
}: {
  data: DonutDatum[];
  center: { value: string; label: string };
  height?: number;
}) {
  return (
    <div className="relative flex justify-center overflow-hidden" style={{ height }}>
      <PieChart width={height} height={height}>
          <Pie
            data={data}
            cx={height / 2}
            cy={height / 2}
            innerRadius={height * 0.28}
            outerRadius={height * 0.4}
            paddingAngle={1}
            dataKey="value"
            isAnimationActive={false}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
      </PieChart>
      <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="text-3xl font-black text-stone-950">{center.value}</div>
          <div className="text-xs text-stone-500">{center.label}</div>
        </div>
      </div>
    </div>
  );
}
