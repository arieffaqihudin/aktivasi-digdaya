/** Normalize an Indonesian phone to wa.me format (digits only, leading 62). */
export function normalizeWhatsAppNumber(value: string | undefined | null): string {
  let number = String(value ?? "").replace(/\D/g, "");
  if (!number) return "";
  if (number.startsWith("0")) number = "62" + number.slice(1);
  else if (number.startsWith("62")) { /* ok */ }
  else number = "62" + number;
  return number;
}

export function buildWhatsAppUrl(phone: string | undefined | null, message?: string): string | null {
  const num = normalizeWhatsAppNumber(phone);
  if (!num) return null;
  const base = `https://wa.me/${num}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function waMessageForTicket(ticketId: string): string {
  return `Halo, kami dari Tim Digdaya ingin mengonfirmasi pengajuan aktivasi Anda dengan nomor tiket ${ticketId}.`;
}
