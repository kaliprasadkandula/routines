import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, AlarmClock, Check, Trash2, Bell, TimerReset, CalendarDays, Clock, LayoutGrid, Settings2 } from "lucide-react";
import Button from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import {Input} from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Switch } from "./components/ui/switch";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./components/ui/select";
import { Badge } from "./components/ui/badge";
import "./App.css";

// --- Types ---
/**
 * Routine schema using your block idea
 * - name: string
 * - blocks.frequency: { type: 'daily' | 'customDays' | 'interval'; times: string[]; days?: number[]; everyXDays?: number }
 * - blocks.reminder: { enabled: boolean }
 * - blocks.quantity: { amount: number; unit: string }
 * - progress: Record<ISODate, Record<time, boolean>>
 */

function todayISO() {
  const d = new Date();
  // Use local timezone; if you prefer IST specifically, adjust offset here.
  return d.toISOString().slice(0, 10);
}

function emptyDayState(times) {
  const obj = {};
  times.forEach((t) => (obj[t] = false));
  return obj;
}

const DEFAULT_UNITS = ["ml", "pills", "tablets", "caps", "drops", "mg", "g", "minutes", "reps", "glasses"]; 

export default function App() {
  const [routines, setRoutines] = useState(() => {
    try {
      const raw = localStorage.getItem("routines_v1");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    localStorage.setItem("routines_v1", JSON.stringify(routines));
  }, [routines]);

  const selected = useMemo(() => routines.find((r) => r.id === selectedId) || null, [routines, selectedId]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-900">
      <header className="sticky top-0 z-10 backdrop-blur bg-white/70 border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <LayoutGrid className="w-6 h-6" />
          <h1 className="text-xl font-semibold">Routine</h1>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" onClick={() => setSelectedId(null)} title="New routine">
              <Plus className="w-4 h-4 mr-2" /> New
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-1">
          <RoutineList
            routines={routines}
            onSelect={setSelectedId}
            onDelete={(id) => setRoutines((cur) => cur.filter((r) => r.id !== id))}
            selectedId={selectedId}
          />
        </section>

        <section className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {!selected ? (
              <motion.div key="builder" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <RoutineBuilder
                  onCreate={(routine) => {
                    setRoutines((cur) => [routine, ...cur]);
                    setSelectedId(routine.id);
                  }}
                />
              </motion.div>
            ) : (
              <motion.div key="detail" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <RoutineDetail
                  routine={selected}
                  onUpdate={(updated) => setRoutines((cur) => cur.map((r) => (r.id === updated.id ? updated : r)))}
                  onBack={() => setSelectedId(null)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}

function RoutineList({ routines, onSelect, onDelete, selectedId }) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2"><CalendarDays className="w-4 h-4"/> Your routines</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {routines.length === 0 && (
          <p className="text-sm text-slate-500">No routines yet. Create one on the right.</p>
        )}
        <div className="grid gap-2">
          {routines.map((r) => (
            <div key={r.id} className={`group flex items-center justify-between px-3 py-2 rounded-xl border ${selectedId===r.id?"border-slate-900":"border-slate-200"} bg-white hover:shadow-sm transition` }>
              <button className="text-left flex-1" onClick={() => onSelect(r.id)}>
                <div className="font-medium">{r.name}</div>
                <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                  <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3"/>{r.blocks.frequency.times.join(" · ") || "—"}</span>
                  {r.blocks.reminder.enabled && (
                    <span className="inline-flex items-center gap-1"><Bell className="w-3 h-3"/> reminders</span>
                  )}
                  <span className="inline-flex items-center gap-1"><TimerReset className="w-3 h-3"/> {r.blocks.quantity.amount} {r.blocks.quantity.unit}</span>
                </div>
              </button>
              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100" onClick={() => onDelete(r.id)} title="Delete">
                <Trash2 className="w-4 h-4"/>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function RoutineBuilder({ onCreate }) {
  const [name, setName] = useState("");
  const [times, setTimes] = useState(["08:00", "20:00"]);
  const [newTime, setNewTime] = useState("12:00");
  const [reminder, setReminder] = useState(true);
  const [amount, setAmount] = useState(1);
  const [unit, setUnit] = useState("ml");
  const [freqType, setFreqType] = useState("daily");
  const [days, setDays] = useState([1,2,3,4,5,6,0]); // 0=Sun
  const [everyXDays, setEveryXDays] = useState(1);

  function addTime() {
    if (!times.includes(newTime)) setTimes((t) => [...t, newTime].sort());
  }
  function removeTime(t) {
    setTimes((cur) => cur.filter((x) => x !== t));
  }

  function create() {
    if (!name.trim()) return;
    const routine = {
      id: crypto.randomUUID(),
      name: name.trim(),
      blocks: {
        frequency: { type: freqType, times: times, days: freqType === 'customDays' ? days : undefined, everyXDays: freqType === 'interval' ? Number(everyXDays) : undefined },
        reminder: { enabled: !!reminder },
        quantity: { amount: Number(amount), unit },
      },
      progress: {},
      createdAt: new Date().toISOString(),
    };
    onCreate(routine);
    // reset minimal fields
    setName("");
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2"><Settings2 className="w-5 h-5"/> Create a routine</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Name */}
        <div className="grid gap-2">
          <Label>Routine name</Label>
          <Input placeholder="e.g., Minoxidil" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        {/* Blocks */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Frequency Block */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2"><AlarmClock className="w-4 h-4"/> Frequency</Label>
            <Select value={freqType} onValueChange={setFreqType}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select frequency"/></SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Options</SelectLabel>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="customDays">Specific days</SelectItem>
                  <SelectItem value="interval">Every X days</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            {freqType === "customDays" && (
              <WeekdayPicker value={days} onChange={setDays} />
            )}
            {freqType === "interval" && (
              <div className="flex items-center gap-2">
                <Input type="number" min={1} value={everyXDays} onChange={(e)=>setEveryXDays(e.target.value)} className="w-28"/>
                <span className="text-sm text-slate-600">day interval</span>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-sm">Times per day</Label>
              <div className="flex items-center gap-2">
                <Input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} className="w-36"/>
                <Button type="button" onClick={addTime} size="sm"><Plus className="w-4 h-4 mr-1"/> Add time</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {times.map((t) => (
                  <Badge key={t} variant="secondary" className="px-2 py-1 text-xs flex items-center gap-1">
                    {t}
                    <button className="ml-1 opacity-70 hover:opacity-100" onClick={() => removeTime(t)} title="Remove">×</button>
                  </Badge>
                ))}
                {times.length === 0 && <p className="text-xs text-slate-500">Add at least one time.</p>}
              </div>
            </div>
          </div>

          {/* Quantity Block */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2"><TimerReset className="w-4 h-4"/> Quantity</Label>
            <div className="flex items-center gap-3">
              <Input type="number" min={0} step={0.1} value={amount} onChange={(e)=>setAmount(e.target.value)} className="w-28"/>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Unit"/></SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Common</SelectLabel>
                    {DEFAULT_UNITS.map((u) => (
                      <SelectItem key={u} value={u}>{u}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <Switch checked={true} onCheckedChange={setReminder} />
              <Label className="flex items-center gap-2 text-sm"><Bell className="w-4 h-4"/> Need reminders</Label>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <Button onClick={create} disabled={!name.trim() || times.length===0}>
            <Plus className="w-4 h-4 mr-2"/> Create routine
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function WeekdayPicker({ value, onChange }) {
  const labels = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  function toggle(i){
    onChange(value.includes(i) ? value.filter((d)=>d!==i) : [...value, i].sort());
  }
  return (
    <div className="flex flex-wrap gap-2">
      {labels.map((lab, i) => (
        <button key={lab} onClick={()=>toggle(i)} className={`px-3 py-1 rounded-full text-sm border ${value.includes(i)?"bg-slate-900 text-white border-slate-900":"bg-white border-slate-300"}`}>{lab}</button>
      ))}
    </div>
  );
}

function RoutineDetail({ routine, onUpdate, onBack }) {
  const [r, setR] = useState(routine);
  useEffect(()=>setR(routine),[routine]);

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
          <span className="inline-flex items-center gap-1"><TimerReset className="w-4 h-4"/> {r.blocks.quantity.amount} {r.blocks.quantity.unit}</span>
          {r.blocks.reminder.enabled && <span className="inline-flex items-center gap-1"><Bell className="w-4 h-4"/> reminders on</span>}
        </div>
      </div>

      {/* Top Half: Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <StatCard title="Today" value={`${doneCount}/${totalCount}`} subtitle={`${pct}% complete`} />
        <StatCard title="Streak" value={`${streak} days`} subtitle="consecutive days completed" />
        <StatCard title="Adherence" value={`${Math.round(adherence7*100)}%`} subtitle="last 7 days" />
      </div>

      {/* Mini trend (last 14 days) */}
      <TrendBar routine={r} days={14} />

      {/* Bottom Half: Today's actions */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Clock className="w-4 h-4"/> Today</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Button size="sm" variant="secondary" onClick={() => markAll(true)}><Check className="w-4 h-4 mr-1"/> Mark all done</Button>
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

function StatCard({ title, value, subtitle }){
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-600">{title}</CardTitle></CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
        <div className="text-xs text-slate-500 mt-1">{subtitle}</div>
      </CardContent>
    </Card>
  );
}

function computeStats(routine){
  // streak: consecutive days with ALL scheduled times completed
  // adherence7: average completion ratio in last 7 days
  const dates = Object.keys(routine.progress || {});
  const today = new Date();

  // adherence
  let totalRatios = 0; let countDays = 0;
  for (let i=0;i<7;i++){
    const d = new Date(today); d.setDate(today.getDate()-i);
    const iso = d.toISOString().slice(0,10);
    const day = routine.progress[iso];
    if (!day) continue;
    const vals = Object.values(day);
    if (vals.length){
      const ratio = vals.filter(Boolean).length / vals.length;
      totalRatios += ratio; countDays++;
    }
  }
  const adherence7 = countDays ? totalRatios / countDays : 0;

  // streak
  let streak = 0;
  for (let i=0;i<365;i++){
    const d = new Date(today); d.setDate(today.getDate()-i);
    const iso = d.toISOString().slice(0,10);
    const day = routine.progress[iso];
    if (!day) break; // streak stops if there is no record for that day
    const allDone = Object.values(day).length>0 && Object.values(day).every(Boolean);
    if (allDone) streak++; else break;
  }

  return { streak, adherence7 };
}

function TrendBar({ routine, days=14 }){
  const bars = [];
  const today = new Date();
  for (let i=days-1;i>=0;i--){
    const d = new Date(today); d.setDate(today.getDate()-i);
    const iso = d.toISOString().slice(0,10);
    const day = routine.progress[iso];
    let ratio = 0;
    if (day){
      const vals = Object.values(day);
      ratio = vals.length? vals.filter(Boolean).length / vals.length : 0;
    }
    bars.push({ iso, ratio });
  }
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2"><CardTitle className="text-base">Last {days} days</CardTitle></CardHeader>
      <CardContent>
        <div className="flex items-end gap-1 h-24">
          {bars.map((b) => (
            <div key={b.iso} className="flex flex-col items-center gap-1">
              <div
                className={`w-4 rounded-t bg-slate-900 transition-all`}
                style={{ height: `${Math.round(b.ratio*100)}%` }}
                title={`${b.iso}: ${Math.round(b.ratio*100)}%`}
              />
              <div className="text-[10px] text-slate-500 rotate-45 origin-left -ml-2">{b.iso.slice(5)}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
