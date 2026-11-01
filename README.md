# Atlantic View Apartments — demonstration showcase

A premium, mobile-first, single-page showcase website for a **fictional** furnished-apartment
property in Limbe, Cameroon. Built as a sales demonstration for property showcase websites that
connect directly to WhatsApp.

No framework, no build step, no database, no backend. Three files plus images.

---

## 1. Files

```
atlantic-view/
├── index.html                  all page content (semantic HTML, inline SVG icons)
├── README.md                   this file
└── assets/
    ├── css/styles.css          single stylesheet, mobile-first, commented by section
    ├── js/main.js              ~230 lines of vanilla JS (config, booking, lightbox)
    └── img/                    9 optimised JPEGs (total ≈ 700 KB)
```

Total page weight on first load (mobile): **≈ 130–200 KB** — HTML + CSS + JS + hero image.
Everything below the hero is lazy-loaded.

---

## 2. Before going live — the two-minute checklist

1. **WhatsApp number.** Open `assets/js/main.js` and change the one configured value:

   ```js
   whatsappNumber: '237653317507',   // digits only, full international format
   ```

   That line is the **only** place the number exists. Every button, every `wa.me` link and the
   footer display (`+237 653 317 507`) is generated from it at load time — there is nothing to
   update in `index.html`. The display format is derived automatically, so a 12-digit number
   reads as `+237 653 317 507` and any other length falls back to `+<digits>`.

   If the value is ever left blank or set to a placeholder such as `000000000`, the script
   refuses to build links, logs a clear console error and disables the WhatsApp buttons rather
   than sending guests to a dead destination.

2. **Property content.** Name, headline, apartment descriptions, prices, amenities, location
   copy and the footer disclaimer are all plain HTML in `index.html` — edit in place.

3. **Photography.** Replace the files in `assets/img/` with the client's own photos, keeping the
   same file names and aspect ratios (hero 16:9, unit cards 4:3, gallery mixed). Then delete or
   reword the two "illustrative photography" notes in the gallery and accommodation sections.

4. **The sales credit.** Replace `[Your Studio Name]` in the footer with the agency name.

---

## 3. How the WhatsApp booking works

Every booking button produces a `wa.me` deep link:

```
https://wa.me/<number>?text=<URL-encoded message>
```

* Header, hero, footer and "ask a question" buttons → a general availability enquiry.
* The booking form builds a complete request containing the **selected apartment**, check-in,
  check-out, number of nights, guests, optional name and notes.
* The right-hand panel in the booking section previews the exact message that will be sent, so
  the visitor knows what they are committing to before they tap.
* Choosing an apartment on its card scrolls to the booking form and pre-selects it.

There is no server call anywhere in the flow — the visitor's own WhatsApp app sends the message,
which is why this stays fast and free to host.

Dates are pre-filled with an example stay (tomorrow → +3 nights) so the preview demonstrates the
feature immediately. The form validates that check-out comes after check-in, and the message
falls back to "flexible — please advise" if a visitor clears the dates.

---

## 4. Design notes

* **Palette:** warm sand `#F7F1E8`, cream `#FCF9F4`, deep warm ink `#221E1A`, muted gold
  `#8A6029` for eyebrows, deep emerald `#0F8A5F` reserved exclusively for WhatsApp actions.
* **Type:** system serif stack (Iowan / Palatino / Georgia) for headlines, system sans for UI.
  No web fonts — nothing to download, nothing to flash.
* **Layout:** single 1140 px container, generous vertical rhythm, mobile-first breakpoints at
  520 / 600 / 768 / 900 / 1080 px.
* **Motion:** a short reveal-on-scroll (IntersectionObserver) with a 2.2 s failsafe so content
  is never left hidden, and full `prefers-reduced-motion` support.
* **Accessibility:** skip link, semantic landmarks, labelled form fields, visible focus rings,
  keyboard-navigable gallery (`←` / `→` / `Esc` via native `<dialog>`), alt text on every image,
  and body text contrast at or above WCAG AA.

---

## 5. Reusing this for the next client

1. Copy the whole `atlantic-view/` folder and rename it.
2. Swap the images in `assets/img/` (keep the file names).
3. Change `CONFIG` in `assets/js/main.js` (name, number, general message).
4. Find/replace in `index.html`:
   * `Atlantic View Apartments` → new property name
   * `Limbe` → new location
   * `AV` (brand mark) → new initials
   * prices, descriptions, amenity list, landmark list
5. Update the `<title>`, `<meta name="description">` and `og:` tags in the `<head>`.
6. Replace `[Your Studio Name]` and the demonstration disclaimer in the footer.

Nothing else references the property, so there is no hidden configuration to hunt for.

---

## 6. Running / hosting

Any static host works — Netlify, Vercel, Cloudflare Pages, GitHub Pages, or plain shared
hosting. To preview locally:

```bash
cd atlantic-view
python3 -m http.server 8080
# open http://localhost:8080
```

Opening `index.html` directly from the file system also works.

---

## 7. Publishing

**Temporary public link (share now).** A Cloudflare quick tunnel is proxied to the running local
server:

```
https://dealer-data-lighting-cologne.trycloudflare.com
```

This link is live only while the sandbox session and tunnel process are running — it is a preview
link for sharing today, not a permanent address. Quick tunnels have no uptime guarantee.

**Permanent hosting.** This folder is a plain static site, so any static host works:
Netlify, Vercel, Cloudflare Pages, GitHub Pages, Firebase Hosting, cPanel/shared hosting.
Upload the contents of `atlantic-view/` (not the folder itself) so that `index.html` sits at the
web root.

Two ready-made packages sit next to this folder:

| File | Use |
| --- | --- |
| `atlantic-view-site.zip` | drag-and-drop deploy (Netlify Drop, Cloudflare Pages direct upload…) |
| `atlantic-view-standalone.html` | one self-contained file: CSS, JS and images inlined. Double-click to open, email it, or drop it anywhere. Images are re-compressed slightly for the single-file build. |

All asset paths are relative, so the site also works from a sub-folder — verified at
`/atlantic-view/`, which is exactly how GitHub Pages project sites are served.

### GitHub Pages, step by step

1. Create an empty repository (public — Pages on a private repo needs a paid plan).
2. From your machine, in the repo folder:

   ```bash
   unzip atlantic-view-repo.zip -d .      # files land at the repo root
   git add .
   git commit -m "Atlantic View Apartments showcase"
   git push origin main
   ```

3. Repo → **Settings → Pages → Build and deployment**:
   * Source: *Deploy from a branch*
   * Branch: `main`, folder: `/ (root)` → **Save**
4. The site goes live in ~1 minute at `https://<username>.github.io/<repo>/`.
   Add a custom domain in the same screen if you have one (a `CNAME` file is created for you).

The `.nojekyll` file in `atlantic-view-repo.zip` stops GitHub from running Jekyll over the files.

---

## 8. Demonstration disclaimer

Atlantic View Apartments is a **fictional property** created to demonstrate this type of
website. Prices, availability, address details, travel times and photography are illustrative
demo content. Nothing on the page is a real offer or a claim of verified availability, and no
customer reviews or testimonials are presented. The page states this in the top strip, in each
pricing block, in the location section and in full in the footer.

Photography: illustrative stock imagery from Pexels (free-to-use licence), colour-graded and
resized for this demo. Replace with the client's own photographs before any real launch.
