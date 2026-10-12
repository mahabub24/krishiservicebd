import Link from "next/link";
import { Logo } from "./Logo";
import { SITE } from "@/lib/site";

const quick = [
  { href: "/products", label: "সকল পণ্য" },
  { href: "/agricultural-advice", label: "কৃষি পরামর্শ" },
  { href: "/cart", label: "কার্ট" },
  { href: "/account", label: "আমার অ্যাকাউন্ট" },
  { href: "/contact", label: "যোগাযোগ" },
];
const cats = [
  { href: "/category/improved-seeds", label: "উন্নত বীজ" },
  { href: "/category/pesticides", label: "কীটনাশক" },
  { href: "/category/fertilizers", label: "সার" },
  { href: "/category/agricultural-machinery", label: "কৃষি যন্ত্রপাতি" },
];
const policies = [
  { href: "/pages/privacy-policy", label: "প্রাইভেসি পলিসি" },
  { href: "/pages/terms-and-conditions", label: "শর্তাবলী" },
  { href: "/pages/return-refund-policy", label: "রিটার্ন ও রিফান্ড পলিসি" },
];

function Col({ title, items }: { title: string; items: { href: string; label: string }[] }) {
  return (
    <div>
      <h3 className="mb-3 font-semibold text-white">{title}</h3>
      <ul className="space-y-2 text-sm text-green-100">
        {items.map((i) => (
          <li key={i.href}>
            <Link href={i.href} className="hover:text-krishi-accent">{i.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="mt-16 bg-krishi-dark text-green-100">
      <div className="container-x grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo light />
          <p className="mt-4 max-w-sm text-sm">
            মানসম্মত বীজ, সার ও কৃষি উপকরণ কৃষকের দোরগোড়ায় পৌঁছে দেওয়াই আমাদের লক্ষ্য।
          </p>
          <address className="mt-4 space-y-1 text-sm not-italic">
            <p>ঠিকানা: {SITE.address}</p>
            <p>ফোন: {SITE.phone}</p>
            <p>ইমেইল: {SITE.email}</p>
          </address>
        </div>
        <Col title="দ্রুত লিংক" items={quick} />
        <Col title="পণ্যের ক্যাটাগরি" items={cats} />
        <Col title="নীতিমালা" items={policies} />
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-green-200">
        © {new Date().getFullYear()} {SITE.nameBn} ({SITE.nameEn})। সর্বস্বত্ব সংরক্ষিত।
      </div>
    </footer>
  );
}
