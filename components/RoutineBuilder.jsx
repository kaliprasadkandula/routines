import React, { useState } from "react";
import { Plus, AlarmClock, Bell, TimerReset, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import WeekdayPicker from "./WeekdayPicker";
import { DEFAULT_UNITS } from "../lib/utils";

export default function RoutineBuilder({ onCreate }) {
  const [name, setName] = useState("");
  const [times, setTimes] = useState(["08:00", "20:00"]);
  const [newTime, setNewTime] = useState("12:00");
  const [reminder, setReminder] = useState(true);
  const [amount, setAmount] = useState(1);
  const [unit, setUnit] = useState("ml");
  const [freqType, setFreqType] = useState("daily");
  const [days, setDays] = useState([1, 2, 3, 4, 5, 6, 0]); // 0=Sun
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
        <CardTitle className="text-lg flex items-center gap-2"><Settings2 className="w-5 h-5" /> Create a routine</CardTitle>
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
            <Label className="flex items-center gap-2"><AlarmClock className="w-4 h-4" /> Frequency</Label>
            <Select value={freqType} onValueChange={setFreqType}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select frequency" /></SelectTrigger>
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
                <Input type="number" min={1} value={everyXDays} onChange={(e) => setEveryXDays(e.target.value)} className="w-28" />
                <span className="text-sm text-slate-600">day interval</span>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-sm">Times per day</Label>
              <div className="flex items-center gap-2">
                <Input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} className="w-36" />
                <Button type="button" onClick={addTime} size="sm"><Plus className="w-4 h-4 mr-1" /> Add time</Button>
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
            <Label className="flex items-center gap-2"><TimerReset className="w-4 h-4" /> Quantity</Label>
            <div className="flex items-center gap-3">
              <Input type="number" min={0} step={0.1} value={amount} onChange={(e) => setAmount(e.target.value)} className="w-28" />
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Unit" /></SelectTrigger>
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
              <Label className="flex items-center gap-2 text-sm"><Bell className="w-4 h-4" /> Need reminders</Label>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <Button onClick={create} disabled={!name.trim() || times.length === 0}>
            <Plus className="w-4 h-4 mr-2" /> Create routine
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
