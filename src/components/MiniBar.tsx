import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { INVERSE_KEYS } from "@/data/departments";

interface MiniBarProps {
  dept: string;
  metrics: string[];
  values: Record<string, number>;
}

const fmt = (n: number) => `${Math.round(n)}%`;

export const MiniBar = ({ metrics, values }: MiniBarProps) => {
  const mini = metrics.map((m) => ({
    name: m.replace(/ (.*)$/, "").slice(0, 18) + (m.length > 18 ? "…" : ""),
    val: INVERSE_KEYS.has(m) ? 100 - values[m] : values[m],
  }));

  return (
    <ResponsiveContainer width="100%" height={140}>
      <BarChart data={mini}>
        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
        <Tooltip formatter={(v) => fmt(v as number)} />
        <Bar dataKey="val" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};
