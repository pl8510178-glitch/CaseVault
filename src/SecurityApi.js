const API_BASE_URL = "http://localhost:8080";

async function api(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (response.status === 204) {
    return null;
  }

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Request failed.");
  }

  return result;
}


// ===============================
// AUTHENTICATION
// ===============================

export const register = ({
  officerId,
  password,
  mobile,
  fullName,
  organization,
  role,
}) =>
  api("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      officerId,
      password,
      mobile,
      fullName,
      organization,
      role,
    }),
  });


export const beginLogin = (officerId, password) =>
  api("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      officerId,
      password,
    }),
  });


export const verifyOtp = (officerId, code) =>
  api("/api/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({
      officerId,
      code,
    }),
  });


export const logout = () =>
  api("/api/auth/logout", {
    method: "POST",
  });


// ===============================
// SECURITY
// ===============================

export const getSecurityStatus = () =>
  api("/api/security/status");


export const createBackup = () =>
  api("/api/backups", {
    method: "POST",
  });