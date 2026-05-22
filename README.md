# Streamly — v1 (MVP)

A creator-first courses platform. **v1 scope:**

- ✅ Email/password + magic-link auth (Supabase)
- ✅ Videos (YouTube link → auto-embed; no streaming infra)
- ✅ Blogs (Markdown editor with live preview)
- ✅ Public profiles (`/u/[username]`)
- ✅ RLS-protected creator content
- ⏳ Subscriptions / payments → v2

Built with **Next.js 14 (App Router) + Supabase + TailwindCSS + TypeScript**.

---

## 1 · Set up Supabase (5 min)

1. Go to [supabase.com](https://supabase.com), create a free project.
2. Open **SQL editor** → New query → paste the contents of [`supabase/schema.sql`](./supabase/schema.sql) → **Run**.
   This creates the `profiles`, `videos`, and `blogs` tables with Row-Level Security policies and a trigger that auto-creates a profile on signup.
3. Go to **Authentication → URL configuration** and add to *Redirect URLs*:
   - `http://localhost:3000/auth/callback`
   - (later) `https://your-domain.com/auth/callback`
4. (Optional, fastest dev loop) **Authentication → Providers → Email** → turn **Confirm email** OFF so you can sign up & be logged in immediately. Re-enable for production.
5. Go to **Project Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 2 · Local setup

```bash
cd streamly-app
cp .env.example .env.local      # then fill in the two Supabase values
npm install
npm run dev
```

Open <http://localhost:3000>.

## 3 · Try it

1. Click **Get started** → create an account.
2. Click **+ Create** → **Add a video** → paste any YouTube URL → publish.
3. Click **+ Create** → **Write a blog** → write some Markdown → publish.
4. Click your avatar → **My profile** to see your public page.

---

## Project structure

```
src/
  app/
    page.tsx                    # Home (latest videos + blogs)
    login/, signup/             # Auth UI (password + magic link)
    auth/callback/route.ts      # Handles Supabase email/magic redirects
    create/                     # Hub: Add video or Write blog
    videos/                     # /videos list, /videos/new, /videos/[id]
    blogs/                      # /blogs list, /blogs/new, /blogs/[slug]
    u/[username]/               # Public creator profile
    profile/                    # Edit own profile
  components/                   # Navbar, UserMenu, VideoCard, BlogCard
  lib/
    supabase/{client,server,middleware}.ts
    youtube.ts                  # ID extractor, thumbnail, embed URL
    markdown.ts                 # Zero-dep MD → safe HTML renderer
    slug.ts
  middleware.ts                 # Refreshes Supabase session cookies
supabase/schema.sql             # All tables, RLS, triggers
```

## Security

- All writes are gated by **Row-Level Security** policies — users can only edit their own videos/blogs/profile, even if they call Supabase directly.
- Markdown is HTML-escaped before formatting; links/images only render for `http(s)://` URLs.
- Auth cookies are httpOnly + refreshed by Next middleware.

## What's next (v1.x → v2)

- Likes, comments, follows
- Search & tag pages
- Image uploads (Supabase Storage) instead of URL inputs
- Drafts & scheduled publishing
- Stripe subscriptions + premium-only content
- Self-hosted video (Mux / Cloudflare Stream) for premium content
