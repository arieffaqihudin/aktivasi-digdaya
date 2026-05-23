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
