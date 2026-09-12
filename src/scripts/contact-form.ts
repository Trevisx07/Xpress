const MAPS_EMBED = 'https://www.google.com/maps?q=Mobile,+AL&output=embed';

document.addEventListener('astro:page-load', () => {
  const form = document.getElementById('contact-form') as HTMLFormElement | null;
  if (!form || form.dataset.ready) return;
  form.dataset.ready = '1';
  const alertBox = document.getElementById('form-alert')!;
  const success = document.getElementById('form-success')!;
  const submit = document.getElementById('f-submit') as HTMLButtonElement;
  const ts = document.getElementById('f-ts') as HTMLInputElement;
  const commercial = form.querySelector<HTMLElement>('[data-commercial]')!;
  const radios = [...form.querySelectorAll<HTMLInputElement>('input[name="type"]')];
  const field = (name: string) => form.elements.namedItem(name) as HTMLInputElement | RadioNodeList | null;
  const value = (name: string) => (field(name) as HTMLInputElement | RadioNodeList | null)?.value ?? '';

  ts.value = String(Date.now());
  const wanted = new URLSearchParams(location.search).get('type');
  const pre = radios.find((r) => r.value === wanted);
  if (pre) pre.checked = true;

  const syncCommercial = () => { commercial.hidden = value('type') !== 'commercial'; };
  radios.forEach((r) => r.addEventListener('change', syncCommercial));
  syncCommercial();

  const setError = (name: string, msg?: string) => {
    const input = field(name) as HTMLInputElement | null;
    const el = document.getElementById('e-' + name);
    if (!el || !input) return;
    el.textContent = msg || '';
    el.hidden = !msg;
    msg ? input.setAttribute('aria-invalid', 'true') : input.removeAttribute('aria-invalid');
  };
  const clientValidate = () => {
    const errors: Record<string, string> = {};
    if (value('name').trim().length < 2) errors.name = 'Enter your name.';
    if (value('phone').replace(/\D/g, '').length < 10) errors.phone = 'Enter a phone number with at least 10 digits.';
    if (value('email') && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value('email'))) errors.email = 'That email address does not look right.';
    if (value('type') === 'commercial' && value('business').trim().length < 2) errors.business = 'Enter your business name.';
    return errors;
  };
  const showErrors = (errors: Record<string, string>) => {
    ['name', 'phone', 'email', 'business', 'message'].forEach((n) => setError(n, errors[n]));
    const formMsg = errors.form || (Object.keys(errors).length ? 'Please fix the highlighted fields.' : '');
    alertBox.textContent = formMsg;
    alertBox.hidden = !formMsg;
    alertBox.classList.toggle('hidden', !formMsg);
    const first = Object.keys(errors).find((k) => field(k));
    if (first) (field(first) as HTMLInputElement).focus();
    else if (formMsg) alertBox.focus();
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errors = clientValidate();
    if (Object.keys(errors).length) return showErrors(errors);
    showErrors({});
    submit.disabled = true;
    const original = submit.innerHTML;
    submit.textContent = 'Sending';
    try {
      const body = Object.fromEntries(new FormData(form).entries());
      const res = await fetch(form.action, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body) });
      const out = await res.json().catch(() => ({}));
      if (res.ok && out.ok) {
        form.hidden = true;
        success.hidden = false;
        success.scrollIntoView({ block: 'center' });
      } else {
        showErrors(out.errors || { form: 'Something went wrong. Please call us instead.' });
      }
    } catch {
      showErrors({ form: 'Could not reach the server. Please call us instead.' });
    } finally {
      submit.disabled = false;
      submit.innerHTML = original;
    }
  });

  // Map facade: no Google request until the user clicks.
  const loadBtn = document.getElementById('map-load') as HTMLButtonElement;
  const facade = document.getElementById('map-facade')!;
  loadBtn.hidden = false;
  loadBtn.addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.src = MAPS_EMBED;
    iframe.title = 'Map of Mobile, Alabama';
    iframe.loading = 'lazy';
    iframe.width = '100%';
    iframe.height = '400';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    iframe.className = 'block w-full rounded-card border-0';
    facade.replaceChildren(iframe);
    facade.classList.remove('grid', 'place-items-center', 'p-8', 'border', 'bg-asphalt');
  });
});
