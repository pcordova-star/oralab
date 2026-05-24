"use client";

import { MessageCircle } from "lucide-react";

export function WhatsAppFAB() {
  const whatsappUrl = "https://wa.me/56936850468";

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center group"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle className="h-7 w-7 fill-white/20" />
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 font-bold whitespace-nowrap">
        ¿Dudas? Escríbenos
      </span>
    </a>
  );
}
