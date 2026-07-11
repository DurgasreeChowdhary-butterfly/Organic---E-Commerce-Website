import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Mail, Phone, MapPin, Send, Check, MessageCircle } from "lucide-react";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import Button from "@/components/common/Button";

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "919999999999";
const WHATSAPP_HREF = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi, I'd like help from the Prakruti Organics support team.")}`;

const contactSchema = z.object({
  name: z.string().min(2, "Enter your name"),
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  message: z.string().min(10, "Tell us a bit more (10+ characters)"),
});
type ContactValues = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>({ resolver: zodResolver(contactSchema) });

  function onSubmit() {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setSent(true);
        reset();
        resolve();
      }, 800);
    });
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-4 sm:py-8">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Contact" }]} />
      <h1 className="font-display text-lg sm:text-2xl md:text-3xl text-forest-700 mb-1.5 sm:mb-2">Get in Touch</h1>
      <p className="text-sm text-brown-500 mb-4 sm:mb-8 max-w-md">Questions about an order, a product, or a partnership? We'd love to hear from you.</p>

      <div className="grid md:grid-cols-2 gap-4 sm:gap-8">
        <div className="space-y-2.5 sm:space-y-4">
          <div className="rounded-2xl bg-white shadow-soft p-3.5 sm:p-5 flex items-center gap-3">
            <Mail className="w-4.5 h-4.5 text-pista-700 shrink-0" />
            <span className="text-sm text-forest-700">hello@prakrutiorganics.example</span>
          </div>
          <div className="rounded-2xl bg-white shadow-soft p-3.5 sm:p-5 flex items-center gap-3">
            <Phone className="w-4.5 h-4.5 text-pista-700 shrink-0" />
            <span className="text-sm text-forest-700">+91 99999 99999</span>
          </div>
          <div className="rounded-2xl bg-white shadow-soft p-3.5 sm:p-5 flex items-center gap-3">
            <MapPin className="w-4.5 h-4.5 text-pista-700 shrink-0" />
            <span className="text-sm text-forest-700">Bengaluru, Karnataka, India</span>
          </div>
          <a
            href={WHATSAPP_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl bg-[#25D366]/10 shadow-soft p-3.5 sm:p-5 flex items-center gap-3 hover:bg-[#25D366]/15 active:scale-[0.99] transition-all"
          >
            <MessageCircle className="w-4.5 h-4.5 text-[#25D366] shrink-0 fill-[#25D366]" />
            <div>
              <span className="text-sm font-semibold text-forest-700 block">Chat on WhatsApp</span>
              <span className="text-xs text-brown-500">Fastest way to reach our support team</span>
            </div>
          </a>
        </div>

        <div className="rounded-3xl bg-white shadow-soft p-4 sm:p-6">
          {sent ? (
            <div className="flex flex-col items-center text-center py-5 sm:py-8 animate-fade-up">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-pista-50 flex items-center justify-center mb-3 sm:mb-4">
                <Check className="w-5 h-5 sm:w-6 sm:h-6 text-pista-700" />
              </div>
              <p className="font-semibold text-forest-700 mb-1">Message sent!</p>
              <p className="text-sm text-brown-500">We'll get back to you within 1–2 business days.</p>
              <button onClick={() => setSent(false)} className="text-xs font-semibold text-pista-700 hover:underline mt-4">Send another message</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-2.5 sm:space-y-3" noValidate>
              <div>
                <input {...register("name")} placeholder="Your name" className="w-full rounded-xl border border-beige px-3.5 py-2 sm:px-4 sm:py-2.5 text-sm outline-none focus:border-pista-500" />
                {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <input type="email" {...register("email")} placeholder="you@email.com" className="w-full rounded-xl border border-beige px-3.5 py-2 sm:px-4 sm:py-2.5 text-sm outline-none focus:border-pista-500" />
                {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <textarea {...register("message")} rows={4} placeholder="How can we help?" className="w-full rounded-xl border border-beige px-3.5 py-2 sm:px-4 sm:py-2.5 text-sm outline-none focus:border-pista-500 resize-none" />
                {errors.message && <p className="text-xs text-red-600 mt-1">{errors.message.message}</p>}
              </div>
              <Button type="submit" fullWidth loading={isSubmitting} icon={<Send className="w-4 h-4" />} className="!py-2.5 !text-sm sm:!py-3">Send Message</Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
