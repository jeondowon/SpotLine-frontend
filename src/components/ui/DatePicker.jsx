import { useState, useRef, useEffect } from 'react';

const DATA_START = '2026-04-24';
const DATA_END   = '2026-05-23';
const MONTH_LABELS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
const DOW_LABELS   = ['일','월','화','수','목','금','토'];

function pad(n) { return String(n).padStart(2, '0'); }
function toStr(y, m, d) { return `${y}-${pad(m+1)}-${pad(d)}`; }
function inRange(s) { return s >= DATA_START && s <= DATA_END; }

export default function DatePicker({ day, setDay }) {
  const [open, setOpen] = useState(false);
  const [vy, setVy] = useState(() => parseInt(day.slice(0, 4)));
  const [vm, setVm] = useState(() => parseInt(day.slice(5, 7)) - 1);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const prevMonth = () => { if (vm === 0) { setVy(y => y-1); setVm(11); } else setVm(m => m-1); };
  const nextMonth = () => { if (vm === 11) { setVy(y => y+1); setVm(0); } else setVm(m => m+1); };

  const firstDow    = new Date(vy, vm, 1).getDay();
  const daysInMonth = new Date(vy, vm + 1, 0).getDate();
  const cells = Array(firstDow).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

  const [dy, dm, dd] = day.split('-').map(Number);
  const hasData = inRange(day);

  return (
    <div ref={ref} style={{ position: 'relative', marginLeft: 'auto' }}>
      {/* 트리거 버튼 */}
      <button onClick={() => setOpen(o => !o)} style={{
        all: 'unset', cursor: 'default', display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '4px 10px', borderRadius: 8, fontSize: 12.5, fontWeight: 600,
        border: `1px solid ${open ? 'var(--accent)' : hasData ? 'oklch(0.82 0.06 155)' : 'oklch(0.82 0.06 25)'}`,
        background: open
          ? 'var(--accent-soft)'
          : hasData ? 'oklch(0.97 0.02 155)' : 'oklch(0.97 0.02 25)',
        color: hasData ? 'oklch(0.38 0.12 155)' : 'oklch(0.50 0.14 25)',
      }}>
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
          <rect x="1" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M5 1v3M11 1v3M1 7h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        {dy}년 {dm}월 {dd}일
        <span style={{
          fontSize: 10, padding: '1px 5px', borderRadius: 5, fontWeight: 700,
          background: hasData ? 'oklch(0.88 0.10 155)' : 'oklch(0.88 0.10 25)',
          color: hasData ? 'oklch(0.35 0.14 155)' : 'oklch(0.45 0.16 25)',
        }}>
          {hasData ? '데이터 있음' : '데이터 없음'}
        </span>
      </button>

      {/* 캘린더 팝오버 */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 300,
          background: '#fff', border: '1px solid var(--line-2)', borderRadius: 14,
          boxShadow: '0 8px 32px rgba(0,0,0,0.14)', padding: '14px 14px 10px', width: 256,
        }}>
          {/* 월 네비 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <button onClick={prevMonth} style={{ all:'unset', cursor:'default', width:26, height:26, borderRadius:6, display:'grid', placeItems:'center', fontSize:17, color:'var(--muted)', lineHeight:1 }}>‹</button>
            <span style={{ fontSize: 13, fontWeight: 700 }}>{vy}년 {MONTH_LABELS[vm]}</span>
            <button onClick={nextMonth} style={{ all:'unset', cursor:'default', width:26, height:26, borderRadius:6, display:'grid', placeItems:'center', fontSize:17, color:'var(--muted)', lineHeight:1 }}>›</button>
          </div>

          {/* 요일 헤더 */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', marginBottom:2 }}>
            {DOW_LABELS.map((d, i) => (
              <div key={d} style={{ textAlign:'center', fontSize:10, paddingBottom:4, fontWeight:600, color: i===0||i===6 ? 'oklch(0.60 0.13 295)' : 'var(--muted)' }}>{d}</div>
            ))}
          </div>

          {/* 날짜 셀 */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2 }}>
            {cells.map((d, i) => {
              if (!d) return <div key={i}/>;
              const s = toStr(vy, vm, d);
              const avail = inRange(s);
              const sel   = s === day;
              const dow   = (firstDow + d - 1) % 7;
              const wknd  = dow === 0 || dow === 6;
              return (
                <button key={i} onClick={() => { setDay(s); setOpen(false); }} style={{
                  all:'unset', textAlign:'center', cursor:'default', borderRadius:7,
                  padding:'5px 0', fontSize:12, fontWeight: sel ? 700 : 400, position:'relative',
                  background: sel ? 'var(--accent)' : avail ? 'oklch(0.97 0.02 155)' : 'transparent',
                  color: sel ? '#fff' : avail ? (wknd ? 'oklch(0.55 0.13 295)' : 'var(--ink)') : 'oklch(0.82 0.01 250)',
                }}>
                  {d}
                  {avail && !sel && (
                    <span style={{ position:'absolute', bottom:2, left:'50%', transform:'translateX(-50%)', width:3, height:3, borderRadius:'50%', display:'block', background:'oklch(0.55 0.16 155)' }}/>
                  )}
                </button>
              );
            })}
          </div>

          {/* 범례 */}
          <div style={{ marginTop:10, paddingTop:8, borderTop:'1px solid var(--line)', display:'flex', gap:12, fontSize:10.5, color:'var(--muted)' }}>
            <span style={{ display:'inline-flex', alignItems:'center', gap:4 }}>
              <span style={{ width:8, height:8, borderRadius:2, background:'oklch(0.97 0.02 155)', border:'1px solid oklch(0.78 0.08 155)', display:'inline-block' }}/>데이터 있음
            </span>
            <span style={{ display:'inline-flex', alignItems:'center', gap:4 }}>
              <span style={{ width:8, height:8, borderRadius:2, background:'#F1F3F6', display:'inline-block' }}/>데이터 없음
            </span>
            <span style={{ marginLeft:'auto', fontFamily:'JetBrains Mono', fontSize:9.5, color:'var(--muted-2)' }}>~{DATA_END}</span>
          </div>
        </div>
      )}
    </div>
  );
}
