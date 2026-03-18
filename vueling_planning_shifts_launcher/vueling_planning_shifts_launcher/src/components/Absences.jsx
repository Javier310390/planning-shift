
import React from 'react'
import { Card, CardContent } from './ui/card'
import { Textarea } from './ui/textarea'

export default function Absences({ vacations, setVacations, sickLeaves, setSickLeaves }){
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card className="rounded-2xl shadow-sm"><CardContent className="p-4 space-y-3">
        <div className="text-lg font-medium">Vacaciones (JSON)</div>
        <Textarea rows={12} value={JSON.stringify(vacations, null, 2)} onChange={e=>{ try{ setVacations(JSON.parse(e.target.value)); }catch{} }} />
        <div className="text-xs text-muted-foreground">Ej.: {`{"E01": ["2026-08-21", "2026-08-22"]}`}</div>
      </CardContent></Card>

      <Card className="rounded-2xl shadow-sm"><CardContent className="p-4 space-y-3">
        <div className="text-lg font-medium">Bajas médicas (JSON)</div>
        <Textarea rows={12} value={JSON.stringify(sickLeaves, null, 2)} onChange={e=>{ try{ setSickLeaves(JSON.parse(e.target.value)); }catch{} }} />
        <div className="text-xs text-muted-foreground">Ej.: {`{"E03": ["2026-01-10", "2026-01-12"]}`}</div>
      </CardContent></Card>
    </div>
  )
}
