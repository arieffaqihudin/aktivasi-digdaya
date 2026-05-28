// ============================================================
// Generic
// ============================================================
export function normalizePhone(input: string): string {
  const cleaned = input.replace(/[^\d+]/g, "");
  if (!cleaned) return "";
  if (cleaned.startsWith("+62")) return cleaned;
  if (cleaned.startsWith("62")) return "+" + cleaned;
  if (cleaned.startsWith("0")) return "+62" + cleaned.slice(1);
  if (cleaned.startsWith("8")) return "+62" + cleaned;
  return cleaned;
}

export function isValidNIK(nik: string) {
  return /^\d{16}$/.test(nik);
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone: string) {
  const n = normalizePhone(phone);
  return /^\+62\d{8,13}$/.test(n);
}

// ============================================================
// WhatsApp — prefix +62 sebagai fixed addon
// User hanya mengetik bagian lokal (mis. 81123456789).
// ============================================================

/** Normalisasi input WA ke bagian LOKAL (tanpa +62 / 62 / 0). Max 13 digit. */
export function normalizeWaLocal(input: string): string {
  let v = (input ?? "").replace(/\D/g, "");
  if (v.startsWith("62")) v = v.slice(2);
  if (v.startsWith("0")) v = v.slice(1);
  return v.slice(0, 13);
}

/** Bentuk simpan: +62XXXX. */
export function formatWaStored(local: string): string {
  const v = normalizeWaLocal(local);
  return v ? "+62" + v : "";
}

/** Parse stored "+62..." ke bagian lokal untuk diisi ulang ke input. */
export function parseStoredWaToLocal(stored: string | undefined | null): string {
  if (!stored) return "";
  return normalizeWaLocal(stored);
}

export function isValidWaLocal(local: string): boolean {
  const v = normalizeWaLocal(local);
  return /^\d{9,13}$/.test(v);
}

// ============================================================
// Email — suggestion & typo detection
// ============================================================

export const COMMON_EMAIL_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "yahoo.co.id",
  "outlook.com",
] as const;

const DOMAIN_TYPO_MAP: Record<string, string> = {
  "gmial.com": "gmail.com",
  "gmal.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gnail.com": "gmail.com",
  "gmaill.com": "gmail.com",
  "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "yahoo.co": "yahoo.com",
  "outlook.co": "outlook.com",
  "outlok.com": "outlook.com",
  "hotmial.com": "hotmail.com",
  "hotmai.com": "hotmail.com",
};

/** Jika user mengetik username tanpa @, kembalikan list saran lengkap. */
export function getEmailDomainSuggestions(input: string): string[] {
  const s = (input ?? "").trim();
  if (!s) return [];
  if (s.includes("@")) return [];
  // Hindari mengusulkan jika user baru mengetik 1-2 huruf
  if (s.length < 2) return [];
  return COMMON_EMAIL_DOMAINS.map((d) => `${s}@${d}`);
}

/** Jika domain merupakan typo, kembalikan saran perbaikan, else null. */
export function getEmailTypoSuggestion(input: string): string | null {
  const s = (input ?? "").trim();
  const at = s.lastIndexOf("@");
  if (at < 1 || at === s.length - 1) return null;
  const local = s.slice(0, at);
  const domain = s.slice(at + 1).toLowerCase();
  const fix = DOMAIN_TYPO_MAP[domain];
  if (!fix) return null;
  return `${local}@${fix}`;
}
