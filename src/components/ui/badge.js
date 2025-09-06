import React from 'react';
export function Badge({ children, ...props }) {
  return <span {...props} style={{background:'#eee', borderRadius:12, padding:'2px 8px', fontSize:12, ...props.style}}>{children}</span>;
}
