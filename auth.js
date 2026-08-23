const path = require("node:path");
const crypto = require("node:crypto");
const { DatabaseSync } = require("node:sqlite");

const DB_PATH = path.join(__dirname, "kingai.db");

const db = new DatabaseSync(DB_PATH);

// ========================================
// DATABASE
// ========================================

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    display_name TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
      REFERENCES users(id)
      ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_sessions_token
  ON sessions(token_hash);

  CREATE INDEX IF NOT EXISTS idx_sessions_user
  ON sessions(user_id);
`);

// ========================================
// CONFIG
// ========================================

const SESSION_DAYS = 30;

const SESSION_MS =
  SESSION_DAYS *
  24 *
  60 *
  60 *
  1000;

const PASSWORD_MIN_LENGTH = 6;
const PASSWORD_MAX_LENGTH = 128;

// ========================================
// PASSWORD HASH
// ========================================

function hashPassword(password) {

  const salt =
    crypto.randomBytes(16).toString("hex");

  const hash =
    crypto.scryptSync(
      password,
      salt,
      64,
      {
        N: 16384,
        r: 8,
        p: 1
      }
    ).toString("hex");

  return {
    hash,
    salt
  };
}


function verifyPassword(
  password,
  storedHash,
  storedSalt
) {

  try {

    const calculatedHash =
      crypto.scryptSync(
        password,
        storedSalt,
        64,
        {
          N: 16384,
          r: 8,
          p: 1
        }
      );

    const storedBuffer =
      Buffer.from(
        storedHash,
        "hex"
      );

    if (
      storedBuffer.length !==
      calculatedHash.length
    ) {
      return false;
    }

    return crypto.timingSafeEqual(
      calculatedHash,
      storedBuffer
    );

  } catch {

    return false;

  }
}

// ========================================
// SESSION
// ========================================

function hashSessionToken(token) {

  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}


function createSession(userId) {

  const token =
    crypto
      .randomBytes(32)
      .toString("base64url");

  const tokenHash =
    hashSessionToken(token);

  const expiresAt =
    Date.now() + SESSION_MS;

  db.prepare(`
    INSERT INTO sessions (
      user_id,
      token_hash,
      expires_at
    )
    VALUES (?, ?, ?)
  `).run(
    Number(userId),
    String(tokenHash),
    Number(expiresAt)
  );

  return {
    token,
    expiresAt
  };
}

// ========================================
// COOKIES
// ========================================

function parseCookies(req) {

  const header =
    req.headers.cookie;

  if (!header) {
    return {};
  }

  const cookies = {};

  for (
    const part of header.split(";")
  ) {

    const index =
      part.indexOf("=");

    if (index === -1) {
      continue;
    }

    const key =
      part
        .slice(0, index)
        .trim();

    const value =
      part
        .slice(index + 1)
        .trim();

    try {

      cookies[key] =
        decodeURIComponent(value);

    } catch {

      cookies[key] =
        value;

    }
  }

  return cookies;
}


function setSessionCookie(
  res,
  token,
  expiresAt
) {

  const isProduction =
    process.env.NODE_ENV ===
    "production";

  const maxAge =
    Math.max(
      0,
      Math.floor(
        (
          Number(expiresAt) -
          Date.now()
        ) / 1000
      )
    );

  const parts = [
    `kingai_session=${encodeURIComponent(token)}`,
    "HttpOnly",
    "Path=/",
    "SameSite=Lax",
    `Max-Age=${maxAge}`
  ];

  if (isProduction) {
    parts.push("Secure");
  }

  res.setHeader(
    "Set-Cookie",
    parts.join("; ")
  );
}


function clearSessionCookie(res) {

  res.setHeader(
    "Set-Cookie",
    [
      "kingai_session=",
      "HttpOnly",
      "Path=/",
      "SameSite=Lax",
      "Max-Age=0"
    ].join("; ")
  );
}

// ========================================
// CURRENT USER
// ========================================

function getCurrentUser(req) {

  const cookies =
    parseCookies(req);

  const token =
    cookies.kingai_session;

  if (!token) {
    return null;
  }

  const tokenHash =
    hashSessionToken(token);

  const row =
    db.prepare(`
      SELECT
        users.id,
        users.email,
        users.display_name,
        users.created_at,
        sessions.expires_at
      FROM sessions
      INNER JOIN users
        ON users.id = sessions.user_id
      WHERE sessions.token_hash = ?
      LIMIT 1
    `).get(
      String(tokenHash)
    );

  if (!row) {
    return null;
  }

  if (
    Number(row.expires_at) <=
    Date.now()
  ) {

    db.prepare(`
      DELETE FROM sessions
      WHERE token_hash = ?
    `).run(
      String(tokenHash)
    );

    return null;
  }

  return {
    id: Number(row.id),
    email: String(row.email),
    displayName:
      String(row.display_name || ""),
    createdAt:
      String(row.created_at)
  };
}

// ========================================
// AUTH ROUTES
// ========================================

function registerAuthRoutes(app) {

  // ======================================
  // SIGNUP
  // ======================================

  app.post(
    "/api/auth/signup",
    (req, res) => {

      try {

        const email =
          String(
            req.body?.email || ""
          )
            .trim()
            .toLowerCase();

        const password =
          String(
            req.body?.password || ""
          );

        if (
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/
            .test(email)
        ) {

          return res.status(400).json({
            error:
              "اكتب بريد إلكتروني صحيح."
          });

        }

        if (
          password.length <
          PASSWORD_MIN_LENGTH
        ) {

          return res.status(400).json({
            error:
              "كلمة المرور يجب أن تكون 6 أحرف على الأقل."
          });

        }

        if (
          password.length >
          PASSWORD_MAX_LENGTH
        ) {

          return res.status(400).json({
            error:
              "كلمة المرور طويلة جدًا."
          });

        }

        const existing =
          db.prepare(`
            SELECT id
            FROM users
            WHERE email = ?
            LIMIT 1
          `).get(
            String(email)
          );

        if (existing) {

          return res.status(409).json({
            error:
              "هذا البريد الإلكتروني مستخدم بالفعل."
          });

        }

        const {
          hash,
          salt
        } =
          hashPassword(password);

        const result =
          db.prepare(`
            INSERT INTO users (
              email,
              password_hash,
              password_salt,
              display_name,
              created_at,
              updated_at
            )
            VALUES (?, ?, ?, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          `).run(
            String(email),
            String(hash),
            String(salt)
          );

        const userId =
          Number(
            result.lastInsertRowid
          );

        const session =
          createSession(userId);

        setSessionCookie(
          res,
          session.token,
          session.expiresAt
        );

        return res.status(201).json({

          authenticated: true,

          needsName: true,

          user: {
            id: userId,
            email,
            displayName: ""
          }

        });

      } catch (error) {

        console.error(
          "SIGNUP ERROR:",
          error
        );

        return res.status(500).json({
          error:
            "حدث خطأ أثناء إنشاء الحساب."
        });

      }
    }
  );

  // ======================================
  // LOGIN
  // ======================================

  app.post(
    "/api/auth/login",
    (req, res) => {

      try {

        const email =
          String(
            req.body?.email || ""
          )
            .trim()
            .toLowerCase();

        const password =
          String(
            req.body?.password || ""
          );

        if (
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/
            .test(email)
        ) {

          return res.status(400).json({
            error:
              "اكتب بريد إلكتروني صحيح."
          });

        }

        if (!password) {

          return res.status(400).json({
            error:
              "اكتب كلمة المرور."
          });

        }

        const user =
          db.prepare(`
            SELECT
              id,
              email,
              password_hash,
              password_salt,
              display_name,
              created_at
            FROM users
            WHERE email = ?
            LIMIT 1
          `).get(
            String(email)
          );

        if (!user) {

          return res.status(401).json({
            error:
              "البريد الإلكتروني أو كلمة المرور غير صحيحة."
          });

        }

        const valid =
          verifyPassword(
            password,
            user.password_hash,
            user.password_salt
          );

        if (!valid) {

          return res.status(401).json({
            error:
              "البريد الإلكتروني أو كلمة المرور غير صحيحة."
          });

        }

        const session =
          createSession(
            Number(user.id)
          );

        setSessionCookie(
          res,
          session.token,
          session.expiresAt
        );

        return res.json({

          authenticated: true,

          needsName:
            !user.display_name,

          user: {

            id: Number(user.id),

            email:
              String(user.email),

            displayName:
              String(
                user.display_name || ""
              ),

            createdAt:
              String(user.created_at)

          }

        });

      } catch (error) {

        console.error(
          "LOGIN ERROR:",
          error
        );

        return res.status(500).json({
          error:
            "حدث خطأ أثناء تسجيل الدخول."
        });

      }
    }
  );

  // ======================================
  // ME
  // ======================================

  app.get(
    "/api/auth/me",
    (req, res) => {

      const user =
        getCurrentUser(req);

      if (!user) {

        return res.status(401).json({
          authenticated: false
        });

      }

      return res.json({

        authenticated: true,

        needsName:
          !user.displayName,

        user

      });

    }
  );

  // ======================================
  // SET NAME
  // ======================================

  app.post(
    "/api/auth/name",
    (req, res) => {

      try {

        const user =
          getCurrentUser(req);

        if (!user) {

          return res.status(401).json({
            error:
              "يجب تسجيل الدخول أولًا."
          });

        }

        const displayName =
          String(
            req.body?.displayName || ""
          ).trim();

        if (!displayName) {

          return res.status(400).json({
            error:
              "اكتب الاسم أولًا."
          });

        }

        if (
          displayName.length > 50
        ) {

          return res.status(400).json({
            error:
              "الاسم طويل جدًا."
          });

        }

        db.prepare(`
          UPDATE users
          SET
            display_name = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(
          String(displayName),
          Number(user.id)
        );

        const updatedUser =
          getCurrentUser(req);

        return res.json({

          success: true,

          authenticated: true,

          needsName: false,

          user: updatedUser

        });

      } catch (error) {

        console.error(
          "NAME ERROR:",
          error
        );

        return res.status(500).json({
          error:
            "حدث خطأ أثناء حفظ الاسم."
        });

      }
    }
  );

  // ======================================
  // LOGOUT
  // ======================================

  app.post(
    "/api/auth/logout",
    (req, res) => {

      try {

        const cookies =
          parseCookies(req);

        const token =
          cookies.kingai_session;

        if (token) {

          const tokenHash =
            hashSessionToken(token);

          db.prepare(`
            DELETE FROM sessions
            WHERE token_hash = ?
          `).run(
            String(tokenHash)
          );

        }

        clearSessionCookie(res);

        return res.json({
          authenticated: false
        });

      } catch (error) {

        console.error(
          "LOGOUT ERROR:",
          error
        );

        clearSessionCookie(res);

        return res.json({
          authenticated: false
        });

      }
    }
  );

  // ======================================
  // CLEAN EXPIRED SESSIONS
  // ======================================

  setInterval(() => {

    try {

      db.prepare(`
        DELETE FROM sessions
        WHERE expires_at <= ?
      `).run(
        Number(Date.now())
      );

    } catch (error) {

      console.error(
        "SESSION CLEANUP ERROR:",
        error
      );

    }

  }, 60 * 60 * 1000);
}

// ========================================
// EXPORTS
// ========================================

module.exports = {
  db,
  registerAuthRoutes,
  getCurrentUser
};
