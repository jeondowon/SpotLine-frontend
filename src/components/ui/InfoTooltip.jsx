import { useState, useEffect, useRef } from 'react';
import { Ic } from './Icons';

export default function InfoTooltip({ text }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (!ref.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'flex' }}>
      <span
        onClick={() => setOpen(o => !o)}
        style={{ cursor: 'pointer', display: 'flex', color: open ? 'var(--ink-2)' : 'var(--muted-2)' }}
      >
        <Ic.Info />
      </span>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: 240,
            background: '#fff',
            border: '1px solid var(--line)',
            borderRadius: 10,
            padding: '12px 14px',
            fontSize: 12.5,
            lineHeight: 1.7,
            color: 'var(--ink-2)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.09)',
            zIndex: 100,
            whiteSpace: 'pre-wrap',
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
}
