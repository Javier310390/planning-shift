
import React, { useMemo } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

export default function CalendarView({ weekStart, shifts, employees, result, vacations, sickLeaves, holidays, onReassign }){
  const dateAt = (start, addDays, hhmm='00:00')=>{ const d = new Date(start); d.setDate(d.getDate()+addDays); const [hh,mm]=(hhmm||'00:00').split(':').map(Number); d.setHours(hh,mm,0,0); return d }
  const diffDays = (start, dt)=>{ const a=new Date(new Date(start).toDateString()); const b=new Date(new Date(dt).toDateString()); return Math.round((b-a)/86400000) }

  const events = useMemo(()=>{
    const evts=[]; if(!result) return evts;
    for(let d=0; d<7; d++){
      const dayBlock = result.schedule?.[d] || {}
      Object.entries(dayBlock).forEach(([shiftId, roleMap])=>{
        const sh = shifts.find(s=>s.id===shiftId);
        const start = dateAt(weekStart, d, sh?.start||'06:00');
        const end   = dateAt(weekStart, d, sh?.end||'14:00');
        Object.entries(roleMap).forEach(([roleId, empIds])=>{
          (empIds||[]).forEach(eid=>{
            const emp = employees.find(e=>e.id===eid);
            evts.push({ id:`S-${d}-${shiftId}-${roleId}-${eid}`, title:`${emp?.name||eid} · ${roleId}`, start, end, editable:true, durationEditable:false, extendedProps:{ type: roleId==='SPECIALIST'?'specialist':'shift', day:d, shiftId, roleId, empId:eid } })
          })
        })
      })
    }
    Object.entries(vacations||{}).forEach(([eid, days])=>{ const emp=employees.find(e=>e.id===eid); (days||[]).forEach(ds=>{ const start=dateAt(ds,0,'08:00'), end=dateAt(ds,0,'18:00'); evts.push({ id:`V-${eid}-${ds}`, title:`${emp?.name||eid} · Vacaciones`, start, end, editable:false, extendedProps:{type:'vacation'} }) }) })
    Object.entries(sickLeaves||{}).forEach(([eid, days])=>{ const emp=employees.find(e=>e.id===eid); (days||[]).forEach(ds=>{ const start=dateAt(ds,0,'08:00'), end=dateAt(ds,0,'18:00'); evts.push({ id:`K-${eid}-${ds}`, title:`${emp?.name||eid} · Baja`, start, end, editable:false, extendedProps:{type:'sick'} }) }) })
    (holidays||[]).forEach(h=>{ const start=dateAt(h.date,0,'00:00'), end=dateAt(h.date,0,'23:59'); evts.push({ id:`H-${h.date}`, title:h.name, start, end, display:'background', extendedProps:{ type: h.type==='special'?'holiday-special':'holiday' } }) })
    return evts
  }, [result, weekStart, shifts, employees, vacations, sickLeaves, holidays])

  const eventDrop = (info)=>{
    const { event } = info; const { empId, roleId, shiftId, day, type } = event.extendedProps||{};
    if(!empId || !shiftId || !roleId || (type!=='shift' && type!=='specialist')) return info.revert();
    const newDay = diffDays(weekStart, event.start); if(Number.isNaN(newDay) || newDay<0 || newDay>6) return info.revert();
    onReassign?.({ empId, roleId, shiftId, oldDay: day, newDay });
  }

  const eventDidMount = (arg)=>{
    const t = arg.event.extendedProps?.type; const el = arg.el; const apply=(bg,color='#0b1020')=>{ el.style.background=bg; el.style.border='1px solid transparent'; el.style.color=color }
    if (t==='specialist') apply('var(--evt-specialist)', '#1d1d1b)')
    else if (t==='shift')  apply('var(--evt-shift)')
    else if (t==='vacation') apply('var(--evt-vacation)')
    else if (t==='sick')   apply('var(--evt-sick)')
    else if (t==='holiday-special'){ el.style.background='var(--evt-holiday-sp)'; el.style.border='none' }
    else if (t==='holiday'){ el.style.background='var(--evt-holiday)'; el.style.border='none' }
  }

  return (
    <div className="panel">
      <div className="legend" style={{marginBottom:8}}>
        <span><i className="sw sw-shift"></i> Turno</span>
        <span><i className="sw sw-spec"></i> Specialist</span>
        <span><i className="sw sw-vac"></i> Vacaciones</span>
        <span><i className="sw sw-sick"></i> Baja</span>
        <span><i className="sw sw-hol"></i> Festivo</span>
        <span><i className="sw sw-holsp"></i> Festivo especial</span>
      </div>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        firstDay={1}
        slotMinTime="06:00:00"
        slotMaxTime="23:59:00"
        headerToolbar={{ left:'prev,next today', center:'title', right:'dayGridWeek,timeGridWeek' }}
        events={events}
        editable={true}
        eventDrop={eventDrop}
        eventDidMount={eventDidMount}
        height="auto"
      />
    </div>
  )
}
