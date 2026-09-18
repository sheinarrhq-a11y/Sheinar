import { MessageCircle } from "lucide-react";

export function WhatsAppFloat() {
  return (
    <a
      href="https://wa.me/917719490036?text=Hello%20Sheinar%2C%20I%27d%20love%20to%20know%20more%20about%20your%20collections%20and%20receive%20assistance%20with%20my%20order."
      target="_blank" rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-accent text-accent-foreground inline-flex items-center justify-center shadow-[0_15px_40px_-10px_rgba(176,141,87,0.6)] hover:scale-110 transition-transform lux-pulse"
    >
      <MessageCircle className="h-5 w-5" />
    </a>
  );
}
