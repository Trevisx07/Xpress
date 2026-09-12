# Xpress Towing & Recovery website

Astro 5 static site with Tailwind v4, deployed to Cloudflare Pages. The contact form posts to a Pages Function at `functions/api/contact.ts`.

## Commands

```bash
npm run dev          # Astro dev server (form POSTs will 404 here)
npm run build        # static output to dist/
npm run check        # astro check
npm run check:functions
npm run prep:images   # process images/ into src/assets
npm run preview:cf   # build, then serve dist + functions with wrangler
```

## Environment variables (Cloudflare Pages)

Set these in the Pages project under Settings, then Variables and Secrets. Mark secrets as encrypted. Redeploy after changing any of them.

| Name | Where | Purpose |
| --- | --- | --- |
| `RESEND_API_KEY` | Secret | Resend API key used to send form submissions. Without it the Function logs the submission and returns success. |
| `MAIL_FROM` | Variable | Sender, e.g. `Xpress Website <noreply@xpresstowingmobile.com>`. The domain must be verified in Resend. Defaults to that value. |
| `MAIL_TO` | Variable | Inbox that receives submissions. Defaults to `xpresstowingandrecoverymobile@gmail.com`. |
| `PUBLIC_TURNSTILE_SITE_KEY` | Variable (build time) | Turnstile site key. When set, the widget and its script render on `/contact`. Available to Astro at build, so set it for Production and Preview. |
| `TURNSTILE_SECRET_KEY` | Secret | Turnstile secret. When set, the Function verifies every submission with Cloudflare. Set both Turnstile values together. |
| `RATE_KV` | KV binding (optional) | Bind a KV namespace named `RATE_KV` under Settings, Bindings. Enables a limit of 5 submissions per IP per hour. Skipped when not bound. |

Local testing with `wrangler pages dev` reads variables from a `.dev.vars` file in the project root (gitignored). The Function works with none of them set.
