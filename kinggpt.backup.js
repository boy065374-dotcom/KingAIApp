require("dotenv").config();

const express = require("express");
const { GoogleGenAI } = require("@google/genai");

const app = express();
const PORT = 3006;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const SYSTEM_INSTRUCTION = `
أنت KingGPT، مساعد ذكاء اصطناعي تابع لمشروع KingAI.
اسمك KingGPT.
تحدث بالعربية بشكل طبيعي.
استخدم اللهجة المصرية عندما يكون مناسبًا.
ساعد المستخدم في الأسئلة والبرمجة والمشاريع.
إذا لم تعرف الإجابة، قل بوضوح إنك لا تعرف بدل اختلاق إجابة.
`;

app.use(express.json());
app.use(express.static("."));

const preferredModels = [
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-flash-latest",
  "gemini-pro-latest",
  "gemini-2.5-flash"
];

async function getAvailableModels() {
  const available = [];
  const pager = await ai.models.list();

  for await (const model of pager) {
    if (!model.name) continue;

    const name = model.name.replace("models/", "");

    if (preferredModels.includes(name)) {
      available.push(name);
    }
  }

  return available;
}

async function askKingGPT(message) {
  const availableModels = await getAvailableModels();

  const modelsToTry = [
    ...preferredModels.filter(model => availableModels.includes(model))
  ];

  if (modelsToTry.length === 0) {
    throw new Error("لا يوجد موديل Gemini مناسب متاح حاليًا.");
  }

  let lastError;

  for (const model of modelsToTry) {
    try {
      console.log(`🤖 تجربة: ${model}`);

      const response = await ai.models.generateContent({
        model: model,
        contents: message,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION
        }
      });

      console.log(`✅ تم استخدام: ${model}`);

      return response.text;
    } catch (error) {
      lastError = error;

      console.log(
        `⚠️ فشل ${model}: ${error.status || error.message}`
      );
    }
  }

  throw lastError;
}

app.post("/api/chat", async (req, res) => {
  try {
    const message = req.body.message;

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: "الرسالة فارغة."
      });
    }

    const reply = await askKingGPT(message);

    res.json({
      reply: reply
    });

  } catch (error) {
    console.error("❌ Gemini Error:", error);

    res.status(500).json({
      error: error.message || "حدث خطأ أثناء الاتصال بـ Gemini."
    });
  }
});

app.listen(PORT, () => {
  console.log(`👑 KingGPT شغال على http://localhost:${PORT}`);
});
