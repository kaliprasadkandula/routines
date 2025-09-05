import React from 'react';

export default function WeekdayPicker({ value, onChange }) {
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
