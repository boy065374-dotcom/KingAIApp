require("dotenv").config();

const express = require("express");
const { GoogleGenAI } = require("@google/genai");

const {
  db,
  registerAuthRoutes,
  getCurrentUser
} = require("./auth");

const app = express();
const PORT = 3006;


// ========================================
// GEMINI
// ========================================

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});


// ========================================
// KINGGPT PERSONALITY
// ========================================

const SYSTEM_INSTRUCTION = `
أنت KingGPT، مساعد الذكاء الاصطناعي الرسمي لمشروع KingAI.

اسمك: KingGPT.

قواعد شخصيتك:
- تحدث بالعربية بشكل طبيعي.
- استخدم اللهجة المصرية عندما يكون ذلك مناسبًا.
- كن ودودًا ومفيدًا.
- استخدم الإيموجي باعتدال.
- ساعد المستخدم في البرمجة والمشاريع والأسئلة العامة.
- إذا لم تعرف الإجابة، قل بوضوح إنك لا تعرف.
- لا تخترع معلومات.
- عند كتابة الأكواد، استخدم Code Blocks واضحة.
- لا تضع شرحًا طويلًا إذا كان المستخدم يريد حلًا مباشرًا.

إذا كان للمستخدم اسم محفوظ، يمكنك مناداته باسمه عندما يكون ذلك طبيعيًا.
لا تكرر الاسم في كل رسالة.
`;


// ========================================
// EXPRESS
// ========================================

app.use(express.json());

app.use(express.static("."));


// ========================================
// AUTH SYSTEM
// ========================================

registerAuthRoutes(app);


// ========================================
// DATABASE - CHAT SYSTEM
// ========================================

db.exec(`
  CREATE TABLE IF NOT EXISTS chats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL DEFAULT 'محادثة جديدة',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
      REFERENCES users(id)
      ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chat_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    role TEXT NOT NULL CHECK (
      role IN ('user', 'assistant')
    ),
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (chat_id)
      REFERENCES chats(id)
      ON DELETE CASCADE,

    FOREIGN KEY (user_id)
      REFERENCES users(id)
      ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_chats_user
  ON chats(user_id);

  CREATE INDEX IF NOT EXISTS idx_chats_updated
  ON chats(user_id, updated_at);

  CREATE INDEX IF NOT EXISTS idx_messages_chat
  ON messages(chat_id);

  CREATE INDEX IF NOT EXISTS idx_messages_user
  ON messages(user_id);
`);

console.log("💾 Chat database ready.");


// ========================================
// MODELS
// ========================================

const preferredModels = [
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-flash-latest",
  "gemini-pro-latest",
  "gemini-2.5-flash"
];


// ========================================
// AVAILABLE MODELS
// ========================================

async function getAvailableModels() {

  const available = [];

  const pager = await ai.models.list();

  for await (const model of pager) {

    if (!model.name) {
      continue;
    }

    const name =
      model.name.replace("models/", "");

    if (preferredModels.includes(name)) {
      available.push(name);
    }
  }

  return available;
}


// ========================================
// ASK KINGGPT
// ========================================

async function askKingGPT(message, user) {

  const availableModels =
    await getAvailableModels();

  const modelsToTry =
    preferredModels.filter(
      model =>
        availableModels.includes(model)
    );

  if (modelsToTry.length === 0) {
    throw new Error(
      "لا يوجد موديل Gemini مناسب متاح حاليًا."
    );
  }


  // ======================================
  // USER CONTEXT
  // ======================================

  let userContext = "";

  if (user) {

    userContext = `
معلومات المستخدم الحالي:

الاسم:
${user.displayName || "لم يحدد اسمه"}

البريد الإلكتروني:
${user.email}

هذا مستخدم مسجل في KingAI.

إذا كان الاسم موجودًا، يمكنك استخدامه بشكل طبيعي في الرد.
لا تكرر الاسم في كل رسالة.
`;

  } else {

    userContext = `
المستخدم الحالي Guest.

لا يوجد له حساب.
لا توجد له ذاكرة.
لا توجد له محادثات محفوظة.
لا تستخدم أو تدّعي وجود معلومات سابقة عنه.
`;
  }


  let lastError;


  // ======================================
  // TRY MODELS
  // ======================================

  for (const model of modelsToTry) {

    try {

      console.log(
        `🤖 تجربة: ${model}`
      );

      const response =
        await ai.models.generateContent({

          model,

          contents: message,

          config: {

            systemInstruction:
              SYSTEM_INSTRUCTION +
              "\n\n" +
              userContext

          }

        });


      console.log(
        `✅ تم استخدام: ${model}`
      );


      return response.text;

    } catch (error) {

      lastError = error;

      console.log(
        `⚠️ فشل ${model}:`,
        error.status ||
        error.message
      );
    }
  }


  throw lastError;
}


