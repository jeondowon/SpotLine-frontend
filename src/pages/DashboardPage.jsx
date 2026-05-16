import { useState, useEffect } from 'react'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/dashboard/Header'
import TrafficChart from '../components/dashboard/TrafficChart'
import Gauge from '../components/dashboard/Gauge'
import KPI from '../components/ui/KPI'
import { Ic } from '../components/ui/Icons'
import { TweaksPanel, TweakSection, TweakColor, TweakRadio, TweakToggle } from '../components/ui/TweaksPanel'
import { useTweaks } from '../hooks/useTweaks'
import { PRESETS, AGE_GROUPS, GENDER, PEAK_BARS } from '../data/dashboard'

const TWEAK_DEFAULTS = {
  accent: '#3B7CF6',
  density: 'regular',
  showAiPanel: true,
  showPrivacyBadge: true,
  chartStyle: 'area',
  storePreset: 'cafe',
}

export default function DashboardPage() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS)
  const [tab, setTab] = useState(0)

  const preset = PRESETS[t.storePreset] || PRESETS.cafe

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', t.accent)
  }, [t.accent])

  return (
    <div className="app">
      <Sidebar/>
      <div className="main">
        <Header storeName={preset.name} tab={tab} onTab={setTab}/>

        <div className="content">

          <div className="row-greet">
            <div className="greet">
              <h1>안녕하세요, {preset.ownerInitial}점주님 — 오늘 매장 상태를 한눈에 보여드릴게요.</h1>
              <p>지금 매장은 평소보다 활발해요. 19시 피크 시간대까지 약 1시간 30분 남았습니다.</p>
            </div>
            <span className="live-pill"><span className="live-dot"/>실시간 업데이트 중</span>
          </div>

          <div className="kpis">
            <KPI label="오늘 방문자 수" icon={<Ic.Users/>} iconBg="oklch(0.95 0.03 250)" iconFg="oklch(0.48 0.16 250)"
                 value={preset.visitorsToday.toLocaleString()} unit="명" delta={preset.deltaV}
                 spark={[18,22,30,42,38,52,68,80,92,110,124,96]} sparkColor="oklch(0.62 0.14 250)"/>
            <KPI label="현재 혼잡도" icon={<Ic.Activity/>} iconBg="oklch(0.95 0.05 80)" iconFg="oklch(0.55 0.14 65)"
                 value={preset.congestion} unit="/ 100" delta={preset.deltaC}
                 spark={[30,35,42,55,68,72,64,58,62]} sparkColor="oklch(0.65 0.14 65)"/>
            <KPI label="평균 체류 시간" icon={<Ic.Clock/>} iconBg="oklch(0.95 0.04 155)" iconFg="oklch(0.42 0.12 155)"
                 value={preset.stay} delta={preset.deltaS}
                 spark={[18,19,21,22,20,23,24,23,23]} sparkColor="oklch(0.55 0.13 155)"/>
            <KPI label="오늘 전환율" icon={<Ic.Trend/>} iconBg="oklch(0.95 0.04 295)" iconFg="oklch(0.50 0.16 295)"
                 value={preset.conv.toFixed(1)} unit="%" delta={preset.deltaCv}
                 spark={[28,30,32,35,33,36,38,37,38]} sparkColor="oklch(0.55 0.14 295)"/>
          </div>

          <div className="compare">
            <div><div className="l">어제 대비 방문자</div><div className="v mono">+45명</div><div className="d delta up" style={{display:'inline-block'}}>▲ 12.3%</div></div>
            <div><div className="l">어제 같은 시간</div><div className="v mono">88명</div><div className="d" style={{color:'#6B7280'}}>17:00 기준</div></div>
            <div><div className="l">이번주 평균</div><div className="v mono">368명/일</div><div className="d" style={{color:'#6B7280'}}>최근 7일</div></div>
            <div><div className="l">목표 달성률</div><div className="v mono">82.4%</div><div className="d" style={{color:'#6B7280'}}>일일 목표 500명</div></div>
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
                  <Gauge value={preset.congestion}/>
                  <div className="gauge-meta">
                    <div className="lvl">보통<span className="small">혼잡도</span></div>
                    <div className="desc">평일 토요일 평균보다 약간 높은 수준이에요. 직원 1명 추가 배치를 고려해보세요.</div>
                  </div>
                </div>

                <div className="status-rows">
                  <div className="status-row"><span className="k">현재 매장 내 인원</span><span className="v mono">23명</span></div>
                  <div className="status-row"><span className="k">최근 10분 입장</span><span className="v mono">8명</span></div>
                  <div className="status-row"><span className="k">최근 10분 이탈</span><span className="v mono">5명</span></div>
                  <div className="status-row"><span className="k">피크 시간대</span><span className="v">{preset.peak}</span></div>
                  <div className="status-row"><span className="k">예상 다음 피크</span><span className="v">19:00 (+72분)</span></div>
                </div>

                <div>
                  <div style={{fontSize:11.5, color:"#6B7280", marginBottom: 6}}>오늘 분단위 혼잡도</div>
                  <div className="peakbars">
                    {PEAK_BARS.map((v, i) => (
                      <span key={i} className={v > 70 ? "hi" : ""} style={{height: (v/100)*28+2}}/>
                    ))}
                  </div>
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
                    <div className="zone-sub">방문자 진입 이벤트 · 어제 +9.2%</div>
                  </div>
                  <div className="zone-val">
                    <div className="n mono">{preset.entry}</div>
                    <div className="d">건</div>
                  </div>
                  <div className="zone-bar"><div style={{width:"100%", background:"oklch(0.62 0.14 250)"}}/></div>
                </div>
                <div className="zone-row">
                  <div className="zone-ic" style={{background:"oklch(0.95 0.04 295)", color:"oklch(0.50 0.16 295)"}}><Ic.Cart/></div>
                  <div>
                    <div className="zone-name">계산대 존</div>
                    <div className="zone-sub">결제 영역 진입 · 어제 +14.4%</div>
                  </div>
                  <div className="zone-val">
                    <div className="n mono">{preset.checkout}</div>
                    <div className="d">건</div>
                  </div>
                  <div className="zone-bar"><div style={{width:`${(preset.checkout/preset.entry)*100}%`, background:"oklch(0.55 0.14 295)"}}/></div>
                </div>
                <div style={{display:'flex', justifyContent:'space-between', marginTop: 12, padding: "10px 12px", borderRadius: 10, background:"#F7F9FC", fontSize: 12}}>
                  <span style={{color:"#6B7280"}}>입구 → 계산대 전환율</span>
                  <span style={{fontWeight:700}} className="mono">{((preset.checkout/preset.entry)*100).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-h">
                <h3>오늘 날씨</h3>
                <span className="sub">· 서울 강남</span>
                <div className="right"><span className="chip">기상청</span></div>
              </div>
              <div className="card-b">
                <div className="wx">
                  <div className="wx-icn"><Ic.Sun/></div>
                  <div>
                    <div className="wx-temp mono">23°</div>
                    <div className="wx-desc">맑음 · 체감 22° · 자외선 보통</div>
                  </div>
                </div>
                <div className="wx-stats">
                  <div className="wx-stat"><div className="l">강수확률</div><div className="v mono">10%</div></div>
                  <div className="wx-stat"><div className="l">습도</div><div className="v mono">48%</div></div>
                  <div className="wx-stat"><div className="l">풍속</div><div className="v mono">2.1m/s</div></div>
                </div>
                <div className="wx-note">
                  맑은 주말 오후엔 평소보다 방문자가 <b>14%</b> 더 많아요. 야외 입간판을 활용해 보세요.
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-h">
                <span className="ai-h-badge"><Ic.Sparkle/> AI 인사이트</span>
                <span className="sub">오늘 자동 생성 · 3건</span>
                <div className="right"><span className="chip">베타</span></div>
              </div>
              <div className="card-b ai-list">
                <div className="ai-card">
                  <div className="num">01</div>
                  <div>
                    <div className="t">19시 피크에 직원 1명 추가 배치 권장</div>
                    <div className="b">지난 4주간 토요일 19–20시 혼잡도가 평균 76으로 가장 높았어요. 대기 이탈을 줄이려면 미리 인원을 배치하세요.</div>
                    <span className="tag k">운영 액션</span>
                  </div>
                </div>
                <div className="ai-card">
                  <div className="num">02</div>
                  <div>
                    <div className="t">20대 여성 비중이 어제보다 8.2%p 증가</div>
                    <div className="b">신상품 &lsquo;딸기 라떼&rsquo; 출시 후 20대 여성 방문이 늘었어요. SNS 이벤트와 매장 내 시즌 POP를 함께 운영하면 효과가 더 커질 수 있어요.</div>
                    <span className="tag r">기회 발견</span>
                  </div>
                </div>
                <div className="ai-card">
                  <div className="num">03</div>
                  <div>
                    <div className="t">계산대 전환율이 5일 연속 상승 중</div>
                    <div className="b">입구 대비 계산대 진입 비율이 5월 12일 28% → 오늘 32%. 신규 진열 동선 변경의 효과로 보여요. 다음 주에도 유지 권장.</div>
                    <span className="tag">트렌드</span>
                  </div>
                </div>
              </div>
            </div>
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
                  {AGE_GROUPS.map((a) => (
                    <div className="age-row" key={a.label}>
                      <div className="l mono">{a.label}</div>
                      <div className="track"><div className="fill" style={{width: a.pct + "%"}}/></div>
                      <div className="v mono">{a.pct}%</div>
                    </div>
                  ))}
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
                    <div style={{position:"absolute", inset:0, width: GENDER.f+"%", background: "oklch(0.7 0.13 0)"}}/>
                    <div style={{position:"absolute", left: GENDER.f+"%", right: 0, top:0, bottom:0, background: "oklch(0.62 0.13 250)"}}/>
                  </div>
                </div>
                <div style={{display:"flex", justifyContent: "space-between", fontSize: 13}}>
                  <div>
                    <div style={{color:"#6B7280", fontSize: 11.5}}>여성</div>
                    <div className="mono" style={{fontWeight: 700, fontSize: 20, marginTop: 2}}>{GENDER.f}%</div>
                    <div style={{fontSize: 11.5, color:"#9AA3AF"}} className="mono">239명</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{color:"#6B7280", fontSize: 11.5}}>남성</div>
                    <div className="mono" style={{fontWeight: 700, fontSize: 20, marginTop: 2}}>{GENDER.m}%</div>
                    <div style={{fontSize: 11.5, color:"#9AA3AF"}} className="mono">173명</div>
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
                <span className="sub">· AI 자동 생성</span>
              </div>
              <div className="card-b" style={{display:"flex", flexDirection:"column", gap: 12}}>
                <div style={{
                  background: "linear-gradient(135deg, oklch(0.97 0.02 250), oklch(0.97 0.03 290))",
                  border: "1px solid oklch(0.92 0.03 260)",
                  borderRadius: 12, padding: "14px 14px", fontSize: 13.5, lineHeight: 1.6, color:"#1F2733"
                }}>
                  <Ic.Sparkle color="oklch(0.50 0.16 270)"/>
                  <div style={{marginTop: 8, fontWeight: 600, letterSpacing: "-0.005em"}}>오늘은 평소보다 활기찬 토요일이에요.</div>
                  <div style={{marginTop: 6, color: "#4B5260"}}>
                    방문자가 어제보다 <b>12.3%</b> 증가했고, 20대 여성 비중이 두드러져요. 19시 피크에 인원 보강을 추천드려요.
                  </div>
                </div>
                <div style={{display:"flex", gap: 8}}>
                  <button className="chip" style={{cursor:"default", padding: "6px 11px", fontSize: 12, fontWeight: 500}}>리포트 만들기</button>
                  <button className="chip" style={{cursor:"default", padding: "6px 11px", fontSize: 12, fontWeight: 500, background:"#0F1419", color:"#fff", borderColor:"#0F1419"}}>분석 더 보기</button>
                </div>
              </div>
            </div>
          </div>

          <div className="priv" style={{padding:"6px 4px 12px", fontSize: 12}}>
            <Ic.Shield color="#9AA3AF"/>
            본 대시보드는 Vision AI 기반 익명 집계 데이터만 표시합니다. 얼굴 인식, 개인 식별, 영상 저장은 수행하지 않으며 모든 처리는 백엔드에서 수치화 후 폐기됩니다.
          </div>
        </div>
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection label="매장 프리셋"/>
        <TweakRadio label="유형" value={t.storePreset}
          options={[{value:"cafe", label:"카페"}, {value:"retail", label:"리테일"}, {value:"resto", label:"식당"}]}
          onChange={(v) => setTweak("storePreset", v)}/>

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
