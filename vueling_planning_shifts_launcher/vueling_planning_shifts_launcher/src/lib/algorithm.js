
export function generateAdvancedSchedule({ employees, shifts, demand, vacations, sickLeaves, rules, startDate }){
  const start = new Date(startDate);
  const schedule = {}; const stats = {};
  employees.forEach(e=>{ stats[e.id] = { yearHours:Number(e.yearHours??0), rotationDaysWorked:0, preOff:0, postOff:0 } })
  const maxDay = demand.length ? Math.max(...demand.map(x=>x.day)) : 6
  const dateAt = (off)=>{ const d=new Date(start); d.setDate(d.getDate()+off); return d.toISOString().slice(0,10) }
  const isAvail = (emp, day, shift)=>{
    const st = stats[emp.id]; const dateStr=dateAt(day)
    if (vacations?.[emp.id]?.includes(dateStr)) return false
    if (sickLeaves?.[emp.id]?.includes(dateStr)) return false
    if (st.preOff>0 || st.postOff>0) return false
    if ((st.yearHours + (shift.hours??8)) > (rules.maxYearHours??1736)) return false
    if (st.rotationDaysWorked >= (rules.maxRotationDays??6)) return false
    if (Array.isArray(emp.allowedShifts) && emp.allowedShifts.length>0){ if(!emp.allowedShifts.includes(shift.id)) return false }
    return true
  }
  const sortC = (c)=> c.sort((a,b)=>{ const A=stats[a.id], B=stats[b.id]; return (A.rotationDaysWorked-B.rotationDaysWorked) || (A.yearHours-B.yearHours) })

  for(let day=0; day<=maxDay; day++){
    schedule[day] = {}; const today = demand.filter(x=>x.day===day)
    for(const need of today){
      const { shiftId, roleId, required } = need; const sh=shifts.find(s=>s.id===shiftId)||{hours:8}
      if(!schedule[day][shiftId]) schedule[day][shiftId] = {}; schedule[day][shiftId][roleId] = []
      let cands = employees.filter(e=> (e.roles||[]).includes(roleId) && isAvail(e, day, sh)); cands = sortC(cands)
      for(const emp of cands){ if(schedule[day][shiftId][roleId].length>=required) break; schedule[day][shiftId][roleId].push(emp.id); stats[emp.id].yearHours += (sh.hours??8); stats[emp.id].rotationDaysWorked += 1; if (stats[emp.id].rotationDaysWorked === (rules.maxRotationDays??6)){ stats[emp.id].postOff=(rules.postOffDays??3); stats[emp.id].rotationDaysWorked=0 } }
    }
    employees.forEach(e=>{ const st=stats[e.id]; if(st.postOff>0) st.postOff-=1; else if(st.rotationDaysWorked===0 && st.preOff===0){ st.preOff=(rules.preOffDays??3) } if(st.preOff>0) st.preOff-=1 })
  }
  return { schedule, stats }
}
