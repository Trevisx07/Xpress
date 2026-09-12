interface Env {
  RESEND_API_KEY?: string;
  MAIL_FROM?: string;
  MAIL_TO?: string;
  TURNSTILE_SECRET_KEY?: string;
  RATE_KV?: KVNamespace;
}

const SITE_EMAIL = 'xpresstowingandrecoverymobile@gmail.com';
const TYPES = { tow: 'Tow now', quote: 'Quote or question', commercial: 'Commercial account' } as const;
type RequestType = keyof typeof TYPES;

const FIELDS = ['type', 'name', 'phone', 'email', 'vehicle', 'location', 'message', 'business', 'businessType', 'website', 'ts', 'cf-turnstile-response'] as const;
type Payload = Record<(typeof FIELDS)[number], string>;

const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const clean = (v: unknown, max = 500) => String(v ?? '').replace(CONTROL, '').trim().slice(0, max);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

async function readBody(request: Request): Promise<{ data: Payload; isJson: boolean }> {
  const ct = request.headers.get('content-type') ?? '';
  let raw: Record<string, unknown> = {};
  let isJson = false;
  if (ct.includes('application/json')) {
    isJson = true;
    raw = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  } else {
    const fd = await request.formData().catch(() => new FormData());
    fd.forEach((v, k) => { raw[k] = typeof v === 'string' ? v : ''; });
  }
  const data = Object.fromEntries(FIELDS.map((f) => [f, clean(raw[f], f === 'message' ? 4000 : 500)])) as Payload;
  return { data, isJson };
}

function validate(d: Payload) {
  const errors: Record<string, string> = {};
  if (!(d.type in TYPES)) errors.type = 'Pick a request type.';
  if (d.name.length < 2 || d.name.length > 80) errors.name = 'Enter your name (2 to 80 characters).';
  const digits = d.phone.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 15) errors.phone = 'Enter a phone number with at least 10 digits.';
  if (d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) errors.email = 'That email address does not look right.';
  if (d.message.length > 2000) errors.message = 'Keep the message under 2000 characters.';
  if (d.type === 'commercial' && d.business.length < 2) errors.business = 'Enter your business name.';
  return errors;
}

async function verifyTurnstile(secret: string, token: string, ip: string | null) {
  if (!token) return false;
  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
  const out = (await res.json().catch(() => ({}))) as { success?: boolean };
  return out.success === true;
}

async function rateLimited(kv: KVNamespace, ip: string) {
  const key = `contact:${ip}`;
  const count = Number((await kv.get(key)) ?? 0);
  if (count >= 5) return true;
  await kv.put(key, String(count + 1), { expirationTtl: 3600 });
  return false;
}

function emailText(d: Payload, meta: { ip: string | null; country: string; when: string }) {
  const rows: [string, string][] = [
    ['Request type', TYPES[d.type as RequestType]],
    ['Name', d.name],
    ['Phone', d.phone],
    ['Email', d.email || '(none)'],
    ['Vehicle', d.vehicle || '(none)'],
    ['Location', d.location || '(none)'],
    ['Message', d.message || '(none)'],
  ];
  if (d.type === 'commercial') rows.push(['Business', d.business], ['Business type', d.businessType || '(none)']);
  rows.push(['Submitted', meta.when], ['Country', meta.country], ['IP', meta.ip ?? 'unknown']);
  return rows.map(([k, v]) => `${k}: ${v}`).join('\n');
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const { data, isJson } = await readBody(request);
  const ip = request.headers.get('CF-Connecting-IP');
  const succeed = () =>
    isJson ? json({ ok: true }) : new Response(null, { status: 303, headers: { Location: '/contact/thanks', 'Cache-Control': 'no-store' } });

  // Honeypot: pretend it worked so bots do not learn what tripped them.
  if (data.website) return succeed();
  if (data.ts && Date.now() - Number(data.ts) < 3000) return json({ ok: false, errors: { form: 'That was too fast. Please try again.' } }, 400);

  const errors = validate(data);
  if (Object.keys(errors).length) return json({ ok: false, errors }, 400);

  if (env.TURNSTILE_SECRET_KEY && !(await verifyTurnstile(env.TURNSTILE_SECRET_KEY, data['cf-turnstile-response'], ip))) {
    return json({ ok: false, errors: { form: 'Verification failed. Please reload the page and try again.' } }, 400);
  }

  if (env.RATE_KV && ip && (await rateLimited(env.RATE_KV, ip))) {
    return json({ ok: false, errors: { form: 'Too many requests from this connection. Please call us instead.' } }, 429);
  }

  const cf = (request as Request & { cf?: { country?: string } }).cf;
  const text = emailText(data, { ip, country: cf?.country ?? 'unknown', when: new Date().toISOString() });
  const subject = `[Xpress] ${TYPES[data.type as RequestType]}: ${data.name} ${data.phone}`;

  if (!env.RESEND_API_KEY) {
    console.log('contact submission (no RESEND_API_KEY set)\n' + text);
    return succeed();
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.MAIL_FROM || 'Xpress Website <noreply@xpresstowingmobile.com>',
      to: [env.MAIL_TO || SITE_EMAIL],
      ...(data.email && { reply_to: data.email }),
      subject,
      text,
    }),
  });
  if (!res.ok) {
    console.error('Resend error', res.status, await res.text());
    return json({ ok: false, errors: { form: 'We could not send your request. Please call us.' } }, 502);
  }
  return succeed();
};
