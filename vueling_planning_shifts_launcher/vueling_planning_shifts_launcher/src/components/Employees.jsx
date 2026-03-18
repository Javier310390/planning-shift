
import React from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Checkbox } from './ui/checkbox'
import { parseCSV } from '../lib/csv'

export default function Employees({ roles, employees, setEmployees, newEmp, setNewEmp }){
  const onUpload = (e)=>{
    const file = e.target.files?.[0]; if(!file) return;
    const reader = new FileReader();
    reader.onload = ()=>{
      const rows = parseCSV(String(reader.result));
      const mapped = rows.map(r=>({
        id: r.id || crypto.randomUUID().slice(0,8),
        name: r.name || 'Sin nombre',
        roles: (r.roles||'').split('|').map(x=>x.trim()).filter(Boolean),
        contractHours: Number(r.contractHours||40),
        yearHours: Number(r.yearHours||0),
        allowedShifts: (r.allowedShifts||'').split('|').map(x=>x.trim()).filter(Boolean)
      }));
      setEmployees(mapped);
    };
    reader.readAsText(file);
  }

  const addEmployee = ()=>{
    if(!newEmp.name || !(newEmp.roles||[]).length) return;
    const emp = { id: crypto.randomUUID().slice(0,8), ...newEmp };
    setEmployees(prev=>[...prev, emp]);
    setNewEmp({ name:'', roles:[], contractHours:40, yearHours:0, allowedShifts:[] });
  }

  return (
    <div className="space-y-3">
      <label className="text-sm">Cargar CSV (id,name,roles,contractHours,yearHours,allowedShifts)</label>
      <Input type="file" accept=".csv" onChange={onUpload} />
      <div className="text-xs text-muted-foreground">Ej.: E01,Ana,AGT|SPECIALIST,40,0,M|N</div>

      <div className="max-h-40 overflow-auto text-sm border rounded p-2">
        {employees.map((e,idx)=> (
          <div key={e.id} className="flex items-center justify-between py-1" style={{gap:8}}>
            <span>{e.name} <span className="text-muted-foreground">({e.roles.join(', ')})</span></span>
            <span>{e.contractHours}h · {e.yearHours}h/año</span>
          </div>
        ))}
      </div>

      <div className="mt-2 border rounded p-2 space-y-2">
        <div className="text-sm font-medium">Añadir empleado</div>
        <Input placeholder="Nombre" value={newEmp.name} onChange={e=>setNewEmp({...newEmp, name:e.target.value})} />
        <div className="text-xs text-muted-foreground">Selecciona roles</div>
        <div className="flex flex-wrap gap-2">
          {roles.map(r=> (
            <label key={r.id} className="text-sm flex items-center gap-1">
              <Checkbox checked={newEmp.roles?.includes(r.id)} onCheckedChange={v=>{
                setNewEmp(curr=>{ const set = new Set(curr.roles||[]); if(v) set.add(r.id); else set.delete(r.id); return { ...curr, roles: Array.from(set) } })
              }} /> {r.name} ({r.id})
            </label>
          ))}
        </div>
        <div className="text-xs text-muted-foreground">Turnos permitidos (vacío = todos)</div>
        <div className="flex flex-wrap gap-2">
          {['M','T','N'].map(sid=> (
            <label key={sid} className="text-sm flex items-center gap-1">
              <Checkbox checked={newEmp.allowedShifts?.includes(sid)||false} onCheckedChange={v=>{
                setNewEmp(curr=>{ const set = new Set(curr.allowedShifts||[]); if(v) set.add(sid); else set.delete(sid); return { ...curr, allowedShifts: Array.from(set) } })
              }} /> {sid}
            </label>
          ))}
        </div>
        <div className="flex gap-2">
          <Input type="number" className="w-32" placeholder="Horas contrato" value={newEmp.contractHours} onChange={e=>setNewEmp({...newEmp, contractHours:Number(e.target.value)})} />
          <Input type="number" className="w-32" placeholder="Horas anuales" value={newEmp.yearHours} onChange={e=>setNewEmp({...newEmp, yearHours:Number(e.target.value)})} />
          <Button onClick={addEmployee}>Añadir</Button>
        </div>
      </div>

      <div className="mt-3 text-sm font-medium">Turnos permitidos por empleado</div>
      <div className="text-xs text-muted-foreground">Marca M/T/N para limitar asignación; si no marcas nada, se permiten todos.</div>
      <div className="panel" style={{marginTop:8}}>
        {employees.map((e,idx)=> (
          <div key={e.id} style={{display:'flex',alignItems:'center',gap:10, marginBottom:8}}>
            <div style={{width:160}}>{e.name}</div>
            {['M','T','N'].map(sid=> (
              <label key={sid} style={{display:'inline-flex',alignItems:'center',gap:6, marginRight:10}}>
                <input type="checkbox" checked={Array.isArray(e.allowedShifts)?e.allowedShifts.includes(sid):false} onChange={ev=>{
                  const v = ev.target.checked; const arr = new Set(e.allowedShifts||[]);
                  if(v) arr.add(sid); else arr.delete(sid);
                  const copy = [...employees]; copy[idx] = { ...e, allowedShifts: Array.from(arr) }; setEmployees(copy);
                }} /> {sid}
              </label>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
