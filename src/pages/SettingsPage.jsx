import { useState, useEffect } from 'react'
import AppLayout from '../components/layout/AppLayout'
import HamburgerButton from '../components/layout/HamburgerButton'
import { Ic } from '../components/ui/Icons'
import { useTweaks } from '../hooks/useTweaks'
import { AddressSearchInput, BizSelect, DayPicker, TimeRangeSelect } from '../components/store/StoreFormInputs'
import { deleteStore, fetchStore, saveStore } from '../api/index'
import { buildStorePayload, clearStoreProfile, syncStoreProfile } from '../utils/storeProfile'

const TWEAK_DEFAULTS = {
  accent: '#00A5BB',
  density: 'regular',
}

// ── internal helpers ────────────────────────────────────────────────

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
    <div className="settings-field-row">
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

// ── main page ───────────────────────────────────────────────────────

export default function SettingsPage() {
  const [t] = useTweaks(TWEAK_DEFAULTS)

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', t.accent)
  }, [t.accent])

  // 매장 프로필
  const [storeName,    setStoreName]    = useState(() => localStorage.getItem('store_name')    ?? '한동대학교 명성')
  const [storeAddress, setStoreAddress] = useState(() => localStorage.getItem('store_address') ?? '한동대학교')
  const [bizType,      setBizType]      = useState(() => localStorage.getItem('store_biz_type') ?? '음식점')
  const [latitude,     setLatitude]     = useState(() => localStorage.getItem('store_latitude') ?? '')
  const [longitude,    setLongitude]    = useState(() => localStorage.getItem('store_longitude') ?? '')
  const [openHours,    setOpenHours]    = useState(() => {
    try { return JSON.parse(localStorage.getItem('store_open_hours')) ?? { startPeriod: '오전', startTime: '9:00', endPeriod: '오후', endTime: '10:00' } }
    catch { return { startPeriod: '오전', startTime: '9:00', endPeriod: '오후', endTime: '10:00' } }
  })
  const [breakTime,    setBreakTime]    = useState(() => {
    try { return JSON.parse(localStorage.getItem('store_break_time')) ?? { startPeriod: '오후', startTime: '', endPeriod: '오후', endTime: '' } }
    catch { return { startPeriod: '오후', startTime: '', endPeriod: '오후', endTime: '' } }
  })
  const [closedDays,   setClosedDays]   = useState(() => {
    try { return JSON.parse(localStorage.getItem('store_closed_days')) ?? [] } catch { return [] }
  })
  const [dailyGoals, setDailyGoals] = useState(() => {
    try { return JSON.parse(localStorage.getItem('store_daily_goals')) ?? { visitors: '', revenue: '' } }
    catch { return { visitors: '', revenue: '' } }
  })
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [storeError, setStoreError] = useState('')

  useEffect(() => {
    let active = true
    fetchStore()
      .then(store => {
        if (!active) return
        syncStoreProfile(store)
        setStoreName(store.storeName ?? '')
        setBizType(store.businessType ?? '')
        setLatitude(store.latitude ?? '')
        setLongitude(store.longitude ?? '')
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  const toggleDay = i => setClosedDays(prev =>
    prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i].sort()
  )

  const handleSaveStore = async () => {
    const payload = buildStorePayload({
      storeName,
      businessType: bizType,
      latitude,
      longitude,
    })
    if (!payload) {
      setStoreError('매장명, 업종, 위도, 경도를 확인해주세요.')
      return
    }

    setSaving(true)
    setStoreError('')
    localStorage.setItem('store_name',        storeName)
    localStorage.setItem('store_address',     storeAddress)
    localStorage.setItem('store_biz_type',    bizType)
    localStorage.setItem('store_latitude',    latitude)
    localStorage.setItem('store_longitude',   longitude)
    localStorage.setItem('store_open_hours',  JSON.stringify(openHours))
    localStorage.setItem('store_break_time',  JSON.stringify(breakTime))
    localStorage.setItem('store_closed_days', JSON.stringify(closedDays))
    localStorage.setItem('store_daily_goals', JSON.stringify(dailyGoals))

    try {
      const savedStore = await saveStore(payload)
      syncStoreProfile(savedStore)
      window.dispatchEvent(new Event('store-profile-updated'))
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      setStoreError('매장 정보를 서버에 저장하지 못했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteStore = async () => {
    if (!window.confirm('등록된 매장 정보를 삭제할까요?')) return
    setSaving(true)
    setStoreError('')
    try {
      await deleteStore()
      clearStoreProfile()
      setStoreName('')
      setStoreAddress('')
      setBizType('')
      setLatitude('')
      setLongitude('')
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      setStoreError('매장 정보를 삭제하지 못했습니다.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppLayout>
      <div className="hdr">
        <div>
          <div className="hdr-title">설정</div>
          <div className="hdr-sub">매장 분석 환경과 계정을 관리합니다</div>
        </div>
        <HamburgerButton />
      </div>
      <div style={{
        padding: t.density === 'compact' ? '24px' : '32px',
        display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 800,
      }}>

        {/* 1. 매장 프로필 */}
        <SectionCard title="매장 프로필" icon={<Ic.Door color="#6B7280"/>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <FieldRow label="매장명">
              <input type="text" value={storeName} onChange={e => setStoreName(e.target.value)}
                style={{ height: 36, padding: '0 12px', border: '1px solid #E5E9EF', borderRadius: 8, fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: 'inherit' }}/>
            </FieldRow>
            <FieldRow label="업종">
              <BizSelect value={bizType} onChange={setBizType} />
            </FieldRow>
            <FieldRow label="주소">
              <AddressSearchInput
                value={storeAddress}
                onChange={({ address, latitude, longitude }) => {
                  setStoreAddress(address)
                  setLatitude(String(latitude))
                  setLongitude(String(longitude))
                }}
                placeholder="주소 입력"
              />
            </FieldRow>
            <FieldRow label="영업시간">
              <TimeRangeSelect value={openHours} onChange={setOpenHours} />
            </FieldRow>
            <FieldRow label="브레이크타임">
              <TimeRangeSelect value={breakTime} onChange={setBreakTime} />
            </FieldRow>
            <FieldRow label="일일 목표">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E5E9EF', borderRadius: 8, overflow: 'hidden' }}>
                  <input
                    type="number" min="0" step="10"
                    value={dailyGoals.visitors}
                    onChange={e => setDailyGoals({ ...dailyGoals, visitors: e.target.value })}
                    placeholder="방문자 수"
                    style={{ flex: 1, height: 36, padding: '0 10px', border: 'none', outline: 'none', fontSize: 13, fontFamily: 'inherit', minWidth: 0 }}
                  />
                  <span style={{ padding: '0 10px', fontSize: 12, color: '#9AA3AF', borderLeft: '1px solid #E5E9EF', height: 36, display: 'flex', alignItems: 'center', flexShrink: 0 }}>명</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E5E9EF', borderRadius: 8, overflow: 'hidden' }}>
                  <input
                    type="number" min="0" step="5"
                    value={dailyGoals.revenue}
                    onChange={e => setDailyGoals({ ...dailyGoals, revenue: e.target.value })}
                    placeholder="매출"
                    style={{ flex: 1, height: 36, padding: '0 10px', border: 'none', outline: 'none', fontSize: 13, fontFamily: 'inherit', minWidth: 0 }}
                  />
                  <span style={{ padding: '0 10px', fontSize: 12, color: '#9AA3AF', borderLeft: '1px solid #E5E9EF', height: 36, display: 'flex', alignItems: 'center', flexShrink: 0 }}>만원</span>
                </div>
              </div>
            </FieldRow>
            <FieldRow label="휴무일">
              <DayPicker days={closedDays} toggleDay={toggleDay} />
            </FieldRow>
            <FieldRow label="관리자 계정">
              <TextInput defaultValue="admin@spotline.kr"/>
            </FieldRow>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10 }}>
            {storeError && (
              <span style={{ fontSize: 12, fontWeight: 600, color: '#EF4444' }}>
                {storeError}
              </span>
            )}
            {saved && (
              <span style={{
                fontSize: 12, fontWeight: 600, color: '#10B981',
                display: 'flex', alignItems: 'center', gap: 4,
                animation: 'fadeIn .2s ease',
              }}>
                ✓ 저장되었습니다
              </span>
            )}
            <button onClick={handleDeleteStore} disabled={saving} style={{
              height: 36, padding: '0 14px', borderRadius: 8, border: '1px solid #FCA5A5',
              background: '#fff', color: '#DC2626', fontSize: 13, fontWeight: 600,
              cursor: saving ? 'default' : 'pointer', fontFamily: 'inherit',
            }}>삭제</button>
            <button onClick={handleSaveStore} disabled={saving} style={{
              height: 36, padding: '0 20px', borderRadius: 8, border: 'none',
              background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 600,
              cursor: saving ? 'default' : 'pointer', fontFamily: 'inherit',
            }}>{saving ? '저장 중...' : '저장'}</button>
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
      </div>

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
    </AppLayout>
  )
}
