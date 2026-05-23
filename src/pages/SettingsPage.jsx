import { useState, useEffect } from 'react'
import '../styles/analytics.css'
import Sidebar from '../components/layout/Sidebar'
import { Ic } from '../components/ui/Icons'
import {
  TweaksPanel, TweakSection, TweakColor, TweakSelect, TweakToggle,
} from '../components/ui/TweaksPanel'
import { useTweaks } from '../hooks/useTweaks'

const TWEAK_DEFAULTS = {
  accent: '#3B7CF6',
  density: 'regular',
}

// ── internal helpers ────────────────────────────────────────────────

function Toggle({ on, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      style={{
        display: 'inline-flex', alignItems: 'center',
        width: 44, height: 24, borderRadius: 999, border: 'none', cursor: 'pointer',
        background: on ? 'var(--accent)' : '#D1D5DB',
        padding: 2, transition: 'background .2s', flexShrink: 0,
      }}
    >
      <span style={{
        width: 20, height: 20, borderRadius: '50%', background: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,.2)',
        transform: on ? 'translateX(20px)' : 'translateX(0)',
        transition: 'transform .2s',
        display: 'block',
      }}/>
    </button>
  )
}

function StatusDot({ status }) {
  const map = {
    ok:      { color: '#10B981', label: '정상' },
    warning: { color: '#F59E0B', label: '경고' },
    error:   { color: '#EF4444', label: '오류' },
    idle:    { color: '#9AA3AF', label: '대기' },
  }
  const { color, label } = map[status] ?? map.idle
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{
        width: 8, height: 8, borderRadius: '50%', background: color,
        boxShadow: status === 'ok' ? `0 0 0 3px ${color}30` : 'none',
      }}/>
      <span style={{ fontSize: 12, color, fontWeight: 600 }}>{label}</span>
    </span>
  )
}

function SectionCard({ title, icon, children }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #E5E9EF', borderRadius: 12,
      padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          width: 32, height: 32, borderRadius: 8, background: '#F4F6FA',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>{icon}</span>
        <span style={{ fontWeight: 700, fontSize: 15 }}>{title}</span>
      </div>
      {children}
    </div>
  )
}

function FieldRow({ label, children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 12, alignItems: 'center' }}>
      <label style={{ fontSize: 13, color: '#6B7280', fontWeight: 500 }}>{label}</label>
      {children}
    </div>
  )
}

function TextInput({ defaultValue, placeholder }) {
  return (
    <input
      type="text"
      defaultValue={defaultValue}
      placeholder={placeholder}
      style={{
        height: 36, padding: '0 12px', border: '1px solid #E5E9EF', borderRadius: 8,
        fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box',
        fontFamily: 'inherit',
      }}
    />
  )
}

// ── abstract floor plan SVG (no CCTV, no cameras) ──────────────────

