'use client';

import { Card } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function ChartPanel({ projects }: { projects: Array<{ name: string; marginPercent: number }> }) {
  const data = projects.slice(0, 10).map((project) => ({ name: project.name.slice(0, 12), margin: Number((project.marginPercent * 100).toFixed(1)) }));

  return (
    <Card>
      <p className="mb-3 font-semibold">Margin Distribution (Top 10 recent)</p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis unit="%" />
            <Tooltip />
            <Bar dataKey="margin" fill="#FFC700" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
