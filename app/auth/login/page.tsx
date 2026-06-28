"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { auth } = await import("@/lib/firebase");
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      const { db } = await import("@/lib/firebase");
      const { doc, getDoc } = await import("firebase/firestore");

      const cred = await signInWithEmailAndPassword(auth, form.email, form.password);
      const userDoc = await getDoc(doc(db, "users", cred.user.uid));
      const userData = userDoc.data();

      if (userData?.role === "teacher") {
        router.push("/dashboard/teacher");
      } else {
        router.push("/dashboard/student");
      }
    } catch (err: any) {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--bg-primary)", position: "relative", overflow: "hidden",
    }}>
      {/* Background */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(124,58,237,0.15), transparent)",
      }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 440, padding: "0 24px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: "var(--gradient-purple)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 32, margin: "0 auto 16px",
          }}>⚡</div>
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>مرحباً بعودتك</h1>
          <p style={{ color: "var(--text-secondary)", marginTop: 8, fontSize: 15 }}>
            سجّل دخولك لمتابعة رحلتك التعليمية
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-card" style={{ padding: 32 }}>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, display: "block", color: "var(--text-secondary)" }}>
                البريد الإلكتروني
              </label>
              <input
                type="email"
                className="input-field"
                placeholder="example@email.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                id="login-email"
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <label style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)" }}>
                  كلمة المرور
                </label>
                <Link href="/auth/forgot-password" style={{ fontSize: 13, color: "var(--purple-light)", textDecoration: "none" }}>
                  نسيت كلمة المرور؟
                </Link>
              </div>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                id="login-password"
              />
            </div>

            {error && (
              <div style={{
                padding: "12px 16px",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: "var(--radius-sm)",
                color: "#fca5a5",
                fontSize: 14,
              }}>
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              id="login-submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: "100%", opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              {loading ? (
                <>
                  <div style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin-slow 0.8s linear infinite" }} />
                  جاري تسجيل الدخول...
                </>
              ) : "تسجيل الدخول →"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: 24, color: "var(--text-muted)", fontSize: 14 }}>
            ليس لديك حساب؟{" "}
            <Link href="/auth/register" style={{ color: "var(--purple-light)", textDecoration: "none", fontWeight: 600 }}>
              أنشئ حساباً مجانياً
            </Link>
          </div>
        </div>

        {/* Demo credentials note */}
        <div style={{
          textAlign: "center", marginTop: 20,
          padding: "12px 20px",
          background: "rgba(6,182,212,0.08)",
          border: "1px solid rgba(6,182,212,0.2)",
          borderRadius: "var(--radius-md)",
          fontSize: 13, color: "var(--cyan-light)",
        }}>
          💡 للتجربة: اضغط "إنشاء حساب مجاناً" وابدأ فوراً
        </div>
      </div>
    </main>
  );
}
