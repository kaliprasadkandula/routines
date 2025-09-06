import React from 'react';
export function CardHeader({ children, ...props }) {
  return <div {...props} style={{marginBottom:8, fontWeight:'bold'}}>{children}</div>;
}

export function CardTitle({ children, ...props }) {
  return <div {...props} style={{fontSize:18, fontWeight:'bold'}}>{children}</div>;
}

export function CardContent({ children, ...props }) {
  return <div {...props}>{children}</div>;
}
export  function Card({ children, ...props }) {
  return <div {...props} style={{border:'1px solid #ccc', borderRadius:8, padding:16, ...props.style}}>{children}</div>;
}
