const DEFAULT_NUMBER = "919999999999";

/**
 * Builds a valid wa.me deep link. wa.me only accepts a bare digit string
 * (country code + number, no "+", spaces, or dashes) — passing anything
 * else makes WhatsApp fall back to https://api.whatsapp.com/resolve/...,
 * which 404s instead of opening a chat.
 */
export function buildWhatsAppLink(message: string): string {
  const rawNumber = import.meta.env.VITE_WHATSAPP_NUMBER || DEFAULT_NUMBER;
  const digitsOnly = rawNumber.replace(/\D/g, "") || DEFAULT_NUMBER;
  return `https://wa.me/${digitsOnly}?text=${encodeURIComponent(message)}`;
}
