"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getUnitById } from "@/lib/physics-content";

export default function UnitPageClient({ unitId }: { unitId: string }) {
  const unit = getUnitById(unitId);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!unit) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "var(--bg-primary)", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 48 }}>📭</div>
        <h2>الوحدة غير موجودة</h2>
        <Link href="/book" style={{ color: "var(--purple-light)", textDecoration: "none" }}>← العودة للكتاب</Link>
      </div>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-primary)", paddingBottom: 60 }}>
      {/* Header */}
      <div style={{
        background: "rgba(7,7,16,0.9)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)",
        padding: isMobile ? "16px 20px" : "20px 40px",
        display: "flex", alignItems: "center", gap: 16,
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <Link href="/book" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: 20 }}>←</Link>
        <span style={{ fontSize: isMobile ? 24 : 28 }}>{unit.icon}</span>
        <div>
          <h1 style={{ fontSize: isMobile ? 16 : 20, fontWeight: 800 }}>{unit.title}</h1>
          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{unit.lessons.length} دروس</p>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: isMobile ? "24px 16px" : "48px 40px" }}>
        {/* Unit Hero */}
        <div style={{
          padding: isMobile ? "24px 16px" : "40px",
          background: `linear-gradient(135deg, ${unit.color}12, rgba(7,7,16,0.8))`,
          border: `1px solid ${unit.color}30`,
          borderRadius: "var(--radius-xl)",
          marginBottom: 32,
        }}>
          <div style={{ fontSize: isMobile ? 40 : 56, marginBottom: 12 }}>{unit.icon}</div>
          <h2 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 800, marginBottom: 8 }}>{unit.title}</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.7 }}>{unit.description}</p>
        </div>

        {/* Lessons List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {unit.lessons.map((lesson, i) => (
            <Link key={lesson.id} href={`/book/${unit.id}/${lesson.id}`} style={{ textDecoration: "none" }}>
              <div className="glass-card" style={{ padding: 20, display: "flex", gap: isMobile ? 12 : 20, alignItems: "center" }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                  background: `${unit.color}20`, border: `1px solid ${unit.color}40`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, fontWeight: 800, color: unit.color,
                }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{lesson.title}</h3>
                  <p style={{
                    color: "var(--text-secondary)", fontSize: 12, lineHeight: 1.5,
                    display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden",
                  }}>
                    {lesson.overview}
                  </p>
                  <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                    {lesson.definitions.length > 0 && <span className="badge badge-purple" style={{ fontSize: 10, padding: "2px 8px" }}>{lesson.definitions.length} تعريف</span>}
                    {lesson.laws.length > 0 && <span className="badge badge-cyan" style={{ fontSize: 10, padding: "2px 8px" }}>{lesson.laws.length} قانون</span>}
                    {lesson.examples.length > 0 && <span className="badge badge-green" style={{ fontSize: 10, padding: "2px 8px" }}>{lesson.examples.length} مثال</span>}
                    {lesson.activities.length > 0 && <span className="badge" style={{ background: `${unit.color}15`, color: unit.color, border: `1px solid ${unit.color}30`, fontSize: 10, padding: "2px 8px" }}>🧪 نشاط</span>}
                  </div>
                </div>
                <span style={{ color: unit.color, fontSize: 20, flexShrink: 0 }}>←</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
