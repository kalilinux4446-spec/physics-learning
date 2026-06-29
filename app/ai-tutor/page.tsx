"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { PHYSICS_BOOK } from "@/lib/physics-content";
import { chatWithAI } from "@/lib/nvidia-client";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const QUICK_QUESTIONS = [
  "ما هو قانون كولوم؟",
  "اشرح لي المجال الكهربائي",
  "ما الفرق بين الجهد والتيار؟",
  "اشرح ظاهرة الحث الكهرومغناطيسي",
  "ما هو التأثير الكهروضوئي؟",
  "كيف تعمل المكثفات؟",
];

export default function AITutorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "مرحباً! أنا معلمك الذكي لمادة الفيزياء 🤖\n\nأنا هنا لأساعدك في فهم أي مفهوم أو حل أي مسألة في منهج الصف الثاني ثانوي.\n\nيمكنك سؤالي عن:\n• شرح القوانين والمفاهيم\n• حل المسائل خطوة بخطوة\n• التطبيقات الحياتية للفيزياء\n• أي سؤال يخطر في بالك! 😊",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  async function sendMessage(content?: string) {
    const text = content ?? input.trim();
    if (!text || loading) return;
    setInput("");
    if (isMobile) setIsSidebarOpen(false);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, aiMsg]);

    try {
      const lessonCtx = selectedLesson
        ? PHYSICS_BOOK.flatMap(u => u.lessons).find(l => l.id === selectedLesson)
        : null;

      const lessonContext = lessonCtx
        ? `درس: ${lessonCtx.title}\n${lessonCtx.overview}\nالقوانين: ${lessonCtx.laws.map(l => `${l.name}: ${l.formula}`).join(", ")}`
        : undefined;

      const chatMessages = messages
        .filter(m => m.id !== "welcome")
        .map(m => ({ role: m.role as "user" | "assistant", content: m.content }))
        .concat({ role: "user" as const, content: text });

      const response = await chatWithAI(chatMessages, lessonContext);
      setMessages(prev =>
        prev.map(m => m.id === aiMsg.id ? { ...m, content: response } : m)
      );
    } catch {
      setMessages(prev =>
        prev.map(m => m.id === aiMsg.id ? { ...m, content: "⚠️ تعذر الاتصال. تأكد من إعداد مفتاح Nvidia API." } : m)
      );
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function clearChat() {
    setMessages([{
      id: "welcome",
      role: "assistant",
      content: "تمت مسح المحادثة. كيف يمكنني مساعدتك؟ 😊",
      timestamp: new Date(),
    }]);
  }

  return (
    <main style={{ display: "flex", height: "100vh", background: "var(--bg-primary)", overflow: "hidden", flexDirection: "row", position: "relative" }}>
      
      {/* Sidebar Backdrop */}
      {isMobile && isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 199,
          }}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: 280,
        background: "rgba(7,7,16,0.98)",
        borderLeft: "1px solid var(--border)",
        display: "flex", flexDirection: "column",
        padding: 20,
        flexShrink: 0,
        position: isMobile ? "fixed" : "relative",
        top: 0, bottom: 0,
        right: isMobile ? (isSidebarOpen ? 0 : -280) : 0,
        zIndex: 200,
        overflowY: "auto",
        transition: "right 0.3s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <Link href="/dashboard/student" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: 18 }}>←</Link>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--gradient-purple)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🤖</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 15 }}>المعلم الذكي</div>
            <div style={{ fontSize: 11, color: "var(--cyan-light)" }}>Gemini AI • متصل</div>
          </div>
          {isMobile && (
            <button
              onClick={() => setIsSidebarOpen(false)}
              style={{ background: "transparent", border: "none", color: "var(--text-muted)", fontSize: 20, cursor: "pointer" }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Context Selector */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 10 }}>سياق الدرس (اختياري)</div>
          <select
            value={selectedLesson}
            onChange={e => setSelectedLesson(e.target.value)}
            style={{
              width: "100%", padding: "10px 12px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              color: "var(--text-primary)",
              fontSize: 13, fontFamily: "Cairo, sans-serif",
              outline: "none",
            }}
          >
            <option value="">بدون سياق محدد</option>
            {PHYSICS_BOOK.map(unit => (
              <optgroup key={unit.id} label={unit.title}>
                {unit.lessons.map(lesson => (
                  <option key={lesson.id} value={lesson.id}>{lesson.title}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Quick Questions */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 10 }}>أسئلة سريعة ⚡</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {QUICK_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => sendMessage(q)}
                disabled={loading}
                style={{
                  padding: "9px 12px",
                  background: "rgba(124,58,237,0.08)",
                  border: "1px solid rgba(124,58,237,0.15)",
                  borderRadius: "var(--radius-sm)",
                  color: "var(--text-secondary)",
                  fontSize: 12, textAlign: "right", cursor: "pointer",
                  fontFamily: "Cairo, sans-serif",
                  transition: "all 0.2s",
                  opacity: loading ? 0.5 : 1,
                }}
                onMouseEnter={e => { if (!loading) { (e.target as HTMLElement).style.borderColor = "rgba(124,58,237,0.4)"; (e.target as HTMLElement).style.color = "var(--purple-light)"; }}}
                onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = "rgba(124,58,237,0.15)"; (e.target as HTMLElement).style.color = "var(--text-secondary)"; }}
              >
                💬 {q}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={clearChat}
          style={{
            marginTop: "auto", padding: "10px",
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: "var(--radius-sm)",
            color: "#fca5a5", fontSize: 13, cursor: "pointer",
            fontFamily: "Cairo, sans-serif",
          }}
        >
          🗑️ مسح المحادثة
        </button>
      </aside>

      {/* Chat Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Chat Header */}
        <div style={{
          padding: "16px 24px",
          borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "rgba(7,7,16,0.5)",
          gap: 12
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            {isMobile && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid var(--border)",
                  color: "white", padding: "6px 12px", borderRadius: 8,
                  cursor: "pointer", fontSize: 14,
                }}
              >
                الدروس 📚
              </button>
            )}
            <div style={{
              width: 10, height: 10, borderRadius: "50%",
              background: "#10b981",
              boxShadow: "0 0 8px #10b981",
              flexShrink: 0,
            }} />
            <span style={{ fontSize: 13, color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {selectedLesson
                ? `سياق: ${PHYSICS_BOOK.flatMap(u => u.lessons).find(l => l.id === selectedLesson)?.title}`
                : "محادثة حرة — بدون سياق"}
            </span>
          </div>
          <div className="badge badge-purple" style={{ fontSize: 11, whiteSpace: "nowrap" }}>🤖 Google Gemini 2.0 Flash</div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "16px" : "24px", display: "flex", flexDirection: "column", gap: 20 }}>
          {messages.map((msg) => (
            <div key={msg.id} style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-start" : "flex-end",
              gap: isMobile ? 8 : 12, alignItems: "flex-start",
            }}>
              {msg.role === "assistant" && (
                <div style={{ width: 32, height: 32, borderRadius: 10, background: "var(--gradient-purple)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>
                  🤖
                </div>
              )}
              <div style={{
                maxWidth: isMobile ? "85%" : "70%",
                padding: isMobile ? "10px 14px" : "14px 18px",
                borderRadius: msg.role === "user" ? "16px 16px 16px 4px" : "16px 16px 4px 16px",
                background: msg.role === "user"
                  ? "var(--gradient-purple)"
                  : "rgba(255,255,255,0.05)",
                border: msg.role === "assistant" ? "1px solid var(--border)" : "none",
                fontSize: 14, lineHeight: 1.7,
                color: "var(--text-primary)",
                whiteSpace: "pre-wrap",
              }}>
                {msg.content === "" && loading ? (
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    {[0,1,2].map(i => (
                      <div key={i} className="typing-dot" style={{ animationDelay: `${i * 0.2}s` }} />
                    ))}
                  </div>
                ) : msg.content}
              </div>
              {msg.role === "user" && (
                <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>
                  👤
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: isMobile ? "12px 16px" : "16px 24px",
          borderTop: "1px solid var(--border)",
          background: "rgba(7,7,16,0.5)",
        }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input
              ref={inputRef}
              id="ai-chat-input"
              type="text"
              className="input-field"
              placeholder="اكتب سؤالك هنا..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              disabled={loading}
              style={{ flex: 1, padding: "10px 12px", fontSize: 14 }}
            />
            <button
              id="ai-send-btn"
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="btn-primary"
              style={{
                padding: "10px 18px",
                opacity: (loading || !input.trim()) ? 0.5 : 1,
                flexShrink: 0,
                fontSize: 14
              }}
            >
              {loading ? "⏳" : "إرسال"}
            </button>
          </div>
          <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 6, textAlign: "center" }}>
            مدعوم بـ Google Gemini AI • يعمل بنموذج Gemini 2.0 Flash 🤖
          </p>
        </div>
      </div>
    </main>
  );
}
