// Security utilities for the clinic application

// ── Input Sanitization ──
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

// Sanitize but allow safe display (strip dangerous tags only)
export function sanitizeHTML(html: string): string {
  const dangerousTags = /<\s*\/?\s*(script|iframe|object|embed|form|input|button|link|meta|style|base)\b[^>]*>/gi;
  const dangerousAttrs = /\s(on\w+|javascript:|data:text\/html)\s*=\s*["'][^"']*["']/gi;
  return html.replace(dangerousTags, "").replace(dangerousAttrs, "");
}

// ── Rate Limiting ──
interface RateLimitEntry {
  count: number;
  firstAttempt: number;
  lockedUntil: number | null;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes lockout

export function checkRateLimit(key: string): { allowed: boolean; remainingAttempts: number; lockoutEnds?: Date } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (entry?.lockedUntil && now < entry.lockedUntil) {
    return { allowed: false, remainingAttempts: 0, lockoutEnds: new Date(entry.lockedUntil) };
  }

  if (!entry || now - entry.firstAttempt > WINDOW_MS) {
    rateLimitStore.set(key, { count: 1, firstAttempt: now, lockedUntil: null });
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS - 1 };
  }

  if (entry.count >= MAX_ATTEMPTS) {
    entry.lockedUntil = now + LOCKOUT_MS;
    rateLimitStore.set(key, entry);
    return { allowed: false, remainingAttempts: 0, lockoutEnds: new Date(entry.lockedUntil) };
  }

  entry.count++;
  rateLimitStore.set(key, entry);
  return { allowed: true, remainingAttempts: MAX_ATTEMPTS - entry.count };
}

export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

// ── Session Management ──
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes of inactivity

let lastActivity = Date.now();

export function updateActivity(): void {
  lastActivity = Date.now();
}

export function isSessionExpired(): boolean {
  return Date.now() - lastActivity > SESSION_TIMEOUT_MS;
}

export function getSessionRemainingMs(): number {
  return Math.max(0, SESSION_TIMEOUT_MS - (Date.now() - lastActivity));
}

// ── Password Validation ──
export function validatePassword(password: string): { valid: boolean; message: string } {
  if (password.length < 6) {
    return { valid: false, message: "Senha deve ter no mínimo 6 caracteres." };
  }
  if (password.length > 128) {
    return { valid: false, message: "Senha deve ter no máximo 128 caracteres." };
  }
  return { valid: true, message: "" };
}

// ── CPF Validation ──
export function validateCPF(cpf: string): boolean {
  const clean = cpf.replace(/\D/g, "");
  if (clean.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(clean)) return false; // all same digits

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(clean[i]) * (10 - i);
  let check = 11 - (sum % 11);
  if (check >= 10) check = 0;
  if (parseInt(clean[9]) !== check) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(clean[i]) * (11 - i);
  check = 11 - (sum % 11);
  if (check >= 10) check = 0;
  if (parseInt(clean[10]) !== check) return false;

  return true;
}

// ── CPF Mask ──
export function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

// ── File Upload Security ──
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const ALLOWED_DOC_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function validateFileUpload(file: File, allowDocs = false): { valid: boolean; message: string } {
  const allowedTypes = [...ALLOWED_IMAGE_TYPES, ...(allowDocs ? ALLOWED_DOC_TYPES : [])];
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, message: `Tipo de arquivo não permitido: ${file.type}` };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, message: "Arquivo muito grande. Máximo 5MB." };
  }
  return { valid: true, message: "" };
}

// ── Content Security ──
export function escapeForDisplay(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
