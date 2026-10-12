import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function SectionHeading({
  title,
  subtitle,
  href,
  linkLabel = "সব দেখুন",
}: {
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold text-krishi-dark sm:text-3xl">{title}</h2>
        {subtitle && <p className="mt-1 text-gray-600">{subtitle}</p>}
        <div className="mt-2 h-1 w-14 rounded bg-krishi-accent" />
      </div>
      {href && (
        <Link href={href} className="flex shrink-0 items-center text-sm font-semibold text-krishi-primary hover:underline">
          {linkLabel} <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
