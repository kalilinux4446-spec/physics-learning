"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PHYSICS_BOOK, getAllLessons } from "@/lib/physics-content";

const EXPERIMENTS = [
  {
    id: "lab-torque",
    title: "عزم القوة والازدواج",
    unit: "توازن الأجسام الصلبة",
    unitColor: "#6366f1",
    icon: "⚖️",
    description: "استكشف مقدرة القوة على إحداث الدوران وعزم الازدواج بالتأثير المباشر واللمس",
    tools: ["قضيب معدني", "نقطة ارتكاز", "قوة متغيرة الاتجاه والمقدار"],
    difficulty: "سهل",
    duration: "10 دقائق",
  },
  {
    id: "lab-circular",
    title: "الحركة الدائرية والجذب المركزي",
    unit: "الحركات الدورية",
    unitColor: "#ec4899",
    icon: "🔄",
    description: "تحقق من قوة الجذب المركزية والتسارع وعلاقتها بالسرعة ونصف القطر",
    tools: ["كرة تدوير خطية", "قوة جذب مركزية", "مؤشرات السرعة والمتجه"],
    difficulty: "متوسط",
    duration: "15 دقيقة",
  },
  {
    id: "lab-pendulum",
    title: "البندول والنابض التوافقي",
    unit: "الحركات الدورية",
    unitColor: "#ec4899",
    icon: "⏱️",
    description: "ادرس الحركة الاهتزازية التوافقية البسيطة وعوامل الزمن الدوري للبندول والزمبرك",
    tools: ["بندول بسيط", "نابض معلق", "ثقل", "عداد الزمن الدوري"],
    difficulty: "سهل",
    duration: "12 دقيقة",
  },
  {
    id: "lab-waves",
    title: "حركة وتداخل الموجات",
    unit: "الموجات الصوتية",
    unitColor: "#3b82f6",
    icon: "🔊",
    description: "شاهد انتشار موجات الصوت وتراكبها من مصادر متعددة وتداخلها بيانياً",
    tools: ["مكبر صوت ثنائي", "راسم إشارة ترددي", "جبهة موجة مرئية"],
    difficulty: "متوسط",
    duration: "15 دقيقة",
  },
  {
    id: "lab-resonance",
    title: "الرنين والأعمدة الهوائية",
    unit: "النغمات الصوتية والرنين",
    unitColor: "#8b5cf6",
    icon: "🎶",
    description: "احسب سرعة الصوت بتغيير طول العمود المغلق والمفتوح لتحقيق الرنين",
    tools: ["عمود هواء متغير", "شوكة رنانة اهتزازية", "عداد الطول الموجي"],
    difficulty: "متوسط",
    duration: "15 دقيقة",
  },
  {
    id: "lab-optics",
    title: "بصريات الضوء والانكسار والعدسات",
    unit: "الضوء وأجهزة الإبصار",
    unitColor: "#14b8a6",
    icon: "👁️",
    description: "ادرس قانون سنل للانكسار وتكون الصور في العدسات اللامة والخيالية",
    tools: ["شريحة انكسار زجاجية", "عدسة لامة رقيقة", "شعاع ليزر تفاعلي"],
    difficulty: "متقدم",
    duration: "20 دقيقة",
  },
  {
    id: "lab-engine",
    title: "محرك البنزين رباعي الأشواط",
    unit: "الديناميكا الحرارية والمحركات",
    unitColor: "#f59e0b",
    icon: "🚂",
    description: "شاهد الأشواط الأربعة لدورة محرك الاحتراق الداخلي رباعية الحركة والشغل بيانياً",
    tools: ["اسطوانة ومكبس معدني", "شمعة احتراق شرارية", "عداد سرعة RPM"],
    difficulty: "متقدم",
    duration: "18 دقيقة",
  },
  {
    id: "lab-kirchhoff",
    title: "الدوائر وقوانين كيرشوف",
    unit: "التيار المستمر",
    unitColor: "#06b6d4",
    icon: "🔋",
    description: "ابنِ دوائر معقدة وحقق قانوني كيرشوف للجهود وحفظ الشحنة",
    tools: ["مصدر جهد ثنائي", "مقاومات مختلفة", "مقياس تيارات الفرع"],
    difficulty: "متوسط",
    duration: "15 دقيقة",
  },
  {
    id: "lab-meters",
    title: "أجهزة القياس وقنطرة هويتستون",
    unit: "القياسات الكهربائية",
    unitColor: "#f59e0b",
    icon: "📊",
    description: "استخدم القنطرة المترية لقياس قيم المقاومات المجهولة بدقة الصفر التوازني",
    tools: ["سلك قنطرة مترية", "مقاومة معلومة", "جلفانومتر صفري", "جسم زالق"],
    difficulty: "متقدم",
    duration: "15 دقيقة",
  },
];

