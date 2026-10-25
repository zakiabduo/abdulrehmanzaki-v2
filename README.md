# Abdul Rehman Zaki – Portfolio

Next.js 14 (App Router) portfolio with a 3D hero, GSAP scroll storytelling and a working contact form (Resend).

## Stack
- Next.js 14, React 18, TypeScript, Tailwind CSS
- three.js via React Three Fiber (hero neural network, 3D skills orbit)
- GSAP + ScrollTrigger (text reveals, scroll-scrubbed story, counters, radar, timeline), Lenis smooth scroll
- Self-hosted variable fonts: Archivo (display, width axis) and Newsreader (text)
- next-themes (light/dark), react-hook-form + zod

## Local setup
1. `npm install`
2. `cp .env.example .env.local` and fill in either the Gmail (`SMTP_USER`, `SMTP_PASS`) or Resend (`RESEND_API_KEY`) values
3. `npm run dev`

Checks: `npm run lint`, `npx tsc --noEmit`, `npm run build`.

## Editing content
Everything lives in `data/content.ts`: profile, stats, skills, orbit labels, radar levels, projects, timeline, certificates.
- `radar` values are self-assessed (0–5). Set them to what you honestly want to show.
- Check the two Coursera certificate links map to the right titles.

## Production notes
- Motion respects `prefers-reduced-motion` (no animation, content fully visible) and works without JavaScript.
- A fixed particle field sits behind every section (`ParticleField.tsx`); the preloader (`Preloader.tsx`) runs on each load and is skipped for reduced motion.
- 3D loads after first paint, pauses off-screen, caps pixel ratio, and falls back gracefully without WebGL.
- Security headers are set in `next.config.mjs`. The contact route has a honeypot; add rate limiting (e.g. Upstash) if spam appears.
- Open Graph image is generated in `app/opengraph-image.tsx`.

## Deploy (Vercel)
Import the GitHub repo on vercel.com, then add the mail variables from `.env.example`
under Project Settings -> Environment Variables and redeploy.
GitHub Pages is not used: it cannot run the `/api/contact` server route.

Contact mail: if `SMTP_USER` + `SMTP_PASS` are set the route uses Gmail SMTP (free, no domain; the visitor's address is set as Reply-To), otherwise it uses Resend.
With Resend and the default `onboarding@resend.dev` sender, Resend only delivers to your own Resend account email.
To email any address, verify a domain in Resend and set `RESEND_FROM`.

## SEO checklist (do these once after deploying)
1. Buy a custom domain (e.g. abdulrehmanzaki.com), add it in Vercel, then set `siteUrl` in `data/content.ts` to it.
2. Google Search Console: add the site, paste the verification token into `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, redeploy, then submit `/sitemap.xml` and use "Request indexing" on the home page.
3. Link to the site from LinkedIn (Website field), GitHub profile + pinned repo READMEs, your CV, and any other profiles, always using the same name "Abdul Rehman Zaki".
4. Keep content fresh (new projects) and the site fast; Google rewards both.
