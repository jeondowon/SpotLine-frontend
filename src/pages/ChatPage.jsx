import { useState, useRef, useEffect, useCallback } from "react";
import Sidebar from "../components/layout/Sidebar";
import { Ic } from "../components/ui/Icons";
import "../styles/chat.css";

const OLLAMA_URL = import.meta.env.VITE_OLLAMA_URL ?? "/ollama/api/chat";
const MODEL = "gemma4:e4b-it-q4_K_M";

const SYSTEM_PROMPT = `당신은 SpotLine의 매장 분석 전문 컨설턴트입니다. 절대로 자신을 AI나 인공지능이라고 밝히지 마세요. 당신은 10년 이상 리테일 데이터 분석 경력을 가진 실무 전문가처럼 대화하세요.

SpotLine은 매장 방문자 분석 플랫폼으로, CCTV 영상을 분석하여 매장 방문자 수, 체류 시간, 피크 시간대, 요일별 패턴, 날씨 영향 등 인사이트를 제공합니다.

주요 기능:
- 실시간 매장 방문자 수 모니터링
- 시간대별/요일별 방문 추세 분석
- 날씨와 방문자 상관관계 분석
- 내일/다음 주 방문자 예측
- 핵심 고객층 프로파일링
- 마케팅 전략 추천

중요한 규칙:
1. 반드시 한국어로 답변합니다.
2. 실무 전문가처럼 자연스럽고 편안한 말투로 답변하세요. 예: "제 경험상...", "보통 이런 경우에는...", "데이터를 보면..."
3. 절대로 마크다운 서식을 사용하지 마세요. **, ***, ###, ---, \`\`\` 등의 기호를 쓰지 마세요.
4. 목록은 "1. 2. 3." 또는 "- " 대신 자연스러운 문장으로 풀어서 설명하세요.
5. 딱딱한 보고서 형식이 아닌, 동료에게 설명하듯 대화체로 답변하세요.`;

