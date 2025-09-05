import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TrendBar({ routine, days = 14 }) {
  const bars = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const day = routine.progress[iso];
    let ratio = 0;
    if (day) {
      const vals = Object.values(day);
      ratio = vals.length ? vals.filter(Boolean).length / vals.length : 0;
    }
    bars.push({ iso, ratio });
  }
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Last {days} days</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-1 h-24">
          {bars.map((b) => (
            <div key={b.iso} className="flex flex-col items-center gap-1">
              <div
                className={`w-4 rounded-t bg-slate-900 transition-all`}
                style={{ height: `${Math.round(b.ratio * 100)}%` }}
                title={`${b.iso}: ${Math.round(b.ratio * 100)}%`}
              />
              <div className="text-[10px] text-slate-500 rotate-45 origin-left -ml-2">{b.iso.slice(5)}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
