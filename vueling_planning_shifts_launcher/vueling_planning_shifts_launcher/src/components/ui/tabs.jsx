export function Tabs({ defaultValue, className='', children }){return <div className={className}>{children}</div>}
export function TabsList({ children }){return <div>{children}</div>}
export function TabsTrigger({ value, children }){return <button>{children}</button>}
export function TabsContent({ value, children }){return <div>{children}</div>}