import { Phone, Truck, MessageCircle } from "lucide-react";
import { SITE } from "@/lib/site";

export function AnnouncementBar() {
  return (
    <div className="bg-krishi-dark text-xs text-white sm:text-sm">
      <div className="container-x flex flex-wrap items-center justify-between gap-x-6 gap-y-1.5 py-2">
        <p className="flex items-center gap-1.5">
          <Truck className="h-4 w-4 text-krishi-accent" aria-hidden /> {SITE.deliveryNote}
        </p>
        <p className="hidden font-medium text-krishi-accent md:block">{SITE.promo}</p>
        <div className="flex items-center gap-3">
          <a
            href={`https://wa.me/88${SITE.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-krishi-accent transition"
          >
            <MessageCircle className="h-4 w-4 text-emerald-400" aria-hidden />
            <span>হোয়াটসঅ্যাপ: {SITE.phone}</span>
          </a>
          <span className="hidden sm:inline text-white/40">|</span>
          <a
            href={`tel:${SITE.whatsapp}`}
            className="flex items-center gap-1 hover:text-krishi-accent transition"
          >
            <Phone className="h-4 w-4 text-krishi-accent" aria-hidden />
            <span>সহায়তা/ফোন: {SITE.phone}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
