import { useRef, useState, useEffect, useCallback } from 'react'
import AppLayout from '../components/layout/AppLayout'
import HamburgerButton from '../components/layout/HamburgerButton'
import { Ic } from '../components/ui/Icons'
import { streamVideoChunk, yoloStreamUrl, fetchLatestVisionData } from '../api'

const CHUNK_MS = 1500
const POLL_MS = 5000
const YOLO_REFRESH_MS = 1200

const GENDER_LABEL = { 1: '남성', 2: '여성' }
const AGE_LABEL = { 10: '10대', 20: '20대', 30: '30대', 40: '40대', 50: '50대 이상' }
const CAMERA_PERMISSION_LABEL = {
  granted: '허용됨',
  prompt: '권한 필요',
  denied: '차단됨',
  unsupported: '확인 불가',
}

export default function LiveStreamPage() {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const recorderRef = useRef(null)
  const mimeTypeRef = useRef('video/webm')
  const yoloVideoRef = useRef(null)
  const yoloRefreshTimersRef = useRef(new Set())

  const [isStreaming, setIsStreaming] = useState(false)
  const [chunkCount, setChunkCount] = useState(0)
  const [sendError, setSendError] = useState(false)
  const [error, setError] = useState(null)
  const [cameraPermission, setCameraPermission] = useState('prompt')

  const [visionData, setVisionData] = useState(null)
  const [flashKeys, setFlashKeys] = useState({})
  const prevDataRef = useRef(null)

  const pollVision = useCallback(async () => {
    try {
      const data = await fetchLatestVisionData()
      setVisionData(data)
      if (prevDataRef.current) {
        const changed = {}
        for (const key of Object.keys(data)) {
          if (data[key] !== prevDataRef.current[key]) changed[key] = true
        }
        if (Object.keys(changed).length > 0) {
          setFlashKeys(changed)
          setTimeout(() => setFlashKeys({}), 600)
        }
      }
      prevDataRef.current = data
    } catch {
      // 폴링 실패 무시
    }
  }, [])

  useEffect(() => {
    const firstPollId = setTimeout(pollVision, 0)
    const id = setInterval(pollVision, POLL_MS)
    return () => {
      clearTimeout(firstPollId)
      clearInterval(id)
    }
  }, [pollVision])

  const refreshYoloVideo = useCallback((delay = 0) => {
    const updateSource = () => {
      if (!streamRef.current) return
      const v = yoloVideoRef.current
      if (!v) return
      v.src = `${yoloStreamUrl()}?t=${Date.now()}`
      v.load()
      v.play().catch(() => {})
    }

    if (delay > 0) {
      const timer = window.setTimeout(() => {
        yoloRefreshTimersRef.current.delete(timer)
        updateSource()
      }, delay)
      yoloRefreshTimersRef.current.add(timer)
      return
    }

    updateSource()
  }, [])

  useEffect(() => {
    if (!isStreaming) return undefined

    refreshYoloVideo()
    const id = window.setInterval(refreshYoloVideo, YOLO_REFRESH_MS)
    return () => window.clearInterval(id)
  }, [isStreaming, refreshYoloVideo])

  useEffect(() => () => {
    yoloRefreshTimersRef.current.forEach(timer => window.clearTimeout(timer))
    yoloRefreshTimersRef.current.clear()
  }, [])

  useEffect(() => {
    if (isStreaming) return
    const v = yoloVideoRef.current
    if (v) {
      v.removeAttribute('src')
      v.load()
    }
  }, [isStreaming])

  function recordNextChunk() {
    const stream = streamRef.current
    if (!stream) return
    const recorder = new MediaRecorder(stream, { mimeType: mimeTypeRef.current })
    recorderRef.current = recorder
    const parts = []
    const createdAt = new Date().toISOString()
    recorder.ondataavailable = (e) => { if (e.data.size > 0) parts.push(e.data) }
    recorder.onstop = () => {
      if (streamRef.current) recordNextChunk()
      if (parts.length === 0) return
      const blob = new Blob(parts, { type: mimeTypeRef.current })
      setChunkCount(c => c + 1)
      streamVideoChunk(blob, createdAt)
        .then(() => {
          setSendError(false)
          refreshYoloVideo(250)
          refreshYoloVideo(800)
        })
        .catch(() => setSendError(true))
    }
    recorder.start()
    setTimeout(() => { if (recorder.state !== 'inactive') recorder.stop() }, CHUNK_MS)
  }

  async function startStream() {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      })
      setCameraPermission('granted')
      streamRef.current = stream
      videoRef.current.srcObject = stream

      if (!window.MediaRecorder) {
        stream.getTracks().forEach(track => track.stop())
        streamRef.current = null
        if (videoRef.current) videoRef.current.srcObject = null
        setError('이 브라우저는 영상 녹화 기능을 지원하지 않습니다. Chrome, Edge, Safari 최신 버전으로 접속해주세요.')
        return
      }

      mimeTypeRef.current = MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')
        ? 'video/mp4;codecs=avc1'
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp8')
          ? 'video/webm;codecs=vp8'
          : 'video/webm'
      setIsStreaming(true)
      recordNextChunk()
    } catch {
      setCameraPermission('denied')
      setError('카메라 권한이 차단되어 있습니다. 브라우저 설정에서 카메라를 허용해주세요.')
    }
  }

  function stopStream() {
    const stream = streamRef.current
    const recorder = recorderRef.current
    recorderRef.current = null
    streamRef.current = null
    yoloRefreshTimersRef.current.forEach(timer => window.clearTimeout(timer))
    yoloRefreshTimersRef.current.clear()
    if (recorder && recorder.state !== 'inactive') recorder.stop()
    stream?.getTracks().forEach(t => t.stop())
    if (videoRef.current) videoRef.current.srcObject = null
    setIsStreaming(false)
  }

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    recorderRef.current?.stop()
  }, [])

  const d = visionData
  const flashStyle = (key) => flashKeys[key]
    ? { transition: 'color .1s', color: 'var(--accent)' }
    : { transition: 'color .4s' }

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
        <div className="card">
          <div className="card-b" style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'oklch(0.94 0.03 235)', color: 'var(--accent)', display: 'grid', placeItems: 'center' }}>
                <Ic.Camera style={{ width: 20, height: 20 }} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>카메라 권한</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>
                  라이브 분석을 시작하려면 이 페이지에서 카메라 접근을 허용해야 합니다.
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                className="chip"
                style={cameraPermission === 'denied'
                  ? { background: 'var(--bad-soft)', color: 'oklch(0.45 0.16 25)', borderColor: 'oklch(0.88 0.08 25)' }
                  : cameraPermission === 'granted'
                    ? { background: 'oklch(0.94 0.05 155)', color: 'oklch(0.42 0.12 155)', borderColor: 'oklch(0.86 0.08 155)' }
                    : {}}
              >
                {CAMERA_PERMISSION_LABEL[cameraPermission] ?? '확인 불가'}
              </span>
              {!isStreaming && cameraPermission !== 'granted' && (
                <button
                  type="button"
                  onClick={startStream}
                  style={{
                    height: 38, padding: '0 14px', borderRadius: 10, border: 'none',
                    background: 'var(--accent)', color: '#fff', fontSize: 13,
                    fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
                  }}
                >
                  권한 허용
                </button>
              )}
            </div>
          </div>
        </div>

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
            <div style={{ background: '#0F1419', minHeight: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <video ref={videoRef} autoPlay muted playsInline
                style={{ width: '100%', maxHeight: 360, display: isStreaming ? 'block' : 'none', objectFit: 'cover' }} />
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
            <div style={{ background: '#0F1419', minHeight: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <video ref={yoloVideoRef} autoPlay muted playsInline
                style={{ width: '100%', maxHeight: 360, display: isStreaming ? 'block' : 'none', objectFit: 'cover' }} />
              {!isStreaming && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, color: '#fff' }}>
                  <Ic.Camera style={{ width: 44, height: 44, opacity: 0.25 }} />
                  <span style={{ fontSize: 13, opacity: 0.4 }}>스트리밍 시작 시 YOLO 분석 영상이 표시됩니다</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-h">
            <Ic.Chart />
            <h3>실시간 분석 데이터</h3>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--muted)' }}>
              {d ? `${new Date(d.createdAt).toLocaleTimeString('ko-KR')} 기준 · 5초마다 갱신` : '로딩 중...'}
            </span>
          </div>
          <div className="card-b" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px 32px' }}>
            {[
              { label: '총 방문자', key: 'totalCount', unit: '명' },
              { label: '평균 체류 시간', key: 'avgDwellTime', unit: '분' },
              { label: '방금 떠난 인원', key: 'justLeftCount', unit: '명' },
              { label: '최대 응답 대기', key: 'maxResponseWaitTime', unit: '분' },
              { label: '최대 빈 테이블', key: 'maxEmptyTableTime', unit: '분' },
              { label: '핵심 고객 연령', key: 'coreCustomerAge', unit: '', format: v => AGE_LABEL[v] ?? `${v}대` },
              { label: '핵심 고객 성별', key: 'coreCustomerGender', unit: '', format: v => GENDER_LABEL[v] ?? '-' },
              { label: '기온', key: 'temperature', unit: '°C' },
            ].map(({ label, key, unit, format }) => (
              <div key={key}>
                <div style={{ fontSize: 11.5, color: 'var(--muted)', marginBottom: 6 }}>{label}</div>
                <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', ...flashStyle(key) }}>
                  {d
                    ? <>{format ? format(d[key]) : (d[key] ?? '-')}<span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500, marginLeft: 3 }}>{unit}</span></>
                    : <span style={{ color: 'var(--muted-2)' }}>-</span>
                  }
                </div>
              </div>
            ))}
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
              padding: '0 28px', borderRadius: 12, border: 'none',
              background: isStreaming ? 'var(--bad)' : 'var(--accent)',
              color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'inherit', whiteSpace: 'nowrap', transition: 'opacity .15s',
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
