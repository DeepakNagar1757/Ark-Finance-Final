import { MessageCircle } from "lucide-react";
import { SITE, whatsappLink } from "@/lib/site";

export function WhatsAppButton() {
  return (
    <a
      href={whatsappLink()}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-primary py-3 pl-3 pr-4 text-sm font-semibold text-primary-foreground shadow-elevated transition-transform hover:scale-[1.03]"
      aria-label={`Chat with ${SITE.shortName} on WhatsApp`}
    >
      <span className="inline-flex size-8 items-center justify-center rounded-full bg-teal text-primary">
        <MessageCircle className="size-4" aria-hidden />
      </span>
      <span className="hidden sm:inline">Chat on WhatsApp</span>
    </a>
  );
}
