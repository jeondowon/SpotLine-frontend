import { useState, useEffect } from 'react'
import '../styles/analytics.css'
import Sidebar from '../components/layout/Sidebar'
import KPI from '../components/ui/KPI'
import { Ic } from '../components/ui/Icons'
import { TweaksPanel, TweakSection, TweakColor } from '../components/ui/TweaksPanel'
import { useTweaks } from '../hooks/useTweaks'

const TWEAK_DEFAULTS = { accent: '#3B7CF6' }

const TYPE_META = {
  opportunity: { color: 'oklch(0.42 0.12 155)', bg: 'oklch(0.95 0.04 155)', bar: 'oklch(0.62 0.13 155)', label: '기회 발견' },
  warning:     { color: 'oklch(0.55 0.16 25)',  bg: 'oklch(0.95 0.04 25)',  bar: 'oklch(0.62 0.18 25)',  label: '개선 필요' },
  trend:       { color: 'oklch(0.48 0.16 250)', bg: 'oklch(0.95 0.03 250)', bar: 'oklch(0.62 0.14 250)', label: '트렌드'   },
  success:     { color: 'oklch(0.50 0.16 295)', bg: 'oklch(0.95 0.04 295)', bar: 'oklch(0.55 0.14 295)', label: '성과'     },
}

const PRIORITY_META = {
  high: { color: 'oklch(0.55 0.16 25)',  label: '높음' },
  mid:  { color: 'oklch(0.55 0.14 65)',  label: '중간' },
  low:  { color: 'oklch(0.42 0.12 155)', label: '낮음' },
}

const TAG_META = {
  '운영':   { color: 'oklch(0.48 0.16 250)', bg: 'oklch(0.95 0.03 250)' },
  '마케팅': { color: 'oklch(0.50 0.16 295)', bg: 'oklch(0.95 0.04 295)' },
  '공간':   { color: 'oklch(0.42 0.12 155)', bg: 'oklch(0.95 0.04 155)' },
  '상품':   { color: 'oklch(0.55 0.14 65)',  bg: 'oklch(0.95 0.05 80)'  },
}

const INSIGHTS = [
  {
    type: 'opportunity',
    title: '저녁 시간대 20대 방문 증가',
    desc: '18시–20시 방문자 중 20대 비율이 38%로 전주 대비 8.2%p 상승했어요. SNS 유입 가능성이 높은 시간대입니다.',
    data: '18–20시 · 20대 비율 38% · 전주 대비 +8.2%p',
    action: '저녁 한정 프로모션 기획',
  },
  {
    type: 'warning',
    title: '점심 시간대 전환율 저하',
    desc: '12–13시 방문자 수는 많지만 계산대 진입률이 평균보다 12%p 낮아요. 메뉴 노출 방식 또는 주문 동선 개선이 필요합니다.',
    data: '점심 전환율 24% · 평균(36%) 대비 -12%p',
    action: '메뉴판 배치 및 동선 재검토',
  },
  {
    type: 'trend',
    title: '비 오는 날 체류 시간 증가',
    desc: '비 오는 날 평균 체류 시간이 28분으로 맑은 날(24분)보다 8.6% 더 길어요. 30일 데이터에서 일관되게 나타나는 패턴입니다.',
    data: '비 오는 날 평균 28분 · 맑은 날 24분 · +8.6%',
    action: '우천 시 따뜻한 음료 프로모션',
  },
  {
    type: 'success',
    title: '계산대 전환율 5일 연속 상승',
    desc: '신규 진열 동선 변경 이후 입구 대비 계산대 진입 비율이 꾸준히 오르고 있어요. 이 흐름을 유지하세요.',
    data: '5월 12일 28.0% → 오늘 32.1% (+4.1%p)',
    action: '현재 동선 배치 유지 권장',
  },
]

const ACTIONS = [
  { priority: 'high', title: '19시 피크 직원 1명 추가 배치',  impact: '고객 이탈 -15% 예상',  difficulty: '쉬움',   metric: '혼잡도'   },
  { priority: 'high', title: '점심 메뉴판 레이아웃 변경',      impact: '전환율 +5–8% 예상',    difficulty: '보통',   metric: '전환율'   },
  { priority: 'mid',  title: '저녁 SNS 이벤트 연동',          impact: '20대 유입 +10–15%',   difficulty: '보통',   metric: '방문자 수' },
  { priority: 'mid',  title: '우천 시 따뜻한 음료 특가 설정',  impact: '우천 매출 +20% 예상',  difficulty: '쉬움',   metric: '체류·매출' },
  { priority: 'low',  title: '시즌 POP 디스플레이 교체',       impact: '브랜드 인지 개선',      difficulty: '어려움', metric: '재방문율'  },
]

