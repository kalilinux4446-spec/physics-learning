"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    studentId: "", school: "", teacherCode: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("كلمتا المرور غير متطابقتين"); return;
    }
    if (form.password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل"); return;
    }
    setLoading(true);
    setError("");
    try {
      const { auth, db } = await import("@/lib/firebase");
      const { createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth");
      const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");

      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await updateProfile(cred.user, { displayName: form.name });

      const userData = {
        uid: cred.user.uid,
        displayName: form.name,
        email: form.email,
        role,
        createdAt: serverTimestamp(),
        ...(role === "student" ? {
          studentId: form.studentId,
          progress: {
            completedLessons: [],
            quizScores: {},
            studyTime: 0,
            streak: 0,
            xp: 0,
            level: 1,
          }
        } : {
          school: form.school,
          teacherCode: form.teacherCode,
        })
      };

      await setDoc(doc(db, "users", cred.user.uid), userData);

      if (role === "teacher") {
        router.push("/dashboard/teacher");
      } else {
        router.push("/dashboard/student");
      }
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        setError("البريد الإلكتروني مستخدم بالفعل");
      } else {
        setError("حدث خطأ أثناء إنشاء الحساب. حاول مرة أخرى");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--bg-primary)", position: "relative",
      padding: "40px 24px",
    }}>
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(124,58,237,0.15), transparent)",
      }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 480 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: "var(--gradient-purple)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, margin: "0 auto 14px",
          }}>⚡</div>
          <h1 style={{ fontSize: 26, fontWeight: 800 }}>إنشاء حساب جديد</h1>
          <p style={{ color: "var(--text-secondary)", marginTop: 8, fontSize: 14 }}>
            انضم لآلاف الطلاب والمعلمين
          </p>
        </div>

        <div className="glass-card" style={{ padding: 32 }}>
          {/* Role Selector */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 10 }}>
              أنا...
            </label>
            <div className="tab-bar">
              <button
                type="button"
                id="role-student"
                className={`tab-item ${role === "student" ? "active" : ""}`}
                onClick={() => setRole("student")}
              >
                🎓 طالب
              </button>
              <button
                type="button"
                id="role-teacher"
                className={`tab-item ${role === "teacher" ? "active" : ""}`}
                onClick={() => setRole("teacher")}
              >
                👩‍🏫 معلم/ة
              </button>
            </div>
          </div>

          <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, display: "block", color: "var(--text-secondary)" }}>
                الاسم الكامل
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="أدخل اسمك الكامل"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
                id="reg-name"
              />
            </div>

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
                id="reg-email"
              />
            </div>

            {role === "student" && (
              <div>
                <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, display: "block", color: "var(--text-secondary)" }}>
                  رقم الطالب (اختياري)
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="مثال: 1234567"
                  value={form.studentId}
                  onChange={e => setForm({ ...form, studentId: e.target.value })}
                  id="reg-student-id"
                />
              </div>
            )}

            {role === "teacher" && (
              <>
                <div>
                  <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, display: "block", color: "var(--text-secondary)" }}>
                    اسم المدرسة
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="اسم المدرسة"
                    value={form.school}
                    onChange={e => setForm({ ...form, school: e.target.value })}
                    id="reg-school"
                  />
                </div>
                <div>
                  <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, display: "block", color: "var(--text-secondary)" }}>
                    كود المعلم (للربط مع الطلاب)
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="أنشئ كود مميز لفصلك"
                    value={form.teacherCode}
                    onChange={e => setForm({ ...form, teacherCode: e.target.value })}
                    id="reg-teacher-code"
                  />
                </div>
              </>
            )}

            <div>
              <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, display: "block", color: "var(--text-secondary)" }}>
                كلمة المرور
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="6 أحرف على الأقل"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                id="reg-password"
              />
            </div>

            <div>
              <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, display: "block", color: "var(--text-secondary)" }}>
                تأكيد كلمة المرور
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                required
                id="reg-confirm-password"
              />
            </div>

            {error && (
              <div style={{
                padding: "12px 16px",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: "var(--radius-sm)",
                color: "#fca5a5", fontSize: 14,
              }}>
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              id="reg-submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: "100%", marginTop: 4, opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              {loading ? (
                <>
                  <div style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin-slow 0.8s linear infinite" }} />
                  جاري إنشاء الحساب...
                </>
              ) : "إنشاء الحساب 🚀"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: 20, color: "var(--text-muted)", fontSize: 14 }}>
            لديك حساب بالفعل؟{" "}
            <Link href="/auth/login" style={{ color: "var(--purple-light)", textDecoration: "none", fontWeight: 600 }}>
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
