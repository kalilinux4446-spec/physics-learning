"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { PHYSICS_BOOK, TOTAL_LESSONS } from "@/lib/physics-content";

// Floating particle component
function Particle({ x, y, size, delay }: { x: number; y: number; size: number; delay: number }) {
  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle, rgba(124,58,237,0.6), transparent)`,
        animation: `float ${3 + delay}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        pointerEvents: "none",
      }}
    />
  );
}

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const particles = [
    { x: 10, y: 20, size: 6, delay: 0 },
    { x: 85, y: 15, size: 4, delay: 0.5 },
    { x: 50, y: 60, size: 8, delay: 1 },
    { x: 25, y: 75, size: 5, delay: 1.5 },
    { x: 70, y: 80, size: 3, delay: 2 },
    { x: 90, y: 50, size: 7, delay: 0.8 },
    { x: 5, y: 55, size: 4, delay: 2.5 },
    { x: 60, y: 25, size: 5, delay: 0.3 },
  ];

  useEffect(() => { setMounted(true); }, []);

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-primary)", position: "relative", overflow: "hidden" }}>

      {/* Background Effects */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse 80% 60% at 50% -20%, rgba(124,58,237,0.15), transparent)",
      }} />
      <div style={{
        position: "fixed", top: "60%", right: "-10%", width: 600, height: 600,
        borderRadius: "50%", background: "radial-gradient(circle, rgba(6,182,212,0.06), transparent)",
        pointerEvents: "none", zIndex: 0,
      }} />

      {/* Floating Particles */}
      {mounted && particles.map((p, i) => <Particle key={i} {...p} />)}

      {/* Navigation */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        padding: "16px 40px",
        background: "rgba(7,7,16,0.8)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: "var(--gradient-purple)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20,
          }}>⚡</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>فيزياء ذكية</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>الصف الثاني ثانوي</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link href="/auth/login" className="btn-secondary" style={{ textDecoration: "none" }}>
            تسجيل الدخول
          </Link>
          <Link href="/auth/register" className="btn-primary" style={{ textDecoration: "none" }}>
            ابدأ الآن مجاناً ✨
          </Link>
        </div>
      </nav>

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* Hero Section */}
        <section style={{ textAlign: "center", padding: "100px 40px 80px" }}>
          <div className="badge badge-purple" style={{ marginBottom: 24, display: "inline-flex" }}>
            <span>🤖</span> مدعوم بـ Nvidia AI
          </div>

          <h1 style={{
            fontSize: "clamp(40px, 6vw, 72px)",
            fontWeight: 900,
            lineHeight: 1.2,
            marginBottom: 24,
            color: "var(--text-primary)",
          }}>
            تعلّم الفيزياء{" "}
            <span className="gradient-text">بطريقة ذكية</span>
            <br />وتفاعلية
          </h1>

          <p style={{
            fontSize: 18, color: "var(--text-secondary)",
            maxWidth: 600, margin: "0 auto 40px",
            lineHeight: 1.8,
          }}>
            شرح تفاعلي لكل درس، معمل افتراضي بأدوات حقيقية، ومعلم ذكي يجيب على أسئلتك — كل ذلك في مكان واحد.
          </p>

          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/auth/register" className="btn-primary" style={{ textDecoration: "none", fontSize: 17, padding: "14px 36px" }}>
              🚀 ابدأ رحلتك الآن
            </Link>
            <Link href="/book" className="btn-secondary" style={{ textDecoration: "none", fontSize: 17, padding: "14px 36px" }}>
              📚 تصفّح الكتاب
            </Link>
          </div>

          {/* Stats */}
          <div style={{
            display: "flex", gap: 40, justifyContent: "center",
            marginTop: 60, flexWrap: "wrap",
          }}>
            {[
              { value: `${TOTAL_LESSONS}+`, label: "درس تفاعلي" },
              { value: "12+", label: "تجربة معملية" },
              { value: "200+", label: "سؤال ذكي" },
              { value: "∞", label: "شرح بالذكاء الاصطناعي" },
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 36, fontWeight: 900, color: "var(--purple-light)" }}>{stat.value}</div>
                <div style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Units Cards */}
        <section style={{ padding: "60px 40px" }}>
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800 }}>وحدات الكتاب</h2>
            <p style={{ color: "var(--text-secondary)", marginTop: 12, fontSize: 16 }}>
              {PHYSICS_BOOK.length} وحدات دراسية شاملة مع شرح تفاعلي ومعمل افتراضي
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24, maxWidth: 1200, margin: "0 auto",
          }}>
            {PHYSICS_BOOK.map((unit, i) => (
              <Link key={unit.id} href={`/book/${unit.id}`} style={{ textDecoration: "none" }}>
                <div className="glass-card" style={{
                  padding: 28,
                  animationDelay: `${i * 0.1}s`,
                  position: "relative",
                  overflow: "hidden",
                }}>
                  {/* Glow top */}
                  <div style={{
                    position: "absolute", top: 0, right: 0, left: 0, height: 2,
                    background: `linear-gradient(90deg, transparent, ${unit.color}, transparent)`,
                  }} />

                  <div style={{ fontSize: 40, marginBottom: 16 }}>{unit.icon}</div>
                  <div className="badge" style={{
                    background: `${unit.color}20`,
                    color: unit.color,
                    border: `1px solid ${unit.color}40`,
                    marginBottom: 12, display: "inline-flex",
                  }}>
                    الوحدة {unit.order}
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{unit.title}</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
                    {unit.description}
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                      {unit.lessons.length} دروس
                    </span>
                    <span style={{ color: unit.color, fontSize: 20 }}>←</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section style={{ padding: "60px 40px" }}>
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800 }}>كل ما تحتاجه في مكان واحد</h2>
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 20, maxWidth: 1100, margin: "0 auto",
          }}>
            {[
              { icon: "🤖", title: "معلم ذكي", desc: "اسأل أي سؤال بالعربية واحصل على إجابة فورية مع شرح مفصّل", color: "#a78bfa" },
              { icon: "🧪", title: "معمل افتراضي", desc: "نفّذ التجارب الفيزيائية بأدوات تفاعلية ثلاثية الأبعاد دون الحاجة لمعمل حقيقي", color: "#06b6d4" },
              { icon: "📝", title: "اختبارات ذكية", desc: "200+ سؤال متنوع تُولَّد تلقائياً مع تصحيح فوري وشرح الإجابة", color: "#10b981" },
              { icon: "📖", title: "قواعد وتعاريف", desc: "استخراج آلي لكل القوانين والمعادلات والتعاريف من كل درس بصيغة قابلة للطباعة", color: "#f59e0b" },
              { icon: "📊", title: "تتبع تقدمك", desc: "داشبورد شخصي يوضح الدروس المكتملة والنتائج ووقت الدراسة يومياً", color: "#ec4899" },
              { icon: "🃏", title: "بطاقات المراجعة", desc: "بطاقات Flashcard تفاعلية لمراجعة التعاريف والقوانين بأسلوب ممتع", color: "#8b5cf6" },
            ].map((feat, i) => (
              <div key={i} className="glass-card" style={{ padding: 24 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: `${feat.color}20`,
                  border: `1px solid ${feat.color}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 24, marginBottom: 16,
                }}>
                  {feat.icon}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{feat.title}</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.6 }}>{feat.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section style={{
          padding: "80px 40px",
          textAlign: "center",
          position: "relative",
        }}>
          <div style={{
            maxWidth: 600, margin: "0 auto",
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 28,
            padding: "60px 40px",
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", inset: 0,
              background: "radial-gradient(ellipse at center top, rgba(124,58,237,0.12), transparent 70%)",
              pointerEvents: "none",
            }} />
            <div style={{ position: "relative" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🎓</div>
              <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16 }}>
                جاهز تبدأ رحلتك؟
              </h2>
              <p style={{ color: "var(--text-secondary)", marginBottom: 32, fontSize: 16 }}>
                انضم وابدأ تعلم الفيزياء بطريقة ذكية وممتعة اليوم
              </p>
              <Link href="/auth/register" className="btn-primary" style={{ textDecoration: "none", fontSize: 17, padding: "16px 48px" }}>
                إنشاء حساب مجاني 🚀
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{
          textAlign: "center", padding: "32px",
          borderTop: "1px solid var(--border)",
          color: "var(--text-muted)", fontSize: 14,
        }}>
          <p>فيزياء ذكية © 2025 — مدعوم بـ Nvidia NIM AI 🤖</p>
        </footer>
      </div>
    </main>
  );
}
