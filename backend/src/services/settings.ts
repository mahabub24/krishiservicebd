import { prisma } from '../config/prisma';

/**
 * Store settings are key/value rows editable from the admin panel.
 * Defaults are deliberately neutral — no invented business facts.
 * Delivery charges default to 0 until the store owner configures real values.
 */
export const SETTING_DEFAULTS: Record<string, string> = {
  store_name_bn: 'কৃষি সার্ভিস বিডি',
  store_name_en: 'Krishi Service BD',
  phone: '',
  email: '',
  address: '',
  announcement: '',
  delivery_note: 'ডেলিভারি চার্জ ও সময় চেকআউটে দেখানো হবে',
  delivery_fee_inside_dhaka: '0',
  delivery_fee_outside_dhaka: '0',
  free_delivery_above: '0',
  allow_guest_checkout: 'true',
  cod_enabled: 'true',
  bkash_enabled: 'false',
  bkash_number: '',
  nagad_enabled: 'false',
  nagad_number: '',
  manual_payment_instructions: '',
  low_stock_threshold: '5',
  seo_title: 'কৃষি সার্ভিস বিডি | মানসম্মত বীজ, সার ও কৃষি উপকরণ',
  seo_description: 'বীজ, সার, কীটনাশক ও কৃষি যন্ত্রপাতি অনলাইনে অর্ডার করুন।',
  privacy_policy: '',
  terms_and_conditions: '',
  return_refund_policy: '',
};

/** Keys safe to expose to anonymous visitors. */
export const PUBLIC_SETTING_KEYS = [
  'store_name_bn', 'store_name_en', 'phone', 'email', 'address', 'announcement', 'delivery_note',
  'delivery_fee_inside_dhaka', 'delivery_fee_outside_dhaka', 'free_delivery_above',
  'allow_guest_checkout', 'cod_enabled', 'bkash_enabled', 'bkash_number', 'nagad_enabled', 'nagad_number',
  'manual_payment_instructions', 'seo_title', 'seo_description',
  'privacy_policy', 'terms_and_conditions', 'return_refund_policy',
];

export async function getAllSettings(): Promise<Record<string, string>> {
  const rows = await prisma.storeSetting.findMany();
  const map = { ...SETTING_DEFAULTS };
  for (const r of rows) map[r.key] = r.value;
  return map;
}

export async function getPublicSettings() {
  const all = await getAllSettings();
  return Object.fromEntries(PUBLIC_SETTING_KEYS.map((k) => [k, all[k] ?? '']));
}

export async function getDeliveryRule() {
  const s = await getAllSettings();
  return {
    insideDhaka: Number(s.delivery_fee_inside_dhaka) || 0,
    outsideDhaka: Number(s.delivery_fee_outside_dhaka) || 0,
    freeAbove: Number(s.free_delivery_above) || 0,
  };
}

export async function upsertSettings(values: Record<string, string>) {
  const keys = Object.keys(values).filter((k) => k in SETTING_DEFAULTS);
  await prisma.$transaction(
    keys.map((key) =>
      prisma.storeSetting.upsert({ where: { key }, update: { value: values[key] }, create: { key, value: values[key] } })
    )
  );
}
