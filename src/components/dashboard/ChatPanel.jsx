import { useState, useRef, useEffect } from 'react'
import { Ic } from '../ui/Icons'
import { sendChatMessage } from '../../api/index'

function Bubble({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{
      display: 'flex',
      flexDirection: isUser ? 'row-reverse' : 'row',
      alignItems: 'flex-end',
      gap: 8,
    }}>
      {!isUser && (
        <div style={{
          flexShrink: 0, width: 26, height: 26, borderRadius: 8,
          background: 'var(--accent-soft)', display: 'grid', placeItems: 'center',
        }}>
          <Ic.Sparkle color="var(--accent-ink)"/>
        </div>
      )}
      <div style={{ maxWidth: '78%', display: 'flex', flexDirection: 'column', gap: 3, alignItems: isUser ? 'flex-end' : 'flex-start' }}>
        {msg.label && (
          <span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--muted)', paddingLeft: 2 }}>{msg.label}</span>
        )}
        <div style={{
          fontSize: 12.5,
          lineHeight: 1.6,
          padding: '9px 12px',
          borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
          background: isUser ? 'var(--accent)' : '#F3F5F8',
          color: isUser ? '#fff' : 'var(--ink-2)',
          opacity: msg.error ? 0.6 : 1,
        }}>
          {msg.text}
        </div>
      </div>
    </div>
  )
}

export default function ChatPanel({ videoId, raw, briefing, marketing, loading: dataLoading }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef()
  const inputRef = useRef()
  const initializedRef = useRef(false)

  useEffect(() => {
    if (dataLoading || initializedRef.current) return
    const initial = []
    if (briefing?.message) initial.push({ role: 'ai', text: briefing.message, label: '일일 브리핑' })
    if (marketing?.message) initial.push({ role: 'ai', text: marketing.message, label: '마케팅 추천' })
    if (initial.length > 0) {
      setMessages(initial)
      initializedRef.current = true
    }
  }, [briefing, marketing, dataLoading])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    const text = input.trim()
    if (!text || sending) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text }])
    setSending(true)
    try {
      const context = {
        summary: raw?.summary ?? null,
        briefing: briefing?.message ?? null,
        marketing: marketing?.message ?? null,
      }
      const { message } = await sendChatMessage(text, videoId, context)
      setMessages(prev => [...prev, { role: 'ai', text: message }])
    } catch (e) {
      console.error('[ChatPanel] sendChatMessage failed:', e)
      setMessages(prev => [...prev, { role: 'ai', text: `오류: ${e.message}`, error: true }])
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* 메시지 영역 */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, padding: '4px 0 8px' }}>
        {dataLoading && messages.length === 0 && (
          <div style={{ fontSize: 13, color: '#9AA3AF', padding: '8px 0' }}>데이터를 불러오는 중...</div>
        )}
        {!dataLoading && messages.length === 0 && (
          <div style={{ fontSize: 13, color: '#9AA3AF', padding: '8px 0' }}>브리핑 데이터가 없습니다.</div>
        )}
        {messages.map((msg, i) => <Bubble key={i} msg={msg}/>)}
        {sending && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <div style={{ flexShrink: 0, width: 26, height: 26, borderRadius: 8, background: 'var(--accent-soft)', display: 'grid', placeItems: 'center' }}>
              <Ic.Sparkle color="var(--accent-ink)"/>
            </div>
            <div style={{ background: '#F3F5F8', borderRadius: '14px 14px 14px 4px', padding: '9px 14px', display: 'flex', gap: 5, alignItems: 'center' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 6, height: 6, borderRadius: '50%', background: 'var(--muted-2)',
                  animation: `intro-bounce .7s ease-in-out ${i * 0.14}s infinite alternate`,
                }}/>
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* 입력 영역 */}
      <div style={{
        borderTop: '1px solid var(--line)',
        paddingTop: 10,
        display: 'flex',
        gap: 8,
        alignItems: 'flex-end',
      }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="데이터 기반으로 질문해보세요..."
          rows={1}
          style={{
            flex: 1,
            resize: 'none',
            border: '1px solid var(--line-2)',
            borderRadius: 10,
            padding: '8px 12px',
            fontSize: 13,
            lineHeight: 1.5,
            fontFamily: 'inherit',
            background: '#FAFBFC',
            color: 'var(--ink-2)',
            outline: 'none',
            maxHeight: 80,
            overflowY: 'auto',
          }}
        />
        <button
          onClick={send}
          disabled={!input.trim() || sending}
          style={{
            flexShrink: 0,
            width: 34,
            height: 34,
            borderRadius: 10,
            border: 'none',
            background: input.trim() && !sending ? 'var(--accent)' : 'var(--line-2)',
            color: '#fff',
            cursor: input.trim() && !sending ? 'pointer' : 'default',
            display: 'grid',
            placeItems: 'center',
            transition: 'background .15s',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
