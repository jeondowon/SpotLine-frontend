import { useState } from 'react'
import { Ic } from '../ui/Icons'
import InfoTooltip from '../ui/InfoTooltip'

export default function AIGenerateCard({ title, fetch, tooltip, emptyText }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    setLoading(true)
    try {
      setData(await fetch())
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  return (
    <div className="card">
      <div className="card-h">
        <span className="ai-h-badge"><Ic.Sparkle /> {title}</span>
        <div className="right">
          <span className="chip">AI</span>
          <button className="gen-btn" onClick={generate} disabled={loading}>
            {loading ? '생성 중...' : '생성하기'}
          </button>
          <InfoTooltip text={tooltip} />
        </div>
      </div>
      <div className="card-b">
        {data?.message ? (
          <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.75, color: 'var(--ink-2)', whiteSpace: 'pre-wrap' }}>
            {data.message}
          </p>
        ) : (
          <p style={{ margin: 0, fontSize: 13, color: 'var(--muted-2)' }}>
            {loading ? '생성 중...' : emptyText}
          </p>
        )}
      </div>
    </div>
  )
}
