"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Metric definitions - human readable
const METRICS = {
  sleep: { label: "睡眠", color: "#6366f1", colorLight: "#818cf8" },
  energy: { label: "精力", color: "#f59e0b", colorLight: "#fbbf24" },
  focus: { label: "專注", color: "#10b981", colorLight: "#34d399" },
} as const;

type MetricKey = keyof typeof METRICS;

function generateTrendData(days: number = 14) {
  const data = [];
  const now = new Date();

  let sleep = 3 + Math.random() * 1;
  let energy = 2.5 + Math.random() * 1;
  let focus = 2.8 + Math.random() * 1;

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    sleep = Math.max(1, Math.min(5, sleep + (Math.random() - 0.42) * 0.5));
    energy = Math.max(1, Math.min(5, energy + (Math.random() - 0.45) * 0.6));
    focus = Math.max(1, Math.min(5, focus + (Math.random() - 0.47) * 0.7));

    data.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      sleep: Math.round(sleep * 10) / 10,
      energy: Math.round(energy * 10) / 10,
      focus: Math.round(focus * 10) / 10,
    });
  }
  return data;
}

const TREND_DATA = generateTrendData();

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ dataKey: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-popover/95 backdrop-blur-md border border-border/50 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-[10px] text-muted-foreground mb-1">{label}</p>
      {payload.map((entry) => {
        const metric = METRICS[entry.dataKey as MetricKey];
        return (
          <p key={entry.dataKey} className="text-xs font-medium" style={{ color: metric?.color }}>
            {metric?.label}: {entry.value}
          </p>
        );
      })}
    </div>
  );
}

export function StatTrendChart() {
  const [selectedMetrics, setSelectedMetrics] = useState<Set<MetricKey>>(
    new Set(["sleep", "energy", "focus"])
  );

  const toggleMetric = (key: MetricKey) => {
    setSelectedMetrics((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size > 1) next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="border-border/40 bg-card/80 backdrop-blur-xl overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold">身體感受趨勢</h2>
              <p className="text-xs text-muted-foreground">最近 14 天的平均分數</p>
            </div>

            <div className="flex gap-1.5">
              {(Object.keys(METRICS) as MetricKey[]).map((key) => {
                const metric = METRICS[key];
                const active = selectedMetrics.has(key);
                return (
                  <button
                    key={key}
                    onClick={() => toggleMetric(key)}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded transition-all ${
                      active
                        ? "bg-foreground/10 text-foreground"
                        : "text-muted-foreground/40 bg-transparent"
                    }`}
                    style={active ? { color: metric.color } : {}}
                  >
                    {metric.label}
                  </button>
                );
              })}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TREND_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  {(Object.keys(METRICS) as MetricKey[]).map((key) => (
                    <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={METRICS[key].color} stopOpacity={0.25} />
                      <stop offset="100%" stopColor={METRICS[key].color} stopOpacity={0.02} />
                    </linearGradient>
                  ))}
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="currentColor"
                  className="text-border/20"
                  vertical={false}
                />

                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 9, fill: "currentColor" }}
                  className="text-muted-foreground/50"
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  domain={[1, 5]}
                  ticks={[1, 2, 3, 4, 5]}
                  tick={{ fontSize: 9, fill: "currentColor" }}
                  className="text-muted-foreground/50"
                  tickLine={false}
                  axisLine={false}
                />

                <RechartsTooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: "currentColor", strokeWidth: 1, className: "text-border/30" }}
                />

                {(Object.keys(METRICS) as MetricKey[]).map((key) => 
                  selectedMetrics.has(key) && (
                    <Area
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={METRICS[key].color}
                      strokeWidth={2}
                      fill={`url(#gradient-${key})`}
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 2 }}
                    />
                  )
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
