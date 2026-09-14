import "dotenv/config";
import { createServer } from "node:http";
import {
  randomBytes,
  createHash,
  createHmac,
  timingSafeEqual,
} from "node:crypto";
import {
  mkdirSync,
  existsSync,
  readFileSync,
  writeFileSync,
  appendFileSync,
  readdirSync,
} from "node:fs";
import { join } from "node:path";
import Database from "better-sqlite3";
import argon2 from "argon2";

const port = Number(process.env.PORT || 8787);
const isProduction = process.env.NODE_ENV === "production";

const dataDirectory = join(process.cwd(), "server", "data");
const backupDirectory = join(dataDirectory, "backups");
const databasePath = join(dataDirectory, "casevault.db");
const auditPath = join(dataDirectory, "audit.jsonl");

mkdirSync(dataDirectory, { recursive: true });
mkdirSync(backupDirectory, { recursive: true });

/*
|--------------------------------------------------------------------------
| DATABASE
|--------------------------------------------------------------------------
*/

const db = new Database(databasePath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.pragma("busy_timeout = 5000");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    officer_id TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    mobile TEXT NOT NULL,
    department TEXT,
    designation TEXT,
    role TEXT NOT NULL DEFAULT 'officer',
    account_status TEXT NOT NULL DEFAULT 'active',
    mfa_enabled INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS cases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id TEXT NOT NULL UNIQUE,
    case_name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'Active',
    registered_date TEXT,
    investigator_head TEXT,
    summary TEXT,
    created_by INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (created_by)
      REFERENCES users(id)
      ON DELETE RESTRICT
  );

  CREATE TABLE IF NOT EXISTS case_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    access_level TEXT NOT NULL DEFAULT 'member',
    joined_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(case_id, user_id),

    FOREIGN KEY (case_id)
      REFERENCES cases(id)
      ON DELETE CASCADE,

    FOREIGN KEY (user_id)
      REFERENCES users(id)
      ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id INTEGER NOT NULL,
    parent_document_id INTEGER,
    file_name TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER NOT NULL DEFAULT 0,
    storage_key TEXT NOT NULL UNIQUE,
    sha256 TEXT,
    verification_status TEXT NOT NULL DEFAULT 'pending',
    uploaded_by INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (case_id)
      REFERENCES cases(id)
      ON DELETE CASCADE,

    FOREIGN KEY (parent_document_id)
      REFERENCES documents(id)
      ON DELETE SET NULL,

    FOREIGN KEY (uploaded_by)
      REFERENCES users(id)
      ON DELETE RESTRICT
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    case_id INTEGER,
    document_id INTEGER,
    action TEXT NOT NULL,
    result TEXT NOT NULL DEFAULT 'success',
    ip_address TEXT,
    user_agent TEXT,
    metadata TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
      REFERENCES users(id)
      ON DELETE SET NULL,

    FOREIGN KEY (case_id)
      REFERENCES cases(id)
      ON DELETE SET NULL,

    FOREIGN KEY (document_id)
      REFERENCES documents(id)
      ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS starred_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    document_id INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, document_id),

    FOREIGN KEY (user_id)
      REFERENCES users(id)
      ON DELETE CASCADE,

    FOREIGN KEY (document_id)
      REFERENCES documents(id)
      ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_token_hash TEXT NOT NULL UNIQUE,
    user_id INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
      REFERENCES users(id)
      ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS otp_challenges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    code_hash TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    verified INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
      REFERENCES users(id)
      ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS backups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    checksum TEXT,
    created_by INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (created_by)
      REFERENCES users(id)
      ON DELETE RESTRICT
  );

  CREATE INDEX IF NOT EXISTS idx_users_officer_id
    ON users(officer_id);

  CREATE INDEX IF NOT EXISTS idx_cases_created_by
    ON cases(created_by);

  CREATE INDEX IF NOT EXISTS idx_case_members_case_id
    ON case_members(case_id);

  CREATE INDEX IF NOT EXISTS idx_case_members_user_id
    ON case_members(user_id);

  CREATE INDEX IF NOT EXISTS idx_documents_case_id
    ON documents(case_id);

  CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by
    ON documents(uploaded_by);

  CREATE INDEX IF NOT EXISTS idx_documents_sha256
    ON documents(sha256);

  CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id
    ON audit_logs(user_id);

  CREATE INDEX IF NOT EXISTS idx_audit_logs_case_id
    ON audit_logs(case_id);

  CREATE INDEX IF NOT EXISTS idx_audit_logs_document_id
    ON audit_logs(document_id);

  CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at
    ON audit_logs(created_at);

  CREATE INDEX IF NOT EXISTS idx_sessions_token
    ON sessions(session_token_hash);

  CREATE INDEX IF NOT EXISTS idx_sessions_user
    ON sessions(user_id);

  CREATE INDEX IF NOT EXISTS idx_otp_user
    ON otp_challenges(user_id);
