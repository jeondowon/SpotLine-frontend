import { useState, useEffect } from 'react'
import HamburgerButton from '../layout/HamburgerButton'
import { fetchStore } from '../../api/index'
import { syncStoreProfile } from '../../utils/storeProfile'

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일']

function fmtTime(t) {
  if (!t || !t.startTime || !t.endTime) return null
  return `${t.startPeriod} ${t.startTime}~${t.endPeriod} ${t.endTime}`
}

function readProfile() {
  let closedDays = []
  let openHours = null
  let breakTime = null
  try { closedDays = JSON.parse(localStorage.getItem('store_closed_days')) ?? [] } catch { closedDays = [] }
  try { openHours  = JSON.parse(localStorage.getItem('store_open_hours'))  ?? null } catch { openHours = null }
  try { breakTime  = JSON.parse(localStorage.getItem('store_break_time'))  ?? null } catch { breakTime = null }
  return {
    name:      localStorage.getItem('store_name')     ?? '한동대학교 명성',
    address:   localStorage.getItem('store_address')  ?? '한동대학교',
    bizType:   localStorage.getItem('store_biz_type') ?? '음식점',
    openHours,
    breakTime,
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

  useEffect(() => {
    let active = true
    fetchStore()
      .then(store => {
        if (!active) return
        syncStoreProfile(store)
        setProfile(readProfile())
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  const { name, address, bizType, openHours, breakTime, closedDays } = profile
  const timeStr    = fmtTime(openHours)
  const breakStr   = fmtTime(breakTime)
  const closedLabel = closedDays.length > 0
    ? `휴무 ${closedDays.map(i => DAY_LABELS[i]).join('·')}`
    : null

  return (
    <header className="hdr">
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: 'linear-gradient(135deg, #e0f2fe, #7dd3fc)',
        display: 'grid', placeItems: 'center',
        fontWeight: 700, color: '#0c4a6e', fontSize: 16,
      }}>
        {name[0]}
      </div>

      <div style={{ minWidth: 0 }}>
        <div className="hdr-title">{name}</div>
        <div className="hdr-sub" style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span>{address}</span>
          <Dot/>
          <span>{bizType}</span>
          {timeStr && <><Dot/><span>{timeStr}</span></>}
          {breakStr && <><Dot/><span>브레이크 {breakStr}</span></>}
          {closedLabel && <><Dot/><span>{closedLabel}</span></>}
        </div>
      </div>
      <HamburgerButton />
    </header>
  )
}

function Dot() {
  return <span style={{ color: '#D1D5DB', fontSize: 10 }}>·</span>
}
