import { MessageCircle } from "lucide-react";
import { buildWhatsAppLink } from "@/utils/whatsapp";

/** Floating WhatsApp support button, fixed bottom-right on every page. */
export default function WhatsAppButton() {
  return (
    <a
      href={buildWhatsAppLink("Hi, I'd like help from the Prakruti Organics support team.")}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 rounded-full shadow-glass bg-[#25D366] p-3 sm:p-4 text-white hover:scale-110 transition-transform duration-200"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 fill-white" />
    </a>
  );
}