function FloorPlan() {
  return (
    <svg viewBox="0 0 340 200" width="100%" style={{ display: 'block', maxWidth: 340 }}>
      {/* room outline */}
      <rect x="10" y="10" width="320" height="180" rx="8" fill="#F8F9FB" stroke="#D1D5DB" strokeWidth="1.5"/>

      {/* furniture: tables */}
      <rect x="40"  y="45"  width="50" height="30" rx="5" fill="#E5E9EF"/>
      <rect x="40"  y="95"  width="50" height="30" rx="5" fill="#E5E9EF"/>
      <rect x="40"  y="145" width="50" height="30" rx="5" fill="#E5E9EF"/>
      <rect x="120" y="45"  width="50" height="30" rx="5" fill="#E5E9EF"/>
      <rect x="120" y="95"  width="50" height="30" rx="5" fill="#E5E9EF"/>
      <rect x="120" y="145" width="50" height="30" rx="5" fill="#E5E9EF"/>

      {/* counter area */}
      <rect x="220" y="25" width="90" height="50" rx="6" fill="#EEF2FF" stroke="#C7D2FE" strokeWidth="1"/>
      <text x="265" y="55" textAnchor="middle" fontSize="10" fill="#6366F1" fontWeight="600">카운터</text>

      {/* entrance zone overlay */}
      <rect x="10" y="130" width="90" height="60" rx="6" fill="#3B7CF620" stroke="#3B7CF6" strokeWidth="1.5" strokeDasharray="4 3"/>
      <text x="55" y="165" textAnchor="middle" fontSize="9" fill="#3B7CF6" fontWeight="700">입구 존</text>

      {/* counter zone overlay */}
      <rect x="210" y="15" width="110" height="70" rx="6" fill="#10B98120" stroke="#10B981" strokeWidth="1.5" strokeDasharray="4 3"/>
      <text x="265" y="72" textAnchor="middle" fontSize="9" fill="#10B981" fontWeight="700">계산대 존</text>

      {/* door */}
      <rect x="10" y="150" width="14" height="3" fill="#fff"/>
      <path d="M10 150 Q10 163 24 163" fill="none" stroke="#9AA3AF" strokeWidth="1.2"/>

      {/* sensor dots (non-camera) */}
      <circle cx="55"  cy="20" r="5" fill="#F59E0B"/>
      <circle cx="265" cy="18" r="5" fill="#F59E0B"/>
      <text x="55"  y="35" textAnchor="middle" fontSize="8" fill="#9AA3AF">센서A</text>
      <text x="265" y="33" textAnchor="middle" fontSize="8" fill="#9AA3AF">센서B</text>
    </svg>
  )
}

// ── threshold slider ────────────────────────────────────────────────

