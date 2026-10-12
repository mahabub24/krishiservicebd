import Link from "next/link";
import Image from "next/image";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center" aria-label="কৃষি সার্ভিস বিডি - হোম">
      <div className={`relative flex items-center justify-center rounded-lg p-1 ${light ? "bg-white/95" : ""}`}>
        <Image
          src="/logo.png"
          alt="কৃষি সার্ভিস বিডি লোগো"
          width={180}
          height={48}
          className="h-9 sm:h-11 w-auto object-contain"
          priority
        />
      </div>
    </Link>
  );
}
