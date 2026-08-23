require("dotenv").config();

const crypto = require("node:crypto");
const { Pool } = require("pg");

// ========================================
// DATABASE
// ========================================

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL غير موجود في ملف .env"
  );
}

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL,

  ssl: {
    rejectUnauthorized: false
  },

  max: 10,

  idleTimeoutMillis: 30000,

  connectionTimeoutMillis: 10000
});


const db = {
  query(text, params) {
    return pool.query(text, params);
  }
};


// ========================================
// DATABASE READY
// ========================================

const dbReady =
  initDatabase();

async function initDatabase() {

  const client =
    await pool.connect();

  try {

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGSERIAL PRIMARY KEY,

        email TEXT NOT NULL UNIQUE,

        password_hash TEXT NOT NULL,

        password_salt TEXT NOT NULL,

        display_name TEXT NOT NULL DEFAULT '',

        created_at
          TIMESTAMPTZ NOT NULL
          DEFAULT CURRENT_TIMESTAMP,

        updated_at
          TIMESTAMPTZ NOT NULL
          DEFAULT CURRENT_TIMESTAMP
      );


      CREATE TABLE IF NOT EXISTS sessions (
        id BIGSERIAL PRIMARY KEY,

        user_id BIGINT NOT NULL,

        token_hash TEXT NOT NULL UNIQUE,

        expires_at BIGINT NOT NULL,

        created_at
          TIMESTAMPTZ NOT NULL
          DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT sessions_user_fk
          FOREIGN KEY (user_id)
          REFERENCES users(id)
          ON DELETE CASCADE
      );


      CREATE INDEX IF NOT EXISTS
        idx_sessions_token
      ON sessions(token_hash);


      CREATE INDEX IF NOT EXISTS
        idx_sessions_user
      ON sessions(user_id);


      CREATE INDEX IF NOT EXISTS
        idx_users_email
      ON users(email);
    `);

    console.log(
      "🔐 Neon auth database ready."
    );

  } finally {

    client.release();

  }
}


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
    crypto
      .randomBytes(16)
      .toString("hex");


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
    )
    .toString("hex");


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
// SESSION TOKEN
// ========================================

function hashSessionToken(token) {

  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}


async function createSession(userId) {

  const token =
    crypto
      .randomBytes(32)
      .toString("base64url");


  const tokenHash =
    hashSessionToken(token);


  const expiresAt =
    Date.now() +
    SESSION_MS;


  await db.query(
    `
      INSERT INTO sessions (
        user_id,
        token_hash,
        expires_at
      )
      VALUES ($1, $2, $3)
    `,
    [
      Number(userId),
      String(tokenHash),
      Number(expiresAt)
    ]
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

async function getCurrentUser(req) {

  const cookies =
    parseCookies(req);


  const token =
    cookies.kingai_session;


  if (!token) {

    return null;

  }


  const tokenHash =
    hashSessionToken(token);


  try {

    const result =
      await db.query(
        `
          SELECT
            users.id,
            users.email,
            users.display_name,
            users.created_at,
            sessions.expires_at

          FROM sessions

          INNER JOIN users
            ON users.id =
               sessions.user_id

          WHERE sessions.token_hash = $1

          LIMIT 1
        `,
        [
          String(tokenHash)
        ]
      );


    const row =
      result.rows[0];


    if (!row) {

      return null;

    }


    if (
      Number(row.expires_at) <=
      Date.now()
    ) {

      await db.query(
        `
          DELETE FROM sessions
          WHERE token_hash = $1
        `,
        [
          String(tokenHash)
        ]
      );


      return null;

    }


    return {

      id:
        Number(row.id),

      email:
        String(row.email),

      displayName:
        String(
          row.display_name || ""
        ),

      createdAt:
        String(row.created_at)

    };

  } catch (error) {

    console.error(
      "GET CURRENT USER ERROR:",
      error
    );

    return null;

  }
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

    async (req, res) => {

      try {

        await dbReady;


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
          await db.query(
            `
              SELECT id
              FROM users
              WHERE email = $1
              LIMIT 1
            `,
            [
              String(email)
            ]
          );


        if (
          existing.rows.length > 0
        ) {

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
          await db.query(
            `
              INSERT INTO users (
                email,
                password_hash,
                password_salt,
                display_name
              )

              VALUES ($1, $2, $3, '')

              RETURNING
                id,
                email,
                display_name,
                created_at
            `,
            [
              String(email),
              String(hash),
              String(salt)
            ]
          );


        const user =
          result.rows[0];


        const session =
          await createSession(
            Number(user.id)
          );


        setSessionCookie(
          res,
          session.token,
          session.expiresAt
        );


        return res.status(201).json({

          authenticated: true,

          needsName: true,

          user: {

            id:
              Number(user.id),

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
          "SIGNUP ERROR:",
          error
        );


        if (
          error.code ===
          "23505"
        ) {

          return res.status(409).json({
            error:
              "هذا البريد الإلكتروني مستخدم بالفعل."
          });

        }


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

    async (req, res) => {

      try {

        await dbReady;


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


        const result =
          await db.query(
            `
              SELECT
                id,
                email,
                password_hash,
                password_salt,
                display_name,
                created_at

              FROM users

              WHERE email = $1

              LIMIT 1
            `,
            [
              String(email)
            ]
          );


        const user =
          result.rows[0];


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
          await createSession(
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

            id:
              Number(user.id),

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

    async (req, res) => {

      try {

        await dbReady;


        const user =
          await getCurrentUser(req);


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

      } catch (error) {

        console.error(
          "ME ERROR:",
          error
        );


        return res.status(500).json({
          error:
            "حدث خطأ أثناء التحقق من الحساب."
        });

      }

    }
  );


  // ======================================
  // SET NAME
  // ======================================

  app.post(
    "/api/auth/name",

    async (req, res) => {

      try {

        await dbReady;


        const user =
          await getCurrentUser(req);


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


        await db.query(
          `
            UPDATE users

            SET
              display_name = $1,
              updated_at = CURRENT_TIMESTAMP

            WHERE id = $2
          `,
          [
            String(displayName),
            Number(user.id)
          ]
        );


        const updatedUser =
          await getCurrentUser(req);


        return res.json({

          success: true,

          authenticated: true,

          needsName: false,

          user:
            updatedUser

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

    async (req, res) => {

      try {

        await dbReady;


        const cookies =
          parseCookies(req);


        const token =
          cookies.kingai_session;


        if (token) {

          const tokenHash =
            hashSessionToken(token);


          await db.query(
            `
              DELETE FROM sessions

              WHERE token_hash = $1
            `,
            [
              String(tokenHash)
            ]
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

  setInterval(
    async () => {

      try {

        await db.query(
          `
            DELETE FROM sessions

            WHERE expires_at <= $1
          `,
          [
            Number(Date.now())
          ]
        );

      } catch (error) {

        console.error(
          "SESSION CLEANUP ERROR:",
          error
        );

      }

    },
    60 * 60 * 1000
  );

}


// ========================================
// EXPORTS
// ========================================

module.exports = {

  db,

  dbReady,

  registerAuthRoutes,

  getCurrentUser

};