function ThresholdBar({ low, high, onChange }) {
  return (
    <div>
      <div style={{ position: 'relative', height: 36, marginBottom: 8 }}>
        <div style={{
          position: 'absolute', top: '50%', left: 0, right: 0, height: 8,
          borderRadius: 999, transform: 'translateY(-50%)',
          background: `linear-gradient(to right, #10B981 0%, #10B981 ${(low/50)*100}%,
            #F59E0B ${(low/50)*100}%, #F59E0B ${(high/50)*100}%,
            #EF4444 ${(high/50)*100}%, #EF4444 100%)`,
        }}/>
        {/* low handle */}
        <input type="range" min={0} max={50} value={low}
          onChange={e => onChange(+e.target.value, high)}
          style={{ position: 'absolute', top: '50%', left: 0, right: 0,
            transform: 'translateY(-50%)', appearance: 'none', width: '100%',
            background: 'transparent', pointerEvents: 'auto', zIndex: 2 }}/>
        {/* high handle */}
        <input type="range" min={0} max={50} value={high}
          onChange={e => onChange(low, +e.target.value)}
          style={{ position: 'absolute', top: '50%', left: 0, right: 0,
            transform: 'translateY(-50%)', appearance: 'none', width: '100%',
            background: 'transparent', pointerEvents: 'auto', zIndex: 3 }}/>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {[
          { label: '낮음', range: `0–${low}명`, color: '#10B981', bg: '#D1FAE5' },
          { label: '보통', range: `${low+1}–${high}명`, color: '#F59E0B', bg: '#FEF3C7' },
          { label: '높음', range: `${high+1}명+`, color: '#EF4444', bg: '#FEE2E2' },
        ].map(b => (
          <div key={b.label} style={{
            flex: 1, padding: '8px 10px', borderRadius: 8, background: b.bg,
            display: 'flex', flexDirection: 'column', gap: 2,
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: b.color }}>{b.label}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: b.color }}>{b.range}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── main page ───────────────────────────────────────────────────────

export default function SettingsPage() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS)

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', t.accent)
  }, [t.accent])

  // 매장 프로필
  const [storeName,    setStoreName]    = useState(() => localStorage.getItem('store_name')    ?? '한동대학교 명성')
  const [storeAddress, setStoreAddress] = useState(() => localStorage.getItem('store_address') ?? '한동대학교')
  const [bizType,      setBizType]      = useState(() => localStorage.getItem('store_biz_type') ?? '음식점')
  const [openTime,     setOpenTime]     = useState(() => localStorage.getItem('store_open_time')  ?? '09:00')
  const [closeTime,    setCloseTime]    = useState(() => localStorage.getItem('store_close_time') ?? '22:00')
  const [closedDays,   setClosedDays]   = useState(() => {
    try { return JSON.parse(localStorage.getItem('store_closed_days')) ?? ['일'] } catch { return ['일'] }
  })
  const [saved, setSaved] = useState(false)

  // 혼잡도
  const [threshLow, setThreshLow]   = useState(10)
  const [threshHigh, setThreshHigh] = useState(25)

  // 개인정보 toggles
  const [noPersonalId,  setNoPersonalId]  = useState(true)
  const [noFaceRecog,   setNoFaceRecog]   = useState(true)
  const [anonOnly,      setAnonOnly]      = useState(true)
  const [retention,     setRetention]     = useState('90일')

  // 외부 데이터
  const [weatherOn,     setWeatherOn]     = useState(true)
  const [weatherTest,   setWeatherTest]   = useState('idle') // idle | testing | ok | error

  // 알림
  const [notifEmail,    setNotifEmail]    = useState(true)
  const [notifPush,     setNotifPush]     = useState(false)

  // 구역 설정
  const [stayThresh,    setStayThresh]    = useState(30)
  const [eventThresh,   setEventThresh]   = useState(5)

  const handleWeatherTest = () => {
    setWeatherTest('testing')
    setTimeout(() => setWeatherTest('ok'), 1600)
  }

  const DAYS = ['월', '화', '수', '목', '금', '토', '일']
  const toggleDay = d => setClosedDays(prev =>
    prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
  )

  const SYS_ITEMS = [
    { label: 'AI 처리 엔진',    status: 'ok',      value: 'v2.4.1' },
    { label: '데이터 수집',     status: 'ok',      value: '실시간' },
    { label: '마지막 동기화',   status: 'ok',      value: '2분 전' },
    { label: '서버 연결',       status: 'ok',      value: '응답 12ms' },
  ]

  return (
    <div className="app">
      <Sidebar/>

      <main className="main" style={{
        padding: t.density === 'compact' ? '24px' : '32px',
        display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 800,
      }}>
        {/* header */}
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>설정</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#6B7280' }}>
            매장 분석 환경과 계정을 관리합니다
          </p>
        </div>

        {/* 1. 매장 프로필 */}
        <SectionCard title="매장 프로필" icon={<Ic.Door color="#6B7280"/>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <FieldRow label="매장명">
              <input type="text" value={storeName} onChange={e => setStoreName(e.target.value)}
                style={{ height: 36, padding: '0 12px', border: '1px solid #E5E9EF', borderRadius: 8, fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: 'inherit' }}/>
            </FieldRow>
            <FieldRow label="업종">
              <select value={bizType} onChange={e => setBizType(e.target.value)} style={{
                height: 36, padding: '0 12px', border: '1px solid #E5E9EF', borderRadius: 8,
                fontSize: 13, outline: 'none', background: '#fff', fontFamily: 'inherit',
                width: '100%',
              }}>
                {['카페', '음식점', '소매점', '베이커리', '편의점'].map(v =>
                  <option key={v}>{v}</option>
                )}
              </select>
            </FieldRow>
            <FieldRow label="주소">
              <input type="text" value={storeAddress} onChange={e => setStoreAddress(e.target.value)} placeholder="주소 입력"
                style={{ height: 36, padding: '0 12px', border: '1px solid #E5E9EF', borderRadius: 8, fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: 'inherit' }}/>
            </FieldRow>
            <FieldRow label="영업시간">
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="text" value={openTime} onChange={e => setOpenTime(e.target.value)}
                  style={{ height: 36, padding: '0 12px', border: '1px solid #E5E9EF', borderRadius: 8, fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: 'inherit' }}/>
                <span style={{ color: '#9AA3AF', fontSize: 13, flexShrink: 0 }}>~</span>
                <input type="text" value={closeTime} onChange={e => setCloseTime(e.target.value)}
                  style={{ height: 36, padding: '0 12px', border: '1px solid #E5E9EF', borderRadius: 8, fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: 'inherit' }}/>
              </div>
            </FieldRow>
            <FieldRow label="휴무일">
              <div style={{ display: 'flex', gap: 6 }}>
                {DAYS.map(d => (
                  <button key={d} onClick={() => toggleDay(d)} style={{
                    width: 32, height: 32, borderRadius: 8, border: '1px solid',
                    borderColor: closedDays.includes(d) ? 'var(--accent)' : '#E5E9EF',
                    background: closedDays.includes(d) ? 'var(--accent)10' : '#fff',
                    color: closedDays.includes(d) ? 'var(--accent)' : '#6B7280',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  }}>{d}</button>
                ))}
              </div>
            </FieldRow>
            <FieldRow label="관리자 계정">
              <TextInput defaultValue="admin@spotline.kr"/>
            </FieldRow>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10 }}>
            {saved && (
              <span style={{
                fontSize: 12, fontWeight: 600, color: '#10B981',
                display: 'flex', alignItems: 'center', gap: 4,
                animation: 'fadeIn .2s ease',
              }}>
                ✓ 저장되었습니다
              </span>
            )}
            <button onClick={() => {
              localStorage.setItem('store_name',        storeName)
              localStorage.setItem('store_address',     storeAddress)
              localStorage.setItem('store_biz_type',    bizType)
              localStorage.setItem('store_open_time',   openTime)
              localStorage.setItem('store_close_time',  closeTime)
              localStorage.setItem('store_closed_days', JSON.stringify(closedDays))
              window.dispatchEvent(new Event('store-profile-updated'))
              setSaved(true)
              setTimeout(() => setSaved(false), 2500)
            }} style={{
              height: 36, padding: '0 20px', borderRadius: 8, border: 'none',
              background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
            }}>저장</button>
          </div>
        </SectionCard>

        {/* 2. 분석 구역 설정 */}
        {/* <SectionCard title="분석 구역 설정" icon={<Ic.Chart color="#6B7280"/>}>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 300px' }}>
              <FloorPlan/>
              <p style={{ margin: '8px 0 0', fontSize: 11, color: '#9AA3AF' }}>
                센서 기반 익명 동선 분석 · 영상 저장 없음
              </p>
            </div>
            <div style={{ flex: '1 1 180px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { name: '입구 존', color: '#3B7CF6', active: true },
                { name: '계산대 존', color: '#10B981', active: true },
              ].map(z => (
                <div key={z.name} style={{
                  padding: '12px 14px', borderRadius: 10, border: '1px solid #E5E9EF',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      width: 10, height: 10, borderRadius: 3, background: z.color,
                    }}/>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{z.name}</span>
                  </div>
                  <Toggle on={z.active} onChange={() => {}}/>
                </div>
              ))}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>
                    체류 기준 (초)
                  </label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="range" min={5} max={120} value={stayThresh}
                      onChange={e => setStayThresh(+e.target.value)}
                      style={{ flex: 1, accentColor: 'var(--accent)' }}/>
                    <span style={{ fontSize: 13, fontWeight: 700, minWidth: 36 }}>
                      {stayThresh}s
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>
                    이벤트 기준 (명)
                  </label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="range" min={1} max={20} value={eventThresh}
                      onChange={e => setEventThresh(+e.target.value)}
                      style={{ flex: 1, accentColor: 'var(--accent)' }}/>
                    <span style={{ fontSize: 13, fontWeight: 700, minWidth: 36 }}>
                      {eventThresh}명
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SectionCard> */}

        {/* 3. 혼잡도 기준 */}
        {/* <SectionCard title="혼잡도 기준 설정" icon={<Ic.Spark color="#6B7280"/>}>
          <p style={{ margin: 0, fontSize: 13, color: '#6B7280' }}>
            동시 체류 인원 기준으로 혼잡도 단계를 조정합니다.
          </p>
          <ThresholdBar
            low={threshLow} high={threshHigh}
            onChange={(l, h) => {
              if (l <= h) { setThreshLow(l); setThreshHigh(h) }
            }}
          />
        </SectionCard> */}

        {/* 4. 데이터 및 개인정보 */}
        {/* <SectionCard title="데이터 및 개인정보 설정" icon={<Ic.Report color="#6B7280"/>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              {
                label: '개인 식별 정보 수집 안 함',
                desc: '이름, 전화번호 등 개인정보를 수집하지 않습니다',
                val: noPersonalId, set: setNoPersonalId, locked: true,
              },
              {
                label: '얼굴 인식 사용 안 함',
                desc: '모든 분석은 익명 실루엣 기반으로 처리됩니다',
                val: noFaceRecog, set: setNoFaceRecog, locked: true,
              },
              {
                label: '익명 집계 데이터만 사용',
                desc: '개인 추적 없이 통계적 패턴만 분석합니다',
                val: anonOnly, set: setAnonOnly, locked: true,
              },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                gap: 16, padding: '14px 0',
                borderBottom: i < 2 ? '1px solid #F1F3F6' : 'none',
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{item.label}</span>
                    {item.locked && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '1px 6px',
                        borderRadius: 4, background: '#F1F3F6', color: '#9AA3AF',
                      }}>고정</span>
                    )}
                  </div>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9AA3AF' }}>{item.desc}</p>
                </div>
                <Toggle on={item.val} onChange={item.locked ? () => {} : item.set}/>
              </div>
            ))}
          </div>
          <FieldRow label="데이터 보관 기간">
            <select value={retention} onChange={e => setRetention(e.target.value)} style={{
              height: 36, padding: '0 12px', border: '1px solid #E5E9EF', borderRadius: 8,
              fontSize: 13, outline: 'none', background: '#fff', fontFamily: 'inherit', width: '100%',
            }}>
              {['30일', '60일', '90일', '180일', '1년'].map(v => <option key={v}>{v}</option>)}
            </select>
          </FieldRow>
          <div style={{
            padding: '12px 14px', borderRadius: 10,
            background: '#F0FDF4', border: '1px solid #BBF7D0',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: 18 }}>🔒</span>
            <p style={{ margin: 0, fontSize: 12, color: '#166534', lineHeight: 1.5 }}>
              Spotline은 영상을 저장하지 않습니다. 모든 분석은 익명 집계 통계이며,
              개인 식별·얼굴 인식 기능은 비활성화되어 있습니다.
            </p>
          </div>
        </SectionCard> */}

        {/* 5. 외부 데이터 연동 */}
        {/* <SectionCard title="외부 데이터 연동" icon={<Ic.Gear color="#6B7280"/>}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px', borderRadius: 10, border: '1px solid #E5E9EF', background: '#FAFAFA',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>🌤</span>
                <span style={{ fontSize: 14, fontWeight: 700 }}>날씨 API</span>
                <StatusDot status={weatherOn ? (weatherTest === 'ok' ? 'ok' : weatherTest === 'error' ? 'error' : weatherTest === 'testing' ? 'warning' : 'ok') : 'idle'}/>
              </div>
              <span style={{ fontSize: 12, color: '#9AA3AF' }}>
                기상청 공개 API · 체류 패턴 보정에 활용
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Toggle on={weatherOn} onChange={setWeatherOn}/>
              <button
                onClick={handleWeatherTest}
                disabled={!weatherOn || weatherTest === 'testing'}
                style={{
                  height: 32, padding: '0 14px', borderRadius: 8,
                  border: '1px solid #E5E9EF', background: '#fff',
                  fontSize: 12, fontWeight: 600, cursor: weatherOn ? 'pointer' : 'not-allowed',
                  color: weatherOn ? '#374151' : '#D1D5DB', fontFamily: 'inherit',
                }}
              >
                {weatherTest === 'testing' ? '테스트 중…' : '연결 테스트'}
              </button>
            </div>
          </div>
        </SectionCard> */}

        {/* 6. 시스템 상태 */}
        {/* <SectionCard title="시스템 상태" icon={<Ic.Dash color="#6B7280"/>}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {SYS_ITEMS.map(item => (
              <div key={item.label} style={{
                padding: '12px 14px', borderRadius: 10, border: '1px solid #E5E9EF',
                display: 'flex', flexDirection: 'column', gap: 6,
              }}>
                <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>{item.label}</span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <StatusDot status={item.status}/>
                  <span style={{ fontSize: 12, color: '#9AA3AF' }}>{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard> */}

        {/* 7. 계정 설정 */}
        {/* <SectionCard title="계정 설정" icon={<Ic.Chevron color="#6B7280"/>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <FieldRow label="이름">
              <TextInput defaultValue="박지원"/>
            </FieldRow>
            <FieldRow label="이메일">
              <TextInput defaultValue="jiwon.park@spotline.kr"/>
            </FieldRow>
            <FieldRow label="비밀번호">
              <button style={{
                height: 36, padding: '0 14px', borderRadius: 8,
                border: '1px solid #E5E9EF', background: '#fff',
                fontSize: 13, fontWeight: 500, cursor: 'pointer',
                color: '#374151', fontFamily: 'inherit', textAlign: 'left',
              }}>
                비밀번호 변경 →
              </button>
            </FieldRow>
          </div>
          <div style={{
            borderTop: '1px solid #F1F3F6', paddingTop: 16,
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>알림 설정</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: '이메일 알림', desc: '주간 리포트, 이상 감지 알림', val: notifEmail, set: setNotifEmail },
                { label: '푸시 알림', desc: '실시간 혼잡도 경보', val: notifPush, set: setNotifPush },
              ].map((n, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{n.label}</div>
                    <div style={{ fontSize: 12, color: '#9AA3AF' }}>{n.desc}</div>
                  </div>
                  <Toggle on={n.val} onChange={n.set}/>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button style={{
              height: 36, padding: '0 20px', borderRadius: 8, border: 'none',
              background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
            }}>저장</button>
          </div>
        </SectionCard> */}

        {/* footer */}
        {/* <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '16px 0',
          borderTop: '1px solid #E5E9EF',
        }}>
          <span style={{ fontSize: 13 }}>🔒</span>
          <span style={{ fontSize: 12, color: '#9AA3AF' }}>
            Spotline v2.4.1 · 프라이버시 보호 분석 · 영상 저장 없음 · 얼굴 인식 없음
          </span>
        </div> */}
      </main>

      {/* <TweaksPanel title="설정 페이지 Tweaks">
        <TweakSection label="테마">
          <TweakColor label="accent" value={t.accent}
            options={['#3B7CF6','#7C3BF6','#F63B7C','#3BF67C','#F6A83B']}
            onChange={v => setTweak('accent', v)}/>
        </TweakSection>
        <TweakSection label="레이아웃">
          <TweakSelect label="density" value={t.density}
            options={['regular','compact']}
            onChange={v => setTweak('density', v)}/>
        </TweakSection>
        <TweakSection label="혼잡도 기준">
          <TweakToggle label="낮음/보통 경계 리셋" value={false}
            onChange={() => { setThreshLow(10); setThreshHigh(25) }}/>
        </TweakSection>
      </TweaksPanel> */}
    </div>
  )
}
