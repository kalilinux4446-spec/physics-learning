// Nvidia NIM API Client
// استخدام OpenAI SDK المتوافق مع Nvidia NIM

import OpenAI from "openai";

const NVIDIA_API_KEY = process.env.NEXT_PUBLIC_NVIDIA_API_KEY || process.env.NVIDIA_API_KEY || "";
const NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1";

// النموذج المختار: Llama-3.3 Nemotron — ممتاز للتعليم والاستدلال
const DEFAULT_MODEL = "nvidia/llama-3.3-nemotron-super-49b-v1";

const client = new OpenAI({
  apiKey: NVIDIA_API_KEY,
  baseURL: NVIDIA_BASE_URL,
  dangerouslyAllowBrowser: false,
});

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

export async function chatWithAI(
  messages: ChatMessage[],
  lessonContext?: string
): Promise<string> {
  const systemContent = lessonContext
    ? `${PHYSICS_SYSTEM_PROMPT}\n\nالدرس الحالي:\n${lessonContext}`
    : PHYSICS_SYSTEM_PROMPT;

  try {
    const response = await client.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemContent },
        ...messages,
      ],
      temperature: 0.6,
      max_tokens: 4096,
    });
    return response.choices[0]?.message?.content ?? "عذراً، لم أتمكن من الإجابة. حاول مرة أخرى.";
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
    const response = await client.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: "أنت مولّد أسئلة فيزياء متخصص. أنشئ أسئلة دقيقة ومتوازنة بصيغة JSON فقط." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });
    return response.choices[0]?.message?.content ?? "[]";
  } catch (error) {
    console.error("Quiz generation error:", error);
    throw error;
  }
}

export async function extractLessonSummary(lessonContent: string): Promise<string> {
  const prompt = `استخرج من محتوى الدرس التالي ملخصاً منظماً يشمل:
1. التعاريف الأساسية
2. القوانين والمعادلات
3. النقاط المهمة للحفظ

محتوى الدرس:
${lessonContent}

أجب بصيغة JSON:
{
  "definitions": [{"term": "...", "definition": "..."}],
  "laws": [{"name": "...", "formula": "...", "description": "..."}],
  "keyPoints": ["..."]
}`;

  const response = await client.chat.completions.create({
    model: DEFAULT_MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 2000,
  });
  return response.choices[0]?.message?.content ?? "{}";
}

export async function streamChatWithAI(
  messages: ChatMessage[],
  lessonContext?: string,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const systemContent = lessonContext
    ? `${PHYSICS_SYSTEM_PROMPT}\n\nالدرس الحالي:\n${lessonContext}`
    : PHYSICS_SYSTEM_PROMPT;

  const stream = await client.chat.completions.create({
    model: DEFAULT_MODEL,
    messages: [
      { role: "system", content: systemContent },
      ...messages,
    ],
    temperature: 0.6,
    max_tokens: 4096,
    stream: true,
  });

  let fullText = "";
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content ?? "";
    if (content) {
      fullText += content;
      onChunk?.(content);
    }
  }
  return fullText;
}
