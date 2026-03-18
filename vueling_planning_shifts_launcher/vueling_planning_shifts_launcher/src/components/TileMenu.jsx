
import React from 'react'
import { Settings, Calendar, ClipboardList, PlayCircle, Download, UserCog, Pill } from 'lucide-react'

export default function TileMenu({ items=[], onSelect }){
  const Icon = ({name})=>{
    const map = { settings:Settings, calendar:Calendar, play:PlayCircle, download:Download, users:UserCog, list:ClipboardList, pill:Pill };
    const C = map[name] || ClipboardList;
    return <C className="tile__icon" color="#ffd300"/>;
  };
  return (
    <div className="tile-grid">
      {items.map(it => (
        <button key={it.key} className="tile" onClick={()=>onSelect?.(it.key)}>
          <Icon name={it.icon} />
          <div>
            <div className="tile__title">{it.title}</div>
            {it.subtitle && <div className="tile__subtitle">{it.subtitle}</div>}
          </div>
        </button>
      ))}
    </div>
  )
}