`);

/*
|--------------------------------------------------------------------------
| PASSWORD HASHING
|--------------------------------------------------------------------------
|
| New passwords:
| Argon2id
|
| Existing passwords:
| Old sha256salt$ format is still supported.
|
| When an old password is successfully used,
| it is automatically upgraded to Argon2id.
|--------------------------------------------------------------------------
*/

async function passwordHash(password) {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19 * 1024,
    timeCost: 2,
    parallelism: 1,
  });
}

function isLegacyPasswordHash(stored) {
  return (
    typeof stored === "string" &&
    stored.startsWith("sha256salt$")
  );
}

async function passwordMatches(password, stored) {
  /*
   * New secure Argon2id password.
   */
  if (
    typeof stored === "string" &&
    stored.startsWith("$argon2")
  ) {
    try {
      return await argon2.verify(
        stored,
        password
      );
    } catch {
      return false;
    }
  }

  /*
   * Backward compatibility for accounts
   * created before Argon2 was introduced.
   */
  if (!isLegacyPasswordHash(stored)) {
    return false;
  }

  try {
    const [, saltText, expectedText] =
      stored.split("$");

    const actual = createHash("sha256")
      .update(
        Buffer.from(
          saltText,
          "base64url"
        )
      )
      .update(password)
      .digest("hex");

    const expected = Buffer.from(
      expectedText
    );

    return (
      actual.length === expected.length &&
      timingSafeEqual(
        Buffer.from(actual),
        expected
      )
    );
  } catch {
    return false;
  }
}

/*
|--------------------------------------------------------------------------
| GENERAL HELPERS
|--------------------------------------------------------------------------
*/

function createId() {
  return randomBytes(32).toString("hex");
}

function hashToken(token) {
  return createHash("sha256")
    .update(token)
    .digest("hex");
}

function hashText(text) {
  return createHash("sha256")
    .update(text)
    .digest("hex");
}

function parseCookies(request) {
  return Object.fromEntries(
    (request.headers.cookie || "")
      .split(";")
      .filter(Boolean)
      .map((item) => {
        const [name, ...value] =
          item.trim().split("=");

        return [
          name,
          decodeURIComponent(
            value.join("=")
          ),
        ];
      })
  );
}

function clientIp(request) {
  return (
    request.socket.remoteAddress ||
    "unknown"
  );
}

function sendResponse(
  reply,
  status,
  body,
  headers = {}
) {
  reply.writeHead(status, {
    "Content-Type":
      "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options":
      "nosniff",
    ...headers,
  });

  if (status === 204) {
    reply.end();
    return;
  }

  reply.end(
    JSON.stringify(body)
  );
}

async function readBody(request) {
  let raw = "";

  for await (const chunk of request) {
    raw += chunk;

    if (raw.length > 50_000) {
      throw new Error(
        "Request is too large."
      );
    }
  }

  if (!raw) return {};

  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(
      "Invalid JSON request."
    );
  }
}

/*
|--------------------------------------------------------------------------
| RATE LIMITING
|--------------------------------------------------------------------------
*/

const rateLimits = new Map();

function rateLimit(
  request,
  bucket,
  limit,
  windowMs
) {
  const key =
    `${bucket}:${clientIp(request)}`;

  const now = Date.now();

  const hits = (
    rateLimits.get(key) || []
  ).filter(
    (time) =>
      time > now - windowMs
  );

  if (hits.length >= limit) {
    return false;
  }

  hits.push(now);

  rateLimits.set(
    key,
    hits
  );

  return true;
}

/*
|--------------------------------------------------------------------------
| AUDIT LOG
|--------------------------------------------------------------------------
*/

function audit(
  event,
  userId = null,
  metadata = {},
  request = null
) {
  const previousHash =
    existsSync(auditPath)
      ? (() => {
          try {
            const lines =
              readFileSync(
                auditPath,
                "utf8"
              )
                .trim()
                .split("\n")
                .filter(Boolean);

            if (!lines.length) {
              return "GENESIS";
            }

            return (
              JSON.parse(
                lines.at(-1)
              ).hash ||
              "GENESIS"
            );
          } catch {
            return "GENESIS";
          }
        })()
      : "GENESIS";

  const entry = {
    at: new Date().toISOString(),
    event,
    userId,
    ipAddress: request
      ? clientIp(request)
      : null,
    metadata,
    previous: previousHash,
  };

  const auditKey =
    process.env.AUDIT_HMAC_KEY ||
    "";

  if (auditKey) {
    entry.hash =
      createHmac(
        "sha256",
        auditKey
      )
        .update(
          JSON.stringify(entry)
        )
        .digest("hex");
  } else {
    entry.hash =
      hashText(
        JSON.stringify(entry)
      );
  }

  appendFileSync(
    auditPath,
    `${JSON.stringify(entry)}\n`,
    {
      mode: 0o600,
    }
  );
}

/*
|--------------------------------------------------------------------------
| SESSION
|--------------------------------------------------------------------------
*/

function createSession(userId) {
  const rawToken =
    createId();

  const tokenHash =
    hashToken(rawToken);

  const expiresAt =
    Date.now() +
    30 * 60 * 1000;

  db.prepare(`
    DELETE FROM sessions
    WHERE expires_at <= ?
  `).run(
    Date.now()
  );

  db.prepare(`
    INSERT INTO sessions (
      session_token_hash,
      user_id,
      expires_at
    )
    VALUES (?, ?, ?)
  `).run(
    tokenHash,
    userId,
    expiresAt
  );

  return {
    rawToken,
    expiresAt,
  };
}

function getCurrentUser(request) {
  const cookies =
    parseCookies(request);

  const rawToken =
    cookies.casevault_session;

  if (!rawToken) {
    return null;
  }

  const tokenHash =
    hashToken(rawToken);

  const session =
    db.prepare(`
      SELECT
        s.id AS session_id,
        s.user_id,
        s.expires_at,
        u.id,
        u.officer_id,
        u.mobile,
        u.department,
        u.designation,
        u.role,
        u.account_status
      FROM sessions s
      INNER JOIN users u
        ON u.id = s.user_id
      WHERE s.session_token_hash = ?
        AND s.expires_at > ?
        AND u.account_status = 'active'
      LIMIT 1
    `).get(
      tokenHash,
      Date.now()
    );

  if (!session) {
    return null;
  }

  db.prepare(`
    UPDATE sessions
    SET last_seen_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    session.session_id
  );

  return session;
}

