import React from 'react';
export function Switch({ checked, onCheckedChange, ...props }) {
  return <input type="checkbox" checked={checked} onChange={e => onCheckedChange?.(e.target.checked)} {...props} />;
}

