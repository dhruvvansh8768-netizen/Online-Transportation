import React, { useEffect, useState } from 'react';
import { AreaChart, Area, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Panel, dateLabel, money } from './Workspace';

export default function Trend({ title, rows, field, currency = false }) {
  const [reducedMotion, setReducedMotion] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const update = (event) => setReducedMotion(event.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  const series = [...rows].sort((a, b) => String(a.date).localeCompare(String(b.date))).map((row) => ({
    date: dateLabel(row.date).replace(/ \d{4}$/, ''),
    value: Number(row[field]),
  }));
  return (
    <Panel className="rg-chart">
      <h2>{title}</h2>
      {series.length ? <div className="rg-chart-frame" role="img" aria-label={title + ': ' + series.map((row) => row.date + ' ' + (currency ? money(row.value) : row.value)).join(', ')}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <AreaChart data={series} margin={{ top: 16, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="#2a3440" />
            <XAxis dataKey="date" stroke="#adb8c3" tickLine={false} axisLine={false} fontSize={11} />
            <YAxis width={58} stroke="#adb8c3" tickLine={false} axisLine={false} fontSize={11} allowDecimals={currency} />
            <Tooltip formatter={(value) => [currency ? money(value) : value, title]} contentStyle={{ background: '#202b37', border: '1px solid #384453', color: '#fff' }} itemStyle={{ color: '#ffbe63' }} />
            <Area type="monotone" dataKey="value" stroke="#ffbe63" fill="#ffbe63" fillOpacity={0.16} strokeWidth={2} dot={{ r: 3 }} isAnimationActive={!reducedMotion} />
          </AreaChart>
        </ResponsiveContainer>
      </div> : <p className="rg-empty">No activity in this period.</p>}
    </Panel>
  );
}

