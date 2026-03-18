export function Select({ value, onValueChange, children }){return <div>{children}</div>}
export function SelectTrigger({ className='', children }){return <div className={className}>{children}</div>}
export function SelectValue(){return <span/>}
export function SelectContent({ children }){return <div>{children}</div>}
export function SelectItem({ value, children }){return <div data-value={value}>{children}</div>}