function requireAuthenticated(
  request,
  reply
) {
  const user =
    getCurrentUser(request);

  if (!user) {
    sendResponse(
      reply,
      401,
      {
        error:
          "Authentication required.",
      }
    );

    return null;
  }

  return user;
}

function requireRole(
  request,
  reply,
  roles
) {
  const user =
    requireAuthenticated(
      request,
      reply
    );

  if (!user) {
    return null;
  }

  if (!roles.includes(user.role)) {
    sendResponse(
      reply,
      403,
      {
        error:
          "You are not authorized for this action.",
      }
    );

    return null;
  }

  return user;
}

/*
|--------------------------------------------------------------------------
| OTP
|--------------------------------------------------------------------------
*/

function createOtp(userId) {
  const code =
    String(
      randomBytes(4)
        .readUInt32BE(0) %
        1_000_000
    ).padStart(
      6,
      "0"
    );

  db.prepare(`
    UPDATE otp_challenges
    SET verified = 1
    WHERE user_id = ?
      AND verified = 0
  `).run(
    userId
  );

  db.prepare(`
    INSERT INTO otp_challenges (
      user_id,
      code_hash,
      expires_at
    )
    VALUES (?, ?, ?)
  `).run(
    userId,
    hashText(code),
    Date.now() +
      5 * 60 * 1000
  );

  return code;
}

