import { MessageCircle } from "lucide-react";

/** Floating WhatsApp support button, fixed bottom-right on every page. */
export default function WhatsAppButton() {
  const number = import.meta.env.VITE_WHATSAPP_NUMBER || "919999999999";

  return (
    <a
      href={`https://wa.me/${number}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 rounded-full shadow-glass bg-[#25D366] p-4 text-white hover:scale-110 transition-transform duration-200"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-6 h-6 fill-white" />
    </a>
  );
}
