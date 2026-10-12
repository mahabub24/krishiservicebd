import type { Metadata } from "next";
import { Hind_Siliguri } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/features/cart/CartContext";
import { AuthProvider } from "@/features/auth/AuthContext";

const hind = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bengali",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "কৃষি সার্ভিস বিডি | মানসম্মত বীজ, সার ও কৃষি উপকরণ",
    template: "%s | কৃষি সার্ভিস বিডি",
  },
  description:
    "কৃষি সার্ভিস বিডি — উন্নত বীজ, সার, কীটনাশক ও কৃষি যন্ত্রপাতি অনলাইনে অর্ডার করুন। সারাদেশে ডেলিভারি।",
  openGraph: {
    type: "website",
    locale: "bn_BD",
    siteName: "কৃষি সার্ভিস বিডি",
  },
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" className={hind.variable}>
      <body className="min-h-screen antialiased">
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