// Strip any residual markdown formatting from LLM output
function stripMarkdown(text) {
  return text
    .replace(/^#{1,6}\s+/gm, "") // ### headings
    .replace(/\*{2,3}([^*]+)\*{2,3}/g, "$1") // **bold** / ***bold italic***
    .replace(/\*([^*]+)\*/g, "$1") // *italic*
    .replace(/__([^_]+)__/g, "$1") // __bold__
    .replace(/_([^_]+)_/g, "$1") // _italic_
    .replace(/^---+$/gm, "") // horizontal rules
    .replace(/^\*\*\*+$/gm, "") // *** rules
    .replace(/```[\s\S]*?```/g, (m) => m.replace(/```\w*\n?/g, "").trim()) // code blocks
    .replace(/`([^`]+)`/g, "$1") // inline code
    .replace(/\n{3,}/g, "\n\n") // excessive newlines
    .trim();
}

const SUGGESTIONS = [
  "오늘 매장 방문자 현황을 알려줘",
  "피크 시간대는 언제야?",
  "날씨가 매출에 미치는 영향은?",
  "마케팅 전략을 추천해줘",
];

const TIPS = [
  "💡 피크 시간대를 파악하면 인력 배치 효율이 크게 올라가요",
  "📊 날씨 영향 분석으로 방문 부진의 진짜 원인을 찾을 수 있어요",
  "📅 요일별 패턴 분석으로 최적 영업 전략을 세워보세요",
  "🎯 방문자 성별·연령 데이터로 맞춤 프로모션을 기획해보세요",
  "🔮 AI 예측 기능으로 다음 주 방문자를 미리 준비하세요",
  "📈 대시보드에서 주간 트렌드를 한눈에 확인할 수 있어요",
];

function formatTime(date) {
  return date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [tipIndex, setTipIndex] = useState(0);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // Rotate tips every 4s while loading
  useEffect(() => {
    if (!isLoading) return;
    setTipIndex(0);
    const iv = setInterval(
      () => setTipIndex((i) => (i + 1) % TIPS.length),
      4000,
    );
    return () => clearInterval(iv);
  }, [isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
    }
  }, [input]);

  // Health check
  useEffect(() => {
    let cancelled = false;
    async function check() {
      try {
        const res = await fetch(OLLAMA_URL.replace("/api/chat", "/api/tags"), {
          method: "GET",
          signal: AbortSignal.timeout(5000),
        });
        if (!cancelled) setIsOnline(res.ok);
      } catch {
        if (!cancelled) setIsOnline(false);
      }
    }
    check();
    const iv = setInterval(check, 30000);
    return () => {
      cancelled = true;
      clearInterval(iv);
    };
  }, []);

  const sendMessage = async (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed || isLoading) return;

    const userMsg = {
      role: "user",
      content: trimmed,
      time: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Build the messages array for Ollama
    const ollamaMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: trimmed },
    ];

    try {
      const res = await fetch(OLLAMA_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: MODEL,
          messages: ollamaMessages,
          stream: false,
        }),
      });

      if (!res.ok) throw new Error(`API ${res.status}`);

      const data = await res.json();
      const botMsg = {
        role: "assistant",
        content: data.message?.content || "응답을 생성하지 못했습니다.",
        time: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsOnline(true);
    } catch (err) {
      console.error("Ollama API error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "error",
          content: `서버 연결에 실패했습니다. 올라마 서버가 실행 중인지 확인해주세요.\n(${err.message})`,
          time: new Date(),
        },
      ]);
      setIsOnline(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="app">
      <Sidebar />
      <main className="main">
        {/* Header */}
        <header className="hdr">
          <div>
            <div className="hdr-title">SpotLine AI 챗봇</div>
            <div className="hdr-sub">
              매장 인사이트에 대해 무엇이든 물어보세요
            </div>
          </div>
          <div className="hdr-right">
            <div className="chat-context-badge">
              <Ic.Bot />
              <span>gemma 4</span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                color: isOnline ? "var(--good)" : "var(--bad)",
                fontWeight: 600,
              }}
            >
              <span
                className={"chat-status-dot" + (isOnline ? "" : " offline")}
              />
              {isOnline ? "온라인" : "오프라인"}
            </div>
          </div>
        </header>

        {/* Chat Content */}
        <div className="chat-content">
          {!hasMessages ? (
            /* ── Welcome Screen ── */
            <div className="chat-welcome">
              <div className="chat-welcome-icon">
                <Ic.Bot style={{ width: 28, height: 28 }} />
              </div>
              <h2>SpotLine AI에게 물어보세요</h2>
              <p>
                매장 방문자 현황, 트렌드 분석, 마케팅 전략 등<br />
                궁금한 점을 자유롭게 질문해보세요.
              </p>
              <div className="chat-suggestions">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    className="chat-suggestion-chip"
                    onClick={() => sendMessage(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* ── Messages ── */
            <div className="chat-messages">
              {messages.map((msg, i) => {
                if (msg.role === "error") {
                  return (
                    <div key={i} className="chat-error">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      {msg.content}
                    </div>
                  );
                }

                const isUser = msg.role === "user";
                return (
                  <div
                    key={i}
                    className={`chat-msg ${isUser ? "user" : "bot"}`}
                  >
                    <div className="chat-msg-avatar">
                      {isUser ? (
                        "U"
                      ) : (
                        <Ic.Bot style={{ width: 16, height: 16 }} />
                      )}
                    </div>
                    <div className="chat-msg-body">
                      <div className="chat-msg-name">
                        {isUser ? "나" : "SpotLine AI"}
                      </div>
                      <div className="chat-msg-bubble">
                        {isUser ? msg.content : stripMarkdown(msg.content)}
                      </div>
                      <div className="chat-msg-time">
                        {formatTime(msg.time)}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isLoading && (
                <div className="chat-typing">
                  <div
                    className="chat-msg-avatar"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--accent) 0%, oklch(0.55 0.16 265) 100%)",
                      color: "#fff",
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      display: "grid",
                      placeItems: "center",
                      boxShadow: "0 2px 8px -2px oklch(0.55 0.16 265 / 0.3)",
                    }}
                  >
                    <Ic.Bot style={{ width: 16, height: 16 }} />
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 4 }}
                  >
                    <div className="chat-thinking-label">
                      gemma4 is thinking...
                    </div>
                    <div key={tipIndex} className="chat-tip">
                      {TIPS[tipIndex]}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* ── Input ── */}
          <div className="chat-input-area">
            <div className="chat-input-wrapper">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="메시지를 입력하세요... (Shift+Enter로 줄바꿈)"
                rows={1}
                disabled={isLoading}
              />
              <button
                className="chat-send-btn"
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                aria-label="전송"
              >
                <Ic.Send />
              </button>
            </div>
            <div className="chat-status">
              <span
                className={"chat-status-dot" + (isOnline ? "" : " offline")}
              />
              <span>
                {isOnline ? "Ollama 서버 연결됨" : "서버 연결 확인 중..."}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