const STRAT_TABS = [
  { id: 'time',       label: '시간대 기반' },
  { id: 'customer',   label: '고객층 기반' },
  { id: 'weather',    label: '날씨 기반'   },
  { id: 'conversion', label: '전환율 개선' },
  { id: 'congestion', label: '혼잡도 개선' },
]

const STRATEGIES = {
  time: [
    { title: '피크 사전 인원 배치',    desc: '19시 피크 30분 전 직원을 배치해 대기 이탈을 방지하고 혼잡도를 선제 관리하세요.',        tag: '운영'   },
    { title: '오전 비수기 활성화',     desc: '10–11시 조용한 시간에 소폭 할인 혜택을 제공해 방문 분산을 유도하세요.',            tag: '마케팅' },
    { title: '점심 동선 최적화',       desc: '12–13시 메뉴판 가시성을 높이고 계산대까지 빠른 주문 경로를 설계하세요.',           tag: '공간'   },
  ],
  customer: [
    { title: '20대 저녁 SNS 프로모션', desc: '18–20시 공유 이벤트로 20대 재방문과 신규 유입을 동시에 강화하세요.',             tag: '마케팅' },
    { title: '30–40대 점심 세트 기획', desc: '체류 시간이 길고 전환율 높은 30–40대를 위한 점심 프리미엄 세트를 구성하세요.',      tag: '상품'   },
    { title: '연령대별 메뉴 전면 배치', desc: 'Vision AI 연령 추정으로 방문 피크 연령층에 맞는 메뉴를 전면에 노출하세요.',        tag: '운영'   },
  ],
  weather: [
    { title: '우천 체류 패키지',       desc: '비 오는 날 따뜻한 음료 + 디저트 세트로 늘어난 체류 시간을 매출로 전환하세요.',      tag: '상품'   },
    { title: '맑은 날 외부 유동 유입', desc: '날씨 좋은 날 야외 입간판과 시식 행사로 주변 유동 인구를 유입하세요.',             tag: '운영'   },
  ],
  conversion: [
    { title: '계산대 동선 가시성 개선',  desc: '체류 중 계산대까지 시선이 자연스럽게 닿도록 진열 배치와 사인을 조정하세요.',        tag: '공간'   },
    { title: '피크 시간 빠른 결제 도입', desc: '혼잡 피크에 QR 셀프 결제를 도입해 이탈률을 낮추고 처리 속도를 높이세요.',         tag: '운영'   },
    { title: '계산대 앞 충동 구매 유도', desc: '계산대 앞 소용량 인기 상품 배치로 추가 전환과 객단가를 높이세요.',               tag: '상품'   },
  ],
  congestion: [
    { title: '실시간 혼잡도 직원 알림',  desc: '혼잡도 70 초과 시 직원 앱에 즉시 알림을 발송해 선제 대응 체계를 갖추세요.',       tag: '운영'   },
    { title: '피크 전후 유도 할인',     desc: '피크 시간 이전·이후 방문 고객에게 소폭 할인을 제공해 방문을 균등 분산하세요.',      tag: '마케팅' },
  ],
}

