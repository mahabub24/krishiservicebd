import { Phone, Truck } from "lucide-react";
import { SITE } from "@/lib/site";

export function AnnouncementBar() {
  return (
    <div className="bg-krishi-dark text-xs text-white sm:text-sm">
      <div className="container-x flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-2">
        <p className="flex items-center gap-1.5">
          <Truck className="h-4 w-4 text-krishi-accent" aria-hidden /> {SITE.deliveryNote}
        </p>
        <p className="hidden font-medium text-krishi-accent md:block">{SITE.promo}</p>
        <p className="flex items-center gap-1.5">
          <Phone className="h-4 w-4 text-krishi-accent" aria-hidden /> সহায়তা: {SITE.phone}
        </p>
      </div>
    </div>
  );
}
