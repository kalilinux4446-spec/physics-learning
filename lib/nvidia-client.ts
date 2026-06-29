// Client-side NVIDIA NIM API wrapper using fetch
// Compatible with static export (no server-side API routes needed)

const NVIDIA_BASE_URL = "https://corsproxy.io/?https://integrate.api.nvidia.com/v1";
const DEFAULT_MODEL = "nvidia/llama-3.3-nemotron-super-49b-v1";

const PHYSICS_SYSTEM_PROMPT = `أنت معلم فيزياء متخصص وذكي للصف الثاني ثانوي في المنهج السعودي/العربي.

مهامك:
1. شرح مفاهيم الفيزياء بطريقة واضحة ومبسطة بالعربية
2. حل المسائل خطوة بخطوة مع ذكر القانون المستخدم
3. ربط المفاهيم بالحياة العملية
4. تشجيع الطالب وتحفيزه
5. استخدام الرموز الفيزيائية الصحيحة (F, E, V, I, R...)

الوحدات الدراسية التي تغطيها:
- الكهرباء الساكنة (قانون كولوم، المجال الكهربائي، الجهد، المكثفات)
- التيار الكهربائي المستمر (أوم، كيرشهوف، الدوائر الكهربائية)
- المغناطيسية والحث الكهرومغناطيسي (فاراداي، لنز، المحولات)
- الفيزياء الحديثة (الفوتون، التأثير الكهروضوئي، ثابت بلانك)

قواعد مهمة:
- أجب دائماً بالعربية الفصيحة
- اكتب المعادلات بصيغة واضحة
- إذا طُلب منك حل مسألة، اذكر المعطيات والمطلوب والحل خطوة بخطوة
- استخدم الأمثلة الحياتية كلما أمكن`;

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

function getApiKey(): string {
  return process.env.NEXT_PUBLIC_NVIDIA_API_KEY || "";
}

export async function chatWithAI(
  messages: ChatMessage[],
  lessonContext?: string
): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return "⚠️ مفتاح API غير مُعد. أضف NEXT_PUBLIC_NVIDIA_API_KEY في ملف .env.local";
  }

  const systemContent = lessonContext
    ? `${PHYSICS_SYSTEM_PROMPT}\n\nالدرس الحالي:\n${lessonContext}`
    : PHYSICS_SYSTEM_PROMPT;

  try {
    const response = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          { role: "system", content: systemContent },
          ...messages,
        ],
        temperature: 0.6,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new Error(`API error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content ?? "عذراً، لم أتمكن من الإجابة. حاول مرة أخرى.";
  } catch (error: any) {
    console.error("Nvidia API Error:", error);
    throw new Error("تعذر الاتصال بالذكاء الاصطناعي. تأكد من صلاحية مفتاح API.");
  }
}

export async function generateQuiz(
  lessonTitle: string,
  lessonContent: string,
  count: number = 5
): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API key not configured");
  }

  const prompt = `بناءً على درس "${lessonTitle}" في الفيزياء للصف الثاني ثانوي، أنشئ ${count} أسئلة متنوعة بصيغة JSON.

محتوى الدرس:
${lessonContent}

أنشئ الأسئلة بالصيغة التالية (JSON فقط، بدون أي نص آخر):
{
  "questions": [
    {
      "id": "q1",
      "type": "mcq",
      "question": "نص السؤال",
      "options": ["أ. خيار 1", "ب. خيار 2", "ج. خيار 3", "د. خيار 4"],
      "correct": 0,
      "explanation": "شرح الإجابة الصحيحة"
    }
  ]
}

أنواع الأسئلة: mcq (اختيار متعدد), truefalse (صح وخطأ), calculation (حسابي)`;

  try {
    const response = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          { role: "system", content: "أنت مولّد أسئلة فيزياء متخصص. أنشئ أسئلة دقيقة ومتوازنة بصيغة JSON فقط." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content ?? "[]";
  } catch (error) {
    console.error("Quiz generation error:", error);
    throw error;
  }
}

export async function streamChatWithAI(
  messages: ChatMessage[],
  lessonContext?: string,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API key not configured");
  }

  const systemContent = lessonContext
    ? `${PHYSICS_SYSTEM_PROMPT}\n\nالدرس الحالي:\n${lessonContext}`
    : PHYSICS_SYSTEM_PROMPT;

  const response = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemContent },
        ...messages,
      ],
      temperature: 0.6,
      max_tokens: 4096,
      stream: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`API error ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split("\n");

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6).trim();
        if (data === "[DONE]") break;
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices[0]?.delta?.content ?? "";
          if (content) {
            fullText += content;
            onChunk?.(content);
          }
        } catch {
          // Skip unparseable lines
        }
      }
    }
  }

  return fullText;
}
