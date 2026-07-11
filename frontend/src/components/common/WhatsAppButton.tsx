import { MessageCircle } from "lucide-react";

/** Floating WhatsApp support button, fixed bottom-right on every page. */
export default function WhatsAppButton() {
  const number = import.meta.env.VITE_WHATSAPP_NUMBER || "919999999999";
  const text = encodeURIComponent("Hi, I'd like help from the Prakruti Organics support team.");

  return (
    <a
      href={`https://wa.me/${number}?text=${text}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 rounded-full shadow-glass bg-[#25D366] p-3 sm:p-4 text-white hover:scale-110 transition-transform duration-200"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 fill-white" />
    </a>
  );
}
