import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
}

/** Shared centered modal shell: backdrop, Esc-to-close, scale-in panel. */
export default function Modal({ open, onClose, title, children, maxWidth = "max-w-lg" }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-forest-900/40 animate-fade-up" onClick={onClose} />
      <div className={`relative bg-white rounded-3xl shadow-glass w-full ${maxWidth} p-6 animate-scale-in max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl text-forest-700">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="p-1 rounded-full hover:bg-beige/60 transition-colors">
            <X className="w-5 h-5 text-forest-700" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
