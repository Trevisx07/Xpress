# Launch guide for xpresstowingmobile.com

This is written for whoever owns the business side of the site. You do not need to write code. Every edit below is a text change in one file, then a redeploy.

## 1. Business details

All business details live in `src/config/site.ts`. Phone, email, address, and the 50 mile radius are already set from the owner's update. Check them once more before launch:

| What | Field | Current value |
| --- | --- | --- |
| Phone, dialing format | `phone` | `+12198694433` |
| Phone, as shown | `phoneDisplay` | `(219) 869-4433` |
| Email | `email` | `xpresstowingandrecoverymobile@gmail.com` |
| Tagline | `tagline` | As we don't drag your car, we safely deliver it. |
| Address | `address.streetAddress`, `postalCode` | 930 W I-65 Service Road S, Mobile, AL 36609. Shown on the contact page and in the schema. Clear `streetAddress` to hide it. |
| Service radius | `serviceRadiusMiles` | 50 |
| Google Business Profile link | `social.googleBusinessUrl` | empty. Paste the full link and a "Read our Google reviews" link appears on the homepage. |

Still placeholders, in page files:

- **Owner name**: `src/pages/commercial-towing.astro`, the text inside `<span data-placeholder="owner">`.
- **Google rating**: `src/pages/index.astro`, the `5.0` value in the `stats` list marked `ph: true`.
- **Reviews**: the `reviews` lists in `src/pages/index.astro` and `src/pages/commercial-towing.astro`.

To find every remaining placeholder:

```bash
grep -rn "data-placeholder" src
```

## 2. Logo

The supplied logo is a raster image wrapped in an SVG file, not true vector artwork. It has been extracted to `src/assets/logo.png` (1302 x 706, transparent background) and the site serves it through Astro's image pipeline at 1x, 2x, and 3x density, so it looks sharp on every screen at its current size.

Ask the designer for the original vector file (AI, EPS, or a real SVG with paths). When it arrives, save it as `src/assets/logo.svg`, change the import in `src/components/Logo.astro` from `logo.png` to `logo.svg`, and rerun the icon and share card scripts:

```bash
npm run gen:icons
npm run gen:og
```

The favicon set uses only the X mark cut from the logo, because the full lockup is unreadable at 32 px.

## 3. Photos

The five real photographs live in `images/` at the project root and are processed into `src/assets/` by one script:

```bash
npm run prep:images
```

It fixes orientation, strips all metadata including GPS, crops to each slot, and never upscales. To replace a photo, drop the new file over the matching name in `images/` and rerun it.

| `images/` file | Becomes | Used on |
| --- | --- | --- |
| `flatbed.jpg` | `hero-flatbed.jpg` 2400 x 2000 | Homepage hero, services roadside article |
| `light-duty.jpg` | `truck-light-duty.jpg` 1200 x 800 | Homepage card, light duty article |
| `medium-duty.jpg` | `truck-medium-duty.jpg` 1200 x 800 | Homepage card, medium duty article |
| `flatbed-1.jpg` | `truck-flatbed.jpg` 1200 x 800 | Homepage card, flatbed article |
| `recovery-dusk.jpg` | `recovery-dusk.jpg` 1800 x 1200 | Accident recovery article |

Lockouts and jump starts have no photo by design. The build stops with `services: missing photo` if a filename in `site.ts` has no file.

## 4. Deploy to Cloudflare Pages

1. Push this folder to a GitHub repository (private is fine).
2. In the Cloudflare dashboard go to Workers and Pages, Create, Pages, Connect to Git, and pick the repository.
3. Build settings:
   - Framework preset: Astro
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Environment variable `NODE_VERSION` = `22`
4. Add the variables listed in `README.md` (Resend key, mail addresses, Turnstile keys). Mark the two keys as encrypted. Optionally bind a KV namespace named `RATE_KV`.
5. Save and deploy. Wait for the first build to finish and open the `pages.dev` preview link to check it.
6. Custom domains: in the project, open Custom domains and add `xpresstowingmobile.com`, then add `www.xpresstowingmobile.com`. Cloudflare creates the DNS records if the domain is already on Cloudflare. The `www` address redirects to the bare domain automatically.
7. In the domain's SSL/TLS settings turn on Always Use HTTPS.

Every later push to the main branch redeploys the site in about a minute.

## 5. After launch

- **Google Search Console**: add the property `https://xpresstowingmobile.com`, verify through Cloudflare DNS, then submit `https://xpresstowingmobile.com/sitemap-index.xml` under Sitemaps.
- **Google Business Profile**: make sure the business name, address, phone number, and website URL match the site exactly, character for character. Use `https://xpresstowingmobile.com` as the website.
- **Test the form once with real keys**: submit a quote request from your phone and confirm the email arrives at the dispatch inbox with the reply address set to yours.
- **Run Lighthouse on the live URL**: open the site in Chrome, press F12, choose the Lighthouse tab, and run a Mobile report. Every score should be 98 or higher. If one drops, the most common cause is an oversized photo.
- **Watch the inbox**: form submissions that fail to send are logged in the Cloudflare Pages Functions log, under the project's Logs tab.
