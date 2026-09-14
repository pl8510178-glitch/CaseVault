import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDirectory = path.join(__dirname, "..", "data");

if (!fs.existsSync(dataDirectory)) {
  fs.mkdirSync(dataDirectory, { recursive: true });
}

const databasePath = path.join(dataDirectory, "casevault.db");

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
    role TEXT NOT NULL DEFAULT 'user',
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
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
      REFERENCES users(id)
      ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS otp_challenges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    officer_id TEXT NOT NULL,
    code_hash TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    verified INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
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

  CREATE INDEX IF NOT EXISTS idx_otp_officer
    ON otp_challenges(officer_id);
`);

export default db;