// ========================================
// CHAT HELPERS
// ========================================

function requireUser(req, res) {

  const user =
    getCurrentUser(req);

  if (!user) {

    res.status(401).json({
      error:
        "يجب تسجيل الدخول لاستخدام المحادثات المحفوظة."
    });

    return null;
  }

  return user;
}


function getChatForUser(chatId, userId) {

  return db.prepare(`
    SELECT
      id,
      user_id,
      title,
      created_at,
      updated_at
    FROM chats
    WHERE id = ?
      AND user_id = ?
    LIMIT 1
  `).get(
    chatId,
    userId
  );
}


// ========================================
// CREATE CHAT
// ========================================

app.post(
  "/api/chats",
  (req, res) => {

    try {

      const user =
        requireUser(req, res);

      if (!user) {
        return;
      }


      const title =
        String(
          req.body?.title ||
          "محادثة جديدة"
        )
          .trim()
          .slice(0, 120);


      const result =
        db.prepare(`
          INSERT INTO chats (
            user_id,
            title
          )
          VALUES (?, ?)
        `).run(
          user.id,
          title || "محادثة جديدة"
        );


      const chatId =
        Number(
          result.lastInsertRowid
        );


      const chat =
        getChatForUser(
          chatId,
          user.id
        );


      return res.status(201).json({
        success: true,
        chat
      });

    } catch (error) {

      console.error(
        "CREATE CHAT ERROR:",
        error
      );

      return res.status(500).json({
        error:
          "حدث خطأ أثناء إنشاء المحادثة."
      });
    }
  }
);


// ========================================
// GET USER CHATS
// ========================================

app.get(
  "/api/chats",
  (req, res) => {

    try {

      const user =
        requireUser(req, res);

      if (!user) {
        return;
      }


      const chats =
        db.prepare(`
          SELECT
            id,
            title,
            created_at,
            updated_at
          FROM chats
          WHERE user_id = ?
          ORDER BY updated_at DESC
        `).all(user.id);


      return res.json({
        success: true,
        chats
      });

    } catch (error) {

      console.error(
        "GET CHATS ERROR:",
        error
      );

      return res.status(500).json({
        error:
          "حدث خطأ أثناء تحميل المحادثات."
      });
    }
  }
);


// ========================================
// GET CHAT MESSAGES
// ========================================

app.get(
  "/api/chats/:chatId/messages",
  (req, res) => {

    try {

      const user =
        requireUser(req, res);

      if (!user) {
        return;
      }


      const chatId =
        Number(
          req.params.chatId
        );


      if (!Number.isInteger(chatId)) {

        return res.status(400).json({
          error:
            "معرف المحادثة غير صحيح."
        });
      }


      const chat =
        getChatForUser(
          chatId,
          user.id
        );


      if (!chat) {

        return res.status(404).json({
          error:
            "المحادثة غير موجودة."
        });
      }


      const messages =
        db.prepare(`
          SELECT
            id,
            role,
            content,
            created_at
          FROM messages
          WHERE chat_id = ?
            AND user_id = ?
          ORDER BY id ASC
        `).all(
          chatId,
          user.id
        );


      return res.json({
        success: true,
        chat,
        messages
      });

    } catch (error) {

      console.error(
        "GET MESSAGES ERROR:",
        error
      );

      return res.status(500).json({
        error:
          "حدث خطأ أثناء تحميل الرسائل."
      });
    }
  }
);


// ========================================
// DELETE CHAT
// ========================================

app.delete(
  "/api/chats/:chatId",
  (req, res) => {

    try {

      const user =
        requireUser(req, res);

      if (!user) {
        return;
      }


      const chatId =
        Number(
          req.params.chatId
        );


      if (!Number.isInteger(chatId)) {

        return res.status(400).json({
          error:
            "معرف المحادثة غير صحيح."
        });
      }


      const result =
        db.prepare(`
          DELETE FROM chats
          WHERE id = ?
            AND user_id = ?
        `).run(
          chatId,
          user.id
        );


      if (Number(result.changes) === 0) {

        return res.status(404).json({
          error:
            "المحادثة غير موجودة."
        });
      }


      return res.json({
        success: true
      });

    } catch (error) {

      console.error(
        "DELETE CHAT ERROR:",
        error
      );

      return res.status(500).json({
        error:
          "حدث خطأ أثناء حذف المحادثة."
      });
    }
  }
);


