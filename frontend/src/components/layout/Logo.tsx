import Link from "next/link";
import { Sprout } from "lucide-react";

// Text-based logo. Replace the inner markup with an <Image> to use an official logo.
export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="কৃষি সার্ভিস বিডি - হোম">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-krishi-primary text-white">
        <Sprout className="h-6 w-6" aria-hidden />
      </span>
      <span className="leading-tight">
        <span className={`block text-xl font-bold ${light ? "text-white" : "text-krishi-dark"}`}>
          কৃষি সার্ভিস বিডি
        </span>
        <span className={`block text-[11px] font-medium tracking-wide ${light ? "text-green-200" : "text-krishi-primary"}`}>
          Krishi Service BD
        </span>
      </span>
    </Link>
  );
}
