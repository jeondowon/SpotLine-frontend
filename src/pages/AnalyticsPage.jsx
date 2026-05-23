import { useState, useEffect } from 'react'
import '../styles/analytics.css'
import Sidebar from '../components/layout/Sidebar'
import PageHead from '../components/analytics/PageHead'
import TabBar from '../components/analytics/TabBar'
import OverviewTab from '../components/analytics/tabs/OverviewTab'
import VisitorsTab from '../components/analytics/tabs/VisitorsTab'
import StayTab from '../components/analytics/tabs/StayTab'
import FunnelTab from '../components/analytics/tabs/FunnelTab'
import WeatherTab from '../components/analytics/tabs/WeatherTab'
import { Ic } from '../components/ui/Icons'
import { TweaksPanel, TweakSection, TweakColor, TweakToggle, TweakNumber } from '../components/ui/TweaksPanel'
import { useTweaks } from '../hooks/useTweaks'
import {
  fetchHourlyPopulation,
  fetchCoreCustomers,
  fetchWeatherImpact,
  fetchWeekdayPatterns,
  fetchVisitCount,
  fetchTomorrowPrediction,
  fetchNextWeekPrediction,
} from '../api/index'

const TWEAK_DEFAULTS = {
  accent: '#10B981',
  videoId: 1,
  showOutliers: true,
}

const DATA_START = '2026-04-24'
const DATA_END   = '2026-05-23'

function isInRange(day) {
  return day >= DATA_START && day <= DATA_END
}

export default function AnalyticsPage() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS)
  const [tab, setTab] = useState('overview')
  const [day, setDay] = useState('2026-05-23')

  const dataAvailable = isInRange(day)

  const [data, setData] = useState({
    ageGroups: null,
    coreCustomer: null,
    weatherImpact: null,
    weekdayPatterns: null,
    visits: null,
    tomorrow: null,
    nextWeek: null,
    loading: true,
  })

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', t.accent)
  }, [t.accent])

  useEffect(() => {
    if (!isInRange(day)) {
      setData({ ageGroups: null, coreCustomer: null, weatherImpact: null,
        weekdayPatterns: null, visits: null, tomorrow: null, nextWeek: null, loading: false })
      return
    }

    let cancelled = false
    const startAt = `${day}T00:00:00`
    const endAt = `${day}T23:59:59`

    // visits/count는 30일 윈도우로 트렌드 데이터 확보
    const trendDate = new Date(day)
    trendDate.setDate(trendDate.getDate() - 29)
    const trendStr = trendDate.toISOString().slice(0, 10)
    const trendStartAt = `${trendStr < DATA_START ? DATA_START : trendStr}T00:00:00`

    setData(d => ({ ...d, loading: true }))

    Promise.allSettled([
      fetchHourlyPopulation(startAt, endAt),
      fetchCoreCustomers(startAt, endAt),
      fetchWeatherImpact(startAt),
      ...Array.from({ length: 7 }, (_, i) => fetchWeekdayPatterns(startAt, i)),
      fetchVisitCount(trendStartAt, endAt),
      fetchTomorrowPrediction(),
      fetchNextWeekPrediction(),
    ]).then(([age, core, weather, wd0, wd1, wd2, wd3, wd4, wd5, wd6, visits, tomorrow, nextWeek]) => {
      if (cancelled) return
      setData({
        ageGroups: age.status === 'fulfilled' ? age.value : null,
        coreCustomer: core.status === 'fulfilled' ? core.value : null,
        weatherImpact: weather.status === 'fulfilled' ? weather.value : null,
        weekdayPatterns: [wd0, wd1, wd2, wd3, wd4, wd5, wd6].map(r => r.status === 'fulfilled' ? r.value : null),
        visits: visits.status === 'fulfilled' ? visits.value : null,
        tomorrow: tomorrow.status === 'fulfilled' ? tomorrow.value : null,
        nextWeek: nextWeek.status === 'fulfilled' ? nextWeek.value : null,
        loading: false,
      })
    })

    return () => { cancelled = true }
  }, [day, t.videoId])

  return (
    <div className="app">
      <Sidebar/>
      <div className="main">
        <header className="hdr">
          <div>
            <div className="hdr-title">분석 워크스페이스</div>
            <div className="hdr-sub">{day} · 하루 분석</div>
          </div>
          <div className="hdr-right">
            <div className="ai-status"><span className="d"/>AI 처리 정상</div>
            <button className="icon-btn" aria-label="알림"><Ic.Bell/></button>
            <button className="icon-btn" aria-label="검색"><Ic.Search/></button>
            <div className="avatar">박</div>
          </div>
        </header>

        <PageHead day={day} setDay={setDay}/>

        {!dataAvailable && (
          <div className="content" style={{paddingBottom: 0}}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 16px', borderRadius: 10,
              background: '#FFF7ED', border: '1px solid #FED7AA',
              color: '#92400E', fontSize: 13,
            }}>
              <Ic.Info style={{flexShrink: 0, color: '#F97316'}}/>
              <span>
                선택한 날짜(<strong>{day}</strong>)의 데이터가 없습니다.
                저장된 데이터 범위는 <strong>{DATA_START}</strong> ~ <strong>{DATA_END}</strong>입니다.
              </span>
            </div>
          </div>
        )}

        <TabBar value={tab} onChange={setTab} day={day} setDay={setDay}/>

        <div className="content">
          {tab === 'overview' && <OverviewTab data={data} day={day}/>}
          {tab === 'visitors' && <VisitorsTab data={data} day={day}/>}
          {tab === 'stay'     && <StayTab/>}
          {tab === 'funnel'   && <FunnelTab/>}
          {tab === 'weather'  && <WeatherTab data={data} day={day}/>}
        </div>
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection label="데이터"/>
        <TweakNumber label="비디오 ID" value={t.videoId} min={1} step={1}
          onChange={(v) => setTweak("videoId", v)}/>
        <TweakSection label="비주얼"/>
        <TweakColor label="액센트" value={t.accent}
          options={["#3B7CF6", "#2563EB", "#0EA5E9", "#7C3AED", "#10B981"]}
          onChange={(v) => setTweak("accent", v)}/>
        <TweakToggle label="이상치 표시" value={t.showOutliers} onChange={(v) => setTweak("showOutliers", v)}/>
      </TweaksPanel>
    </div>
  )
}
