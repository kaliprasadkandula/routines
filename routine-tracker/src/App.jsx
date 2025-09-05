import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import RoutineList from "./components/RoutineList";
import RoutineBuilder from "./components/RoutineBuilder";
import RoutineDetail from "./components/RoutineDetail";

// --- Types ---
/**
 * Routine schema using your block idea
 * - name: string
 * - blocks.frequency: { type: 'daily' | 'customDays' | 'interval'; times: string[]; days?: number[]; everyXDays?: number }
 * - blocks.reminder: { enabled: boolean }
 * - blocks.quantity: { amount: number; unit: string }
 * - progress: Record<ISODate, Record<time, boolean>>
 */

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


