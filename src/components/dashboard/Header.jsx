import { useState, useEffect } from 'react'

function readProfile() {
  let closedDays = []
  try { closedDays = JSON.parse(localStorage.getItem('store_closed_days')) ?? ['일'] } catch { closedDays = ['일'] }
  return {
    name:      localStorage.getItem('store_name')       ?? '한동대학교 명성',
    address:   localStorage.getItem('store_address')    ?? '한동대학교',
    bizType:   localStorage.getItem('store_biz_type')   ?? '음식점',
    openTime:  localStorage.getItem('store_open_time')  ?? '09:00',
    closeTime: localStorage.getItem('store_close_time') ?? '22:00',
    closedDays,
  }
}

export default function Header() {
  const [profile, setProfile] = useState(readProfile)

  useEffect(() => {
    const refresh = () => setProfile(readProfile())
    window.addEventListener('store-profile-updated', refresh)
    return () => window.removeEventListener('store-profile-updated', refresh)
  }, [])

  const { name, address, bizType, openTime, closeTime, closedDays } = profile
  const closedLabel = closedDays.length > 0 ? `휴무 ${closedDays.join('·')}` : null

  return (
    <header className="hdr">
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: 'linear-gradient(135deg, #FFE6CC, #FFC78A)',
        display: 'grid', placeItems: 'center',
        fontWeight: 700, color: '#8A4A14', fontSize: 16,
      }}>
        {name[0]}
      </div>

      <div style={{ minWidth: 0 }}>
        <div className="hdr-title">{name}</div>
        <div className="hdr-sub" style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span>{address}</span>
          <Dot/>
          <span>{bizType}</span>
          <Dot/>
          <span>{openTime}~{closeTime}</span>
          {closedLabel && <><Dot/><span>{closedLabel}</span></>}
        </div>
      </div>
    </header>
  )
}

function Dot() {
  return <span style={{ color: '#D1D5DB', fontSize: 10 }}>·</span>
}
