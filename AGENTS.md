# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Common commands

### Install dependencies
- `npm install`

This repo uses npm (see `package-lock.json`).

### Run the app (local dev)
- `npm run dev`

### Production build / run
- `npm run build`
- `npm run start`

### Lint
- `npm run lint`

To lint specific paths/files, pass args through npm:
- `npm run lint -- app`
- `npm run lint -- app/page.tsx components/Navbar.tsx`

To apply autofixes:
- `npm run lint -- --fix`

### Typecheck
There is no dedicated script, but you can typecheck via:
- `npx tsc -p tsconfig.json --noEmit`

### Tests
No test runner/scripts are configured in `package.json` (no `test` script).

## High-level architecture

### Framework + routing (Next.js App Router)
- The app is a Next.js App Router project.
- Route entrypoints live under `app/`.
  - `app/layout.tsx` is the root layout. It:
    - loads global styles from `app/globals.css`
    - sets fonts via `next/font/google`
    - renders `components/Navbar.tsx` and the background effect `components/LightRays.tsx`
  - `app/page.tsx` is the home page (`/`). It renders a list of events from `lib/constants.ts`.

Notes:
- `EventCard` links to `/events/[slug]` (`/events/${slug}`), but there is currently no `app/events/...` route implemented.

### UI + styling (Tailwind CSS v4)
- Global styling and component-specific CSS live in `app/globals.css`.
  - Tailwind is imported via `@import "tailwindcss";` (Tailwind v4 style).
  - The file defines project-wide CSS variables (colors/radii/fonts) and Tailwind “utilities”/component styles using `@utility` and `@layer`.
  - Many component styles are tied to element IDs (e.g. `#explore-btn`, `#event-card`) rather than per-component CSS modules.
- `lib/utils.ts` provides `cn()` (clsx + tailwind-merge) for className composition.

### Data model
- `lib/constants.ts` defines `EventItem` and an in-memory `events` list used by `app/page.tsx`.
  - Today the site is effectively static (no API routes / database code in the repo).

### Analytics (PostHog)
PostHog is integrated client-side:
- `instrumentation-client.ts` initializes `posthog-js` in the browser.
  - Requires `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST`.
- `next.config.ts` sets up a reverse-proxy rewrite so the client posts to `/ingest/*` which is forwarded to PostHog EU hosts. This helps reduce ad-blocker interference.

Event instrumentation lives in client components:
- `components/Navbar.tsx`: `nav_link_clicked`
- `components/ExploreBtn.tsx`: `explore_events_clicked`
- `components/EventCard.tsx`: `event_card_clicked` (includes event metadata)

Additional context:
- `posthog-setup-report.md` documents what was instrumented.
- `.claude/skills/posthog-integration-nextjs-app-router/` contains reference material for the PostHog integration approach used here.

## Repo conventions worth knowing
- TypeScript path alias: `@/*` maps to the repo root (see `tsconfig.json`).
- Linting uses ESLint 9 flat config (`eslint.config.mjs`) with `eslint-config-next` (core-web-vitals + TypeScript presets).