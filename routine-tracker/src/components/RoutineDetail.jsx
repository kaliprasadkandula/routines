import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Check, Bell, TimerReset, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StatCard from "./StatCard";
import TrendBar from "./TrendBar";
import { todayISO, emptyDayState, computeStats } from "../lib/utils";

export default function RoutineDetail({ routine, onUpdate, onBack }) {
  const [r, setR] = useState(routine);
  useEffect(() => setR(routine), [routine]);

  // Ensure day state exists
  useEffect(() => {
    const iso = todayISO();
    if (!r.progress[iso]) {
      r.progress[iso] = emptyDayState(r.blocks.frequency.times);
      onUpdate({ ...r });
    }
  }, []); // eslint-disable-line

  function setTaken(time, val) {
    const iso = todayISO();
    const copy = { ...r };
    if (!copy.progress[iso]) copy.progress[iso] = emptyDayState(copy.blocks.frequency.times);
    copy.progress[iso][time] = val;
    setR(copy);
    onUpdate(copy);
  }

  function markAll(val) {
    const iso = todayISO();
    const copy = { ...r };
    if (!copy.progress[iso]) copy.progress[iso] = emptyDayState(copy.blocks.frequency.times);
    Object.keys(copy.progress[iso]).forEach((t) => (copy.progress[iso][t] = val));
    setR(copy);
    onUpdate(copy);
  }

  const todayProgress = r.progress[todayISO()] || emptyDayState(r.blocks.frequency.times);
  const doneCount = Object.values(todayProgress).filter(Boolean).length;
  const totalCount = r.blocks.frequency.times.length || 0;
  const pct = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;

  const { streak, adherence7 } = useMemo(() => computeStats(r), [r]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <h2 className="text-lg font-semibold">{r.name}</h2>
        <div className="ml-auto text-sm text-slate-600 flex items-center gap-3">
          <span className="inline-flex items-center gap-1"><TimerReset className="w-4 h-4" /> {r.blocks.quantity.amount} {r.blocks.quantity.unit}</span>
          {r.blocks.reminder.enabled && <span className="inline-flex items-center gap-1"><Bell className="w-4 h-4" /> reminders on</span>}
        </div>
      </div>

      {/* Top Half: Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <StatCard title="Today" value={`${doneCount}/${totalCount}`} subtitle={`${pct}% complete`} />
        <StatCard title="Streak" value={`${streak} days`} subtitle="consecutive days completed" />
        <StatCard title="Adherence" value={`${Math.round(adherence7 * 100)}%`} subtitle="last 7 days" />
      </div>

      {/* Mini trend (last 14 days) */}
      <TrendBar routine={r} days={14} />

      {/* Bottom Half: Today's actions */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Clock className="w-4 h-4" /> Today</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Button size="sm" variant="secondary" onClick={() => markAll(true)}><Check className="w-4 h-4 mr-1" /> Mark all done</Button>
            <Button size="sm" variant="ghost" onClick={() => markAll(false)}>Reset</Button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {r.blocks.frequency.times.map((t) => (
              <motion.div key={t} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={`flex items-center justify-between p-3 rounded-xl border ${todayProgress[t] ? "bg-emerald-50 border-emerald-200" : "bg-white border-slate-200"}`}>
                <div>
                  <div className="font-medium flex items-center gap-2">{t} {todayProgress[t] && <Badge className="bg-emerald-600">done</Badge>}</div>
                  <div className="text-xs text-slate-500">Take {r.blocks.quantity.amount} {r.blocks.quantity.unit}</div>
                </div>
                <Button size="sm" variant={todayProgress[t] ? "secondary" : "default"} onClick={() => setTaken(t, !todayProgress[t])}>
                  {todayProgress[t] ? "Undo" : "Mark taken"}
                </Button>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
