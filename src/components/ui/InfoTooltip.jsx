import { useState, useEffect, useRef } from 'react';
import { Ic } from './Icons';

export default function InfoTooltip({ text }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, right: 0 });
  const btnRef = useRef(null);
  const boxRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (!btnRef.current?.contains(e.target) && !boxRef.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  function handleToggle() {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
    setOpen(o => !o);
  }

  return (
    <>
      <span
        ref={btnRef}
        onClick={handleToggle}
        style={{ cursor: 'pointer', display: 'flex', color: open ? 'var(--ink-2)' : 'var(--muted-2)' }}
      >
        <Ic.Info />
      </span>
      {open && (
        <div
          ref={boxRef}
          style={{
            position: 'fixed',
            top: coords.top,
            right: coords.right,
            width: 240,
            background: '#fff',
            border: '1px solid var(--line)',
            borderRadius: 10,
            padding: '12px 14px',
            fontSize: 12.5,
            lineHeight: 1.7,
            color: 'var(--ink-2)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.09)',
            zIndex: 1000,
            whiteSpace: 'pre-wrap',
          }}
        >
          {text}
        </div>
      )}
    </>
  );
}
