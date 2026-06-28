"use client";
import { useState } from "react";
import Link from "next/link";
import { PHYSICS_BOOK } from "@/lib/physics-content";
import { generateQuiz } from "@/lib/nvidia-client";

interface Question {
  id: string;
  type: "mcq" | "truefalse";
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

// Static seed questions
const SEED_QUESTIONS: Question[] = [
  {
    id: "q1",
    type: "mcq",
    question: "ما هو الشرط الثاني لتحقيق التوازن التام للجسم الصلب الجاسئ؟",
    options: [
      "أ. أن تكون محصلة القوى المؤثرة تساوي صفراً",
      "ب. أن يكون المجموع الجبري لعزوم القوى حول أي نقطة مساوياً للصفر",
      "ج. أن يتحرك الجسم بسرعة ثابتة في خط مستقيم",
      "د. أن تكون طاقة الحركة الكلية للجسم مساوية للصفر"
    ],
    correct: 1,
    explanation: "الشرط الثاني للتوازن (التوازن الدوراني) ينص على أن المجموع الجبري لعزوم القوى المؤثرة على الجسم حول أي محور دوران يجب أن يساوي صفراً (مجـ ع = 0).",
  },
  {
    id: "q2",
    type: "mcq",
    question: "ماذا يحدث للزمن الدوري للبندول البسيط عند زيادة كتلة كرته إلى الضعف مع ثبات طول خيطه؟",
    options: [
      "أ. يزداد إلى الضعف",
      "ب. يقل إلى النصف",
      "ج. يظل ثابتاً دون تغيير",
      "د. يزداد بمقدار أربع مرات"
    ],
    correct: 2,
    explanation: "الزمن الدوري للبندول البسيط يُحسب من العلاقة ز = 2π√(ل/د)، وهي تعتمد على طول الخيط (ل) وتسارع الجاذبية (د) فقط، ولا تعتمد على كتلة الكرة المهتزة.",
  },
  {
    id: "q3",
    type: "mcq",
    question: "بكم تزداد سرعة الصوت في الهواء مع كل ارتفاع في درجة الحرارة بمقدار درجة مئوية واحدة (1°C)؟",
    options: [
      "أ. 0.6 م/ث",
      "ب. 331 م/ث",
      "ج. 1.2 م/ث",
      "د. 6 م/ث"
    ],
    correct: 0,
    explanation: "تزداد سرعة الصوت في الهواء بمعدل 0.6 م/ث لكل درجة مئوية واحدة ارتفاع في درجة الحرارة، وفق العلاقة: ع = 331 + 0.6 × ت.",
  },
  {
    id: "q4",
    type: "mcq",
    question: "في عمود هوائي مغلق من طرف واحد، يحدث الرنين الأول عندما يكون طول العمود مساوياً لـ...",
    options: [
      "أ. نصف الطول الموجي (λ/2)",
      "ب. الطول الموجي الكامل (λ)",
      "ج. ربع الطول الموجي (λ/4)",
      "د. ثلاثة أرباع الطول الموجي (3λ/4)"
    ],
    correct: 2,
    explanation: "يحدث الرنين الأول في الأعمدة الهوائية المغلقة عند تكون ربع موجة موقوفة طولية (ل = λ/4)، حيث تتكون عقدة عند الطرف المغلق وبطن عند الفوهة المفتوحة.",
  },
  {
    id: "q5",
    type: "mcq",
    question: "عند سقوط شعاع ضوئي مائلاً من الهواء إلى الزجاج، فإنه ينكسر...",
    options: [
      "أ. مبتعداً عن العمود المقام لأن سرعته تزداد",
      "ب. مقترباً من العمود المقام لأن سرعته تقل",
      "ج. على استقامته دون أي انحراف",
      "د. بزاوية انكسار تساوي زاوية السقوط دائماً"
    ],
    correct: 1,
    explanation: "الزجاج أكبر كثافة ضوئية من الهواء، وبالتالي فإن معامل انكساره أكبر وسرعة الضوء فيه أقل. وفق قانون سنل، ينكسر الشعاع مقترباً من العمود المقام (θ₂ < θ₁).",
  },
  {
    id: "q6",
    type: "mcq",
    question: "في أي من العمليات الديناميكية الحرارية التالية يكون الشغل الميكانيكي المبذول مساوياً للصفر دائماً؟",
    options: [
      "أ. العملية تحت ضغط ثابت (Isobaric)",
      "ب. العملية تحت درجة حرارة ثابتة (Isothermal)",
      "ج. العملية تحت حجم ثابت (Isochoric)",
      "د. العملية الكظمية (Adiabatic)"
    ],
    correct: 2,
    explanation: "بما أن الشغل يُحسب من العلاقة شغ = ض × Δح، وفي العملية تحت حجم ثابت يكون التغير في الحجم Δح = 0، فإن الشغل المبذول ينعدم تماماً (شغ = 0).",
  },
  {
    id: "q7",
    type: "mcq",
    question: "في أي شوط من أشواط محرك البنزين رباعي الأشواط ينتج الشغل الميكانيكي الفعلي (شوط الحركة المفيد)؟",
    options: [
      "أ. شوط السحب",
      "ب. شوط الانضغاط",
      "ج. شوط القدرة (الاشتعال)",
      "د. شوط العادم"
    ],
    correct: 2,
    explanation: "شوط القدرة هو الشوط المفيد الوحيد في الدورة، حيث يحدث اشتعال الخليط بالشرارة الكهربية مما يولد ضغطاً هائلاً يدفع المكبس لأسفل ويبذل شغلاً يدير المحرك.",
  },
  {
    id: "q8",
    type: "mcq",
    question: "يعتمد قانون كيرشوف الأول للتيارات (Σ I = 0) في الدوائر الكهربية على مبدأ حفظ...",
    options: [
      "أ. الطاقة",
      "ب. الشحنة الكهربائية",
      "ج. المادة",
      "د. كمية الحركة"
    ],
    correct: 1,
    explanation: "قانون كيرشوف الأول (قانون العقدة) يعتمد على قانون حفظ الشحنة، حيث لا يمكن للشحنات الكهربية أن تتراكم عند نقطة التفرع، فما يدخل للعقدة يجب أن يخرج منها.",
  },
  {
    id: "q9",
    type: "mcq",
    question: "ما مقدار القوة المغناطيسية المؤثرة على شحنة كهربائية تتحرك موازية لخطوط مجال مغناطيسي منتظم؟",
    options: [
      "أ. قيمة عظمى (ق = ش × ع × ب)",
      "ب. نصف القيمة العظمى",
      "ج. صفر",
      "د. قيمة سالبة"
    ],
    correct: 2,
    explanation: "قوة لورنتز تُحسب من العلاقة ق = ش × ع × ب × جا(θ). عندما تتحرك الشحنة موازية للمجال تكون الزاوية θ = 0 أو 180، وحيث أن جا(0) = 0، فإن القوة المغناطيسية تنعدم تماماً.",
  },
  {
    id: "q10",
    type: "mcq",
    question: "لتحويل الجلفانومتر الحساس إلى فولتميتر صالح لقياس فروق جهد كبيرة، يجب توصيل مقاومة...",
    options: [
      "أ. صغيرة جداً على التوازي (مجزئ تيار)",
      "ب. كبيرة جداً على التوالي (مضاعف جهد)",
      "ج. مساوية لمقاومة الجلفانومتر على التوازي",
      "د. صغيرة جداً على التوالي"
    ],
    correct: 1,
    explanation: "يتم تحويل الجلفانومتر إلى فولتميتر بتوصيل مقاومة كبيرة جداً على التوالي تسمى مضاعف الجهد (Rm)، لكي يمر بها تيار صغير جداً ويقع عليها معظم فرق الجهد المراد قياسه.",
  }
];

export default function QuizPage() {
  const [selectedUnit, setSelectedUnit] = useState("all");
  const [questions] = useState<Question[]>(SEED_QUESTIONS);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizDone, setQuizDone] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiQuestions, setAiQuestions] = useState<Question[]>([]);

  const activeQuestions = aiQuestions.length > 0 ? aiQuestions : questions;
  const question = activeQuestions[currentQ];
  const answered = answers[question?.id] !== undefined;
  const score = Object.entries(answers).filter(([qid, ans]) => {
    const q = activeQuestions.find(q => q.id === qid);
    return q && ans === q.correct;
  }).length;

  async function generateAIQuestions() {
    setAiGenerating(true);
    try {
      let lessonTitle = "الفيزياء العامة";
      let lessonContent = "";

      if (selectedUnit !== "all") {
        const unit = PHYSICS_BOOK.find(u => u.id === selectedUnit);
        if (unit) {
          lessonTitle = unit.title;
          lessonContent = unit.lessons.map(l => `${l.title}: ${l.overview}`).join("\n");
        }
      } else {
        lessonTitle = "فيزياء الصف الثاني ثانوي";
        lessonContent = PHYSICS_BOOK.flatMap(u => u.lessons).map(l => `${l.title}: ${l.overview}`).join("\n");
      }

      const result = await generateQuiz(lessonTitle, lessonContent, 5);
      let parsed;
      try {
        const jsonStr = result.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        parsed = JSON.parse(jsonStr);
      } catch {
        parsed = JSON.parse(result);
      }
      if (parsed.questions?.length) {
        setAiQuestions(parsed.questions);
        setCurrentQ(0);
        setAnswers({});
        setQuizDone(false);
      }
    } catch {
      console.error("Failed to generate AI questions");
    } finally {
      setAiGenerating(false);
    }
  }

  function selectAnswer(optIdx: number) {
    if (answered) return;
    setAnswers(prev => ({ ...prev, [question.id]: optIdx }));
    setShowExplanation(true);
  }

  function nextQuestion() {
    setShowExplanation(false);
    if (currentQ + 1 >= activeQuestions.length) {
      setQuizDone(true);
    } else {
      setCurrentQ(prev => prev + 1);
    }
  }

  function restart() {
    setCurrentQ(0);
    setAnswers({});
    setQuizDone(false);
    setShowExplanation(false);
    setAiQuestions([]);
  }

  if (quizDone) {
    const pct = Math.round((score / activeQuestions.length) * 100);
    const grade = pct >= 85 ? { label: "ممتاز 🏆", color: "#10b981" }
      : pct >= 70 ? { label: "جيد جداً ⭐", color: "#06b6d4" }
      : pct >= 50 ? { label: "جيد 👍", color: "#f59e0b" }
      : { label: "تحتاج مراجعة 📚", color: "#ef4444" };

    return (
      <main style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div className="glass-card" style={{ padding: 48, textAlign: "center", maxWidth: 500, width: "100%" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>{pct >= 70 ? "🎉" : "📚"}</div>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>انتهى الاختبار!</h2>
          <div style={{ fontSize: 56, fontWeight: 900, color: grade.color, marginBottom: 8 }}>{pct}%</div>
          <div style={{ fontSize: 18, color: grade.color, marginBottom: 24 }}>{grade.label}</div>
          <div style={{ fontSize: 15, color: "var(--text-secondary)", marginBottom: 32 }}>
            أجبت بشكل صحيح على {score} من {activeQuestions.length} سؤال
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={restart} className="btn-primary">🔄 إعادة الاختبار</button>
            <Link href="/ai-tutor" className="btn-secondary" style={{ textDecoration: "none" }}>🤖 راجع مع المعلم الذكي</Link>
          </div>
        </div>
      </main>
    );
  }

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
          <h1 style={{ fontSize: 20, fontWeight: 800 }}>📝 الاختبارات الذكية</h1>
          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
            سؤال {currentQ + 1} من {activeQuestions.length}
          </p>
        </div>
        <button
          onClick={generateAIQuestions}
          disabled={aiGenerating}
          className="btn-secondary"
          style={{ fontSize: 13, padding: "8px 16px", opacity: aiGenerating ? 0.6 : 1 }}
        >
          {aiGenerating ? "⏳ يُولَّد..." : "🤖 أسئلة بالذكاء الاصطناعي"}
        </button>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px 24px" }}>
        {/* Progress */}
        <div className="progress-bar" style={{ marginBottom: 32 }}>
          <div className="progress-fill" style={{ width: `${((currentQ + 1) / activeQuestions.length) * 100}%` }} />
        </div>

        {/* Question Card */}
        {question && (
          <div className="glass-card" style={{ padding: 32, marginBottom: 20 }}>
            <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center" }}>
              <span className="badge badge-purple">سؤال {currentQ + 1}</span>
              <span className="badge" style={{
                background: question.type === "mcq" ? "rgba(6,182,212,0.1)" : "rgba(245,158,11,0.1)",
                color: question.type === "mcq" ? "var(--cyan-light)" : "#fbbf24",
                border: `1px solid ${question.type === "mcq" ? "rgba(6,182,212,0.3)" : "rgba(245,158,11,0.3)"}`,
              }}>
                {question.type === "mcq" ? "اختيار متعدد" : "صح أو خطأ"}
              </span>
            </div>

            <h2 style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.6, marginBottom: 28 }}>
              {question.question}
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {question.options.map((opt, i) => {
                const isSelected = answers[question.id] === i;
                const isCorrect = i === question.correct;
                let bg = "rgba(255,255,255,0.04)";
                let border = "var(--border)";
                let color = "var(--text-primary)";

                if (answered) {
                  if (isCorrect) { bg = "rgba(16,185,129,0.1)"; border = "rgba(16,185,129,0.5)"; color = "#6ee7b7"; }
                  else if (isSelected) { bg = "rgba(239,68,68,0.1)"; border = "rgba(239,68,68,0.5)"; color = "#fca5a5"; }
                }

                return (
                  <button
                    key={i}
                    onClick={() => selectAnswer(i)}
                    disabled={answered}
                    style={{
                      padding: "14px 20px",
                      background: bg,
                      border: `1px solid ${border}`,
                      borderRadius: "var(--radius-md)",
                      color, fontSize: 15, textAlign: "right",
                      cursor: answered ? "default" : "pointer",
                      fontFamily: "Cairo, sans-serif",
                      transition: "all 0.2s",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                    }}
                  >
                    <span>{opt}</span>
                    {answered && isCorrect && <span>✅</span>}
                    {answered && isSelected && !isCorrect && <span>❌</span>}
                  </button>
                );
              })}
            </div>

            {showExplanation && (
              <div style={{
                marginTop: 20, padding: "16px 20px",
                background: "rgba(99,102,241,0.08)",
                border: "1px solid rgba(99,102,241,0.2)",
                borderRadius: "var(--radius-md)",
              }}>
                <div style={{ fontWeight: 700, marginBottom: 6, color: "var(--purple-light)" }}>💡 الشرح:</div>
                <div style={{ fontSize: 14, lineHeight: 1.7, color: "var(--text-secondary)" }}>{question.explanation}</div>
              </div>
            )}
          </div>
        )}

        {answered && (
          <div style={{ textAlign: "center" }}>
            <button onClick={nextQuestion} className="btn-primary" style={{ padding: "14px 40px", fontSize: 16 }}>
              {currentQ + 1 >= activeQuestions.length ? "عرض النتيجة 🎯" : "السؤال التالي →"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