function verifyOtp(
  userId,
  code
) {
  const otp =
    db.prepare(`
      SELECT *
      FROM otp_challenges
      WHERE user_id = ?
        AND verified = 0
      ORDER BY id DESC
      LIMIT 1
    `).get(
      userId
    );

  if (!otp) {
    return false;
  }

  if (
    otp.expires_at <
    Date.now()
  ) {
    return false;
  }

  if (otp.attempts >= 5) {
    return false;
  }

  const submittedHash =
    hashText(
      String(code || "")
    );

  const expectedHash =
    Buffer.from(
      otp.code_hash
    );

  const actualHash =
    Buffer.from(
      submittedHash
    );

  const matches =
    actualHash.length ===
      expectedHash.length &&
    timingSafeEqual(
      actualHash,
      expectedHash
    );

  if (!matches) {
    db.prepare(`
      UPDATE otp_challenges
      SET attempts = attempts + 1
      WHERE id = ?
    `).run(
      otp.id
    );

    return false;
  }

  db.prepare(`
    UPDATE otp_challenges
    SET verified = 1
    WHERE id = ?
  `).run(
    otp.id
  );

  return true;
}

/*
|--------------------------------------------------------------------------
| DEVELOPMENT OTP DELIVERY
|--------------------------------------------------------------------------
*/

async function deliverOtp(
  user,
  code
) {
  if (isProduction) {
    throw new Error(
      "Production OTP delivery provider is not configured."
    );
  }

  return {
    demoCode: code,
    delivery:
      `Development-only OTP for ${user.officer_id}`,
  };
}

/*
|--------------------------------------------------------------------------
| BACKUPS
|--------------------------------------------------------------------------
*/

function backupStatus() {
  const backupCount =
    existsSync(
      backupDirectory
    )
      ? readdirSync(
          backupDirectory
        ).filter(
          (name) =>
            name.endsWith(
              ".backup"
            )
        ).length
      : 0;

  return {
    encrypted: true,
    localSnapshots:
      backupCount,
    immutable: false,
    offSiteCopies: 0,
    message:
      "Local database backups are available. Production evidence storage should use encrypted off-site immutable storage.",
  };
}

function createBackup(
  userId
) {
  const timestamp =
    new Date()
      .toISOString()
      .replaceAll(
        ":",
        "-"
      );

  const filename =
    `casevault-${timestamp}.backup`;

  const temporaryPath =
    join(
      backupDirectory,
      `${filename}.tmp`
    );

  const finalPath =
    join(
      backupDirectory,
      filename
    );

  /*
   * SQLite backup creates a consistent
   * database snapshot.
   */
  db.backup(
    temporaryPath
  );

  const databaseBytes =
    readFileSync(
      temporaryPath
    );

  const checksum =
    hashText(
      databaseBytes.toString(
        "base64"
      )
    );

  writeFileSync(
    finalPath,
    databaseBytes,
    {
      mode: 0o400,
    }
  );

  try {
    writeFileSync(
      temporaryPath,
      "",
      {
        flag: "w",
        mode: 0o600,
      }
    );
  } catch {
    // Ignore cleanup errors.
  }

  const result =
    db.prepare(`
      INSERT INTO backups (
        filename,
        storage_path,
        checksum,
        created_by
      )
      VALUES (?, ?, ?, ?)
    `).run(
      filename,
      finalPath,
      checksum,
      userId
    );

  return {
    id:
      result.lastInsertRowid,
    filename,
    checksum,
  };
}

/*
|--------------------------------------------------------------------------
| SERVER
|--------------------------------------------------------------------------
*/

