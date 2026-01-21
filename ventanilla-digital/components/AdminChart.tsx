"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ChartDatum = {
  [key: string]: string | number;
  cantidad: number;
};

type AdminChartProps = {
  data: ChartDatum[];
  labelKey?: string;
};

export default function AdminChart({ data, labelKey = "estado" }: AdminChartProps) {
  return (
    <div className="h-64 w-full sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey={labelKey}
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fontSize: 10 }}
            className="sm:text-xs"
          />
          <YAxis allowDecimals={false} tick={{ fontSize: 10 }} className="sm:text-xs" />
          <Tooltip />
          <Bar dataKey="cantidad" fill="#E84922" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