// ========================================
// CHAT API
// ========================================

app.post(
  "/api/chat",
  async (req, res) => {

    try {

      // ==================================
      // GET CURRENT USER
      // ==================================

      const user =
        getCurrentUser(req);


      // ==================================
      // MESSAGE
      // ==================================

      const message =
        String(
          req.body?.message || ""
        ).trim();


      if (!message) {

        return res.status(400).json({
          error:
            "الرسالة فارغة."
        });
      }


      // ==================================
      // CHAT ID
      // ==================================

      let chatId =
        Number(
          req.body?.chatId
        );


      // ==================================
      // CREATE CHAT FOR AUTH USER
      // ==================================

      if (user && !Number.isInteger(chatId)) {

        const result =
          db.prepare(`
            INSERT INTO chats (
              user_id,
              title
            )
            VALUES (?, ?)
          `).run(
            user.id,
            "محادثة جديدة"
          );


        chatId =
          Number(
            result.lastInsertRowid
          );
      }


      // ==================================
      // VERIFY CHAT OWNERSHIP
      // ==================================

      if (user && Number.isInteger(chatId)) {

        const chat =
          getChatForUser(
            chatId,
            user.id
          );


        if (!chat) {

          return res.status(404).json({
            error:
              "المحادثة غير موجودة."
          });
        }
      }


      // ==================================
      // SAVE USER MESSAGE
      // ==================================

      if (user && Number.isInteger(chatId)) {

        db.prepare(`
          INSERT INTO messages (
            chat_id,
            user_id,
            role,
            content
          )
          VALUES (?, ?, 'user', ?)
        `).run(
          chatId,
          user.id,
          message
        );


        // أول رسالة تصبح عنوان المحادثة
        const chat =
          getChatForUser(
            chatId,
            user.id
          );


        if (
          chat &&
          chat.title === "محادثة جديدة"
        ) {

          let title =
            message
              .replace(/\s+/g, " ")
              .trim()
              .slice(0, 60);


          if (!title) {
            title = "محادثة جديدة";
          }


          db.prepare(`
            UPDATE chats
            SET
              title = ?,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
              AND user_id = ?
          `).run(
            title,
            chatId,
            user.id
          );

        } else {

          db.prepare(`
            UPDATE chats
            SET updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
              AND user_id = ?
          `).run(
            chatId,
            user.id
          );
        }
      }


      // ==================================
      // ASK KINGGPT
      // ==================================

      const reply =
        await askKingGPT(
          message,
          user
        );


      // ==================================
      // SAVE ASSISTANT MESSAGE
      // ==================================

      if (user && Number.isInteger(chatId)) {

        db.prepare(`
          INSERT INTO messages (
            chat_id,
            user_id,
            role,
            content
          )
          VALUES (?, ?, 'assistant', ?)
        `).run(
          chatId,
          user.id,
          reply
        );


        db.prepare(`
          UPDATE chats
          SET updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
            AND user_id = ?
        `).run(
          chatId,
          user.id
        );
      }


      // ==================================
      // RESPONSE
      // ==================================

      return res.json({

        reply,

        chatId:
          user && Number.isInteger(chatId)
            ? chatId
            : null,

        authenticated:
          !!user,

        user:
          user
            ? {
                id: user.id,
                email: user.email,
                displayName:
                  user.displayName
              }
            : null

      });

    } catch (error) {

      console.error(
        "❌ Gemini Error:",
        error
      );


      return res.status(500).json({

        error:
          error.message ||
          "حدث خطأ أثناء الاتصال بـ Gemini."

      });

    }
  }
);


// ========================================
// SERVER
// ========================================

app.listen(
  PORT,
  () => {

    console.log(
      "========================================"
    );

    console.log(
      "👑 KingGPT SERVER"
    );

    console.log(
      "========================================"
    );

    console.log(
      `🌐 http://localhost:${PORT}`
    );

    console.log(
      "🔐 Auth: enabled"
    );

    console.log(
      "💾 SQLite: kingai.db"
    );

    console.log(
      "💬 Chat history: enabled"
    );

    console.log(
      "🤖 Gemini: enabled"
    );

    console.log(
      "========================================"
    );

  }
);
