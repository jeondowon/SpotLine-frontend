import { useState, useRef, useEffect } from 'react'
import { Ic } from '../ui/Icons'
import { buildSystemPrompt, streamChat } from '../../api/gemini'

export default function ChatPanel({ videoData, feedback }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const abortRef = useRef(null)

  const msgCount = messages.length
  useEffect(() => {
    if (open && msgCount === 0) {
      const hasData = !!videoData
      setMessages([{
        role: 'assistant',
        content: hasData
          ? `안녕하세요! 분석된 매장 데이터를 바탕으로 질문해 주세요. 예를 들어 "전환율을 높이려면?", "혼잡도가 높을 때 어떻게 해야 해?" 같은 질문도 좋아요.`
          : '안녕하세요! 매장 데이터에 대해 무엇이든 질문해 주세요.',
      }])
    }
  }, [open, msgCount, videoData])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  async function send() {
    const text = input.trim()
    if (!text || streaming) return

    setInput('')
    const history = [...messages, { role: 'user', content: text }]
    setMessages(history)
    setStreaming(true)

    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ VITE_GEMINI_API_KEY가 .env에 설정되지 않았습니다.' }])
      setStreaming(false)
      return
    }

    const controller = new AbortController()
    abortRef.current = controller
    const systemPrompt = buildSystemPrompt(videoData, feedback)

    try {
      setMessages(prev => [...prev, { role: 'assistant', content: '' }])
      for await (const chunk of streamChat(history, systemPrompt)) {
        if (controller.signal.aborted) break
        setMessages(prev => {
          const last = prev[prev.length - 1]
          if (last?.role === 'assistant') {
            return [...prev.slice(0, -1), { role: 'assistant', content: last.content + chunk }]
          }
          return prev
        })
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setMessages(prev => {
          const last = prev[prev.length - 1]
          if (last?.role === 'assistant' && last.content === '') {
            return [...prev.slice(0, -1), { role: 'assistant', content: `오류: ${err.message}` }]
          }
          return prev
        })
      }
    } finally {
      setStreaming(false)
      abortRef.current = null
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  function close() {
    abortRef.current?.abort()
    setOpen(false)
  }

  return (
    <>
      {open && (
        <div style={{
          position: 'fixed', bottom: 88, right: 24, zIndex: 100,
          width: 380, height: 520,
          background: '#fff', borderRadius: 16,
          border: '1px solid var(--line)',
          boxShadow: '0 8px 40px rgba(15,20,25,.14), 0 0 0 1px rgba(15,20,25,.04)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          <div style={{
            padding: '14px 16px', borderBottom: '1px solid var(--line)',
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'linear-gradient(135deg, oklch(0.97 0.02 250), oklch(0.96 0.03 285))',
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'oklch(0.93 0.05 265)', display: 'grid', placeItems: 'center',
              border: '1px solid oklch(0.89 0.06 265)',
            }}>
              <Ic.Sparkle color="oklch(0.50 0.16 265)"/>
            </div>
            <div style={{flex: 1}}>
              <div style={{fontSize: 13, fontWeight: 700, color: 'oklch(0.30 0.10 265)'}}>AI 매장 어시스턴트</div>
              <div style={{fontSize: 10.5, color: 'oklch(0.50 0.10 265)'}}>
                {videoData ? '실시간 데이터 기반' : '일반 질의 모드'}
              </div>
            </div>
            <button onClick={close} style={{
              all: 'unset', width: 26, height: 26, borderRadius: 7,
              display: 'grid', placeItems: 'center', color: 'oklch(0.50 0.10 265)',
              cursor: 'default',
            }}>✕</button>
          </div>

          <div style={{flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10}}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '82%', padding: '9px 12px',
                  borderRadius: m.role === 'user' ? '12px 12px 3px 12px' : '12px 12px 12px 3px',
                  background: m.role === 'user' ? 'var(--accent)' : '#F3F5F8',
                  color: m.role === 'user' ? '#fff' : 'var(--ink)',
                  fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap',
                }}>
                  {m.content || (
                    <span style={{display: 'flex', gap: 3, alignItems: 'center', padding: '2px 0'}}>
                      {[0, 1, 2].map(j => (
                        <span key={j} style={{
                          width: 5, height: 5, borderRadius: '50%', background: 'var(--muted-2)',
                          animation: `dot-blink 1.2s ${j * 0.2}s infinite`,
                        }}/>
                      ))}
                    </span>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef}/>
          </div>

          <div style={{
            padding: '10px 12px', borderTop: '1px solid var(--line)',
            display: 'flex', gap: 8, alignItems: 'flex-end',
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="질문을 입력하세요..."
              rows={1}
              style={{
                flex: 1, resize: 'none', border: '1px solid var(--line-2)',
                borderRadius: 10, padding: '8px 11px', fontSize: 13,
                fontFamily: 'inherit', outline: 'none', lineHeight: 1.5,
                maxHeight: 96, overflowY: 'auto', background: '#FAFBFD',
                color: 'var(--ink)',
              }}
            />
            <button onClick={send} disabled={!input.trim() || streaming} style={{
              all: 'unset', width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: input.trim() && !streaming ? 'var(--accent)' : 'var(--line)',
              display: 'grid', placeItems: 'center', cursor: 'default',
              transition: 'background 0.15s',
            }}>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M1 7.5h13M8 1.5l6 6-6 6" stroke={input.trim() && !streaming ? '#fff' : '#9AA3AF'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      <button onClick={() => setOpen(v => !v)} style={{
        all: 'unset',
        position: 'fixed', bottom: 24, right: 24, zIndex: 100,
        width: 52, height: 52, borderRadius: '50%',
        background: open
          ? '#fff'
          : 'linear-gradient(135deg, oklch(0.55 0.16 265), oklch(0.50 0.18 280))',
        border: open ? '1px solid var(--line)' : 'none',
        boxShadow: '0 4px 20px rgba(15,20,25,.18)',
        display: 'grid', placeItems: 'center', cursor: 'default',
        transition: 'transform 0.15s',
      }}>
        {open
          ? <span style={{fontSize: 18, color: 'var(--muted)'}}>✕</span>
          : <Ic.Sparkle color="#fff"/>
        }
      </button>

      <style>{`
        @keyframes dot-blink {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  )
}
