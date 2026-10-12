import { config } from '../config';

/** Email is sent only when SMTP is configured; SMS only when an SMS gateway is configured. */
async function sendEmail(to: string, subject: string, text: string) {
  const { host, port, user, pass, from } = config.smtp;
  if (!host || !from) {
    if (!config.isProd) console.log(`[mail:dev-not-configured] to=${to} subject=${subject}\n${text}`);
    return false;
  }
  const nodemailer = await import('nodemailer');
  const transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user ? { user, pass } : undefined,
  });
  await transport.sendMail({ from, to, subject, text });
  return true;
}

async function sendSms(to: string, message: string) {
  const { apiUrl, apiKey } = config.sms;
  if (!apiUrl) return false;
  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}) },
    body: JSON.stringify({ to, message }),
  });
  return res.ok;
}

/** Fire-and-forget: notification failures must never break the request. */
export function notify(opts: { email?: string | null; phone?: string | null; subject: string; text: string }) {
  void (async () => {
    try {
      if (opts.email) await sendEmail(opts.email, opts.subject, opts.text);
    } catch (e) {
      console.error('[notify] email failed', (e as Error).message);
    }
    try {
      if (opts.phone) await sendSms(opts.phone, opts.text);
    } catch (e) {
      console.error('[notify] sms failed', (e as Error).message);
    }
  })();
}

export function notifyOrderPlaced(order: {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  totalAmount: unknown;
}) {
  notify({
    email: order.customerEmail,
    phone: order.customerPhone,
    subject: `আপনার অর্ডার গ্রহণ করা হয়েছে — ${order.orderNumber}`,
    text: `প্রিয় ${order.customerName}, আপনার অর্ডার ${order.orderNumber} গ্রহণ করা হয়েছে। মোট: ৳${order.totalAmount}।`,
  });
}
