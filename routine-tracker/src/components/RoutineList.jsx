import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, CalendarDays, Clock, Bell, TimerReset } from "lucide-react";

export default function RoutineList({ routines, onSelect, onDelete, selectedId }) {
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
