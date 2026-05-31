import { useState } from 'react'
import { fetchDailyBriefing } from '../../api/index'
import { Ic } from '../ui/Icons'
import InfoTooltip from '../ui/InfoTooltip'

export default function DailyBriefingCard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    setLoading(true)
    try {
      const r = await fetchDailyBriefing()
      setData(r)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  return (
    <div className="card">
      <div className="card-h">
        <span className="ai-h-badge"><Ic.Sparkle /> 일일 브리핑</span>
        <div className="right">
          <span className="chip">AI</span>
          <button className="gen-btn" onClick={generate} disabled={loading}>
            {loading ? '생성 중...' : '생성하기'}
          </button>
          <InfoTooltip
            text="오늘 하루 매장 데이터를 AI가 분석해서 중요한 내용만 짧게 정리해줘요.\n\n방문자 수 변화, 고객 패턴, 특이사항 등을 빠르게 파악할 수 있어요."
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
            {loading ? '생성 중...' : '생성하기 버튼을 눌러 AI 브리핑을 받아보세요.'}
          </p>
        )}
      </div>
    </div>
  )
}
