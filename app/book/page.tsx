"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { PHYSICS_BOOK } from "@/lib/physics-content";

export default function BookPage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-primary)", padding: "0 0 60px" }}>
      {/* Header */}
      <div style={{
        background: "rgba(7,7,16,0.8)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)",
        padding: isMobile ? "16px 20px" : "20px 40px",
        display: "flex", alignItems: "center", gap: 16,
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <Link href="/dashboard/student" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: 20 }}>←</Link>
        <div>
          <h1 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800 }}>📚 كتاب الفيزياء</h1>
          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>الصف الثاني ثانوي — المنهج اليمني الكامل</p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "24px 16px" : "48px 40px" }}>
        {/* Hero */}
        <div style={{
          background: "var(--gradient-card)",
          border: "1px solid rgba(99,102,241,0.2)",
          borderRadius: "var(--radius-xl)",
          padding: isMobile ? "24px 16px" : "48px",
          marginBottom: 32,
          position: "relative", overflow: "hidden",
          textAlign: "center",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse at center, rgba(124,58,237,0.12), transparent 70%)",
            pointerEvents: "none",
          }} />
          <div style={{ position: "relative" }}>
            <div style={{ fontSize: isMobile ? 36 : 56, marginBottom: 12 }}>⚡🧲⚖️</div>
            <h2 style={{ fontSize: isMobile ? 22 : 32, fontWeight: 800, marginBottom: 8 }}>
              كتاب الفيزياء المنهجي تفاعلي
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, maxWidth: 500, margin: "0 auto" }}>
              {PHYSICS_BOOK.length} وحدات دراسية • {PHYSICS_BOOK.reduce((a, u) => a + u.lessons.length, 0)} درساً تفاعلياً مع التجارب والأنشطة
            </p>
          </div>
        </div>

        {/* Units */}
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {PHYSICS_BOOK.map((unit, ui) => (
            <div key={unit.id}>
              {/* Unit Header */}
              <div style={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                alignItems: isMobile ? "flex-start" : "center",
                gap: 16,
                marginBottom: 20,
                padding: isMobile ? "16px" : "20px 24px",
                background: `${unit.color}10`,
                border: `1px solid ${unit.color}30`,
                borderRadius: "var(--radius-lg)",
              }}>
                <span style={{ fontSize: 36, display: "block" }}>{unit.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                    <span className="badge" style={{
                      background: `${unit.color}20`, color: unit.color,
                      border: `1px solid ${unit.color}40`,
                    }}>
                      الوحدة {unit.order}
                    </span>
                    <span style={{ color: "var(--text-muted)", fontSize: 13 }}>{unit.lessons.length} دروس</span>
                  </div>
                  <h2 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800 }}>{unit.title}</h2>
                  <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 4 }}>{unit.description}</p>
                </div>
                <Link
                  href={`/book/${unit.id}`}
                  style={{
                    padding: "10px 20px",
                    background: unit.color,
                    color: "white",
                    borderRadius: "var(--radius-md)",
                    textDecoration: "none",
                    fontSize: 14, fontWeight: 600,
                    alignSelf: isMobile ? "stretch" : "center",
                    textAlign: "center",
                  }}
                >
                  فتح الوحدة ←
                </Link>
              </div>

              {/* Lessons Grid */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 16,
              }}>
                {unit.lessons.map((lesson, li) => (
                  <Link key={lesson.id} href={`/book/${unit.id}/${lesson.id}`} style={{ textDecoration: "none" }}>
                    <div className="glass-card" style={{ padding: 20, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: 10,
                            background: `${unit.color}20`,
                            border: `1px solid ${unit.color}30`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 13, fontWeight: 700, color: unit.color,
                          }}>
                            {li + 1}
                          </div>
                          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>درس {unit.order}.{li + 1}</div>
                        </div>

                        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{lesson.title}</h3>
                        <p style={{ color: "var(--text-secondary)", fontSize: 13, lineHeight: 1.5, marginBottom: 16,
                          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                        }}>
                          {lesson.overview}
                        </p>
                      </div>

                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: "auto" }}>
                        {lesson.definitions.length > 0 && (
                          <span className="badge badge-purple" style={{ fontSize: 10, padding: "2px 8px" }}>
                            {lesson.definitions.length} تعريف
                          </span>
                        )}
                        {lesson.laws.length > 0 && (
                          <span className="badge badge-cyan" style={{ fontSize: 10, padding: "2px 8px" }}>
                            {lesson.laws.length} قانون
                          </span>
                        )}
                        {lesson.activities.length > 0 && (
                          <span className="badge badge-green" style={{ fontSize: 10, padding: "2px 8px" }}>
                            🧪 نشاط
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
