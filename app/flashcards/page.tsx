"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { PHYSICS_BOOK } from "@/lib/physics-content";

interface FlashCard {
  id: string;
  front: string;
  back: string;
  category: "definition" | "law" | "formula";
  unitColor: string;
}

function buildFlashcards(): FlashCard[] {
  const cards: FlashCard[] = [];
  PHYSICS_BOOK.forEach(unit => {
    unit.lessons.forEach(lesson => {
      lesson.definitions.forEach(def => {
        cards.push({
          id: `def-${def.term}`,
          front: def.term,
          back: `${def.definition}${def.symbol ? `\n\nالرمز: ${def.symbol}` : ""}${def.unit ? `\nالوحدة: ${def.unit}` : ""}`,
          category: "definition",
          unitColor: unit.color,
        });
      });
      lesson.laws.forEach(law => {
        cards.push({
          id: `law-${law.name}`,
          front: law.name,
          back: `${law.formula}\n\n${law.description}`,
          category: "law",
          unitColor: unit.color,
        });
      });
    });
  });
  return cards;
}

const ALL_CARDS = buildFlashcards();

export default function FlashcardsPage() {
  const [filter, setFilter] = useState<"all" | "definition" | "law">("all");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<string>>(new Set());
  const [unknown, setUnknown] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const cards = filter === "all" ? ALL_CARDS
    : ALL_CARDS.filter(c => c.category === filter);

  const card = cards[currentIdx];
  const progress = ((currentIdx + 1) / cards.length) * 100;

  function next() { setFlipped(false); setTimeout(() => setCurrentIdx(i => Math.min(i + 1, cards.length - 1)), 150); }
  function prev() { setFlipped(false); setTimeout(() => setCurrentIdx(i => Math.max(i - 1, 0)), 150); }
  function markKnown() { setKnown(s => new Set([...s, card.id])); next(); }
  function markUnknown() { setUnknown(s => new Set([...s, card.id])); next(); }
  function reset() { setCurrentIdx(0); setFlipped(false); setKnown(new Set()); setUnknown(new Set()); }

  const knownCount = known.size;
  const unknownCount = unknown.size;
  const remaining = cards.length - currentIdx - 1;

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-primary)", paddingBottom: 60 }}>
      {/* Header */}
      <div style={{
        padding: "16px 32px", borderBottom: "1px solid var(--border)",
        background: "rgba(7,7,16,0.9)", backdropFilter: "blur(20px)",
        display: "flex", alignItems: "center", gap: 16,
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <Link href="/dashboard/student" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: 20 }}>←</Link>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 20, fontWeight: 800 }}>🃏 بطاقات المراجعة</h1>
          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
            {cards.length} بطاقة — {currentIdx + 1} / {cards.length}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div className="badge badge-green">✅ {knownCount}</div>
          <div style={{ background: "rgba(239,68,68,0.1)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.3)" }} className="badge">❌ {unknownCount}</div>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 24px" }}>
        {/* Filter */}
        <div className="tab-bar" style={{ marginBottom: 32 }}>
          {[
            { id: "all", label: `الكل (${ALL_CARDS.length})` },
            { id: "definition", label: `تعريفات (${ALL_CARDS.filter(c => c.category === "definition").length})` },
            { id: "law", label: `قوانين (${ALL_CARDS.filter(c => c.category === "law").length})` },
          ].map(f => (
            <button
              key={f.id}
              className={`tab-item ${filter === f.id ? "active" : ""}`}
              onClick={() => { setFilter(f.id as any); setCurrentIdx(0); setFlipped(false); }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Progress */}
        <div className="progress-bar" style={{ marginBottom: 32 }}>
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* Flashcard */}
        {card && (
          <div
            className={`flashcard ${flipped ? "flipped" : ""}`}
            style={{ width: "100%", height: 300, marginBottom: 28 }}
            onClick={() => setFlipped(!flipped)}
          >
            <div className="flashcard-inner" style={{ width: "100%", height: "100%" }}>
              {/* Front */}
              <div className="flashcard-front glass-card" style={{
                height: 300, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                padding: 40, textAlign: "center",
                borderTop: `3px solid ${card.unitColor}`,
              }}>
                <div className="badge" style={{
                  background: card.category === "definition" ? "rgba(99,102,241,0.15)" : "rgba(6,182,212,0.15)",
                  color: card.category === "definition" ? "var(--purple-light)" : "var(--cyan-light)",
                  border: `1px solid ${card.category === "definition" ? "rgba(99,102,241,0.3)" : "rgba(6,182,212,0.3)"}`,
                  marginBottom: 20,
                }}>
                  {card.category === "definition" ? "📌 تعريف" : "⚖️ قانون"}
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.4 }}>{card.front}</h2>
                <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 20 }}>
                  اضغط للكشف عن الإجابة 👆
                </p>
              </div>

              {/* Back */}
              <div className="flashcard-back glass-card" style={{
                height: 300, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                padding: 32, textAlign: "center",
                background: `linear-gradient(135deg, ${card.unitColor}12, rgba(7,7,16,0.95))`,
                border: `1px solid ${card.unitColor}30`,
              }}>
                <p style={{
                  fontSize: 16, lineHeight: 1.8,
                  color: "var(--text-primary)",
                  whiteSpace: "pre-line",
                }}>
                  {card.back}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: 12,
          marginBottom: 20
        }}>
          {!isMobile && (
            <button
              onClick={prev}
              disabled={currentIdx === 0}
              className="btn-secondary"
              style={{ flex: 1, opacity: currentIdx === 0 ? 0.4 : 1 }}
            >
              → السابق
            </button>
          )}

          <div style={{ display: "flex", gap: 8, flex: isMobile ? "none" : 1.5 }}>
            <button
              onClick={markUnknown}
              disabled={!flipped || currentIdx >= cards.length - 1}
              style={{
                flex: 1, padding: "12px",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: "var(--radius-sm)",
                color: "#fca5a5", cursor: "pointer",
                fontFamily: "Cairo, sans-serif", fontSize: 13,
                opacity: (!flipped || currentIdx >= cards.length - 1) ? 0.4 : 1,
              }}
            >
              ❌ لم أعرف
            </button>
            <button
              onClick={markKnown}
              disabled={!flipped || currentIdx >= cards.length - 1}
              style={{
                flex: 1, padding: "12px",
                background: "rgba(16,185,129,0.1)",
                border: "1px solid rgba(16,185,129,0.3)",
                borderRadius: "var(--radius-sm)",
                color: "#6ee7b7", cursor: "pointer",
                fontFamily: "Cairo, sans-serif", fontSize: 13,
                opacity: (!flipped || currentIdx >= cards.length - 1) ? 0.4 : 1,
              }}
            >
              ✅ عرفت
            </button>
          </div>

          {isMobile ? (
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={prev}
                disabled={currentIdx === 0}
                className="btn-secondary"
                style={{ flex: 1, padding: "12px", opacity: currentIdx === 0 ? 0.4 : 1 }}
              >
                → السابق
              </button>
              <button
                onClick={next}
                disabled={currentIdx >= cards.length - 1}
                className="btn-primary"
                style={{ flex: 1, padding: "12px", opacity: currentIdx >= cards.length - 1 ? 0.4 : 1 }}
              >
                التالي ←
              </button>
            </div>
          ) : (
            <button
              onClick={next}
              disabled={currentIdx >= cards.length - 1}
              className="btn-primary"
              style={{ flex: 1, opacity: currentIdx >= cards.length - 1 ? 0.4 : 1 }}
            >
              التالي ←
            </button>
          )}
        </div>

        {/* Stats */}
        {(known.size + unknown.size > 0) && (
          <div className="glass-card" style={{ padding: 20, display: "flex", justifyContent: "space-around", alignItems: "center" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#6ee7b7" }}>{knownCount}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>تعرّفت عليها</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#fca5a5" }}>{unknownCount}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>تحتاج مراجعة</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "var(--purple-light)" }}>{remaining}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>متبقية</div>
            </div>
            <button onClick={reset} className="btn-secondary" style={{ fontSize: 13, padding: "8px 16px" }}>
              🔄 إعادة
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
