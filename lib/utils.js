export function todayISO() {
  const d = new Date();
  // Use local timezone; if you prefer IST specifically, adjust offset here.
  return d.toISOString().slice(0, 10);
}

export function emptyDayState(times) {
  const obj = {};
  times.forEach((t) => (obj[t] = false));
  return obj;
}

export const DEFAULT_UNITS = ["ml", "pills", "tablets", "caps", "drops", "mg", "g", "minutes", "reps", "glasses"];

export function computeStats(routine){
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
