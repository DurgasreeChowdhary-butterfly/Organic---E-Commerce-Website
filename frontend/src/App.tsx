import AppRoutes from "@/routes/AppRoutes";
import WhatsAppButton from "@/components/common/WhatsAppButton";
import ChatbotWidget from "@/components/chatbot/ChatbotWidget";

/**
 * Root application component. Global providers (Redux, Router) are
 * mounted in main.tsx; this component owns app-wide chrome like the
 * floating WhatsApp button and AI chatbot widget.
 */
export default function App() {
  return (
    <>
      <AppRoutes />
      <WhatsAppButton />
      <ChatbotWidget />
    </>
  );
}
