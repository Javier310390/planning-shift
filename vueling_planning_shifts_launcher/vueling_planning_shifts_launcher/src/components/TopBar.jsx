
import React from 'react'
export default function TopBar({ title='Vueling planning shifts', section='Launcher' }){
  const now = new Date().toLocaleString('en-GB', { timeZone: 'UTC', hour12: false })
  return (
    <div className="topbar">
      <div className="topbar__left">
        <span className="topbar__brand">vueling</span>
        <span className="separator-dot" />
        <span className="topbar__crumb">{section}</span>
      </div>
      <div className="topbar__right">
        <span>{now} UTC</span>
      </div>
    </div>
  )
}
