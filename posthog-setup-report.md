<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog into your **DevEvent** Next.js App Router project. Here's a summary of all changes made:

- **`instrumentation-client.ts`** (new file): Initialises PostHog client-side using the recommended Next.js 15.3+ approach. Includes error tracking (`capture_exceptions: true`), debug mode in development, and routes events through a local reverse proxy (`/ingest`).
- **`next.config.ts`** (updated): Added reverse proxy rewrites routing `/ingest/*` to the EU PostHog host (`eu.i.posthog.com`), reducing the chance of events being blocked by ad blockers. Also added `skipTrailingSlashRedirect: true`.
- **`components/ExploreBtn.tsx`** (updated): Added `posthog.capture('explore_events_clicked')` in the click handler.
- **`components/EventCard.tsx`** (updated): Added `'use client'` directive and `posthog.capture('event_card_clicked', {...})` on link click, capturing the event title, slug, location, and date as properties.
- **`components/Navbar.tsx`** (updated): Added `'use client'` directive and `posthog.capture('nav_link_clicked', { nav_label })` on each navigation link click.
- **`.env.local`** (updated): Added `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` environment variables.

## Events instrumented

| Event name | Description | File |
|---|---|---|
| `explore_events_clicked` | User clicked the 'Explore Events' call-to-action button on the home page | `components/ExploreBtn.tsx` |
| `event_card_clicked` | User clicked on a featured event card to view event details | `components/EventCard.tsx` |
| `nav_link_clicked` | User clicked a navigation link in the navbar | `components/Navbar.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- 📊 **Dashboard — Analytics basics**: https://eu.posthog.com/project/130554/dashboard/536583
- 📈 **Explore & Event Card Clicks Over Time**: https://eu.posthog.com/project/130554/insights/YeVNbtRj
- 🔀 **Explore → Event Card Conversion Funnel**: https://eu.posthog.com/project/130554/insights/3fDwTd1O
- 🧭 **Navigation Link Clicks by Section**: https://eu.posthog.com/project/130554/insights/8aR2Rfx6
- 👥 **Unique Users Engaging with Events Daily**: https://eu.posthog.com/project/130554/insights/n64IKDDI
- 🥇 **Most Popular Events (by clicks)**: https://eu.posthog.com/project/130554/insights/GKEnnnmt

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/posthog-integration-nextjs-app-router/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
