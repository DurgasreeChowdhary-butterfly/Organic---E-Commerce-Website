import { useState, useRef, useEffect } from "react";
import { MessageSquareText, X, Send, Leaf } from "lucide-react";

interface Message {
  id: number;
  from: "bot" | "user";
  text: string;
}

const INITIAL: Message[] = [
  { id: 1, from: "bot", text: "Namaste! 🌿 I'm the Prakruti assistant. Ask me about products, orders, or shipping." },
];

/** Dummy FAQ/recommendation chatbot with scripted replies (no real AI call yet). */
export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  function scriptedReply(text: string): string {
    const lower = text.toLowerCase();
    if (lower.includes("order") || lower.includes("track")) return "You can track all your orders under My Account → Orders. Want me to open that for you?";
    if (lower.includes("oil")) return "Our cold-pressed oils (groundnut, coconut, sesame) are best sellers — extracted below 40°C to keep nutrients intact.";
    if (lower.includes("millet")) return "We stock Foxtail, Little, and Kodo millet — all stone-polished, no added chemicals.";
    if (lower.includes("delivery") || lower.includes("shipping")) return "Orders above ₹499 ship free and usually arrive in 2–4 business days.";
    if (lower.includes("human") || lower.includes("agent") || lower.includes("whatsapp")) return "Sure — I can connect you to our team on WhatsApp for anything I can't resolve.";
    return "Got it! I'm a demo assistant right now, so my replies are scripted — but I'd normally recommend products and answer this from our live catalog.";
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now(), from: "user", text: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, { id: Date.now() + 1, from: "bot", text: scriptedReply(userMsg.text) }]);
      setTyping(false);
    }, 900);
  }

  return (
    <div className="fixed bottom-6 left-6 z-40">
      {open && (
        <div className="mb-3 w-[90vw] max-w-sm rounded-3xl bg-white shadow-glass overflow-hidden animate-scale-in flex flex-col" style={{ height: 440 }}>
          <div className="bg-forest-700 text-white px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <Leaf className="w-4 h-4 text-gold" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight">Prakruti Assistant</p>
                <p className="text-[11px] text-pista-100/80 leading-tight">Usually replies instantly</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat"><X className="w-4.5 h-4.5" /></button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-cream">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${m.from === "user" ? "bg-forest-700 text-white rounded-br-sm" : "bg-white text-forest-700 shadow-soft rounded-bl-sm"}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="bg-white shadow-soft rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-sm text-brown-500">typing…</div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="px-4 py-2 border-t border-beige">
            <a
              href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || "919999999999"}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-pista-700 hover:underline"
            >
              Continue on WhatsApp →
            </a>
          </div>

          <form onSubmit={handleSend} className="flex items-center gap-2 p-3 border-t border-beige">
            <input
              value={input} onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about products, orders..."
              className="flex-1 rounded-full bg-beige/50 px-4 py-2.5 text-sm outline-none"
            />
            <button type="submit" className="w-10 h-10 rounded-full bg-forest-700 text-white flex items-center justify-center shrink-0" aria-label="Send">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="rounded-full shadow-glass bg-forest-700 p-4 text-white hover:scale-110 transition-transform duration-200"
        aria-label="Open chat assistant"
      >
        {open ? <X className="w-6 h-6" /> : <MessageSquareText className="w-6 h-6" />}
      </button>
    </div>
  );
}
