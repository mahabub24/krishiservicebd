import Link from "next/link";
import Image from "next/image";

export function Logo({ light = false, className = "" }: { light?: boolean; className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-center ${className}`} aria-label="কৃষি সার্ভিস বিডি - হোম">
      <div className={`relative flex items-center justify-center rounded-lg p-0.5 ${light ? "bg-white/95" : ""}`}>
        <Image
          src="/logo.png"
          alt="কৃষি সার্ভিস বিডি লোগো"
          width={260}
          height={70}
          className="h-12 sm:h-14 md:h-16 w-auto object-contain max-w-[210px] sm:max-w-[260px]"
          priority
        />
      </div>
    </Link>
  );
}
