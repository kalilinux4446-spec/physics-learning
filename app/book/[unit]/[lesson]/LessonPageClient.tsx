"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getLessonById, getUnitById } from "@/lib/physics-content";
import { chatWithAI } from "@/lib/nvidia-client";

export default function LessonPageClient({ unitId, lessonId }: { unitId: string; lessonId: string }) {
  const lesson = getLessonById(lessonId);
  const unit = getUnitById(unitId);
  const [activeTab, setActiveTab] = useState<"overview" | "laws" | "examples" | "activity">("overview");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState("");
  const [expandedExample, setExpandedExample] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!lesson || !unit) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "var(--bg-primary)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
          <h2>الدرس غير موجود</h2>
          <Link href="/book" style={{ color: "var(--purple-light)" }}>← العودة للكتاب</Link>
        </div>
      </div>
    );
  }

  async function askAI(question: string) {
    setAiLoading(true);
    setAiExplanation("");
    try {
      const lessonCtx = `درس: ${lesson!.title}\n${lesson!.overview}\nالقوانين: ${lesson!.laws.map(l => l.formula).join(", ")}`;
      const response = await chatWithAI(
        [{ role: "user", content: question }],
        lessonCtx
      );
      setAiExplanation(response);
    } catch {
      setAiExplanation("عذراً، تعذر الاتصال بالذكاء الاصطناعي.");
    } finally {
      setAiLoading(false);
    }
  }

  const tabs = [
    { id: "overview", label: "الشرح", icon: "📖" },
    { id: "laws", label: `القوانين (${lesson.laws.length})`, icon: "⚖️" },
    { id: "examples", label: `الأمثلة (${lesson.examples.length})`, icon: "✏️" },
    { id: "activity", label: `الأنشطة (${lesson.activities.length})`, icon: "🧪" },
  ] as const;

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      {/* Top Bar */}
      <div style={{
        background: "rgba(7,7,16,0.9)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)",
        padding: isMobile ? "12px 16px" : "16px 32px",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "stretch" : "center",
        gap: 12,
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
          <Link href={`/book/${unitId}`} style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: 20 }}>←</Link>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {unit.icon} {unit.title}
            </div>
            <h1 style={{ fontSize: isMobile ? 15 : 18, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{lesson.title}</h1>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: isMobile ? "flex-end" : "flex-start" }}>
          {lesson.activities[0]?.labId && (
            <Link href={`/lab/${lesson.activities[0].labId}`} style={{
              flex: isMobile ? 1 : "none", textAlign: "center",
              padding: "8px 14px", background: "rgba(6,182,212,0.15)",
              border: "1px solid rgba(6,182,212,0.3)", color: "var(--cyan-light)",
              borderRadius: "var(--radius-sm)", textDecoration: "none", fontSize: 12, fontWeight: 600,
            }}>
              🧪 افتح المعمل
            </Link>
          )}
          <Link href={`/quiz?lesson=${lessonId}`} style={{
            flex: isMobile ? 1 : "none", textAlign: "center",
            padding: "8px 14px", background: "var(--gradient-purple)",
            color: "white", borderRadius: "var(--radius-sm)",
            textDecoration: "none", fontSize: 12, fontWeight: 600,
          }}>
            📝 اختبار
          </Link>
        </div>
      </div>

      <div style={{
        maxWidth: 1000,
        margin: "0 auto",
        padding: isMobile ? "20px 16px" : "40px 32px",
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 320px",
        gap: isMobile ? 20 : 32
      }}>

        {/* Main Content */}
        <div>
          {/* Key Points */}
          <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <span>🔑</span> النقاط الأساسية
            </h2>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
              {lesson.keyPoints.map((pt, i) => (
                <li key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{
                    minWidth: 24, height: 24, borderRadius: "50%",
                    background: "var(--gradient-purple)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700, color: "white", flexShrink: 0, marginTop: 2,
                  }}>{i + 1}</span>
                  <span style={{ fontSize: 15, lineHeight: 1.6 }}>{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tabs */}
          <div className="tab-bar" style={{ marginBottom: 24 }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab-item ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Tab: Overview */}
          {activeTab === "overview" && (
            <div className="glass-card" style={{ padding: 28 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>شرح الدرس</h2>
              <p style={{ lineHeight: 1.9, fontSize: 16, color: "var(--text-secondary)" }}>{lesson.overview}</p>

              {lesson.definitions.length > 0 && (
                <div style={{ marginTop: 28 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: "var(--purple-light)" }}>📌 التعريفات</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {lesson.definitions.map((def, i) => (
                      <div key={i} style={{
                        padding: "16px 20px",
                        background: "rgba(99,102,241,0.06)",
                        border: "1px solid rgba(99,102,241,0.15)",
                        borderRadius: "var(--radius-md)",
                        borderRight: "3px solid var(--purple-primary)",
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                          <span style={{ fontWeight: 700, fontSize: 16 }}>{def.term}</span>
                          <div style={{ display: "flex", gap: 8 }}>
                            {def.symbol && <span className="badge badge-purple">{def.symbol}</span>}
                            {def.unit && <span className="badge badge-cyan">{def.unit}</span>}
                          </div>
                        </div>
                        <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.6 }}>{def.definition}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab: Laws */}
          {activeTab === "laws" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {lesson.laws.length === 0 ? (
                <div className="glass-card" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
                  لا توجد قوانين في هذا الدرس
                </div>
              ) : lesson.laws.map((law, i) => (
                <div key={i} className="glass-card" style={{ padding: 28 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{law.name}</h3>
                      <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{law.nameEn}</span>
                    </div>
                    <span style={{ fontSize: 24 }}>⚖️</span>
                  </div>
                  <div className="formula-box" style={{ marginBottom: 16 }}>{law.formula}</div>
                  <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.7, marginBottom: 20 }}>{law.description}</p>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: "var(--text-muted)" }}>المتغيرات:</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
                      {law.variables.map((v, j) => (
                        <div key={j} style={{
                          padding: "10px 14px",
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid var(--border)",
                          borderRadius: "var(--radius-sm)",
                        }}>
                          <span style={{ color: "var(--purple-light)", fontFamily: "JetBrains Mono, monospace", fontWeight: 700 }}>{v.symbol}</span>
                          <span style={{ color: "var(--text-muted)", fontSize: 12, margin: "0 8px" }}>→</span>
                          <span style={{ fontSize: 13 }}>{v.meaning}</span>
                          <div style={{ fontSize: 12, color: "var(--cyan-light)", marginTop: 4 }}>{v.unit}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab: Examples */}
          {activeTab === "examples" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {lesson.examples.length === 0 ? (
                <div className="glass-card" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
                  لا توجد أمثلة في هذا الدرس بعد
                </div>
              ) : lesson.examples.map((ex) => (
                <div key={ex.id} className="glass-card" style={{ padding: 24 }}>
                  <div
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
                    onClick={() => setExpandedExample(expandedExample === ex.id ? null : ex.id)}
                  >
                    <h3 style={{ fontSize: 16, fontWeight: 700 }}>✏️ {ex.title}</h3>
                    <span style={{ fontSize: 20, color: "var(--purple-light)", transition: "transform 0.2s", transform: expandedExample === ex.id ? "rotate(180deg)" : "none" }}>⌃</span>
                  </div>
                  {expandedExample === ex.id && (
                    <div style={{ marginTop: 20 }}>
                      <div style={{ marginBottom: 16, padding: 16, background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.15)", borderRadius: "var(--radius-sm)" }}>
                        <div style={{ fontWeight: 700, marginBottom: 10, color: "var(--cyan-light)" }}>المعطيات:</div>
                        {ex.given.map((g, i) => <div key={i} style={{ fontSize: 14, marginBottom: 4, color: "var(--text-secondary)" }}>• {g}</div>)}
                        <div style={{ fontWeight: 700, marginTop: 12, marginBottom: 4, color: "#fbbf24" }}>المطلوب:</div>
                        <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>{ex.required}</div>
                      </div>
                      <div style={{ fontWeight: 700, marginBottom: 12 }}>الحل:</div>
                      {ex.solution.map((step) => (
                        <div key={step.step} className="step-card">
                          <div className="step-number">{step.step}</div>
                          <div>
                            <div style={{ fontSize: 14, marginBottom: step.formula ? 8 : 0 }}>{step.text}</div>
                            {step.formula && <div className="formula-box" style={{ textAlign: "right", fontSize: 14 }}>{step.formula}</div>}
                          </div>
                        </div>
                      ))}
                      <div style={{ padding: "14px 20px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "var(--radius-md)", marginTop: 12 }}>
                        <span style={{ fontWeight: 700, color: "#6ee7b7" }}>✅ الإجابة: </span>
                        <span style={{ fontSize: 15 }}>{ex.answer}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Tab: Activities */}
          {activeTab === "activity" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {lesson.activities.length === 0 ? (
                <div className="glass-card" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
                  لا توجد أنشطة في هذا الدرس
                </div>
              ) : lesson.activities.map((act) => (
                <div key={act.id} className="glass-card" style={{ padding: 28 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>🧪 {act.title}</h3>
                      <p style={{ color: "var(--cyan-light)", fontSize: 14 }}>الهدف: {act.objective}</p>
                    </div>
                    {act.labId && (
                      <Link href={`/lab/${act.labId}`} style={{
                        padding: "8px 16px",
                        background: "rgba(6,182,212,0.15)",
                        border: "1px solid rgba(6,182,212,0.3)",
                        color: "var(--cyan-light)",
                        borderRadius: "var(--radius-sm)",
                        textDecoration: "none", fontSize: 13, fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}>
                        افتح في المعمل ←
                      </Link>
                    )}
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontWeight: 600, marginBottom: 10, fontSize: 14, color: "var(--text-muted)" }}>🔧 الأدوات المطلوبة:</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {act.tools.map((t, i) => <span key={i} className="badge badge-purple">{t}</span>)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14, color: "var(--text-muted)" }}>خطوات التجربة:</div>
                    {act.steps.map((step) => (
                      <div key={step.step} className="step-card">
                        <div className="step-number">{step.step}</div>
                        <div>
                          <div style={{ fontSize: 14, lineHeight: 1.6 }}>{step.instruction}</div>
                          {step.observation && (
                            <div style={{ marginTop: 8, padding: "8px 12px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "var(--radius-sm)", fontSize: 13, color: "#fbbf24" }}>
                              🔭 الملاحظة: {step.observation}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 16, padding: "14px 20px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: "var(--radius-md)" }}>
                    <span style={{ fontWeight: 700, color: "#6ee7b7" }}>🎯 الاستنتاج: </span>
                    <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>{act.conclusion}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar — AI Assistant */}
        <div>
          <div className="glass-card" style={{ padding: 24, position: "sticky", top: 90 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--gradient-purple)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🤖</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>المعلم الذكي</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Nvidia AI</div>
              </div>
            </div>

            {aiExplanation ? (
              <div style={{ fontSize: 14, lineHeight: 1.8, color: "var(--text-secondary)", marginBottom: 16, maxHeight: 300, overflowY: "auto" }}>
                {aiExplanation}
              </div>
            ) : (
              <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 16, lineHeight: 1.6 }}>
                اسأل المعلم الذكي عن أي شيء في هذا الدرس
              </p>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                `اشرح لي درس ${lesson.title} بطريقة بسيطة`,
                `ما هي أهم القوانين في هذا الدرس؟`,
                `أعطني مثالاً على تطبيق حياتي`,
              ].map((q, i) => (
                <button
                  key={i}
                  onClick={() => askAI(q)}
                  disabled={aiLoading}
                  style={{
                    padding: "10px 14px",
                    background: "rgba(124,58,237,0.1)",
                    border: "1px solid rgba(124,58,237,0.2)",
                    borderRadius: "var(--radius-sm)",
                    color: "var(--purple-light)",
                    fontSize: 13, textAlign: "right", cursor: "pointer",
                    fontFamily: "Cairo, sans-serif",
                    transition: "all 0.2s",
                    opacity: aiLoading ? 0.6 : 1,
                  }}
                >
                  {aiLoading ? "⏳ جاري..." : `💬 ${q}`}
                </button>
              ))}
            </div>

            <Link href="/ai-tutor" style={{
              display: "block", textAlign: "center", marginTop: 16,
              padding: "10px", background: "var(--gradient-purple)",
              color: "white", borderRadius: "var(--radius-sm)",
              textDecoration: "none", fontSize: 14, fontWeight: 600,
            }}>
              فتح المحادثة الكاملة 🤖
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}
