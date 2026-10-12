export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://krishiservicebd-admin.vercel.app/api/v1"
    : "http://localhost:5000/api/v1");

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: { path: string; message: string }[];
}

export class ApiError extends Error {
  status: number;
  errors?: { path: string; message: string }[];
  constructor(message: string, status: number, errors?: { path: string; message: string }[]) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { revalidate?: number } = {}
): Promise<T> {
  const { revalidate, ...init } = options;
  
  // Abort controller with 8-second timeout so pages never hang if backend is cold/offline
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...init,
      signal: controller.signal,
      credentials: "include",
      headers: { "Content-Type": "application/json", ...(init.headers || {}) },
      ...(typeof window === "undefined" ? { next: { revalidate: revalidate ?? 60 } } : {}),
    } as RequestInit);

    clearTimeout(timeoutId);

    let body: ApiResponse<T> | null = null;
    try {
      body = await res.json();
    } catch {
      /* non-JSON response */
    }

    if (!res.ok || !body?.success) {
      throw new ApiError(body?.message || "সার্ভারের সাথে যোগাযোগ করা যায়নি", res.status, body?.errors);
    }
    return body.data;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new ApiError("সার্ভার রেসপন্স দিতে দেরি হচ্ছে", 504);
    }
    throw err;
  }
}

export interface ProductImage {
  id: string;
  imageUrl: string;
  altText?: string | null;
  isPrimary: boolean;
}

export interface Product {
  id: string;
  nameBn: string;
  nameEn?: string | null;
  slug: string;
  sku: string;
  shortDescBn: string;
  fullDescBn: string;
  price: string | number;
  discountPrice?: string | number | null;
  stockQuantity: number;
  unitSize: string;
  specifications?: Record<string, string> | null;
  usageGuideBn?: string | null;
  safetyNoticeBn?: string | null;
  manufacturer?: string | null;
  isFeatured: boolean;
  category?: { id: string; nameBn: string; slug: string };
  brand?: { id: string; nameBn: string; slug: string } | null;
  images: ProductImage[];
}

export interface Category {
  id: string;
  nameBn: string;
  nameEn?: string | null;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  children?: Category[];
  _count?: { products: number };
}

export interface Article {
  id: string;
  titleBn: string;
  slug: string;
  categoryBn: string;
  excerptBn: string;
  contentBn: string;
  imageUrl?: string | null;
  author?: string | null;
  readingTimeMin: number;
}

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
export const toBn = (n: number | string) => String(n).replace(/\d/g, (d) => BN_DIGITS[Number(d)]);

export const formatTaka = (n: number | string) =>
  `৳${toBn(Number(n).toLocaleString("en-US", { maximumFractionDigits: 2 }))}`;

export const effectivePrice = (p: Pick<Product, "price" | "discountPrice">) =>
  Number(p.discountPrice ?? p.price);

export const hasDiscount = (p: Pick<Product, "price" | "discountPrice">) =>
  p.discountPrice != null && Number(p.discountPrice) < Number(p.price);

export const primaryImage = (p: Pick<Product, "images">) =>
  p.images?.find((i) => i.isPrimary)?.imageUrl || p.images?.[0]?.imageUrl || "/placeholder.svg";
