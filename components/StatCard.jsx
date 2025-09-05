import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StatCard({ title, value, subtitle }){
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
