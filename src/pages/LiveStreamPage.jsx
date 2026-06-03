import { useRef, useState, useEffect } from 'react'
import AppLayout from '../components/layout/AppLayout'
import HamburgerButton from '../components/layout/HamburgerButton'
import { Ic } from '../components/ui/Icons'
import { streamVideoChunk, fetchYoloStream } from '../api'

// 업로드 클립 길이(ms). 각 구간을 timeslice 조각이 아니라 독립적으로 디코딩 가능한
// 완결 파일로 녹화하기 위해 매 구간마다 MediaRecorder를 stop/start 한다.
const CHUNK_MS = 1500

export default function LiveStreamPage() {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const recorderRef = useRef(null)
  const mimeTypeRef = useRef('video/webm')

  const yoloVideoRef = useRef(null)
  const yoloAbortRef = useRef(null)

  const [isStreaming, setIsStreaming] = useState(false)
  const [chunkCount, setChunkCount] = useState(0)
  const [sendError, setSendError] = useState(false)
  const [error, setError] = useState(null)

  async function startYoloStream() {
    const ms = new MediaSource()
    const objectUrl = URL.createObjectURL(ms)
    yoloVideoRef.current.src = objectUrl

    const abort = new AbortController()
    yoloAbortRef.current = abort

    ms.addEventListener('sourceopen', async () => {
      const mimeType = MediaSource.isTypeSupported('video/webm;codecs=vp8')
        ? 'video/webm;codecs=vp8'
        : 'video/webm'
      const sb = ms.addSourceBuffer(mimeType)
      const queue = []

      sb.addEventListener('updateend', () => {
        if (queue.length > 0 && !sb.updating) sb.appendBuffer(queue.shift())
      })

      try {
        const res = await fetchYoloStream(abort.signal)
        const reader = res.body.getReader()
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          if (sb.updating || queue.length > 0) queue.push(value)
          else sb.appendBuffer(value)
        }
      } catch (e) {
        if (e.name !== 'AbortError') console.error('YOLO stream error', e)
      } finally {
        URL.revokeObjectURL(objectUrl)
      }
    })
  }

  function stopYoloStream() {
    yoloAbortRef.current?.abort()
    yoloAbortRef.current = null
    if (yoloVideoRef.current) yoloVideoRef.current.src = ''
  }

  // 한 구간을 완결된 클립으로 녹화 → 업로드 → 다음 구간 녹화 시작.
  // stop() 시 생성되는 파일은 자체 헤더(moov)와 시작 키프레임을 포함하므로
  // 서버에서 단독으로 디코딩된다. (timeslice 조각은 첫 조각 외엔 헤더가 없어 디코딩 불가)
  function recordNextChunk() {
    const stream = streamRef.current
    if (!stream) return

    const recorder = new MediaRecorder(stream, { mimeType: mimeTypeRef.current })
    recorderRef.current = recorder
    const parts = []
    const createdAt = new Date().toISOString()

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) parts.push(e.data)
    }

    recorder.onstop = () => {
      // 프레임 공백을 최소화하기 위해 다음 클립을 즉시 시작
      if (streamRef.current) recordNextChunk()

      if (parts.length === 0) return
      const blob = new Blob(parts, { type: mimeTypeRef.current })
      setChunkCount(c => c + 1)
      streamVideoChunk(blob, createdAt)
        .then(() => setSendError(false))
        .catch(() => setSendError(true))
    }

    recorder.start() // timeslice 미사용 — stop() 시 완결된 단일 파일 생성
    setTimeout(() => {
      if (recorder.state !== 'inactive') recorder.stop()
    }, CHUNK_MS)
  }

  async function startStream() {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      streamRef.current = stream
      videoRef.current.srcObject = stream

      mimeTypeRef.current = MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')
        ? 'video/mp4;codecs=avc1'
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp8')
          ? 'video/webm;codecs=vp8'
          : 'video/webm'

      setIsStreaming(true)
      recordNextChunk()
      startYoloStream()
    } catch {
      setError('카메라 접근 권한이 필요합니다. 브라우저 설정에서 카메라를 허용해주세요.')
    }
  }

  function stopStream() {
    const stream = streamRef.current
    const recorder = recorderRef.current
    recorderRef.current = null
    streamRef.current = null // onstop에서 streamRef가 null이라 다음 클립이 녹화되지 않음
    if (recorder && recorder.state !== 'inactive') recorder.stop() // 마지막 클립 flush + 업로드
    stream?.getTracks().forEach(t => t.stop())
    if (videoRef.current) videoRef.current.srcObject = null
    stopYoloStream()
    setIsStreaming(false)
  }

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    recorderRef.current?.stop()
    stopYoloStream()
  }, [])

  return (
    <AppLayout>
        <div className="hdr">
          <div>
            <div className="hdr-title">라이브 분석</div>
            <div className="hdr-sub">실시간 YOLO 영상 분석 데모</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            {isStreaming && (
              <div className="live-pill">
                <div className="live-dot" />
                스트리밍 중
              </div>
            )}
            <HamburgerButton />
          </div>
        </div>

        <div className="content">
          <div style={{ display: 'flex', gap: 16 }}>
            <div className="card" style={{ flex: 1, overflow: 'hidden' }}>
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
              <div style={{ background: '#0F1419', minHeight: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  style={{ width: '100%', maxHeight: 360, display: isStreaming ? 'block' : 'none', objectFit: 'cover' }}
                />
                {!isStreaming && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, color: '#fff' }}>
                    <Ic.Camera style={{ width: 44, height: 44, opacity: 0.25 }} />
                    <span style={{ fontSize: 13, opacity: 0.4 }}>스트리밍 시작 버튼을 눌러주세요</span>
                  </div>
                )}
              </div>
            </div>

            <div className="card" style={{ flex: 1, overflow: 'hidden' }}>
              <div className="card-h">
                <Ic.Camera />
                <h3>YOLO 분석 영상</h3>
                {isStreaming && (
                  <div className="right" style={{ marginLeft: 'auto' }}>
                    <span className="chip dot">분석 중</span>
                  </div>
                )}
              </div>
              <div style={{ background: '#0F1419', minHeight: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <video
                  ref={yoloVideoRef}
                  autoPlay
                  muted
                  playsInline
                  style={{ width: '100%', maxHeight: 360, display: isStreaming ? 'block' : 'none', objectFit: 'cover' }}
                />
                {!isStreaming && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, color: '#fff' }}>
                    <Ic.Camera style={{ width: 44, height: 44, opacity: 0.25 }} />
                    <span style={{ fontSize: 13, opacity: 0.4 }}>스트리밍 시작 시 YOLO 분석 영상이 표시됩니다</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="live-action-row">
            <div className="card" style={{ flex: 1 }}>
              <div className="card-b" style={{ display: 'flex', gap: 32, justifyContent: 'space-between' }}>
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
              className="live-action-btn"
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
    </AppLayout>
  )
}
