# Little Lights · Big stories. Little hearts.

A mobile-first bedtime Bible story app for ages 3–7. Built with the requested Next.js 14 App Router, TypeScript, Tailwind, Supabase, Stripe, and Framer Motion. Original SVG illustrations and self-hosted Fredoka/Nunito fonts ship with the app.

## Run locally

Use Node.js 22 or newer (validated on Node 24):

```sh
npm ci
npm run dev
```

No credentials are needed for the local preview. It includes three fully readable stories, onboarding, device narration, quizzes, finger coloring and PNG download, daily stickers, printable milestone certificates, parent statistics, and calendar reminders. Family details and drawings stay in the browser in preview mode. Three additional paid story previews are included; their full text is kept out of client bundles.

## Connect accounts and billing

Copy `.env.example` to `.env.local` and fill in your own service values. Never commit that file. The app automatically enables live mode when Supabase is configured. Missing services return explicit setup errors; the app never simulates a successful payment or admin login.

1. **Supabase:** create a project, run [schema.sql](supabase/schema.sql), then [seed.sql](supabase/seed.sql) in its SQL editor. Enable email authentication and allow your `/auth/callback` URL. Configure the project URL, anonymous key, and server-only service-role key. See [Supabase setup](supabase/README.md).
2. **Stripe test mode:** create recurring prices for **$7.99/month** and **$49/year**. Set both price IDs, your `sk_test_` key, and the publishable key. Enable the Stripe Billing customer portal. Add a webhook for `/api/stripe/webhook` and set its signing secret. Subscribe to `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, and `invoice.payment_failed`. Local development can use `stripe listen --forward-to localhost:3000/api/stripe/webhook`.
3. **App URL:** set `NEXT_PUBLIC_APP_URL` to your app origin. Production accounts and billing require an HTTPS URL. Public `NEXT_PUBLIC_*` changes require a fresh build.
4. **Restricted cloud networking:** allow your exact Supabase project hostname and `api.stripe.com` for server requests. Checkout also uses `js.stripe.com`, `checkout.stripe.com`, and `billing.stripe.com` in the browser. Preserve other existing allowlist entries.
5. **Admin:** set a strong `ADMIN_PASSWORD` of at least 12 characters and a random `ADMIN_SESSION_SECRET` of at least 32 characters. Open `/admin` to manage stories, per-page illustrations and MP3s, quiz answers, and publication status. Sessions expire after eight hours.

Paid content requires a verified Supabase session and a subscription confirmed by a signed Stripe webhook. The success URL alone never grants access. Checkout and the portal require an authenticated parent. Live Stripe keys are rejected unless `STRIPE_LIVE_MODE=true` is explicitly set. Test the full payment, cancellation, renewal, and deletion flows in your own test accounts before changing that setting.

The database has `users`, `stories`, `progress`, `stickers`, and webhook receipts, with row-level security. Coloring and CMS media use private Supabase Storage buckets; authorized APIs create expiring signed links. A completion is unique per parent/story/UTC day. Repeating it updates the drawing without minting another reward. Re-reading on a later day earns another sticker, up to 30.

## Included screens

- `/`: personalized illustrated home, featured story, library and sticker previews.
- `/stories`: searchable story library with themes, free stories, and subscription gates.
- `/read/[id]`: swipe/keyboard reader, HTML5 audio or device voice, celebration, two-question quiz, coloring, and sticker collection.
- `/stickers`: 30 illustrated stickers, earned dates, saved drawings, certificates at 10/20/30.
- `/parent`: streak calendar, totals, favorite story, family settings, calendar reminders, subscriptions, secure email sign-in, and account deletion.
- `/admin`: password-protected Story Studio with validated per-page uploads and quizzes.

## Validation

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm start
# With the server running in a second terminal:
npm run test:e2e
```

Unit and database tests execute the real PostgreSQL schema in PGlite and test access controls, subscription forgery, paid story protection, content limits, daily reward idempotency, private drawing ownership, admin session integrity, and account deletion ordering. Playwright covers the complete free bedtime journey and mobile layout. Use `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium` when using a system browser; otherwise install one with `npx playwright install chromium`.

## PWA and offline behavior

The manifest includes 192px, 512px, and maskable icons. The production service worker caches the shell, self-hosted fonts/assets, and previously visited free story pages. It deliberately excludes accounts, admin, API responses, and paid content. Offline support starts after an online visit and service-worker activation; live authentication and uploads still need a connection. Run a production build to test installation and offline behavior. Reminders download a daily calendar event; they are not background push notifications.

## Before public launch

- **Security release blocker:** the explicitly requested Next.js 14.2.35 is the last available 14.x release and the dependency audit reports unresolved critical framework advisories. It must be upgraded to a currently supported, patched major before public deployment. A PostCSS override addresses the separately reported vulnerable transitive PostCSS version. Keeping the exact Next.js 14 requirement is suitable for review/development, not a claim of launch readiness.
- Supabase, Stripe, remote storage, and email delivery have not been verified against your service accounts because credentials are not supplied. All local checks and SQL checks run without external service credentials.
- The seed contains **six** original stories, not 100+. Expand the catalogue in the CMS before advertising a larger library. Record licensed narrator MP3s for consistent warm narration; device voices vary by browser and may not work offline.
- Paywall quotations are explicitly labeled illustrative. Replace them with consented, verified testimonials before selling. The annual price saves about **49%** versus twelve monthly payments.
- Publish your own privacy policy, terms, support contact, refund policy, and parental consent process appropriate to your audience. The parent panel describes actual data use and provides deletion; it is not a substitute for those policies.
- Add a durable rate limiter/WAF for a multi-instance deployment; the included in-memory login/email throttling protects a single instance. Configure trusted proxy headers, application monitoring, database backups, and your own email provider.
- Deploy behind HTTPS only after the security update and live-service testing. No public deployment is performed by this repository setup.

Use `npm run build` and `npm start` for production execution. In Codex cloud, use the existing `/workspace/little-lights-app` checkout: each task is already isolated, so no additional Git worktree is needed.
