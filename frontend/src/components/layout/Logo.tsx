import Link from "next/link";
import Image from "next/image";

export function Logo({ light = false, className = "" }: { light?: boolean; className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-center ${className}`} aria-label="কৃষি সার্ভিস বিডি - হোম">
      <div className={`relative flex items-center justify-center rounded-lg p-0.5 ${light ? "bg-white/95" : ""}`}>
        <Image
          src="/logo.png"
          alt="কৃষি সার্ভিস বিডি লোগো"
          width={220}
          height={60}
          className="h-11 sm:h-12 md:h-14 w-auto object-contain max-w-[190px] sm:max-w-[220px]"
          priority
        />
      </div>
    </Link>
  );
}
