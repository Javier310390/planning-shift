
import React from 'react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Input } from './ui/input'

export default function Demand({ DAYS, roles, shifts, demand, setDemand }){
  return (
    <Card className="rounded-2xl shadow-sm"><CardContent className="p-4 space-y-4">
      <div className="text-lg font-medium">Demanda por día / turno / rol</div>
      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="p-2">Día</th>
              <th className="p-2">Turno</th>
              <th className="p-2">Rol</th>
              <th className="p-2">Requeridos</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {demand.map((row, idx)=> (
              <tr key={idx} className="border-t">
                <td className="p-2">
                  <Select value={String(row.day)} onValueChange={v=>{ const m=[...demand]; m[idx]={...m[idx], day:Number(v)}; setDemand(m);}}>
                    <SelectTrigger className="w-[110px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DAYS.map((d, i)=> <SelectItem key={i} value={String(i)}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-2">
                  <Select value={row.shiftId} onValueChange={v=>{ const m=[...demand]; m[idx]={...m[idx], shiftId:v}; setDemand(m);}}>
                    <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {shifts.map((s)=> <SelectItem key={s.id} value={s.id}>{s.name} ({s.id})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-2">
                  <Select value={row.roleId} onValueChange={v=>{ const m=[...demand]; m[idx]={...m[idx], roleId:v}; setDemand(m);}}>
                    <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {roles.map((r)=> <SelectItem key={r.id} value={r.id}>{r.name} ({r.id})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-2 w-28">
                  <Input type="number" value={row.required} onChange={e=>{ const m=[...demand]; m[idx]={...m[idx], required:Number(e.target.value)}; setDemand(m);}} />
                </td>
                <td className="p-2">
                  <Button variant="ghost" onClick={()=>{ const m=[...demand]; m.splice(idx,1); setDemand(m); }}>Eliminar</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button variant="secondary" onClick={()=> setDemand([...demand, { day: 0, shiftId: shifts[0]?.id || 'M', roleId: roles[0]?.id || 'AGT', required: 1 }])}>Añadir demanda</Button>
    </CardContent></Card>
  )
}
