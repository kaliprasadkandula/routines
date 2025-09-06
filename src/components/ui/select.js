import React from 'react';
export function Select({ children, ...props }) {
  return <select {...props}>{children}</select>;
}

export function SelectContent({ children }) { return <>{children}</>; }
export function SelectGroup({ children }) { return <>{children}</>; }
export function SelectItem({ children, ...props }) { return <option {...props}>{children}</option>; }
export function SelectLabel({ children }) { return <optgroup label={children} />; }
export function SelectTrigger({ children, ...props }) { return <div {...props}>{children}</div>; }
export function SelectValue({ children }) { return <>{children}</>; }
