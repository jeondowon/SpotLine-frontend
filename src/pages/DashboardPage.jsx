import { useEffect, useState } from 'react'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/dashboard/Header'
import TrafficChart from '../components/dashboard/TrafficChart'
import Gauge from '../components/dashboard/Gauge'
import KPI from '../components/ui/KPI'
import { Ic } from '../components/ui/Icons'
import { TweaksPanel, TweakSection, TweakColor, TweakRadio, TweakToggle, TweakNumber } from '../components/ui/TweaksPanel'
import { useTweaks } from '../hooks/useTweaks'
import { fetchRawAnalytics, fetchDailyBriefing, fetchMarketingRecommendations } from '../api/index'

const TWEAK_DEFAULTS = {
  accent: '#3B7CF6',
  videoId: 1,
  chartStyle: 'area',
  showAiPanel: true,
  showPrivacyBadge: true,
}

const CONGESTION_LEVEL = { low: 20, medium: 50, high: 80 }

const AGE_GROUP_KEYS = [
  { label: '20–29', keys: ['20s'] },
  { label: '30–39', keys: ['30s'] },
  { label: '40–49', keys: ['40s'] },
  { label: '50대+', keys: ['50s', '60s', '70s', '80s'] },
  { label: '기타',  keys: ['0s', '10s'] },
]

function formatDwellTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}분 ${String(s).padStart(2, '0')}초`
}

function congestionLabel(level) {
  if (level < 34) return '여유'
  if (level < 67) return '보통'
  return '혼잡'
}

function computeAgeGroups(persons) {
  if (!persons?.length) return []
  const counts = {}
  for (const p of persons) counts[p.age_group] = (counts[p.age_group] ?? 0) + 1
  return AGE_GROUP_KEYS.map(({ label, keys }) => {
    const count = keys.reduce((sum, k) => sum + (counts[k] ?? 0), 0)
    return { label, count, pct: Math.round((count / persons.length) * 100) }
  })
}

export default function DashboardPage() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS)

  const [fetchState, setFetchState] = useState({ videoId: null, raw: null, briefing: null, marketing: null, error: null })

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', t.accent)
  }, [t.accent])

  useEffect(() => {
    let cancelled = false
    Promise.all([fetchRawAnalytics(t.videoId), fetchDailyBriefing(), fetchMarketingRecommendations()])
      .then(([raw, briefing, marketing]) => {
        if (!cancelled) setFetchState({ videoId: t.videoId, raw, briefing, marketing, error: null })
      })
      .catch(e => {
        if (!cancelled) setFetchState({ videoId: t.videoId, raw: null, briefing: null, marketing: null, error: e.message })
      })
    return () => { cancelled = true }
  }, [t.videoId])

  const loading    = fetchState.videoId !== t.videoId
  const raw        = fetchState.raw
  const briefing   = fetchState.briefing
  const marketing  = fetchState.marketing
  const apiError   = fetchState.error

  const persons      = raw?.persons ?? []
  const visitorCount = raw?.summary?.total_visitors ?? 0
  const congestion   = CONGESTION_LEVEL[raw?.summary?.peak_congestion] ?? 0
  const dwellSecs    = raw?.summary?.avg_dwell_time_seconds ?? 0
  const dwellDisplay = dwellSecs ? formatDwellTime(Math.round(dwellSecs)) : '—'
  const entry        = persons.filter(p => p.entrance_event).length
  const manCount     = persons.filter(p => p.gender === 'male').length
  const womanCount   = persons.filter(p => p.gender === 'female').length
  const genderTotal  = manCount + womanCount
  const femPct       = genderTotal > 0 ? Math.round((womanCount / genderTotal) * 100) : 50
  const malePct      = 100 - femPct
  const ageGroups    = computeAgeGroups(persons)

  return (
    <div className="app">
      <Sidebar/>
      <div className="main">
        <Header storeName={`비디오 #${t.videoId} 분석`}/>

        <div className="content">

          {apiError && (
            <div style={{
              padding: '12px 16px', marginBottom: 8, borderRadius: 10,
              background: '#FEF2F2', border: '1px solid #FECACA',
              fontSize: 13, color: '#DC2626',
            }}>
              데이터를 불러오지 못했습니다: {apiError}
            </div>
          )}

          <div className="row-greet">
            <div className="greet">
              <h1>
                {loading
                  ? '데이터를 불러오는 중입니다...'
                  : `오늘 매장 현황을 한눈에 보여드릴게요.`}
              </h1>
              <p>
                {loading
                  ? '잠시만 기다려 주세요.'
                  : `총 방문자 ${visitorCount}명 · 혼잡도 ${congestionLabel(congestion)} · 평균 체류 ${dwellDisplay}`}
              </p>
            </div>
            <span className="live-pill"><span className="live-dot"/>실시간 업데이트 중</span>
          </div>

          <div className="kpis">
            <KPI label="오늘 방문자 수" icon={<Ic.Users/>} iconBg="oklch(0.95 0.03 250)" iconFg="oklch(0.48 0.16 250)"
                 value={visitorCount.toLocaleString()} unit="명"
                 hint="실시간 데이터"/>
            <KPI label="현재 혼잡도" icon={<Ic.Activity/>} iconBg="oklch(0.95 0.05 80)" iconFg="oklch(0.55 0.14 65)"
                 value={congestion} unit="/ 100"
                 hint="실시간 데이터"/>
            <KPI label="평균 체류 시간" icon={<Ic.Clock/>} iconBg="oklch(0.95 0.04 155)" iconFg="oklch(0.42 0.12 155)"
                 value={dwellDisplay}
                 hint="실시간 데이터"/>
            <KPI label="입장 이벤트" icon={<Ic.Door/>} iconBg="oklch(0.95 0.04 295)" iconFg="oklch(0.50 0.16 295)"
                 value={entry} unit="건"
                 hint="오늘 누적"/>
          </div>

          <div className="compare">
            <div>
              <div className="l">입구 존 진입</div>
              <div className="v mono">{entry}건</div>
              <div className="d" style={{color:'#6B7280'}}>오늘 누적</div>
            </div>
            <div>
              <div className="l">방문자 수</div>
              <div className="v mono">{visitorCount}명</div>
              <div className="d" style={{color:'#6B7280'}}>오늘 누적</div>
            </div>
            <div>
              <div className="l">성별 비율</div>
              <div className="v mono">여 {femPct}% · 남 {malePct}%</div>
              <div className="d" style={{color:'#6B7280'}}>익명 추정</div>
            </div>
            <div>
              <div className="l">혼잡도</div>
              <div className="v mono">{congestionLabel(congestion)}</div>
              <div className="d" style={{color:'#6B7280'}}>현재 상태</div>
            </div>
          </div>

          <div className="grid-main">
            <div className="card">
              <div className="card-h">
                <h3>오늘 시간대별 방문자</h3>
                <span className="sub">· 09시 ~ 22시</span>
                <div className="right">
                  <span className="chip dot">방문자</span>
                  <span className="chip">어제 비교</span>
                  <span className="chip">시간당</span>
                </div>
              </div>
              <div className="card-b" style={{padding: "8px 12px 14px"}}>
                <TrafficChart style={t.chartStyle}/>
              </div>
            </div>

            <div className="card">
              <div className="card-h">
                <h3>매장 상태</h3>
                <div className="right"><span className="chip">실시간</span></div>
              </div>
              <div className="card-b status-grid">
                <div className="gauge-wrap">
                  <Gauge value={congestion}/>
                  <div className="gauge-meta">
                    <div className="lvl">{congestionLabel(congestion)}<span className="small">혼잡도</span></div>
                    <div className="desc">
                      {congestion < 34 && '매장이 여유로운 상태입니다. 고객 응대에 집중하세요.'}
                      {congestion >= 34 && congestion < 67 && '평소 수준의 혼잡도입니다. 상황을 주시하세요.'}
                      {congestion >= 67 && '혼잡도가 높습니다. 직원 추가 배치를 고려해보세요.'}
                    </div>
                  </div>
                </div>

                <div className="status-rows">
                  <div className="status-row"><span className="k">방문자 수</span><span className="v mono">{visitorCount}명</span></div>
                  <div className="status-row"><span className="k">남성 방문자</span><span className="v mono">{manCount}명</span></div>
                  <div className="status-row"><span className="k">여성 방문자</span><span className="v mono">{womanCount}명</span></div>
                  <div className="status-row"><span className="k">입구 이벤트</span><span className="v mono">{entry}건</span></div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid-second">
            <div className="card">
              <div className="card-h">
                <h3>존(Zone) 진입 이벤트</h3>
                <span className="sub">· 오늘 누적</span>
              </div>
              <div className="card-b">
                <div className="zone-row">
                  <div className="zone-ic" style={{background:"oklch(0.95 0.03 250)", color:"oklch(0.48 0.16 250)"}}><Ic.Door/></div>
                  <div>
                    <div className="zone-name">입구 존</div>
                    <div className="zone-sub">방문자 진입 이벤트</div>
                  </div>
                  <div className="zone-val">
                    <div className="n mono">{entry}</div>
                    <div className="d">건</div>
                  </div>
                  <div className="zone-bar"><div style={{width:"100%", background:"oklch(0.62 0.14 250)"}}/></div>
                </div>
              </div>
            </div>

            {t.showAiPanel && (
              <div className="card">
                <div className="card-h">
                  <span className="ai-h-badge"><Ic.Sparkle/> AI 인사이트</span>
                  <span className="sub">비디오 #{t.videoId} 기반</span>
                  <div className="right"><span className="chip">베타</span></div>
                </div>
                <div className="card-b ai-list">
                  {briefing?.message && (
                    <div className="ai-card">
                      <div className="num">01</div>
                      <div>
                        <div className="t">일일 브리핑</div>
                        <div className="b">{briefing.message}</div>
                        <span className="tag">AI 분석</span>
                      </div>
                    </div>
                  )}
                  {marketing?.message && (
                    <div className="ai-card">
                      <div className="num">02</div>
                      <div>
                        <div className="t">마케팅 추천</div>
                        <div className="b">{marketing.message}</div>
                        <span className="tag k">마케팅</span>
                      </div>
                    </div>
                  )}
                  {!briefing && !marketing && !loading && (
                    <div style={{fontSize: 13, color: '#9AA3AF', padding: '8px 0'}}>
                      브리핑 데이터가 없습니다.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="grid-second" style={{gridTemplateColumns:"1.4fr 1fr 1fr"}}>
            <div className="card">
              <div className="card-h">
                <h3>주요 방문 연령대</h3>
                <span className="sub">· AI 추정 · 익명 통계</span>
                <div className="right"><span className="chip">오늘</span></div>
              </div>
              <div className="card-b">
                <div className="ages">
                  {ageGroups.length > 0
                    ? ageGroups.map((a) => (
                        <div className="age-row" key={a.label}>
                          <div className="l mono">{a.label}</div>
                          <div className="track"><div className="fill" style={{width: a.pct + "%"}}/></div>
                          <div className="v mono">{a.pct}%</div>
                        </div>
                      ))
                    : <div style={{fontSize: 13, color: '#9AA3AF'}}>연령 데이터 없음</div>
                  }
                </div>
                <div className="priv" style={{marginTop: 14, fontSize: 11.5}}>
                  <Ic.Shield color="#9AA3AF"/>
                  연령대는 Vision AI가 추정한 익명 통계이며, 개인을 식별하지 않습니다.
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-h">
                <h3>성별 추정</h3>
                <span className="sub">· 익명 통계</span>
              </div>
              <div className="card-b" style={{display:"flex", flexDirection:"column", gap: 16}}>
                <div style={{display:"flex", alignItems:"center", gap: 12}}>
                  <div style={{height: 10, borderRadius: 99, background: "#F1F3F6", flex: 1, overflow: "hidden", position: "relative"}}>
                    <div style={{position:"absolute", inset:0, width: femPct+"%", background: "oklch(0.7 0.13 0)"}}/>
                    <div style={{position:"absolute", left: femPct+"%", right: 0, top:0, bottom:0, background: "oklch(0.62 0.13 250)"}}/>
                  </div>
                </div>
                <div style={{display:"flex", justifyContent: "space-between", fontSize: 13}}>
                  <div>
                    <div style={{color:"#6B7280", fontSize: 11.5}}>여성</div>
                    <div className="mono" style={{fontWeight: 700, fontSize: 20, marginTop: 2}}>{femPct}%</div>
                    <div style={{fontSize: 11.5, color:"#9AA3AF"}} className="mono">{womanCount}명</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{color:"#6B7280", fontSize: 11.5}}>남성</div>
                    <div className="mono" style={{fontWeight: 700, fontSize: 20, marginTop: 2}}>{malePct}%</div>
                    <div style={{fontSize: 11.5, color:"#9AA3AF"}} className="mono">{manCount}명</div>
                  </div>
                </div>
                <div className="priv" style={{fontSize: 11.5}}>
                  <Ic.Shield color="#9AA3AF"/>얼굴 식별 없이 외관 기반으로 추정합니다.
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-h">
                <h3>오늘의 한 줄 요약</h3>
                <span className="sub">· 데이터 기반</span>
              </div>
              <div className="card-b" style={{display:"flex", flexDirection:"column", gap: 12}}>
                <div style={{
                  background: "linear-gradient(135deg, oklch(0.97 0.02 250), oklch(0.97 0.03 290))",
                  border: "1px solid oklch(0.92 0.03 260)",
                  borderRadius: 12, padding: "14px 14px", fontSize: 13.5, lineHeight: 1.6, color:"#1F2733"
                }}>
                  <Ic.Sparkle color="oklch(0.50 0.16 270)"/>
                  {loading
                    ? <div style={{marginTop: 8, color: '#9AA3AF'}}>분석 중...</div>
                    : <>
                        <div style={{marginTop: 8, fontWeight: 600, letterSpacing: "-0.005em"}}>
                          총 방문자 {visitorCount}명, 혼잡도 {congestionLabel(congestion)} 수준이에요.
                        </div>
                        <div style={{marginTop: 6, color: "#4B5260"}}>
                          평균 체류 시간 <b>{dwellDisplay}</b>.
                          {femPct > malePct ? ` 여성 방문자 비중(${femPct}%)이 더 높아요.` : ` 남성 방문자 비중(${malePct}%)이 더 높아요.`}
                        </div>
                      </>
                  }
                </div>
              </div>
            </div>
          </div>

          {t.showPrivacyBadge && (
            <div className="priv" style={{padding:"6px 4px 12px", fontSize: 12}}>
              <Ic.Shield color="#9AA3AF"/>
              본 대시보드는 Vision AI 기반 익명 집계 데이터만 표시합니다. 얼굴 인식, 개인 식별, 영상 저장은 수행하지 않으며 모든 처리는 백엔드에서 수치화 후 폐기됩니다.
            </div>
          )}
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
        <TweakRadio label="차트 스타일" value={t.chartStyle}
          options={[{value:"area", label:"영역형"}, {value:"line", label:"선형"}]}
          onChange={(v) => setTweak("chartStyle", v)}/>

        <TweakSection label="패널"/>
        <TweakToggle label="AI 인사이트 강조" value={t.showAiPanel} onChange={(v) => setTweak("showAiPanel", v)}/>
        <TweakToggle label="개인정보 배지" value={t.showPrivacyBadge} onChange={(v) => setTweak("showPrivacyBadge", v)}/>
      </TweaksPanel>
    </div>
  )
}