export default function InsightsPage() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS)
  const [stratTab, setStratTab] = useState('time')

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', t.accent)
  }, [t.accent])

  return (
    <div className="app">
      <Sidebar/>
      <div className="main">
        <header className="hdr">
          <div>
            <div className="hdr-title">AI 인사이트</div>
            <div className="hdr-sub">2026.04.17 – 05.16 · 30일 · 코지 카페 · 강남점</div>
          </div>
          <div className="hdr-right">
            <div className="ai-status"><span className="d"/>AI 인사이트 생성 완료</div>
            <button className="btn-secondary"><Ic.Download/> 내보내기</button>
            <button className="icon-btn" aria-label="알림"><Ic.Bell/></button>
            <div className="avatar">박</div>
          </div>
        </header>

        <div className="content" style={{display:'flex', flexDirection:'column', gap: 20}}>

          {/* AI 요약 메시지 */}
          <div style={{
            background: 'linear-gradient(135deg, oklch(0.97 0.02 250), oklch(0.96 0.03 285))',
            border: '1px solid oklch(0.92 0.03 260)',
            borderRadius: 14, padding: '20px 24px',
          }}>
            <div style={{display:'flex', alignItems:'flex-start', gap: 14}}>
              <div style={{
                width: 40, height: 40, borderRadius: 11, flexShrink: 0,
                background: 'oklch(0.93 0.05 265)', display:'grid', placeItems:'center',
                border: '1px solid oklch(0.89 0.06 265)',
              }}>
                <Ic.Sparkle color="oklch(0.50 0.16 265)"/>
              </div>
              <div style={{flex: 1}}>
                <div style={{display:'flex', alignItems:'center', gap: 8, marginBottom: 8}}>
                  <span style={{fontSize: 12.5, fontWeight: 700, color: 'oklch(0.40 0.14 265)'}}>AI 요약</span>
                  <span style={{fontSize: 10.5, padding: '1px 8px', borderRadius: 999, background: 'oklch(0.91 0.04 265)', color: 'oklch(0.48 0.16 265)', fontWeight: 600}}>오늘 자동 생성</span>
                  <span style={{fontSize: 10.5, padding: '1px 8px', borderRadius: 999, background: 'oklch(0.91 0.04 265)', color: 'oklch(0.48 0.16 265)', fontWeight: 600}}>베타</span>
                </div>
                <p style={{margin: 0, fontSize: 13.5, lineHeight: 1.7, color: 'oklch(0.22 0.03 255)'}}>
                  이번 주 매장은 <b>저녁 시간대 방문자 증가</b>가 뚜렷하며, 특히 20대 고객 비율이 높게 나타났습니다. 다만 점심 시간대에는 방문자 수에 비해 계산대 전환율이 낮아 <b>메뉴 노출 방식이나 주문 동선 개선</b>이 필요합니다. 계산대 전환율이 5일 연속 상승 중인 점은 긍정적이며, 비 오는 날 체류 시간이 늘어나는 패턴을 <b>우천 매출 기회</b>로 활용할 수 있습니다.
                </p>
                <div style={{display:'flex', gap: 6, marginTop: 12, flexWrap:'wrap'}}>
                  {['분석 데이터 기반', '최근 30일', '코지 카페 · 강남점'].map(tag => (
                    <span key={tag} style={{fontSize: 11, padding: '3px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.65)', color: 'oklch(0.45 0.14 260)', border: '1px solid oklch(0.90 0.04 260)'}}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 오늘의 핵심 인사이트 + 우선순위 액션 */}
          <div>
            <div className="section-h">
              <h2>오늘의 핵심 인사이트</h2>
              <span className="sub">· AI 자동 생성 · 4건</span>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1.5fr 1fr', gap: 16, marginTop: 10}}>

              {/* 인사이트 카드 2×2 */}
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 12}}>
                {INSIGHTS.map((ins, i) => {
                  const meta = TYPE_META[ins.type]
                  return (
                    <div key={i} style={{
                      borderRadius: 12, border: '1px solid var(--line)',
                      background: '#fff', overflow:'hidden',
                      display:'flex', flexDirection:'column',
                      boxShadow: 'var(--shadow-sm)',
                    }}>
                      <div style={{height: 3, background: meta.bar}}/>
                      <div style={{padding: '14px 15px', display:'flex', flexDirection:'column', gap: 8, flex: 1}}>
                        <span style={{
                          alignSelf: 'flex-start',
                          fontSize: 10.5, fontWeight: 700, padding: '2px 8px',
                          borderRadius: 999, background: meta.bg, color: meta.color,
                        }}>{meta.label}</span>
                        <div style={{fontWeight: 700, fontSize: 13.5, lineHeight: 1.35, color: 'var(--ink)'}}>{ins.title}</div>
                        <div style={{fontSize: 12, color: 'var(--muted)', lineHeight: 1.55, flex: 1}}>{ins.desc}</div>
                        <div style={{padding: '7px 9px', background: '#F7F9FC', borderRadius: 8, fontSize: 11, color: 'var(--muted-2)'}}>
                          <span style={{fontWeight: 600, color: 'var(--muted)'}}>근거 · </span>{ins.data}
                        </div>
                        <div style={{fontSize: 11.5, fontWeight: 600, color: meta.color}}>→ {ins.action}</div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* 우선순위 액션 리스트 */}
              <div className="card">
                <div className="card-h">
                  <h3>우선순위 액션 리스트</h3>
                  <span className="sub">· AI 추천</span>
                </div>
                <div className="card-b" style={{display:'flex', flexDirection:'column', gap: 10}}>
                  {['high', 'mid', 'low'].map(level => {
                    const levelActions = ACTIONS.filter(a => a.priority === level)
                    const meta = PRIORITY_META[level]
                    return (
                      <div key={level}>
                        <div style={{
                          fontSize: 10, fontWeight: 700, letterSpacing: '0.07em',
                          textTransform: 'uppercase', color: meta.color, marginBottom: 6,
                        }}>{meta.label} 우선순위</div>
                        <div style={{display:'flex', flexDirection:'column', gap: 6}}>
                          {levelActions.map((act, i) => (
                            <div key={i} style={{
                              padding: '10px 12px', borderRadius: 9,
                              border: '1px solid var(--line)', background: '#fff',
                              borderLeft: `3px solid ${meta.color}`,
                            }}>
                              <div style={{fontWeight: 600, fontSize: 12.5, color: 'var(--ink)', marginBottom: 5}}>{act.title}</div>
                              <div style={{display:'flex', gap: 6, fontSize: 11, color: 'var(--muted)', flexWrap:'wrap'}}>
                                <span>{act.impact}</span>
                                <span style={{color: 'var(--line-2)'}}>·</span>
                                <span>난이도 {act.difficulty}</span>
                              </div>
                              <div style={{fontSize: 10.5, color: 'var(--muted-2)', marginTop: 3}}>관련 지표 · {act.metric}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* 추천 전략 분류 */}
          <div className="card">
            <div className="card-h">
              <h3>추천 전략 분류</h3>
              <span className="sub">· 카테고리별 실행 전략</span>
            </div>
            <div className="card-b" style={{display:'flex', flexDirection:'column', gap: 16}}>
              <div style={{display:'flex', gap: 6, flexWrap:'wrap'}}>
                {STRAT_TABS.map(tab => (
                  <button key={tab.id} onClick={() => setStratTab(tab.id)} style={{
                    padding: '6px 14px', borderRadius: 999, fontSize: 12.5, fontWeight: 600,
                    border: '1px solid',
                    borderColor: stratTab === tab.id ? 'var(--accent)' : 'var(--line)',
                    background: stratTab === tab.id ? 'var(--accent)' : '#fff',
                    color: stratTab === tab.id ? '#fff' : 'var(--muted)',
                    cursor: 'default', transition: 'background 0.12s, color 0.12s',
                  }}>{tab.label}</button>
                ))}
              </div>

              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap: 12}}>
                {(STRATEGIES[stratTab] || []).map((s, i) => {
                  const tagMeta = TAG_META[s.tag] || { color: 'var(--muted)', bg: '#F7F9FC' }
                  return (
                    <div key={i} style={{
                      padding: '14px 15px', borderRadius: 11,
                      border: '1px solid var(--line)', background: '#FAFBFD',
                    }}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: 8, gap: 8}}>
                        <div style={{fontWeight: 700, fontSize: 13, color: 'var(--ink)', lineHeight: 1.3}}>{s.title}</div>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '2px 7px',
                          borderRadius: 999, background: tagMeta.bg, color: tagMeta.color, flexShrink: 0,
                        }}>{s.tag}</span>
                      </div>
                      <div style={{fontSize: 12, color: 'var(--muted)', lineHeight: 1.6}}>{s.desc}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* 데이터 근거 패널 */}
          <div>
            <div className="section-h"><h2>데이터 근거 패널</h2><span className="sub">· 최근 30일 기준</span></div>
            <div className="kpis" style={{marginTop: 10}}>
              <KPI label="방문자 변화율"    icon={<Ic.Users/>}    iconBg="oklch(0.95 0.03 250)" iconFg="oklch(0.48 0.16 250)" value="+9.2"  unit="%" delta={9.2}  hint="전월 대비"/>
              <KPI label="평균 체류 변화"   icon={<Ic.Clock/>}    iconBg="oklch(0.95 0.04 155)" iconFg="oklch(0.42 0.12 155)" value="+4.2"  unit="%" delta={4.2}  hint="이전 30일 대비"/>
              <KPI label="전환율 변화"      icon={<Ic.Trend/>}    iconBg="oklch(0.95 0.04 295)" iconFg="oklch(0.50 0.16 295)" value="+1.6" unit="%p" delta={1.6}  hint="입구→계산대"/>
              <KPI label="주요 방문 연령대" icon={<Ic.Users/>}    iconBg="oklch(0.95 0.05 80)"  iconFg="oklch(0.55 0.14 65)"  value="20대"  hint="전체의 38%"/>
              <KPI label="날씨 영향도"      icon={<Ic.Sun/>}      iconBg="oklch(0.95 0.05 80)"  iconFg="oklch(0.55 0.14 65)"  value="높음"  hint="상관계수 0.78"/>
            </div>
          </div>

          <div className="priv" style={{padding:'6px 4px 12px', fontSize: 12}}>
            <Ic.Shield color="#9AA3AF"/>
            모든 인사이트는 Vision AI 익명 집계 데이터를 기반으로 생성됩니다. 얼굴 인식, 개인 식별, 영상 저장은 수행하지 않습니다.
          </div>
        </div>
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection label="비주얼"/>
        <TweakColor label="액센트" value={t.accent}
          options={["#3B7CF6", "#2563EB", "#0EA5E9", "#7C3AED", "#10B981"]}
          onChange={(v) => setTweak("accent", v)}/>
      </TweaksPanel>
    </div>
  )
}
