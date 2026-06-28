"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { PHYSICS_BOOK } from "@/lib/physics-content";

interface NavItem {
  icon: string;
  label: string;
  href: string;
  id: string;
}

const NAV_ITEMS: NavItem[] = [
  { icon: "🏠", label: "الرئيسية", href: "/dashboard/student", id: "nav-home" },
  { icon: "📚", label: "الكتاب", href: "/book", id: "nav-book" },
  { icon: "🧪", label: "المعمل", href: "/lab", id: "nav-lab" },
  { icon: "🤖", label: "المعلم الذكي", href: "/ai-tutor", id: "nav-ai" },
  { icon: "📝", label: "الاختبارات", href: "/quiz", id: "nav-quiz" },
  { icon: "🃏", label: "بطاقات المراجعة", href: "/flashcards", id: "nav-flash" },
];

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null);
  const [progress, setProgress] = useState({ completedLessons: [] as string[], xp: 0, level: 1, streak: 3, studyTime: 0 });
  const [activeNav, setActiveNav] = useState("nav-home");
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const { auth, db } = await import("@/lib/firebase");
        const { onAuthStateChanged } = await import("firebase/auth");
        const { doc, getDoc } = await import("firebase/firestore");

        onAuthStateChanged(auth, async (u) => {
          if (u) {
            setUser(u);
            const snap = await getDoc(doc(db, "users", u.uid));
            const data = snap.data();
            if (data?.progress) setProgress(data.progress);
          }
        });
      } catch (e) {}
    }
    loadUser();

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalLessons = PHYSICS_BOOK.reduce((a, u) => a + u.lessons.length, 0);
  const completedCount = progress.completedLessons.length;
  const completionPct = Math.round((completedCount / totalLessons) * 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg-primary)" }}>
      {/* Mobile Top Header */}
      {isMobile && (
        <header style={{
          position: "sticky", top: 0, zIndex: 100,
          padding: "14px 20px",
          background: "rgba(7,7,16,0.9)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "var(--gradient-purple)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
            }}>⚡</div>
            <span style={{ fontWeight: 800, fontSize: 16 }}>فيزياء ذكية</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(true)}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid var(--border)",
              color: "white", padding: "6px 12px", borderRadius: 8,
              cursor: "pointer", fontSize: 18,
            }}
          >
            ☰
          </button>
        </header>
      )}

      <div style={{ display: "flex", flex: 1, position: "relative" }}>
        {/* Sidebar Backdrop for Mobile */}
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

        {/* Sidebar Drawer */}
        <aside style={{
          width: 260,
          position: isMobile ? "fixed" : "fixed",
          top: 0, bottom: 0,
          right: isMobile ? (isSidebarOpen ? 0 : -260) : 0,
          background: "rgba(7,7,16,0.98)",
          borderLeft: "1px solid var(--border)",
          backdropFilter: "blur(20px)",
          display: "flex", flexDirection: "column",
          padding: "24px 16px",
          zIndex: 200,
          overflowY: "auto",
          transition: "right 0.3s ease",
        }}>
          {/* Logo (Desktop only or Drawer top) */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 36, paddingRight: 8 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: "var(--gradient-purple)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
            }}>⚡</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 800 }}>فيزياء ذكية</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>لوحة الطالب</div>
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

          {/* Nav */}
          <nav style={{ flex: 1 }}>
            {NAV_ITEMS.map(item => (
              <Link
                key={item.id}
                href={item.href}
                id={item.id}
                className={`nav-item ${activeNav === item.id ? "active" : ""}`}
                onClick={() => {
                  setActiveNav(item.id);
                  if (isMobile) setIsSidebarOpen(false);
                }}
                style={{ display: "flex", textDecoration: "none", marginBottom: 4 }}
              >
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User Info */}
          <div style={{
            padding: "16px",
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            marginTop: 24,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "var(--gradient-purple)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, fontWeight: 700,
              }}>
                {user?.displayName?.[0] ?? "ط"}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{user?.displayName ?? "الطالب"}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>المستوى {progress.level}</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main style={{
          flex: 1,
          marginRight: isMobile ? 0 : 260,
          padding: isMobile ? "24px 20px" : "32px 40px",
          overflowY: "auto",
          width: "100%",
        }}>
          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <div style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              justifyContent: "space-between",
              alignItems: isMobile ? "flex-start" : "center",
              gap: 16,
              marginBottom: 8
            }}>
              <div>
                <h1 style={{ fontSize: isMobile ? 24 : 28, fontWeight: 800 }}>
                  مرحباً، {user?.displayName ?? "الطالب"} 👋
                </h1>
                <p style={{ color: "var(--text-secondary)", marginTop: 6, fontSize: 14 }}>
                  واصل رحلتك في تعلم الفيزياء اليوم
                </p>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div className="badge badge-purple" style={{ fontSize: 12 }}>🔥 {progress.streak} أيام متتالية</div>
                <div className="badge badge-cyan" style={{ fontSize: 12 }}>⭐ {progress.xp} نقطة</div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
            gap: isMobile ? 12 : 20,
            marginBottom: 32,
          }}>
            {[
              { icon: "📚", label: "دروس مكتملة", value: `${completedCount}/${totalLessons}`, color: "#6366f1" },
              { icon: "🧪", label: "تجارب منفّذة", value: "0/10", color: "#06b6d4" },
              { icon: "📝", label: "اختبارات حُلَّت", value: "0", color: "#10b981" },
              { icon: "⏱️", label: "وقت الدراسة", value: `${progress.studyTime ?? 0} دقيقة`, color: "#f59e0b" },
            ].map((stat, i) => (
              <div key={i} className="glass-card" style={{ padding: isMobile ? 16 : 24, position: "relative", overflow: "hidden" }}>
                <div style={{
                  position: "absolute", top: 0, right: 0, left: 0, height: 2,
                  background: `linear-gradient(90deg, transparent, ${stat.color}, transparent)`,
                }} />
                <div style={{ fontSize: isMobile ? 22 : 28, marginBottom: 8 }}>{stat.icon}</div>
                <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Progress Overview */}
          <div className="glass-card" style={{ padding: 24, marginBottom: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>تقدمك الكلي</h2>
              <span style={{ fontSize: 20, fontWeight: 800, color: "var(--purple-light)" }}>{completionPct}%</span>
            </div>
            <div className="progress-bar" style={{ height: 8, marginBottom: 12 }}>
              <div className="progress-fill" style={{ width: `${completionPct}%` }} />
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>
              أكملت {completedCount} درساً من أصل {totalLessons} درس في منهج الفيزياء
            </p>
          </div>

          {/* Units Grid */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>وحدات الكتاب المنهجي</h2>
            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
              gap: 16
            }}>
              {PHYSICS_BOOK.map((unit) => {
                const unitLessons = unit.lessons.length;
                const unitCompleted = progress.completedLessons.filter(id =>
                  unit.lessons.some(l => l.id === id)
                ).length;
                const pct = Math.round((unitCompleted / unitLessons) * 100);

                return (
                  <Link key={unit.id} href={`/book/${unit.id}`} style={{ textDecoration: "none" }}>
                    <div className="glass-card" style={{ padding: 20, position: "relative", overflow: "hidden" }}>
                      <div style={{
                        position: "absolute", top: 0, right: 0, width: 100, height: 100,
                        background: `radial-gradient(circle, ${unit.color}15, transparent)`,
                        borderRadius: "50%", transform: "translate(30%, -30%)",
                      }} />
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                        <span style={{ fontSize: 28 }}>{unit.icon}</span>
                        <span className="badge" style={{
                          background: `${unit.color}20`, color: unit.color,
                          border: `1px solid ${unit.color}40`, fontSize: 11,
                        }}>
                          {unitCompleted}/{unitLessons}
                        </span>
                      </div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{unit.title}</h3>
                      <div className="progress-bar" style={{ marginBottom: 6 }}>
                        <div style={{
                          height: "100%", borderRadius: 4, width: `${pct}%`,
                          background: `linear-gradient(90deg, ${unit.color}, ${unit.color}aa)`,
                          transition: "width 0.5s ease",
                        }} />
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{pct}% مكتمل</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>روابط سريعة</h2>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {[
                { href: "/ai-tutor", icon: "🤖", label: "اسأل المعلم الذكي", color: "#a78bfa" },
                { href: "/lab", icon: "🧪", label: "افتح المعمل", color: "#06b6d4" },
                { href: "/quiz", icon: "📝", label: "ابدأ اختباراً", color: "#10b981" },
                { href: "/flashcards", icon: "🃏", label: "بطاقات المراجعة", color: "#f59e0b" },
              ].map((action, i) => (
                <Link key={i} href={action.href} style={{ textDecoration: "none" }}>
                  <div style={{
                    padding: "12px 20px",
                    background: `${action.color}15`,
                    border: `1px solid ${action.color}30`,
                    borderRadius: "var(--radius-md)",
                    color: action.color,
                    fontSize: 14, fontWeight: 600,
                    display: "flex", alignItems: "center", gap: 8,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}>
                    <span style={{ fontSize: 18 }}>{action.icon}</span>
                    {action.label}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