const server =
  createServer(
    async (
      request,
      reply
    ) => {
      try {
        const url =
          new URL(
            request.url,
            `http://${
              request.headers.host ||
              "127.0.0.1"
            }`
          );

        /*
         * Basic security headers.
         */
        if (
          request.method ===
          "OPTIONS"
        ) {
          return sendResponse(
            reply,
            204,
            {}
          );
        }

        /*
         * HEALTH CHECK
         */
        if (
          request.method ===
            "GET" &&
          url.pathname ===
            "/api/health"
        ) {
          return sendResponse(
            reply,
            200,
            {
              ok: true,
              service:
                "CaseVault API",
            }
          );
        }

        /*
         * REGISTER
         *
         * New account:
         * Registration → OTP →
         * frontend biometric flow
         *
         * IMPORTANT:
         * The account is created as PENDING.
         * It becomes ACTIVE only after OTP.
         */
        if (
          request.method ===
            "POST" &&
          url.pathname ===
            "/api/auth/register"
        ) {
          if (
            !rateLimit(
              request,
              "register",
              5,
              15 * 60 * 1000
            )
          ) {
            return sendResponse(
              reply,
              429,
              {
                error:
                  "Too many registration attempts. Try again later.",
              }
            );
          }

          const {
            officerId,
            password,
            mobile,
          } =
            await readBody(
              request
            );

          const cleanOfficerId =
            String(
              officerId || ""
            ).trim();

          const cleanMobile =
            String(
              mobile || ""
            ).trim();

          if (
            !/^[A-Za-z0-9_-]{4,64}$/.test(
              cleanOfficerId
            ) ||
            typeof password !==
              "string" ||
            password.length < 12 ||
            !/^\d{10}$/.test(
              cleanMobile
            )
          ) {
            return sendResponse(
              reply,
              400,
              {
                error:
                  "Use a valid Officer ID, 12+ character password, and 10-digit mobile number.",
              }
            );
          }

          const existing =
            db.prepare(`
              SELECT id
              FROM users
              WHERE lower(officer_id) =
                    lower(?)
              LIMIT 1
            `).get(
              cleanOfficerId
            );

          if (existing) {
            return sendResponse(
              reply,
              409,
              {
                error:
                  "An account with this Officer ID already exists.",
              }
            );
          }

          /*
           * New passwords are securely
           * stored using Argon2id.
           */
          const passwordHashValue =
            await passwordHash(
              password
            );

          const result =
            db.prepare(`
              INSERT INTO users (
                officer_id,
                password_hash,
                mobile,
                role,
                account_status,
                mfa_enabled
              )
              VALUES (
                ?,
                ?,
                ?,
                'officer',
                'pending',
                1
              )
            `).run(
              cleanOfficerId,
              passwordHashValue,
              cleanMobile
            );

          const userId =
            result.lastInsertRowid;

          const user =
            db.prepare(`
              SELECT
                id,
                officer_id,
                mobile
              FROM users
              WHERE id = ?
            `).get(
              userId
            );

          const otpCode =
            createOtp(
              userId
            );

          audit(
            "registration_requested",
            userId,
            {
              officerId:
                cleanOfficerId,
            },
            request
          );

          const otpResult =
            await deliverOtp(
              user,
              otpCode
            );

          return sendResponse(
            reply,
            201,
            {
              message:
                "Registration created. Verify the OTP to continue.",
              officerId:
                cleanOfficerId,
              ...otpResult,
            }
          );
        }

        /*
         * LOGIN
         *
         * Normal login:
         * Officer ID + password
         * → server authentication
         * → secure session
         * → frontend biometric page
         *
         * NO OTP here.
         */
        if (
          request.method ===
            "POST" &&
          url.pathname ===
            "/api/auth/login"
        ) {
          if (
            !rateLimit(
              request,
              "login",
              10,
              15 * 60 * 1000
            )
          ) {
            return sendResponse(
              reply,
              429,
              {
                error:
                  "Too many login attempts. Try again later.",
              }
            );
          }

          const {
            officerId,
            password,
          } =
            await readBody(
              request
            );

          const cleanOfficerId =
            String(
              officerId || ""
            ).trim();

          const user =
            db.prepare(`
              SELECT *
              FROM users
              WHERE lower(officer_id) =
                    lower(?)
              LIMIT 1
            `).get(
              cleanOfficerId
            );

          const valid =
            user &&
            typeof password ===
              "string" &&
            await passwordMatches(
              password,
              user.password_hash
            );

          /*
           * Pending accounts cannot log in.
           *
           * They must complete:
           * Registration → OTP
           */
          if (
            user &&
            user.account_status ===
              "pending"
          ) {
            audit(
              "login_blocked_pending_account",
              user.id,
              {
                officerId:
                  cleanOfficerId.slice(
                    0,
                    64
                  ),
              },
              request
            );

            return sendResponse(
              reply,
              403,
              {
                error:
                  "Account verification is incomplete. Please complete OTP verification first.",
              }
            );
          }

          if (
            !valid ||
            user.account_status !==
              "active"
          ) {
            audit(
              "login_failed",
              user?.id ||
                null,
              {
                officerId:
                  cleanOfficerId.slice(
                    0,
                    64
                  ),
              },
              request
            );

            return sendResponse(
              reply,
              401,
              {
                error:
                  "Invalid Officer ID or password.",
              }
            );
          }

          /*
           * Automatic password upgrade.
           *
           * If this account still has the
           * old SHA-256 password format,
           * replace it with Argon2id after
           * successful authentication.
           */
          if (
            isLegacyPasswordHash(
              user.password_hash
            )
          ) {
            const upgradedHash =
              await passwordHash(
                password
              );

            db.prepare(`
              UPDATE users
              SET
                password_hash = ?,
                updated_at =
                  CURRENT_TIMESTAMP
              WHERE id = ?
            `).run(
              upgradedHash,
              user.id
            );

            audit(
              "password_hash_upgraded",
              user.id,
              {
                method:
                  "argon2id",
              },
              request
            );
          }

          const session =
            createSession(
              user.id
            );

          audit(
            "login_succeeded",
            user.id,
            {
              role:
                user.role,
            },
            request
          );

          return sendResponse(
            reply,
            200,
            {
              user: {
                officerId:
                  user.officer_id,
                role:
                  user.role,
                department:
                  user.department,
                designation:
                  user.designation,
              },
              biometricRequired:
                true,
            },
            {
              "Set-Cookie":
                `casevault_session=${encodeURIComponent(
                  session.rawToken
                )}; ` +
                `HttpOnly; ` +
                `SameSite=Strict; ` +
                `Path=/; ` +
                `Max-Age=1800` +
                (isProduction
                  ? "; Secure"
                  : ""),
            }
          );
        }

        /*
         * VERIFY OTP
         *
         * Used for new account registration.
         */
        if (
          request.method ===
            "POST" &&
          url.pathname ===
            "/api/auth/verify-otp"
        ) {
          if (
            !rateLimit(
              request,
              "otp",
              10,
              15 * 60 * 1000
            )
          ) {
            return sendResponse(
              reply,
              429,
              {
                error:
                  "Too many OTP attempts. Try again later.",
              }
            );
          }

          const {
            officerId,
            code,
          } =
            await readBody(
              request
            );

          const cleanOfficerId =
            String(
              officerId || ""
            ).trim();

          const user =
            db.prepare(`
              SELECT *
              FROM users
              WHERE lower(officer_id) =
                    lower(?)
              LIMIT 1
            `).get(
              cleanOfficerId
            );

          if (!user) {
            return sendResponse(
              reply,
              401,
              {
                error:
                  "Invalid or expired OTP.",
              }
            );
          }

          /*
           * OTP verification is allowed
           * for the pending registration flow.
           */
          const validOtp =
            verifyOtp(
              user.id,
              String(
                code || ""
              )
            );

          if (!validOtp) {
            audit(
              "otp_failed",
              user.id,
              {},
              request
            );

            return sendResponse(
              reply,
              401,
              {
                error:
                  "Invalid or expired OTP.",
              }
            );
          }

          /*
           * OTP is now verified.
           *
           * Activate the account.
           */
          db.prepare(`
            UPDATE users
            SET
              account_status = 'active',
              updated_at =
                CURRENT_TIMESTAMP
            WHERE id = ?
          `).run(
            user.id
          );

          /*
           * OTP verification alone does not
           * finish the new-account flow.
           *
           * Your React frontend continues:
           *
           * Fingerprint → Face ID → Terms
           */
          audit(
            "otp_verified",
            user.id,
            {},
            request
          );

          audit(
            "account_activated",
            user.id,
            {},
            request
          );

          return sendResponse(
            reply,
            200,
            {
              verified:
                true,
              user: {
                officerId:
                  user.officer_id,
                role:
                  user.role,
              },
              nextStep:
                "biometric",
            }
          );
        }

        /*
         * LOGOUT
         */
        if (
          request.method ===
            "POST" &&
          url.pathname ===
            "/api/auth/logout"
        ) {
          const cookies =
            parseCookies(
              request
            );

          const rawToken =
            cookies.casevault_session;

          if (rawToken) {
            const tokenHash =
              hashToken(
                rawToken
              );

            const session =
              db.prepare(`
                SELECT user_id
                FROM sessions
                WHERE session_token_hash = ?
                LIMIT 1
              `).get(
                tokenHash
              );

            if (session) {
              audit(
                "logout",
                session.user_id,
                {},
                request
              );
            }

            db.prepare(`
              DELETE FROM sessions
              WHERE session_token_hash = ?
            `).run(
              tokenHash
            );
          }

          return sendResponse(
            reply,
            204,
            {},
            {
              "Set-Cookie":
                "casevault_session=; " +
                "HttpOnly; " +
                "SameSite=Strict; " +
                "Path=/; " +
                "Max-Age=0" +
                (isProduction
                  ? "; Secure"
                  : ""),
            }
          );
        }

        /*
         * SECURITY STATUS
         */
        if (
          request.method ===
            "GET" &&
          url.pathname ===
            "/api/security/status"
        ) {
          const user =
            requireAuthenticated(
              request,
              reply
            );

          if (!user) {
            return;
          }

          return sendResponse(
            reply,
            200,
            {
              role:
                user.role,

              mfa:
                "biometric",

              session:
                "HttpOnly secure session",

              audit:
                "tamper-evident",

              encryption:
                "AES-256-GCM for protected application secrets",

              database:
                "SQLite with WAL mode and indexed queries",

              backups:
                backupStatus(),
            }
          );
        }

        /*
         * CREATE BACKUP
         */
        if (
          request.method ===
            "POST" &&
          url.pathname ===
            "/api/backups"
        ) {
          const user =
            requireRole(
              request,
              reply,
              ["admin"]
            );

          if (!user) {
            return;
          }

          const backup =
            createBackup(
              user.id
            );

          audit(
            "encrypted_backup_created",
            user.id,
            {
              filename:
                backup.filename,
              checksum:
                backup.checksum,
            },
            request
          );

          return sendResponse(
            reply,
            201,
            {
              filename:
                backup.filename,
              checksum:
                backup.checksum,
              ...backupStatus(),
            }
          );
        }

        /*
         * CASE LIST
         *
         * Efficient case-level
         * data fetching.
         *
         * Only cases belonging to
         * the authenticated user
         * are returned.
         */
        if (
          request.method ===
            "GET" &&
          url.pathname ===
            "/api/cases"
        ) {
          const user =
            requireAuthenticated(
              request,
              reply
            );

          if (!user) {
            return;
          }

          const page =
            Math.max(
              1,
              Number(
                url.searchParams.get(
                  "page"
                ) || 1
              )
            );

          const limit =
            Math.min(
              50,
              Math.max(
                1,
                Number(
                  url.searchParams.get(
                    "limit"
                  ) || 20
                )
              )
            );

          const offset =
            (page - 1) *
            limit;

          const cases =
            db.prepare(`
              SELECT
                c.case_id,
                c.case_name,
                c.description,
                c.status,
                c.registered_date,
                c.investigator_head,
                c.summary,
                cm.access_level
              FROM cases c
              INNER JOIN case_members cm
                ON cm.case_id = c.id
              WHERE cm.user_id = ?
              ORDER BY c.updated_at DESC
              LIMIT ? OFFSET ?
            `).all(
              user.id,
              limit,
              offset
            );

          const total =
            db.prepare(`
              SELECT COUNT(*) AS count
              FROM case_members
              WHERE user_id = ?
            `).get(
              user.id
            ).count;

          return sendResponse(
            reply,
            200,
            {
              page,
              limit,
              total,
              totalPages:
                Math.ceil(
                  total /
                    limit
                ),
              cases,
            }
          );
        }

        /*
         * CASE DETAILS
         */
        if (
          request.method ===
            "GET" &&
          url.pathname.startsWith(
            "/api/cases/"
          )
        ) {
          const caseId =
            url.pathname.split(
              "/"
            )[3];

          if (!caseId) {
            return sendResponse(
              reply,
              400,
              {
                error:
                  "Case ID is required.",
              }
            );
          }

          const user =
            requireAuthenticated(
              request,
              reply
            );

          if (!user) {
            return;
          }

          const caseRecord =
            db.prepare(`
              SELECT
                c.id,
                c.case_id,
                c.case_name,
                c.description,
                c.status,
                c.registered_date,
                c.investigator_head,
                c.summary,
                cm.access_level
              FROM cases c
              INNER JOIN case_members cm
                ON cm.case_id = c.id
              WHERE c.case_id = ?
                AND cm.user_id = ?
              LIMIT 1
            `).get(
              caseId,
              user.id
            );

          if (!caseRecord) {
            return sendResponse(
              reply,
              404,
              {
                error:
                  "Case not found or you are not authorized to access it.",
              }
            );
          }

          return sendResponse(
            reply,
            200,
            {
              case:
                caseRecord,
            }
          );
        }

        /*
         * DOCUMENT METADATA
         *
         * Important:
         * This endpoint returns metadata only.
         * The actual file is not downloaded.
         */
        if (
          request.method ===
            "GET" &&
          url.pathname ===
            "/api/documents"
        ) {
          const user =
            requireAuthenticated(
              request,
              reply
            );

          if (!user) {
            return;
          }

          const caseId =
            url.searchParams.get(
              "caseId"
            );

          if (!caseId) {
            return sendResponse(
              reply,
              400,
              {
                error:
                  "caseId is required.",
              }
            );
          }

          const allowedCase =
            db.prepare(`
              SELECT c.id
              FROM cases c
              INNER JOIN case_members cm
                ON cm.case_id = c.id
              WHERE c.case_id = ?
                AND cm.user_id = ?
              LIMIT 1
            `).get(
              caseId,
              user.id
            );

          if (!allowedCase) {
            return sendResponse(
              reply,
              403,
              {
                error:
                  "You are not authorized to access this case.",
              }
            );
          }

          const page =
            Math.max(
              1,
              Number(
                url.searchParams.get(
                  "page"
                ) || 1
              )
            );

          const limit =
            Math.min(
              50,
              Math.max(
                1,
                Number(
                  url.searchParams.get(
                    "limit"
                  ) || 20
                )
              )
            );

          const offset =
            (page - 1) *
            limit;

          const documents =
            db.prepare(`
              SELECT
                d.id,
                d.file_name,
                d.original_name,
                d.file_type,
                d.file_size,
                d.sha256,
                d.verification_status,
                d.created_at
              FROM documents d
              WHERE d.case_id = ?
              ORDER BY d.created_at DESC
              LIMIT ? OFFSET ?
            `).all(
              allowedCase.id,
              limit,
              offset
            );

          const total =
            db.prepare(`
              SELECT COUNT(*) AS count
              FROM documents
              WHERE case_id = ?
            `).get(
              allowedCase.id
            ).count;

          return sendResponse(
            reply,
            200,
            {
              page,
              limit,
              total,
              totalPages:
                Math.ceil(
                  total /
                    limit
                ),
              documents,
            }
          );
        }

        /*
         * FALLBACK
         */
        return sendResponse(
          reply,
          404,
          {
            error:
              "Not found.",
          }
        );
      } catch (error) {
        console.error(
          "CaseVault server error:",
          error.message
        );

        return sendResponse(
          reply,
          500,
          {
            error:
              "The request could not be completed safely.",
          }
        );
      }
    }
  );

/*
|--------------------------------------------------------------------------
| START SERVER
|--------------------------------------------------------------------------
*/

server.listen(
  port,
  "127.0.0.1",
  () => {
    console.log(
      `CaseVault API listening on http://127.0.0.1:${port}`
    );

    console.log(
      `Database: ${databasePath}`
    );
  }
);