import { useRef, useState, useEffect } from 'react'
import Sidebar from '../components/layout/Sidebar'
import { Ic } from '../components/ui/Icons'
import { streamVideoChunk } from '../api'

export default function LiveStreamPage() {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const recorderRef = useRef(null)
  const chunkStartRef = useRef(null)

  const [isStreaming, setIsStreaming] = useState(false)
  const [chunkCount, setChunkCount] = useState(0)
  const [sendError, setSendError] = useState(false)
  const [error, setError] = useState(null)

  async function startStream() {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      streamRef.current = stream
      videoRef.current.srcObject = stream

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp8')
        ? 'video/webm;codecs=vp8'
        : 'video/webm'
      const recorder = new MediaRecorder(stream, { mimeType })
      recorderRef.current = recorder

      chunkStartRef.current = new Date()

      recorder.ondataavailable = async (e) => {
        if (e.data.size === 0) return
        const createdAt = chunkStartRef.current.toISOString()
        chunkStartRef.current = new Date()
        setChunkCount(c => c + 1)
        try {
          await streamVideoChunk(e.data, createdAt)
          setSendError(false)
        } catch {
          setSendError(true)
        }
      }

      recorder.start(1500)
      setIsStreaming(true)
    } catch {
      setError('카메라 접근 권한이 필요합니다. 브라우저 설정에서 카메라를 허용해주세요.')
    }
  }

  function stopStream() {
    recorderRef.current?.stop()
    streamRef.current?.getTracks().forEach(t => t.stop())
    recorderRef.current = null
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setIsStreaming(false)
  }

  useEffect(() => () => {
    recorderRef.current?.stop()
    streamRef.current?.getTracks().forEach(t => t.stop())
  }, [])

  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <div className="hdr">
          <div>
            <div className="hdr-title">라이브 분석</div>
            <div className="hdr-sub">실시간 YOLO 영상 분석 데모</div>
          </div>
          {isStreaming && (
            <div className="live-pill" style={{ marginLeft: 'auto' }}>
              <div className="live-dot" />
              스트리밍 중
            </div>
          )}
        </div>

        <div className="content">
          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="card-h">
              <Ic.Camera />
              <h3>카메라 피드</h3>
              {isStreaming && (
                <div className="right" style={{ marginLeft: 'auto' }}>
                  <span className="chip dot" style={sendError ? { background: 'var(--bad-soft)', color: 'oklch(0.45 0.16 25)', borderColor: 'oklch(0.88 0.08 25)' } : {}}>
                    {sendError ? '전송 실패' : '백엔드 전송 중'}
                  </span>
                </div>
              )}
            </div>
            <div style={{ background: '#0F1419', minHeight: 420, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                style={{ width: '100%', maxHeight: 480, display: isStreaming ? 'block' : 'none', objectFit: 'cover' }}
              />
              {!isStreaming && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, color: '#fff' }}>
                  <Ic.Camera style={{ width: 44, height: 44, opacity: 0.25 }} />
                  <span style={{ fontSize: 13, opacity: 0.4 }}>스트리밍 시작 버튼을 눌러주세요</span>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 14, alignItems: 'stretch' }}>
            <div className="card" style={{ flex: 1 }}>
              <div className="card-b" style={{ display: 'flex', gap: 32 }}>
                <div>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)', marginBottom: 6 }}>전송된 청크</div>
                  <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>{chunkCount}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)', marginBottom: 6 }}>청크 간격</div>
                  <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>
                    1.5<span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500, marginLeft: 4 }}>초</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)', marginBottom: 6 }}>상태</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: isStreaming ? 'oklch(0.42 0.12 155)' : 'var(--muted-2)' }}>
                    {isStreaming ? '스트리밍 중' : '대기'}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={isStreaming ? stopStream : startStream}
              style={{
                padding: '0 28px',
                borderRadius: 12,
                border: 'none',
                background: isStreaming ? 'var(--bad)' : 'var(--accent)',
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                whiteSpace: 'nowrap',
                transition: 'opacity .15s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              {isStreaming ? '중지' : '스트리밍 시작'}
            </button>
          </div>

          {error && (
            <div style={{ padding: '12px 14px', background: 'var(--bad-soft)', color: 'oklch(0.45 0.16 25)', borderRadius: 10, fontSize: 13 }}>
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
