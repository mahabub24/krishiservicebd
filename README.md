# কৃষি সার্ভিস বিডি (Krishi Service BD)
### Full-Stack Bengali Agriculture E-Commerce Platform

---

## 📌 পরিচিতি ও সারসংক্ষেপ (Overview)
**কৃষি সার্ভিস বিডি** একটি আধুনিক, নিরাপদ এবং প্রডাকশন-রেডি কৃষি ই-কমার্স প্ল্যাটফর্ম। এটি সম্পূর্ণ বাংলা ভাষায় বাংলাদেশের কৃষকদের জন্য তৈরি করা হয়েছে, যাতে তারা সহজে উচ্চ ফলনশীল প্রত্যয়িত বীজ, অনুমোদিত বালাইনাশক ও ফসল সুরক্ষা উপাদান, রাসায়নিক ও জৈব সার এবং আধুনিক কৃষি যন্ত্রপাতি কিনতে পারেন।

- **লাইভ ডাটাবেজ:** Supabase Cloud PostgreSQL
- **ব্যাকএন্ড:** Node.js, Express.js, TypeScript, Prisma ORM, JWT (HTTP-Only Secure Cookie)
- **ফ্রন্টএন্ড:** Next.js 15+ (App Router), React 19, TypeScript, Tailwind CSS, Lucide React
- **টাইপোগ্রাফি:** Hind Siliguri (হিন্দ শিলিগুড়ি) বাংলা ফন্ট
- **কারেন্সি ও লোকাল:** ৳ (BDT), বাংলাদেশ স্ট্যান্ডার্ড ঠিকানা (গ্রাম, ইউনিয়ন, উপজেলা, জেলা)

---

## 🚀 আর্কিটেকচার ও মূল বৈশিষ্ঠ্য (Key Features)

1. **গ্রাহক ক্যাটালগ ও শপিং এক্সপেরিয়েন্স:**
   - রেসপনসিভ হোমপেজ (হিরো ব্যানার, ক্যাটাগরি গ্রিড, নতুন ও জনপ্রিয় পণ্য, বিশ্বস্ততা সেকশন, কৃষি পরামর্শ)।
   - উন্নত ফিল্টারিং (ক্যাটাগরি, মূল্য রেঞ্জ, ইন-স্টক ফিল্টার ও বিভিন্ন সর্টিং)।
   - বিস্তারিত প্রোডাক্ট পেজ (ছবি গ্যালারি, পরিমাপ/প্যাকেট সাইজ, ব্যবহারবিধি ও সতর্কতা নির্দেশিকা)।
   - ব্রাউজার ও লোকালস্টোরেজ ভিত্তিক পারসিস্টেন্ট শপিং কার্ট।
   - পূর্ণাঙ্গ চেকআউট (বাংলাদেশি জেলা, উপজেলা, ইউনিয়নভিত্তিক ডেলিভারি ও ক্যাশ অন ডেলিভারি / বিকাশ পেমেন্ট সুবিধা)।

2. **নিরাপত্তা ও ডেটা অখণ্ডতা (Security & Reliability):**
   - সার্ভার-সাইড মূল্য পুনঃগণনা (ক্লায়েন্টের পাঠানো মূল্য কখনোই বিশ্বাস করা হয় না)।
   - পারমানবিক ডাটাবেজ ট্রানজেকশন (Atomic Transactions): অতিরিক্ত অর্ডার প্রতিরোধে কনকারেন্ট স্টক লকিং।
   - নিরাপদ পাসওয়ার্ড হ্যাশিং (bcrypt, 12 rounds)।
   - HTTP-Only সিকিউর কুকি ও RBAC রোল-বেসড অথরাইজেশন।
   - Helmet সিকিউরিটি হেডার, স্ট্রিক্ট CORS পলিসি এবং রেট লিমিটিং।

3. **অ্যাডমিন ড্যাশবোর্ড (`/admin`):**
   - ওভারভিউ মেট্রিক্স (মোট সেলস, মোট অর্ডার, পেন্ডিং অর্ডার, লো-স্টক অ্যালার্ট)।
   - পণ্য ব্যবস্থাপনা (যুক্ত, হালনাগাদ ও নিরাপদ সংরক্ষণ)।
   - অর্ডার ট্র্যাকিং ও স্ট্যাটাস ট্রানজিশন ওয়ার্কফ্লো (`PENDING` -> `CONFIRMED` -> `PROCESSING` -> `SHIPPED` -> `DELIVERED`)।
   - ইনভেন্টরি মুভমেন্ট ট্র্যাকিং ও বাতিল অর্ডারে স্বয়ংক্রিয় স্টক রিস্টক।

---

## 🛠️ লোকাল সেটআপ ও রান করার নিয়মাবলী (Local Development Guide)

### ১. রিপোজিটরি ক্লোন করুন
```bash
git clone https://github.com/mahabub24/krishiservicebd.git
cd krishiservicebd
```

### ২. ব্যাকএন্ড সেটআপ (Backend Setup)
```bash
cd backend
npm install
```
`backend/.env.example` কপি করে `backend/.env` তৈরি করুন এবং আপনার Supabase ডাটাবেজ ক্রেডেনশিয়াল ও সিক্রেট সেট করুন:
```env
PORT=5000
DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
JWT_SECRET="YOUR_SUPER_SECRET_KEY"
CORS_ORIGIN="http://localhost:3000"
```

ডাটাবেজ মাইগ্রেশন ও সীডিং রান করুন:
```bash
npx prisma migrate dev
npm run prisma:seed
```

ব্যাকএন্ড সার্ভার চালু করতে:
```bash
npm run dev
# সার্ভার চালু হবে: http://localhost:5000
```

### ৩. ফ্রন্টএন্ড সেটআপ (Frontend Setup)
```bash
cd ../frontend
npm install
npm run dev
# ওয়েবসাইট ভিজিট করুন: http://localhost:3000
```

---

## 🧪 টেস্ট ও কোয়ালিটি অ্যাসিউরেন্স (Testing)

ব্যাকএন্ড ইউনিট ও এপিআই টেস্ট চালানোর কমান্ড:
```bash
cd backend
# ইউনিট টেস্ট চালান (প্রাইসিং, স্টক স্টেট মেশিন ও অর্ডার ক্যালকুলেশন)
npm run test:unit

# ইন্টিগ্রেশন এপিআই টেস্ট চালান
npm run test:api
```

---

## 📦 প্রডাকশন বিল্ড (Production Build)

```bash
# ব্যাকএন্ড বিল্ড
cd backend
npm run build

# ফ্রন্টএন্ড বিল্ড
cd ../frontend
npm run build
```

---

## 🔐 লাইসেন্স ও কপিরাইট
© ২০২৬ কৃষি সার্ভিস বিডি (Krishi Service BD)। সর্বস্বত্ব সংরক্ষিত।
