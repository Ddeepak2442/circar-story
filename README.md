# A Birthday Surprise, Just for Her 💌

A small Next.js site built to surprise your girlfriend on her 29th birthday: an envelope she taps to open (with a confetti pop), then a hero section with her name, a "reasons I love you" list, a photo memories gallery, and a love letter — all in a soft, romantic pastel theme.

It also has a no-login **admin page** at a secret URL where you can edit the reasons list and upload photos yourself, without touching code or redeploying.

## Running it locally

You'll need [Node.js](https://nodejs.org) 18.18+ installed.

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

The admin page needs an `ADMIN_SECRET` — one is already set in `.env.local` (`pe8lt9UU6pCS`), so locally you can go straight to `http://localhost:3000/admin/pe8lt9UU6pCS`. Change it any time (see below).

Photo uploads only work once Blob storage is connected (see **Deploying**, below) — until then the admin page will tell you saving isn't available yet, but editing reasons still needs it too, since everything is stored in the same place.

## Customizing it

Static text lives in **one file**: [`lib/content.ts`](./lib/content.ts). Open it and edit:

- `herName` — appears in the browser tab title, the hero section, and the letter.
- `envelope` — the text/button on the opening screen.
- `hero` — the eyebrow text, her age, and the subheading.
- `loveLetter.paragraphs` — the letter text. I drafted a starting version for you — read it over and make it sound like *you*.
- `milestone.reasons` and `gallery.photos` — these are just the **starting defaults**. Once you save anything from the admin page, your saved version takes over on the live site (see below).

### Reasons and photos — via the admin page, not code

Go to `/admin/<your secret>` (see `ADMIN_SECRET` above) to:

- Add, edit, or delete lines in the reasons list — the counter badge on the public page always matches however many you have, so it doesn't need to be exactly 29.
- Upload photos with captions (images are resized in the browser first, so large phone photos are fine), edit captions, or delete photos.

Changes save immediately to Blob storage and show up on the public page right away — no redeploy needed. If you never touch the admin page, the site just shows the starting defaults from `lib/content.ts`.

**This admin page has no username/password — the secret URL is the only thing protecting it.** Don't share that link, and treat it like a password. To change it, update `ADMIN_SECRET` in `.env.local` (local) and in your Vercel project's Environment Variables (production), then use the new URL.

### Changing the color theme

The pastel palette (blush pink, lilac, cream, rose, gold) is defined at the top of [`app/globals.css`](./app/globals.css) as CSS variables (`--blush`, `--lilac`, `--rose`, etc.) — tweak the hex values there to shift the whole site's palette.

## Deploying to Vercel

This site needs two things set up on [Vercel](https://vercel.com) (made by the Next.js team, free for a project this size): the deployment itself, and a **Blob store** for the admin page's reasons/photos to persist to.

1. **Deploy the project.**
   - Easiest: install the CLI and run `npx vercel` from this folder, then `npx vercel --prod` once you're happy with it. It'll ask you to log in (opens your browser) the first time.
   - Or push this folder to a GitHub repo and import it at [vercel.com/new](https://vercel.com/new).
2. **Add a Blob store** (for the admin page to work): in the Vercel dashboard, open your project → **Storage** tab → **Create Database** → **Blob** → connect it to this project. Vercel automatically sets a `BLOB_READ_WRITE_TOKEN` environment variable for you — no copying/pasting needed.
3. **Set your admin secret:** in the project's **Settings → Environment Variables**, add `ADMIN_SECRET` with your own value (reuse the one in `.env.local`, or pick a new random string).
4. **Redeploy** (Vercel does this automatically after step 2/3 change env vars in most cases; if not, trigger a redeploy from the dashboard).
5. Your site is live at `your-project.vercel.app` — send that link to her. Your admin page is `your-project.vercel.app/admin/<ADMIN_SECRET>` — keep that one to yourself.

Other hosts (Netlify, Cloudflare Pages, etc.) can run the Next.js app itself, but the admin page's storage is built specifically on Vercel Blob, so Vercel is the path of least resistance here.

## Tech used

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com) for styling
- [Framer Motion](https://www.framer.com/motion/) for scroll-in animations
- [canvas-confetti](https://github.com/catdad/canvas-confetti) for the reveal-screen confetti burst
- [Vercel Blob](https://vercel.com/docs/vercel-blob) for storing the admin-edited reasons/photos and uploaded images