const DIFFICULTY_COLORS: Record<string, string> = {
  "سهل": "#10b981",
  "متوسط": "#f59e0b",
  "متقدم": "#ef4444",
};

export default function LabIndexPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"simulators" | "activities" | "notebook">("simulators");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [activeActivity, setActiveActivity] = useState<any | null>(null);
  const [currentNoteText, setCurrentNoteText] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load notes from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem("physics_notebook_notes");
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (e) {
        console.error("Failed to parse notes");
      }
    }
  }, []);

  function saveNote(activityId: string) {
    const updated = { ...notes, [activityId]: currentNoteText };
    setNotes(updated);
    localStorage.setItem("physics_notebook_notes", JSON.stringify(updated));
    setActiveActivity(null);
    setCurrentNoteText("");
  }

  // Get all activities defined in units
  const allActivities: any[] = [];
  PHYSICS_BOOK.forEach(unit => {
    unit.lessons.forEach(lesson => {
      lesson.activities.forEach(act => {
        allActivities.push({
          ...act,
          unitTitle: unit.title,
          unitColor: unit.color,
          lessonTitle: lesson.title,
        });
      });
    });
  });

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-primary)", paddingBottom: 60 }}>
      {/* Header */}
      <div style={{
        background: "rgba(7,7,16,0.9)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)",
        padding: isMobile ? "14px 20px" : "20px 40px",
        display: "flex", flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "stretch" : "center", gap: 16,
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
          <Link href="/dashboard/student" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: 20 }}>←</Link>
          <div>
            <h1 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800 }}>🧪 المختبر العلمي المتكامل</h1>
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>محاكاة تفاعلية للتجارب ودفتر الملاحظات المنهجي</p>
          </div>
        </div>

        {/* Custom Tab Selector */}
        <div className="tab-bar" style={{ flexShrink: 0, padding: 4 }}>
          {[
            { id: "simulators", label: "المحاكيات الافتراضية" },
            { id: "activities", label: "أنشطة الدروس" },
            { id: "notebook", label: "دفتر الملاحظات" },
          ].map(tab => (
            <button
              key={tab.id}
              className={`tab-item ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id as any)}
              style={{ fontSize: 13, padding: "8px 14px" }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "20px 16px" : "40px" }}>
        
        {/* Tab: Simulators */}
        {activeTab === "simulators" && (
          <div>
            {/* Hero */}
            <div style={{
              background: "linear-gradient(135deg, rgba(6,182,212,0.1), rgba(16,185,129,0.05))",
              border: "1px solid rgba(6,182,212,0.2)",
              borderRadius: "var(--radius-xl)",
              padding: isMobile ? "24px 20px" : "40px",
              marginBottom: 36,
              display: "flex", flexDirection: isMobile ? "column" : "row",
              alignItems: "center", gap: 24,
              position: "relative", overflow: "hidden",
            }}>
              <div style={{ fontSize: 64 }}>🔬</div>
              <div style={{ flex: 1, textAlign: isMobile ? "center" : "right" }}>
                <h2 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 800, marginBottom: 8 }}>مختبر المحاكاة التفاعلية</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.6, maxWidth: 600 }}>
                  نفّذ التجارب الفيزيائية مباشرة على شاشتك. يدعم المحاكي اللمس الكامل، وتغيير أشرطة الانزلاق وسحب وإفلات العناصر المادية.
                </p>
              </div>
            </div>

            {/* Simulators Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
              gap: 20,
            }}>
              {EXPERIMENTS.map((exp) => (
                <div
                  key={exp.id}
                  className="glass-card"
                  style={{ padding: 24, cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
                  onClick={() => router.push(`/lab/${exp.id}`)}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <span style={{ fontSize: 32 }}>{exp.icon}</span>
                      <span className="badge" style={{
                        background: `${DIFFICULTY_COLORS[exp.difficulty]}15`,
                        color: DIFFICULTY_COLORS[exp.difficulty],
                        border: `1px solid ${DIFFICULTY_COLORS[exp.difficulty]}35`,
                        fontSize: 10,
                      }}>
                        {exp.difficulty}
                      </span>
                    </div>
                    <span className="badge" style={{ background: `${exp.unitColor}15`, color: exp.unitColor, border: `1px solid ${exp.unitColor}25`, fontSize: 10, marginBottom: 10 }}>
                      {exp.unit}
                    </span>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{exp.title}</h3>
                    <p style={{ color: "var(--text-secondary)", fontSize: 12.5, lineHeight: 1.5, marginBottom: 16 }}>
                      {exp.description}
                    </p>
                  </div>

                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "8px 12px", background: `${exp.unitColor}10`,
                    borderRadius: "var(--radius-sm)", color: exp.unitColor, fontSize: 13, fontWeight: 600,
                  }}>
                    <span>بدء المحاكاة</span>
                    <span>←</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Activities */}
        {activeTab === "activities" && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>أنشطة الكتاب المدرسي المنهجية</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {allActivities.map((act, idx) => {
                const hasNote = notes[act.id];
                return (
                  <div key={act.id} className="glass-card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                      <div>
                        <span className="badge" style={{ background: `${act.unitColor}15`, color: act.unitColor, border: `1px solid ${act.unitColor}35`, fontSize: 10, marginBottom: 6 }}>
                          {act.unitTitle} • {act.lessonTitle}
                        </span>
                        <h3 style={{ fontSize: 16, fontWeight: 700 }}>🧪 {act.title}</h3>
                        <p style={{ color: "var(--cyan-light)", fontSize: 12.5, marginTop: 4 }}>الهدف: {act.objective}</p>
                      </div>
                      
                      <div style={{ display: "flex", gap: 8 }}>
                        {act.labId && (
                          <button
                            onClick={() => router.push(`/lab/${act.labId}`)}
                            className="btn-secondary"
                            style={{ fontSize: 12, padding: "6px 12px" }}
                          >
                            💻 تشغيل المحاكي
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setActiveActivity(act);
                            setCurrentNoteText(notes[act.id] || "");
                          }}
                          className="btn-primary"
                          style={{ fontSize: 12, padding: "6px 12px" }}
                        >
                          {hasNote ? "📝 تعديل الملاحظة" : "✏️ تدوين ملاحظات"}
                        </button>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {act.tools.map((t: string, i: number) => (
                        <span key={i} className="badge badge-purple" style={{ fontSize: 10, padding: "2px 8px" }}>{t}</span>
                      ))}
                    </div>

                    {hasNote && (
                      <div style={{
                        padding: 12, background: "rgba(16,185,129,0.06)",
                        border: "1px solid rgba(16,185,129,0.2)", borderRadius: "var(--radius-sm)",
                        fontSize: 13, borderRight: "3px solid #10b981"
                      }}>
                        <span style={{ fontWeight: 700, color: "#6ee7b7" }}>📔 دفترك:</span> {hasNote}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab: Notebook */}
        {activeTab === "notebook" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800 }}>📔 دفتر الملاحظات الرقمي للفيزياء</h2>
              <button
                onClick={() => {
                  if (confirm("هل تريد مسح جميع الملاحظات المسجلة؟")) {
                    setNotes({});
                    localStorage.removeItem("physics_notebook_notes");
                  }
                }}
                className="btn-secondary"
                style={{ fontSize: 12, padding: "6px 12px", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}
              >
                🗑️ مسح الدفتر
              </button>
            </div>

            {Object.keys(notes).length === 0 ? (
              <div className="glass-card" style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}>
                <span style={{ fontSize: 48, display: "block", marginBottom: 12 }}>📓</span>
                <h3>دفترك الافتراضي فارغ</h3>
                <p style={{ fontSize: 13, marginTop: 6 }}>افتح الأنشطة ودوّن استنتاجاتك وملاحظاتك لتظهر هنا في تقريرك العملي</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {allActivities.filter(act => notes[act.id]).map(act => (
                  <div key={act.id} className="glass-card" style={{ padding: 24, borderRight: `4px solid ${act.unitColor}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                      <div>
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{act.unitTitle}</span>
                        <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 2 }}>{act.title}</h3>
                      </div>
                      <span style={{ fontSize: 24 }}>📝</span>
                    </div>

                    <div style={{ padding: 16, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                      {notes[act.id]}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Note Editor Modal */}
      {activeActivity && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }}>
          <div className="glass-card" style={{
            maxWidth: 600, width: "100%", padding: 28,
            background: "var(--bg-secondary)", border: "1px solid var(--border)",
            display: "flex", flexDirection: "column", gap: 20
          }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800 }}>📔 دفتر الملاحظات: {activeActivity.title}</h3>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>اكتب استنتاجاتك أو إجابات الأسئلة أو مشاهداتك لتسجيل تقدمك العملي</p>
            </div>

            <textarea
              className="input-field"
              rows={6}
              placeholder="اكتب ملاحظاتك العملية أو استنتاجك من النشاط هنا..."
              value={currentNoteText}
              onChange={e => setCurrentNoteText(e.target.value)}
              style={{ width: "100%", background: "rgba(0,0,0,0.2)", resize: "vertical", fontFamily: "Cairo, sans-serif" }}
            />

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                onClick={() => { setActiveActivity(null); setCurrentNoteText(""); }}
                className="btn-secondary"
              >
                إلغاء
              </button>
              <button
                onClick={() => saveNote(activeActivity.id)}
                className="btn-primary"
              >
                حفظ في الدفتر 💾
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
