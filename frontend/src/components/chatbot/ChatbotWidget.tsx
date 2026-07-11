import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { MessageSquareText, X, Send, Leaf, RotateCcw, AlertCircle, PackageX } from "lucide-react";
import { sendChatMessage } from "@/services/chatbotService";
import { resolveImageUrl } from "@/utils/resolveImageUrl";
import { formatCurrency } from "@/utils/formatCurrency";
import type { ChatProductSuggestion } from "@/types";

interface Message {
  id: number;
  from: "bot" | "user";
  text: string;
  products?: ChatProductSuggestion[];
  escalate?: boolean;
}

const INITIAL: Message[] = [
  { id: 1, from: "bot", text: "Namaste! 🌿 I'm the Prakruti assistant. Ask me about products, orders, or shipping." },
];

const STARTER_QUESTIONS = [
  "How do I track my order?",
  "Do you have millets?",
  "What payment methods do you support?",
  "How do I cancel an order?",
];

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "919999999999";

function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/** AI-powered FAQ/product-discovery chatbot, backed by the real Gemini-grounded backend. */
export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId] = useState(() => crypto.randomUUID());
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, error]);

  async function sendText(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setError(null);
    setMessages((prev) => [...prev, { id: Date.now(), from: "user", text: trimmed }]);
    setInput("");
    setLoading(true);
    try {
      const res = await sendChatMessage(sessionId, trimmed);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, from: "bot", text: res.reply, products: res.suggested_products, escalate: res.escalate_to_whatsapp },
      ]);
    } catch {
      setError("Something went wrong reaching the assistant. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    sendText(input);
  }

  function handleClear() {
    setMessages(INITIAL);
    setError(null);
    setInput("");
  }

  const showStarters = messages.length === 1 && !loading;

  return (
    <div className="fixed bottom-6 left-6 z-40">
      {open && (
        <div className="mb-3 w-[90vw] max-w-sm rounded-3xl bg-white shadow-glass overflow-hidden animate-scale-in flex flex-col" style={{ height: 480 }}>
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
            <div className="flex items-center gap-1">
              <button onClick={handleClear} aria-label="Clear conversation" title="Clear conversation" className="p-1.5 hover:bg-white/10 rounded-full">
                <RotateCcw className="w-4 h-4" />
              </button>
              <button onClick={() => setOpen(false)} aria-label="Close chat" className="p-1.5 hover:bg-white/10 rounded-full">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-cream">
            {messages.map((m) => (
              <div key={m.id} className={`flex flex-col ${m.from === "user" ? "items-end" : "items-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${m.from === "user" ? "bg-forest-700 text-white rounded-br-sm" : "bg-white text-forest-700 shadow-soft rounded-bl-sm"}`}>
                  {m.text}
                </div>

                {m.products && m.products.length > 0 && (
                  <div className="mt-2 w-full max-w-[85%] space-y-2">
                    {m.products.map((p) => (
                      <Link
                        key={p.id}
                        to={`/products/${p.slug}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2.5 bg-white shadow-soft rounded-xl p-2 hover:bg-pista-50/60 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-lg bg-pista-50 flex items-center justify-center shrink-0 overflow-hidden">
                          {p.image_url ? (
                            <img src={resolveImageUrl(p.image_url)} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <Leaf className="w-4 h-4 text-pista-700" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-forest-700 truncate">{p.name}</p>
                          <p className="text-[11px] text-brown-500">
                            {formatCurrency(p.discount_price ?? p.price)}
                            {!p.in_stock && <span className="text-red-600 ml-1.5 inline-flex items-center gap-0.5"><PackageX className="w-3 h-3" /> Out of stock</span>}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {m.escalate && (
                  <a
                    href={whatsappLink("Hi, I need help with something the chat assistant couldn't resolve.")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 text-xs font-semibold text-pista-700 hover:underline"
                  >
                    Continue on WhatsApp →
                  </a>
                )}
              </div>
            ))}

            {showStarters && (
              <div className="flex flex-col gap-1.5 pt-1">
                {STARTER_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendText(q)}
                    className="text-left text-xs font-medium text-pista-700 bg-white shadow-soft rounded-xl px-3 py-2 hover:bg-pista-50 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white shadow-soft rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-sm text-brown-500">typing…</div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
              </div>
            )}

            <div ref={endRef} />
          </div>

          <div className="px-4 py-2 border-t border-beige">
            <a
              href={whatsappLink("Hi, I'd like help from the Prakruti Organics support team.")}
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
              maxLength={1000}
              disabled={loading}
              className="flex-1 rounded-full bg-beige/50 px-4 py-2.5 text-sm outline-none disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-10 h-10 rounded-full bg-forest-700 text-white flex items-center justify-center shrink-0 disabled:opacity-50"
              aria-label="Send"
            >
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
