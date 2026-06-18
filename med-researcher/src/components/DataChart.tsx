"use client";

import { useId } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type DataChartProps = {
  title: string;
  description: string;
  xKey: string;
  yKey: string;
  kind: "bar" | "line";
  data: Record<string, string | number>[];
};

const ACCENT = "#6c7eff";

export default function DataChart({
  title,
  description,
  xKey,
  yKey,
  kind,
  data,
}: DataChartProps) {
  const gradientId = useId();

  const tooltipStyle = {
    background: "rgba(13,16,24,0.92)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 14,
    color: "#f5f4ed",
    fontSize: 13,
    backdropFilter: "blur(12px)",
  } as const;

  return (
    <div className="glass-card rounded-3xl p-5">
      <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">{description}</p>
      <div className="mt-5 h-72">
        <ResponsiveContainer width="100%" height="100%">
          {kind === "line" ? (
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={ACCENT} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(140,160,200,0.12)" vertical={false} />
              <XAxis dataKey={xKey} stroke="#7f8ca4" fontSize={12} tickLine={false} />
              <YAxis stroke="#7f8ca4" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: ACCENT, strokeOpacity: 0.3 }} />
              <Area
                type="monotone"
                dataKey={yKey}
                stroke={ACCENT}
                strokeWidth={2.5}
                fill={`url(#${gradientId})`}
              />
            </AreaChart>
          ) : (
            <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={ACCENT} stopOpacity={0.95} />
                  <stop offset="100%" stopColor={ACCENT} stopOpacity={0.35} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(140,160,200,0.12)" vertical={false} />
              <XAxis dataKey={xKey} stroke="#7f8ca4" fontSize={12} tickLine={false} />
              <YAxis stroke="#7f8ca4" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(108,126,255,0.08)" }} />
              <Bar dataKey={yKey} fill={`url(#${gradientId})`} radius={[8, 8, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
