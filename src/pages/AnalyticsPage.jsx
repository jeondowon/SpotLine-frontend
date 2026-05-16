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
import { TweaksPanel, TweakSection, TweakColor, TweakRadio, TweakToggle } from '../components/ui/TweaksPanel'
import { useTweaks } from '../hooks/useTweaks'

const TWEAK_DEFAULTS = {
  accent: '#10B981',
  chartStyle: 'area',
  compareMode: 'yesterday',
  showOutliers: true,
}

export default function AnalyticsPage() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS)
  const [tab, setTab] = useState('overview')
  const [range, setRange] = useState('30d')

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', t.accent)
  }, [t.accent])

  return (
    <div className="app">
      <Sidebar/>
      <div className="main">
        <header className="hdr">
          <div>
            <div className="hdr-title">분석 워크스페이스</div>
            <div className="hdr-sub">2026.04.17 – 05.16 · 30일 · 코지 카페 · 강남점</div>
          </div>
          <div className="hdr-right">
            <div className="ai-status"><span className="d"/>AI 처리 정상</div>
            <button className="icon-btn" aria-label="알림"><Ic.Bell/></button>
            <button className="icon-btn" aria-label="검색"><Ic.Search/></button>
            <div className="avatar">박</div>
          </div>
        </header>

        <PageHead range={range} setRange={setRange}/>
        <TabBar value={tab} onChange={setTab}/>

        <div className="content">
          {tab === 'overview' && <OverviewTab/>}
          {tab === 'visitors' && <VisitorsTab/>}
          {tab === 'stay'     && <StayTab/>}
          {tab === 'funnel'   && <FunnelTab/>}
          {tab === 'weather'  && <WeatherTab/>}
        </div>
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection label="비주얼"/>
        <TweakColor label="액센트" value={t.accent}
          options={["#3B7CF6", "#2563EB", "#0EA5E9", "#7C3AED", "#10B981"]}
          onChange={(v) => setTweak("accent", v)}/>
        <TweakRadio label="차트 스타일" value={t.chartStyle}
          options={[{value:"area", label:"영역형"}, {value:"line", label:"선형"}]}
          onChange={(v) => setTweak("chartStyle", v)}/>
        <TweakSection label="비교"/>
        <TweakRadio label="비교 기간" value={t.compareMode}
          options={[{value:"yesterday", label:"전일"}, {value:"lastweek", label:"전주"}, {value:"lastmonth", label:"전월"}]}
          onChange={(v) => setTweak("compareMode", v)}/>
        <TweakToggle label="이상치 표시" value={t.showOutliers} onChange={(v) => setTweak("showOutliers", v)}/>
      </TweaksPanel>
    </div>
  )
}
