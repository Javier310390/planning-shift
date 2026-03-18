
import React, { useMemo, useState } from 'react'
import { Settings, Calendar, PlayCircle, Download, RefreshCw, CheckCircle2, Users } from 'lucide-react'
import TopBar from './components/TopBar'
import TileMenu from './components/TileMenu'
import { Card, CardContent } from './components/ui/card'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import Employees from './components/Employees'
import Demand from './components/Demand'
import Absences from './components/Absences'
import Holidays from './components/Holidays'
import CalendarView from './components/CalendarView'
import { toCSV } from './lib/csv'
import { generateAdvancedSchedule } from './lib/algorithm'

const DAYS = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']
const defaultShifts = [
  { id: 'M', name: 'Mañana', start: '06:00', end: '14:00', hours: 8 },
  { id: 'T', name: 'Tarde',  start: '14:00', end: '22:00', hours: 8 },
  { id: 'N', name: 'Noche',  start: '22:00', end: '06:00', hours: 8 },
]

export default function App(){
  const [tab, setTab] = useState('home')
  const [weekStart, setWeekStart] = useState(()=> new Date().toISOString().slice(0,10))
  const [roles, setRoles] = useState([
    { id: 'AGT', name: 'Agente' },
    { id: 'SPECIALIST', name: 'Specialist' },
    { id: 'SUP', name: 'Supervisor' },
  ])
  const [shifts, setShifts] = useState(defaultShifts)
  const [employees, setEmployees] = useState([
    { id: 'E01', name: 'Ana', roles: ['AGT'], contractHours: 40, yearHours: 0 },
    { id: 'E02', name: 'Luis', roles: ['AGT'], contractHours: 30, yearHours: 0, allowedShifts:['M'] },
    { id: 'E03', name: 'Marta', roles: ['SPECIALIST','AGT'], contractHours: 40, yearHours: 0 },
    { id: 'E04', name: 'Javier', roles: ['AGT'], contractHours: 20, yearHours: 0, allowedShifts:['N'] },
  ])
  const [demand, setDemand] = useState(()=>{ const base=[]; for(let d=0; d<7; d++){ const weekday=d<5; if(weekday){ base.push({day:d, shiftId:'M', roleId:'AGT', required:3}); base.push({day:d, shiftId:'T', roleId:'AGT', required:3}); } else { base.push({day:d, shiftId:'M', roleId:'AGT', required:2}); base.push({day:d, shiftId:'T', roleId:'AGT', required:2}); } } return base })
  const [rules, setRules] = useState({ maxRotationDays:6, preOffDays:3, postOffDays:3, maxYearHours:1736, minStaffPerShift:4, minSpecialistPerShift:1 })
  const [vacations, setVacations] = useState({})
  const [sickLeaves, setSickLeaves] = useState({})
  const [holidays, setHolidays] = useState([])
  const [result, setResult] = useState(null)
  const [status, setStatus] = useState('')

  function expandDemandWithMins(demandIn){
    const out=[]; const generalRoleId = roles.find(r=> r.id!=='SPECIALIST')?.id || roles[0]?.id || 'AGT'; const shiftsByDay={}
    for(const row of demandIn){ out.push({...row}); const key=`${row.day}-${row.shiftId}`; if(!shiftsByDay[key]) shiftsByDay[key]={ total:0, hasSpecialist:false }; shiftsByDay[key].total+=row.required; if(row.roleId==='SPECIALIST') shiftsByDay[key].hasSpecialist=true }
    for(const key of Object.keys(shiftsByDay)){ const [day, shiftId]=key.split('-'); const info=shiftsByDay[key]; if(!info.hasSpecialist && (rules.minSpecialistPerShift??1)>0){ out.push({ day:Number(day), shiftId, roleId:'SPECIALIST', required:1 }); info.total+=1 } const needed=(rules.minStaffPerShift??4)-info.total; if(needed>0){ out.push({ day:Number(day), shiftId, roleId:generalRoleId, required:needed }) } }
    return out
  }
  const totalDemandByShift = useMemo(()=>{ const map={}; const expanded=expandDemandWithMins(demand); expanded.forEach(d=>{ const key=`${d.day}-${d.shiftId}`; map[key]=(map[key]||0)+d.required }); return map }, [demand, roles, rules])
  const [newEmp, setNewEmp] = useState({ name:'', roles:[], contractHours:40, yearHours:0, allowedShifts:[] })
  const handleGenerate = ()=>{ setStatus('Generando...'); const out=generateAdvancedSchedule({ employees, shifts, demand:expandDemandWithMins(demand), vacations, sickLeaves, rules, startDate:weekStart }); setResult(out); setStatus('Hecho'); setTab('run'); }
  const resetAll = ()=>{ setResult(null); setStatus('') }
  const downloadCSV = ()=>{ if(!result) return; const rows=[]; for(let d=0; d<7; d++){ const day=DAYS[d]; const dayBlock=result.schedule?.[d] || {}; Object.entries(dayBlock).forEach(([shiftId, rolesMap])=>{ Object.entries(rolesMap).forEach(([roleId, empIds])=>{ (empIds||[]).forEach(eid=>{ const emp=employees.find(e=>e.id===eid); rows.push({ Semana:weekStart, Día:day, Turno:shiftId, Rol:roleId, Empleado:emp?.name||eid }) }) }) }) } const csv=toCSV(rows); const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`turnos_${weekStart}.csv`; a.click(); URL.revokeObjectURL(url) }
  const handleReassign = ({ empId, roleId, shiftId, oldDay, newDay })=>{ if(!result) return; const sch=JSON.parse(JSON.stringify(result.schedule||{})); const from = (((sch[oldDay]||{})[shiftId]||{})[roleId]||[]).filter(id=>id!==empId); if(!sch[oldDay]) sch[oldDay]={}; if(!sch[oldDay][shiftId]) sch[oldDay][shiftId]={}; sch[oldDay][shiftId][roleId]=from; if(!sch[newDay]) sch[newDay]={}; if(!sch[newDay][shiftId]) sch[newDay][shiftId]={}; const to=((sch[newDay][shiftId][roleId])||[]); to.push(empId); sch[newDay][shiftId][roleId]=to; setResult(prev=>({ ...prev, schedule: sch })) }

  const tiles = [
    { key:'setup',    title:'Configuración',  subtitle:'Empleados • Roles • Turnos • Reglas', icon:'settings' },
    { key:'demand',   title:'Demanda',        subtitle:'Día • Turno • Rol • Requeridos',      icon:'list' },
    { key:'absences', title:'Ausencias',      subtitle:'Vacaciones • Bajas',                  icon:'pill' },
    { key:'run',      title:'Generar',        subtitle:'Crear cuadrante',                     icon:'play' },
    { key:'calendar', title:'Calendario',     subtitle:'Drag & drop de asignaciones',         icon:'calendar' },
    { key:'holidays', title:'Festivos',       subtitle:'Especial / No especial (visual)',     icon:'calendar' },
    { key:'export',   title:'Exportar',       subtitle:'CSV consolidado',                     icon:'download' },
  ]

  const ViewSetup = () => (
    <div className="grid md:grid-cols-3 gap-4">
      <Card className="rounded-2xl shadow-sm"><CardContent className="p-4 space-y-3">
        <div className="step-header"><Users className="w-4 h-4" /><div className="step-title">Empleados</div></div>
        <Employees roles={roles} employees={employees} setEmployees={setEmployees} newEmp={newEmp} setNewEmp={setNewEmp} />
      </CardContent></Card>

      <Card className="rounded-2xl shadow-sm"><CardContent className="p-4 space-y-3">
        <div className="step-header"><Settings className="w-4 h-4" /><div className="step-title">Roles</div></div>
        <div className="space-y-2">
          {roles.map((r, idx)=> (
            <div key={r.id} className="flex gap-2">
              <Input value={r.name} onChange={e=>{ const v=[...roles]; v[idx]={...v[idx], name:e.target.value}; setRoles(v); }} />
              <Input className="w-24" value={r.id} onChange={e=>{ const v=[...roles]; v[idx]={...v[idx], id:e.target.value.toUpperCase()}; setRoles(v); }} />
            </div>
          ))}
          <Button variant="secondary" onClick={()=> setRoles([...roles, { id: 'R'+(roles.length+1), name: 'Nuevo' }])}>Añadir rol</Button>
        </div>
      </CardContent></Card>

      <Card className="rounded-2xl shadow-sm"><CardContent className="p-4 space-y-3">
        <div className="step-header"><Calendar className="w-4 h-4" /><div className="step-title">Turnos</div></div>
        {shifts.map((s,i)=> (
          <div key={s.id} className="grid grid-cols-4 gap-2 items-center">
            <Input value={s.name} onChange={e=>{ const v=[...shifts]; v[i]={...v[i], name:e.target.value}; setShifts(v) }} />
            <Input value={s.id}   onChange={e=>{ const v=[...shifts]; v[i]={...v[i], id:e.target.value.toUpperCase()}; setShifts(v) }} />
            <Input type="time" value={s.start} onChange={e=>{ const v=[...shifts]; v[i]={...v[i], start:e.target.value}; setShifts(v) }} />
            <Input type="time" value={s.end}   onChange={e=>{ const v=[...shifts]; v[i]={...v[i], end:e.target.value}; setShifts(v) }} />
          </div>
        ))}
        <div className="flex gap-2">
          <Button variant="secondary" onClick={()=> setShifts([...shifts, { id:'X', name:'Turno', start:'09:00', end:'17:00', hours:8 }])}>Añadir turno</Button>
          <Button variant="ghost" onClick={()=> setShifts(defaultShifts)}><RefreshCw className="w-4 h-4 mr-2"/>Reset</Button>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-2">
          <div><label className="text-sm">Inicio de semana</label><Input type="date" value={weekStart} onChange={e=>setWeekStart(e.target.value)} /></div>
          <div><label className="text-sm">Máx días cons.</label><Input type="number" value={rules.maxRotationDays} onChange={e=>setRules({...rules, maxRotationDays:Number(e.target.value)})} /></div>
          <div><label className="text-sm">OFF previos</label><Input type="number" value={rules.preOffDays} onChange={e=>setRules({...rules, preOffDays:Number(e.target.value)})} /></div>
          <div><label className="text-sm">OFF posteriores</label><Input type="number" value={rules.postOffDays} onChange={e=>setRules({...rules, postOffDays:Number(e.target.value)})} /></div>
          <div><label className="text-sm">Máx horas/año</label><Input type="number" value={rules.maxYearHours} onChange={e=>setRules({...rules, maxYearHours:Number(e.target.value)})} /></div>
          <div><label className="text-sm">Mín personas / turno</label><Input type="number" value={rules.minStaffPerShift} onChange={e=>setRules({...rules, minStaffPerShift:Number(e.target.value)})} /></div>
          <div><label className="text-sm">Mín Specialists</label><Input type="number" value={rules.minSpecialistPerShift} onChange={e=>setRules({...rules, minSpecialistPerShift:Number(e.target.value)})} /></div>
        </div>
      </CardContent></Card>
    </div>
  )

  const ViewDemand   = () => <Demand   DAYS={DAYS} roles={roles} shifts={shifts} demand={demand} setDemand={setDemand} />
  const ViewAbsences = () => <Absences vacations={vacations} setVacations={setVacations} sickLeaves={sickLeaves} setSickLeaves={setSickLeaves} />
  const ViewHolidays = () => <Holidays holidays={holidays} setHolidays={setHolidays} />

  const ViewRun = () => (
    <div className="grid md:grid-cols-3 gap-4">
      <Card className="rounded-2xl shadow-sm md:col-span-2"><CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="step-title">Resultado</div>
          <div className="text-sm text-muted-foreground flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/>{status || 'Listo'}</div>
        </div>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead><tr><th className="p-2 text-left">Día</th>{shifts.map(s=>(<th key={s.id} className="p-2 text-left">{s.name} ({s.id})</th>))}</tr></thead>
            <tbody>
              {Array.from({length:7}).map((_, d)=>(
                <tr key={d} className="border-t align-top">
                  <td className="p-2 font-medium">{DAYS[d]}</td>
                  {shifts.map(s=>(
                    <td key={s.id} className="p-2">
                      {result ? (
                        <div className="space-y-2">
                          {Object.entries(result.schedule?.[d]?.[s.id] || {}).map(([roleId, empIds])=> (
                            <div key={roleId} className="border rounded p-2">
                              <div className="text-xs uppercase text-muted-foreground">{roleId}</div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {(empIds||[]).map(eid=>{ const emp=employees.find(e=>e.id===eid); return <span key={eid} className="inline-block bg-primary/10 text-primary px-2 py-0.5 rounded-full">{emp?.name||eid}</span> })}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground">Demanda total (con mínimos): {totalDemandByShift[`${d}-${s.id}`] || 0}</div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-2"><Button onClick={handleGenerate}><PlayCircle className="w-4 h-4 mr-2"/>Generar</Button><Button variant="ghost" onClick={resetAll}><RefreshCw className="w-4 h-4 mr-2"/>Reset</Button></div>
      </CardContent></Card>
      <Card className="rounded-2xl shadow-sm"><CardContent className="p-4 space-y-3">
        <div className="step-title">Resumen</div>
        {result ? (
          <div className="space-y-2 text-sm">{employees.map(e=> (<div key={e.id} className="flex justify-between"><span>{e.name}</span><span className="text-muted-foreground">{result.stats?.[e.id]?.yearHours ?? 0} h/año</span></div>))}</div>
        ) : (<div className="text-sm text-muted-foreground">Genera para ver horas/año por empleado.</div>)}
      </CardContent></Card>
    </div>
  )

  const ViewCalendar = () => (
    result
    ? <CalendarView weekStart={weekStart} shifts={shifts} employees={employees} result={result} vacations={vacations} sickLeaves={sickLeaves} holidays={holidays} onReassign={handleReassign} />
    : <div className="text-sm text-muted-foreground">Genera primero el cuadrante para ver el calendario.</div>
  )

  const ViewExport = () => (
    <Card className="rounded-2xl shadow-sm"><CardContent className="p-4 space-y-3">
      <div className="step-title">Exportar</div>
      <Button onClick={downloadCSV}><Download className="w-4 h-4 mr-2"/>Descargar CSV</Button>
    </CardContent></Card>
  )

  const renderContent = () => {
    switch(tab){
      case 'setup':    return <ViewSetup />
      case 'demand':   return <ViewDemand />
      case 'absences': return <ViewAbsences />
      case 'run':      return <ViewRun />
      case 'calendar': return <ViewCalendar />
      case 'holidays': return <ViewHolidays />
      case 'export':   return <ViewExport />
      default:         return <TileMenu items={tiles} onSelect={(key)=> setTab(key)} />
    }
  }

  return (
    <>
      <TopBar section={ tab==='home' ? 'Launcher' : tab.toUpperCase() } />
      <div className="p-6 grid gap-6">
        {tab !== 'home' && (
          <div className="step-actions">
            <Button variant="ghost" onClick={()=> setTab('home')}>← Volver</Button>
          </div>
        )}
        {renderContent()}
      </div>
    </>
  )
}
