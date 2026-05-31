import { useState } from 'react'
import { fetchMarketingRecommendations } from '../../api/index'
import { Ic } from '../ui/Icons'
import InfoTooltip from '../ui/InfoTooltip'

export default function MarketingRecommendationsCard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    setLoading(true)
    try {
      const r = await fetchMarketingRecommendations()
      setData(r)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  return (
    <div className="card">
      <div className="card-h">
        <span className="ai-h-badge"><Ic.Sparkle /> 마케팅 추천</span>
        <div className="right">
          <span className="chip">AI</span>
          <button className="gen-btn" onClick={generate} disabled={loading}>
            {loading ? '생성 중...' : '생성하기'}
          </button>
          <InfoTooltip
            text="오늘의 방문 데이터와 고객 패턴을 분석해서 지금 매장에 맞는 마케팅 아이디어를 제안해줘요.\n\n어떤 고객이 많이 왔는지, 어떤 시간대가 한산했는지를 바탕으로 실질적인 액션을 추천해줘요."
          />
        </div>
      </div>
      <div className="card-b">
        {data?.message ? (
          <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.75, color: 'var(--ink-2)', whiteSpace: 'pre-wrap' }}>
            {data.message}
          </p>
        ) : (
          <p style={{ margin: 0, fontSize: 13, color: 'var(--muted-2)' }}>
            {loading ? '생성 중...' : '생성하기 버튼을 눌러 AI 마케팅 추천을 받아보세요.'}
          </p>
        )}
      </div>
    </div>
  )
}
