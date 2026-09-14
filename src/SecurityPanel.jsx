import { useEffect, useState } from "react";
import { createBackup, getSecurityStatus } from "./SecurityApi";
import "./SecurityPanel.css";

export default function SecurityPanel() {
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState("Loading security status…");

  useEffect(() => {
    getSecurityStatus()
      .then((result) => {
        setStatus(result);
        setMessage("");
      })
      .catch((error) => setMessage(error.message));
  }, []);

  async function makeBackup() {
    try {
      const result = await createBackup();

      setStatus((current) => ({
        ...current,
        backups: result,
      }));

      setMessage(`Encrypted backup created: ${result.filename}`);
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <section className="security-panel">
      <div className="security-panel__heading">
        <div>
          <p>SECURITY & BACKUP</p>
          <h2>Protection status</h2>
        </div>

        <span className="security-panel__role">
          {status?.role || "Not authenticated"}
        </span>
      </div>

      <div className="security-panel__grid">
        <article>
          <span>Encryption</span>
          <strong>AES-256-GCM</strong>
          <small>
            Server-side encrypted data and snapshots
          </small>
        </article>

        <article>
          <span>Authentication</span>
          <strong>
            {status?.mfa === "otp"
              ? "MFA enabled"
              : "Sign in required"}
          </strong>
          <small>
            Short-lived OTP and HttpOnly session
          </small>
        </article>

        <article>
          <span>Audit trail</span>
          <strong>
            {status?.audit || "Unavailable"}
          </strong>
          <small>
            Secrets and personal identifiers are excluded
          </small>
        </article>

        <article>
          <span>Backup retention</span>
          <strong>
            {status?.backups?.immutable
              ? "Immutable"
              : "Action required"}
          </strong>
          <small>
            {status?.backups?.message ||
              "Sign in to check backup status"}
          </small>
        </article>
      </div>

      {status?.role === "admin" && (
        <button type="button" onClick={makeBackup}>
          Create encrypted local backup
        </button>
      )}

      {message && (
        <p className="security-panel__message">
          {message}
        </p>
      )}
    </section>
  );
}