
import React, { useState } from 'react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

export default function Holidays({ holidays, setHolidays }){
  const [form, setForm] = useState({ date:'', name:'', type:'standard' })
  const add = ()=>{ if(!form.date || !form.name) return; setHolidays([...holidays, {...form}]); setForm({date:'', name:'', type:'standard'}); }
  const remove = (i)=>{ const copy=[...holidays]; copy.splice(i,1); setHolidays(copy) }
  return (
    <Card className="rounded-2xl shadow-sm"><CardContent className="p-4 space-y-3">
      <div className="text-lg font-medium">Festivos (no restrictivos)</div>
      <div className="text-sm text-muted-foreground">Los festivos no bloquean la planificación (24/7/365). Se usan para visualizar. Categorías: especial / no especial.</div>
      <div className="grid grid-cols-3 gap-2">
        <Input type="date" value={form.date} onChange={e=>setForm({...form, date:e.target.value})} />
        <Input placeholder="Nombre" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
        <Select value={form.type} onValueChange={v=>setForm({...form, type:v})}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="standard">No especial</SelectItem>
            <SelectItem value="special">Especial</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div><Button onClick={add}>Añadir</Button></div>
      <div className="panel" style={{marginTop:8}}>
        {holidays.length===0 ? (
          <div className="text-sm text-muted-foreground">Aún no hay festivos.</div>
        ) : holidays.map((h,idx)=>(
          <div key={idx} className="flex items-center justify-between py-1 text-sm">
            <span>{h.date} — {h.name} ({h.type})</span>
            <Button variant="ghost" onClick={()=>remove(idx)}>Eliminar</Button>
          </div>
        ))}
      </div>
    </CardContent></Card>
  )
}
