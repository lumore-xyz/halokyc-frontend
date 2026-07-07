# DESIGN_SYSTEM.md

# Design System

**See also:** [`AI_RULES.md`](AI_RULES.md) §"Component Conventions" · [`frontend/ARCHITECTURE.md`](ARCHITECTURE.md) (data flow) · [`frontend/DECISIONS.md`](DECISIONS.md) (ADRs that introduced new tokens or primitives)

HaloKYC's frontend uses shadcn/ui (base-nova style) on top of Tailwind, with a few customizations to match the brand and product language. The design system is documented here as of V1, version
v4. This document is the source of truth for the design language: every
visual decision the team makes should trace back to a token or
primitive documented here.

## Brand Foundations

HaloKYC is the **anti-abuse layer for serious products**. The brand
voice is developer-first, blunt about fraud, calm under pressure, and
respectful of operator time. It should feel like a serious trust
infrastructure product - not a generic AI wrapper, not a playful
onboarding tool, and not a fake enterprise compliance brand.

### Archetype: Outlaw + Control

The brand sits at the intersection of two character archetypes:

- **Outlaw** - anti-abuse, challenger, blunt, developer-first, not
  afraid to call out fraud. HaloKYC should sound like the team that
  built identity verification because they were tired of identity
  vendors that did the opposite.
- **Control** - policy-driven, auditable, precise, calm, operationally
  serious. Every decision has a reason, every reason lands in the
  audit log, every reviewer sees the same evidence.

Three words anchor every design decision:

- **Clarity** - every state is legible at a glance
- **Restraint** - decoration is reserved for moments that need it
- **Auditability** - the UI shows its work, never hides the source

The product should feel:

- sharp, but not aggressive
- controlled, but not sterile
- technical, but not cold
- challenging, but not cocky
- trustworthy, but not stuffy

The landing page is allowed to lean more "outlaw": dark technical
canvas for the hero, sharp anti-abuse copy, concrete numbers over
vague claims. The dashboard always leans "control": warm paper, calm
typography, evidence-first surfaces. The two modes alternate by
intent, not by symmetry.


## Visual Direction

HaloKYC uses a **controlled challenger** visual system: warm paper
surfaces, ink-like text, restrained blue accents, sharp display
headlines, and precise UI components. The landing page may lean
slightly more "anti-abuse infrastructure" while the dashboard stays
highly functional and evidence-first.

Avoid these visual traps:

- Purple/pink AI gradients
- Neon cyber-security palettes
- Overused glassmorphism
- Playful rounded SaaS illustrations
- Fake customer logo strips
- Excessive motion or scroll effects
- Compliance claims the product has not earned

Reference mood:

- Stripe-like precision
- Linear-like restraint
- Vercel-like technical clarity
- Cloudflare-like anti-abuse infrastructure voice
- "We are the anti-abuse layer for serious products" — sharp,
  controlled, slightly rebellious


## Color Palette

The core app ships light only. Dark mode is a post-MVP feature. All core
colors are defined as CSS variables in `src/app/globals.css` and exposed
via `@theme inline` to Tailwind utilities.

The palette is intentionally warm, not pure white. Identity verification
involves sensitive data, so the interface should feel stable and human,
not sterile.

```css
/* Core app tokens */
--background: #fafaf8; /* warm off-white canvas */
--foreground: #111111; /* ink text */

--card: #ffffff;
--card-foreground: #111111;

--popover: #ffffff;
--popover-foreground: #111111;

--primary: #0f172a; /* deep slate, primary action */
--primary-foreground: #ffffff;

--secondary: #f1f0ec; /* warm secondary surface */
--secondary-foreground: #1f2937;

--muted: #f4f3ef;
--muted-foreground: #6b7280;

--accent: #2563eb; /* restrained verification blue */
--accent-foreground: #ffffff;

--destructive: #b42318;
--destructive-foreground: #ffffff;

--border: #e7e5e4;
--input: #dad7d0;
--ring: #2563eb;

--radius: 0.75rem;
```

Equivalent OKLCH values may be used if the existing shadcn theme is kept
in OKLCH format:

```css
--background: oklch(0.985 0.005 95);
--foreground: oklch(0.145 0 0);
--card: oklch(1 0 0);
--card-foreground: oklch(0.145 0 0);
--popover: oklch(1 0 0);
--popover-foreground: oklch(0.145 0 0);
--primary: oklch(0.208 0.04 265);
--primary-foreground: oklch(1 0 0);
--secondary: oklch(0.965 0.006 95);
--secondary-foreground: oklch(0.23 0.02 265);
--muted: oklch(0.968 0.006 95);
--muted-foreground: oklch(0.47 0.01 260);
--accent: oklch(0.546 0.215 262);
--accent-foreground: oklch(1 0 0);
--destructive: oklch(0.47 0.19 27);
--destructive-foreground: oklch(1 0 0);
--border: oklch(0.92 0.006 80);
--input: oklch(0.88 0.006 80);
--ring: oklch(0.546 0.215 262);
```

### Semantic Accent Tokens

Use these sparingly. They are semantic, not decorative.

```css
--success: #16803c;
--success-soft: #eaf7ef;
--warning: #b45309;
--warning-soft: #fff7e6;
--danger: #b42318;
--danger-soft: #feecec;
--info: #2563eb;
--info-soft: #eaf1ff;
--ink-soft: #374151;
--paper: #f4f0e8;
--paper-edge: #ded8cc;
```

### Status-Specific Accents

Status pills must pair color with text and an icon. Color alone is never
the signal.

| Status           | Foreground | Background | Border    |
| ---------------- | ---------- | ---------- | --------- |
| `approved`       | `#16803C`  | `#EAF7EF`  | `#BFE8CC` |
| `rejected`       | `#B42318`  | `#FEECEC`  | `#F9C7C3` |
| `manual_review`  | `#B45309`  | `#FFF7E6`  | `#F7D48B` |
| `processing`     | `#2563EB`  | `#EAF1FF`  | `#BFD3FF` |
| `awaiting_credits` | `#2563EB` | `#EAF1FF` | `#BFD3FF` |
| `pending_upload` | `#4B5563`  | `#F4F3EF`  | `#DAD7D0` |

Do not introduce new color tokens without updating this file. Any new
accent used across more than one component must be documented here and
recorded in `DECISIONS.md`.

## Typography

HaloKYC uses a layered type stack built around **Control** — the brand
personality that governs how the system is read, operated, and audited:

- **Display / editorial headlines**: `Fraunces` — A contemporary variable
  serif with optical-size intelligence and a subtle wonk axis. Gives
  landing and dashboard headlines the editorial weight of a
  broadsheet without feeling historical. Reads as a brand that makes
  decisions and owns the outcome.
- **Body / UI / dashboard**: `Inter` — Neutral, authoritative,
  legible at every size. Disappears into the interface so the display
  face carries the emotional weight.
- **Mono**: `JetBrains Mono` — Ligature-aware, tabular figures.
  Purpose-built for evidence data, IDs, hashes, and API snippets.

### Why Fraunces Replaces Space Grotesk

The previous display face was a geometric sans that read as a modern
dev tool. Control requires editorial authority — something that borrows
from the tradition of law, banking, and institutional publishing rather
than consumer SaaS. Fraunces delivers that because:

1. **Variable optical size.** Fraunces adjusts weight and contrast
   automatically across sizes. A 5rem headline renders with firmer
   contrast than the same font at 0.875rem. The font contracts or
   expands its personality with the layout. That is control.

2. **The wonk axis.** A subtle variable axis that adds controlled
   irregularity to letterforms. In a brand about precision, the wonk
   axis reads as intentional — a deliberate choice to feel human
   within structure. Used at display sizes only.

3. **Weight range 300–900 + italics with independent color.**
   Build a five-level hierarchy from whisper-quote weight to full
   institutional headline. The italics have a different width and color
   from the roman — they read as an editorial device with intent, not a
   slanted version of the same word.

4. **It is on Google Fonts as a variable font.** One request, infinite
   weights, no layout shifts, no self-hosting infrastructure.

### Alternate Display Faces (if Fraunces is rejected)

| Font | Trade-off |
|------|-----------|
| Instrument Serif | Softer, more contemporary. Less institutional authority, more design-forward. |
| Newsreader | More newspaper-tract. Exceptional at body sizes; slightly more literary than institutional. |
| Recoleta | Warm and distinctive. Slightly nostalgic. Works if Control reads as "reassuring authority" rather than "imposing authority." |

Keep `Space Grotesk` out of the project after the swap — loading three
display families simultaneously negates the performance benefit of a
single variable font.

### Font Loading

Use `next/font/google` unless the project later decides to self-host
fonts for stricter privacy/performance control.

```ts
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";

export const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "500", "700", "900"],
  style: ["normal", "italic"],
});

export const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});
```

The root `layout.tsx` applies the three CSS variables to `<html>`:

```html
<html className={`${sans.variable} ${display.variable} ${mono.variable}`}>
```

`globals.css` exposes both `--font-display` and `--font-serif` (legacy
alias) so any existing `font-serif` Tailwind classes keep working
without a mass rewrite.

### Usage Rules

- `Fraunces` is the display family. It appears on landing-page hero
  and section headlines, audit-log detail page titles,
  data-retention / terms / privacy headings, dashboard page titles,
  and any brand-led surface that needs an authoritative editorial voice.
- Do not use `Fraunces` for body text, form labels, buttons, tables,
  status pills, card bodies, navigation, sidebar, or any element below
  `text-display-sm` (1.5rem / 24px).
- `Inter` is the default for the application shell, dashboard, forms,
  cards, navigation, sidebar, topbar, body copy, and all non-display
  headings.
- `JetBrains Mono` is reserved for IDs, hashes, JSON, API snippets,
  timestamps, document numbers, risk scores, and numeric developer
  surfaces. The tabular glyphs make audit rows align cleanly.
- Never use more than these three families without updating this file.

### Type Scale

Two tiers: **Display** (Fraunces) and **UI** (Inter / Mono).

#### Display — Fraunces

| Token name | Size | Weight | Line | Where |
|------------|------|--------|------|-------|
| `text-display-xl` | `clamp(3.5rem, 8vw, 7rem)` | 500 | 0.95 | Landing hero headline |
| `text-display-lg` | `clamp(2.5rem, 5vw, 4.5rem)` | 500 | 0.95 | Landing section headlines, final CTA |
| `text-display-md` | `2.25rem` | 500 | 1.1 | Dashboard page titles |
| `text-display-sm` | `1.5rem` | 500 | 1.2 | Card titles, modal headers, legal H1 |

Floor: Fraunces is not used below `text-display-sm`. All display sizes
use `tracking-[-0.03em]` as a base; tighten to `[-0.04em]` only at
`display-xl`.

#### UI — Inter

| Role | Class | Weight | Line | Where |
|------|-------|--------|------|-------|
| Body large | `text-base leading-7` | 400 | 1.7 | Landing body, long-form |
| Body | `text-sm leading-6` | 400 | 1.6 | Dashboard body, forms, cards |
| Caption | `text-xs leading-5 text-muted-foreground` | 400 | 1.5 | Metadata, timestamps, helper text |

#### Mono — JetBrains Mono

| Role | Class | Weight | Line | Where |
|------|-------|--------|------|-------|
| Mono-md | `text-sm` | 500 | 1.5 | Stats, route labels, metadata |
| Mono-sm | `text-xs` | 500 | 1.4 | Inline data, audit log entries |

No font-size below `text-xs`. Every numeric value — risk score,
timestamp, verification count — uses `tabular-nums`.

### Copy Rhythm

- Landing headlines should be short, sharp, and confident. Lead with a
  verb; finish with a noun.
- Dashboard text should be literal and operational.
- Avoid hype words like "revolutionary", "magical", "unlimited", or
  "bank-grade" unless legally and technically true.
- Prefer verbs like verify, approve, review, reject, detect, sign,
  queue, resolve, attribute, and disclose.
- The landing hero copy may be blunt about identity fraud: the brand
  is not afraid to say "your current vendor does not care about
  duplicate detection" or call out a violation class by name.
- The dashboard never editorialises. Error messages explain what
  happened, why, and what to do next.

## Layout Primitives

The application uses two distinct layout shells:

### 1. Landing & Public Shell

Used for `/`, `/verify`, and `/login`.

- **Structure**: `SiteHeader` + single column (`max-w-5xl`, `mx-auto`, `px-6`, `py-12`).
- **Visuals**: Centered, breathable, focused on single-task flows.

### 2. Product AppShell

Used for authenticated routes (`/dashboard`, `/console`, `/admin`).

- **Structure**: `SidebarProvider` wraps the surface.
- **Sidebar**: Collapsible sidebar on the left (icons-only when collapsed).
- **Main Content**: `SidebarInset` wraps a `AppTopbar` and the page content.
- **Topbar**: Sticky header containing the `SidebarTrigger`, dynamic `Breadcrumbs`, and a `UserMenu`.
- **Canvas**: Full-width content area that adapts to the sidebar state.

Developer detail pages (`/console/verifications/[id]`) and Admin review detail pages (`/admin/reviews/[id]`) continue to use their specific content layouts (single-column and two-pane respectively) inside the `AppShell`.

## Landing Page Layout System

The landing page has a wider editorial canvas than the dashboard.

```txt
max-w-7xl mx-auto px-6 sm:px-8 lg:px-10
```

Recommended section rhythm:

- Hero: `pt-28 pb-24 sm:pt-36 sm:pb-32`
- Standard sections: `py-24 sm:py-32`
- Dense product sections: `py-20 sm:py-24`
- Final CTA: `py-28 sm:py-36`

Landing sections should use generous whitespace and fewer cards. A
single strong visual is better than many small decorative elements.

## Spacing Scale

We follow Tailwind's default scale with one custom step:

- `gap-1.5` between inline chips
- `gap-4` inside cards
- `gap-6` between cards in a grid
- `gap-8` between page sections
- `gap-12` between hero and content
- `gap-16` between landing-page content blocks
- `gap-24` between major landing-page sections

Cards use `p-6` internally. Large marketing cards may use `p-8` or
`p-10` on desktop. Forms use `space-y-4` between fields.

## Radius

`--radius: 0.75rem` (12px). Buttons and inputs inherit `rounded-lg`.
Cards use `rounded-2xl` for marketing surfaces and `rounded-xl` for
product dashboards. Avatars and status dots use `rounded-full`.

Do not use extremely large blob radii on serious product surfaces.

## Borders and Shadows

HaloKYC uses borders and layered surfaces more than heavy shadows.

- Sticky headers: `border-b border-border/70 bg-background/80 backdrop-blur-xl`
- Product cards: 1px border, no default shadow
- Marketing cards: soft border + optional subtle shadow
- Hover lift: allowed only on landing-page cards and upload/capture zones
- Dashboard cards: no dramatic hover motion

Recommended marketing card shadow:

```css
box-shadow:
  0 1px 2px rgba(15, 23, 42, 0.04),
  0 24px 80px rgba(15, 23, 42, 0.08);
```

Do not use neon glow shadows in the core app.

## Motion

Motion must communicate quality, not excitement. The default dashboard
experience remains calm and direct. The landing page can use Framer
Motion, but animation must be restrained.

### Dashboard Motion

Defaults:

- Page content fade: `150ms ease-out`
- Hover/focus: `100ms ease-out`
- Polling indicator: `1.5s ease-in-out` infinite
- Skeleton shimmer: `1.6s linear` infinite, paused under
  `prefers-reduced-motion`

Dashboard rules:

- Never animate text size, line height, or font weight on state change.
- Do not use parallax or scroll-jacking in app routes.
- User-input feedback must complete under `300ms`.
- Loading, polling, and optimistic updates may animate.

### Landing Page Motion

Framer Motion is allowed on `src/app/page.tsx` and components under
`src/components/landing/`.

Allowed landing motion:

- Hero headline fade-up
- CTA fade-up
- Section reveal on scroll
- Feature card stagger
- Very subtle dashboard mockup parallax
- Soft floating verification receipt/card
- Button hover lift

Avoid:

- Text scramble effects
- Autoplay video backgrounds
- Infinite moving particles
- Scroll-jacking
- Large bouncy springs
- Animation that distracts from copy

Recommended motion presets:

```ts
export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

export const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.08 },
  },
};

export const softFloat = {
  y: [0, -10, 0],
  transition: { duration: 7, repeat: Infinity, ease: "easeInOut" },
};
```

All non-essential Framer Motion animations must respect
`prefers-reduced-motion` through `useReducedMotion()` or CSS fallback.

## Iconography

`lucide-react` is the only icon source. Stroke width `1.75` to match the
UI feel. Icons inside buttons inherit `size-4`. Icons inside metric
blocks use `size-5`. Landing-page hero icons may use `size-6` only if
they sit inside a large visual card.

No emoji in the UI - ever.

## Brand Assets

HaloKYC logo artwork lives in `public/assets/logo/` and is consumed
through `src/components/brand-logo.tsx`.

- `halokyc-hr-dark.png` - horizontal wordmark for light surfaces.
- `halokyc-hr-light.png` - horizontal wordmark for dark landing and
  auth surfaces.
- `halokyc-icon.png` - square app icon for browser metadata and
  light-background icon use.
- `halokyc-color-icon.png` - square blue icon for compact dark app
  chrome such as the collapsed sidebar.

Use `BrandLogo` for nav, footer, login, legal headers, and app-shell
brand marks. Do not rebuild the HaloKYC logo from text plus a generic
lucide icon; lucide remains for functional UI symbols only.

## Empty States

Every list, queue, and detail panel has an empty state:

```txt
[icon]
Heading: what is missing (in plain language)
Body: what to do next
Primary action
```

Empty states are never decorated with illustrations. They use a
`lucide-react` glyph and the standard card surface.

## Status Language

Status pills use sentence case and the present tense:

- `Pending upload` (not `PENDING_UPLOAD` or `Awaiting upload`)
- `Awaiting credits` for operator-facing credit backlog rows; end-user
  `/verify` screens use neutral submitted/waiting copy instead.
- `Processing` (not `In progress`)
- `Approved`, `Rejected`, `Needs review`

Decision reasons are quoted as returned by the backend. We never
paraphrase them in the UI - the operator must see exactly what the risk
engine wrote.

## Component Inventory (MVP)

Primitives in `src/components/ui/`:

- `alert` - inline errors and blocked-state notices
- `badge` - status pills and count chips
- `button` - default, outline, secondary, ghost, destructive, link
- `card` - the only core app container; supports header / content /
  footer
- `command` - searchable command lists, including workflow comboboxes
- `dialog` - modal task surfaces and command-dialog accessibility shell
- `field` - accessible form grouping, labels, descriptions, and errors
- `input` - text, email, password, url, search
- `input-group` - grouped input/addon composition used by search fields
- `label` - bound to inputs by `htmlFor`
- `popover` - anchored click surfaces for comboboxes and contextual
  controls
- `progress` - verification progress indicator
- `separator` - semantic section dividers
- `skeleton` - loading placeholder
- `spinner` - pending action indicator inside buttons
- `sonner` - toaster provider
- `textarea` - multiline admin rejection reasons

Shared feature components in `src/components/`:

- `site-header` - the persistent top nav with the API key Settings menu
- `status-pill` - status badge bound to `VerificationStatus`
- `score-meter` - risk score gauge (0-100, three bands: low < 30,
  medium < 60, high >= 60). Tabular numerals for the readout.
- `check-card` - one card per check (`ocr`, `face_match`, `liveness`,
  `duplicate`, `age`). Status pill + score readout + collapsible detail
  JSON.
- `agent-recommendation-panel` - advisory agent verdict card for reviewer
  and platform detail pages. Shows structured status, confidence,
  reason-code labels, fallback state, deterministic comparison, and safe
  evidence references. Provider/model metadata is role-gated to owner/admin
  and platform contexts; prompts and hidden evidence are never shown.
- `json-viewer` - collapsible JSON block with copy-to-clipboard.
- `empty-state` - shared empty / loading shell

Landing-only components live under `src/components/landing/`:

- `landing-navbar` - scroll-aware sticky with shield/halo mark
- `hero-section` - serif headline, floating VerificationReceipt, halo
- `trusted-pipeline` - 6 check cells animating on scroll
- `problem-section` - warm-paper editorial block
- `feature-grid` - 8 verification primitives on dark canvas
- `api-section` - code + signed-webhook payload
- `workflow-section` - 6-step vertical timeline
- `use-cases-section` - 6 product-shape cards
- `client-control-section` - mock client policy/review controls with audit labels
- `pricing-section` - 3 plans, no hardcoded prices
- `security-section` - 8-point checklist
- `final-cta` - cyan halo with two CTAs
- `landing-footer` - 4-column marketing navigation
- `reveal` - viewport-triggered fade-up wrapper (motion/react)
- `gradient-orb` - soft radial glow for hero / CTA
- `verification-receipt` - paper-slip signature visual

Landing-only components may use larger radii, editorial typography,
and `motion/react` for orchestration. They must not change
dashboard primitives.

Landing-only components may use larger radii, editorial typography, and
Framer Motion. They must not change dashboard primitives.

We do not introduce a new primitive unless at least two routes need it
or it is a direct shadcn addition driven by the design language above.

## Accessibility Floor

Every interaction must be reachable by keyboard and exposed to screen
readers. The MVP sets this as a quality bar, not a stretch goal:

- Visible focus ring (`outline-ring/50`) on every interactive element
- `aria-label` on every icon-only button
- Form errors associated with their field via `aria-describedby`
- `prefers-reduced-motion` disables non-essential animation
- Colour is never the only signal; status pills pair colour with text
  and an icon
- All images carry meaningful `alt` text or `alt=""` for decorative
- Landing-page Framer Motion must respect reduced-motion preferences
- Text contrast must remain readable on warm paper and tinted surfaces

## Landing Page Tokens (additive, scoped)

`src/app/page.tsx` ships a brand-led landing-page language: editorial
headlines, warm paper surfaces, restrained blue accents, and precise
verification UI mockups. Landing tokens are separately namespaced so
they never bleed into the dashboard.

```css
--landing-bg: #fafaf8; /* warm editorial canvas */
--landing-ink: #111111; /* hero/headline text */
--landing-ink-soft: #52525b; /* secondary copy */
--landing-paper: #ffffff; /* elevated cards */
--landing-paper-warm: #f4f0e8; /* trust receipt surfaces */
--landing-rule: #e7e5e4; /* dividers and hairlines */
--landing-blue: #2563eb; /* primary accent */
--landing-blue-soft: #eaf1ff; /* soft accent surface */
--landing-green: #16803c; /* pass / approved */
--landing-green-soft: #eaf7ef;
--landing-amber: #b45309; /* review / warning */
--landing-amber-soft: #fff7e6;
```

Landing-page visual motifs:

- Verification receipt
- Verification case file / dossier
- Policy manifest
- Audit trail slip
- Risk score meter
- Signed webhook card
- ID/selfie check rows
- Subtle paper fold or rule lines

The landing page may use a "case file" composition: a dark technical
canvas with structured dossier panels that show the relationship
between workflow policy, captured evidence, check results, risk score,
audit trail, and signed webhook. This motif is specific to HaloKYC's
auditability promise and should replace generic SaaS dashboard mockups
when a product visual is needed.

The landing page should not use dark cyber-security visuals by default.
Dark sections are allowed only as short contrast breaks, never as the
entire identity.

### Landing Chrome (additive, scoped)

The landing page uses an additional set of tokens for its dark canvas
sections. These are additive and do not affect the dashboard or the
warm-paper system above.

```css
--landing-canvas: oklch(0.16 0.018 250); /* hero / dark section bg */
--landing-canvas-edge: oklch(0.22 0.02 250); /* elevated card on canvas */
--landing-canvas-soft: oklch(0.32 0.02 250); /* hover / pressed */
--landing-canvas-ink: oklch(0.96 0.01 250); /* primary text on canvas */
--landing-canvas-ink-soft: oklch(0.74 0.015 250);
--landing-canvas-mute: oklch(0.56 0.02 250);
--landing-hair: oklch(0.28 0.015 250); /* hairlines, borders */
--landing-cyan: oklch(0.82 0.13 200); /* halo accent */
--landing-cyan-soft: oklch(0.32 0.07 200);
--landing-cyan-edge: oklch(0.45 0.09 200);
--landing-amber-stamp: oklch(0.78 0.15 80); /* manual review signal */
--landing-mint: oklch(0.78 0.16 155);
```

Use the warm-paper tokens (`--landing-ink`, `--landing-paper`, etc.)
for editorial / human sections (problem, use cases, security) and
the landing-canvas tokens for technical / product surfaces (hero,
feature grid, API, workflow, client control, pricing, final CTA).
The two systems alternate by intent, not by symmetry.

## Dashboard Chrome Tokens (additive, scoped)

Authenticated app routes use a quieter continuation of the landing
page's case-file motif: warm paper canvas, dark ink navigation, thin
record-grid rules, and small evidence-strip accents. These tokens are
defined in `src/app/globals.css` and are reserved for `/dashboard`,
`/admin`, and `/console` shell surfaces.

```css
--dashboard-rule: oklch(0.86 0.008 80);
--dashboard-canvas: oklch(0.97 0.006 90);
--dashboard-paper: oklch(0.99 0.006 92);
--dashboard-ink: oklch(0.18 0.025 255);
--dashboard-blue: oklch(0.58 0.17 242);
--dashboard-cyan: oklch(0.79 0.13 199);
--dashboard-mint: oklch(0.79 0.14 155);
--dashboard-amber: oklch(0.77 0.15 78);
```

Dashboard chrome rules:

- The sidebar is an ink surface so authenticated areas feel distinct
  from public marketing pages.
- Main content sits on a warm ruled canvas, not pure white.
- Use the evidence strip only as a small brand signal: logo mark,
  header rule, or status rail. Do not turn it into a large gradient
  background.
- Product cards may use `app-shell-panel` for layered paper surfaces.
  Repeated list items should still rely on borders and spacing, not
  heavy shadows.

### Landing Motion (additive)

The `motion/react` library (the renamed `framer-motion`) is the only
allowed motion source for landing-only components. Use the
`Reveal` primitive for scroll-triggered fade-ups and
`GradientOrb` for hero / CTA halos. All keyframe utilities
(`landing-rise`, `landing-float`, `landing-stamp`, `landing-halo`,
`landing-orbit`, `landing-stripe`) respect
`prefers-reduced-motion: reduce` and pause automatically.

### Landing Font (additive)

`Fraunces` is loaded via `next/font/google` in the root layout and
exposed as `--font-display` in `@theme inline` (with the legacy
`--font-serif` alias retained so existing `font-serif` Tailwind classes
keep mapping to the same face). The landing page applies `font-display`
for hero and section headlines. The dashboard uses `font-display` for
page titles and card titles; dashboard body copy stays on Inter.

The display face is an editorial serif — variable optical size, wonk
axis, weight range 300–900 — chosen to express the Control half of the
brand personality. It reads as a brand that makes decisions and owns
the outcome.

## Future Decisions

When we add dark mode, every core color token gets a dark counterpart
here. Landing tokens may stay light-first unless a full brand refresh is
approved.

When we add a charting library for risk-score distribution, the chart
palette must be derived from chart slots documented here before use.

When we add paid/custom fonts, licensing must be documented in
`DECISIONS.md`; never commit commercial font files to the repository.

## Workspace Switcher

The organization/workspace/RBAC phase extends the existing authenticated
AppShell. It does not introduce a new visual system.

### Customer Switcher (`AppWorkspaceSwitcher`)

- Lives at the top of the authenticated customer sidebar, immediately under
  the brand mark.
- Trigger is a `SidebarMenuButton` with a 2-letter avatar tile, the active
  workspace name as the primary label, and the workspace count as the
  secondary label (e.g. `3 workspaces`).
- Opens a `DropdownMenu` (NOT a `Popover` or `Command` list — dropdown is
  the canonical surface for "switch context" pickers).
- Two labelled sections inside the menu, each in its own
  `DropdownMenuGroup`:
  - **Organization** — read-only name of the caller's organization.
  - **Workspaces** — one `DropdownMenuItem` per workspace, with the slug
    as secondary text and a `CheckIcon` next to the active entry.
- Optional third section (`showCreate`) for owner/admin roles exposes a
  `Create workspace` action that links back to `/dashboard` and forces a
  router refresh.
- Workspace selection routes the caller to
  `/dashboard/${workspaceId}`. The destination layout always rewrites
  workspace-scoped nav entries through `useNavGroups` so the active
  workspace id propagates to every sidebar link.

### Implementation Rules

- Use the existing `DropdownMenu` + `SidebarMenu` primitives. Do not build
  a bespoke dropdown unless a second surface needs it.
- Workspace switching must preserve route intent where possible and fall
  back to the target workspace overview when a route is unavailable.
- The switcher is hidden in the `admin` audience — it only renders for
  customer (`audience="client"`) shells.
- When the sidebar is collapsed (`collapsible="icon"`), labels and
  chevrons collapse to icons via `group-data-[collapsible=icon]:hidden`,
  matching the rest of the sidebar.

## Role-Filtered Navigation

Hidden nav items are a clarity affordance, not a security boundary.
Every route handler must enforce the role check itself; the sidebar
filter exists to reduce noise.

### Nav Config (`app-nav-config.ts`)

- One source of truth: `APP_NAV_GROUPS` declares every entry with a
  `roles: ClientRole[]` allow-list for customer entries and
  `platformRoles: PlatformRole[]` for platform entries.
- Items declare a `scope: "workspace" | "organization"`. Workspace-scoped
  entries (the default) get their URL rewritten to include the active
  workspace id; organization-scoped entries (`Workspaces`, `Team`,
  `Billing`, `Settings`) keep their URL stable across workspaces.
- The sidebar renders six logical groups: `Workspace`, `Organization`,
  `Account`, `Developer`, `Operator`, `Admin`.

### Filter Hook (`useNavGroups`)

- Audience filter: customer entries are hidden when the admin audience
  is active, and platform entries are hidden for unauthenticated
  previews.
- Role filter: an item with no `roles` allow-list is visible to every
  customer; an item with a non-empty allow-list is visible only when
  the caller's role is in the list. The same rule applies to
  `platformRoles` for the platform audience.
- URL rewrite: when the audience is `client` and the pathname includes
  a UUID in the second segment (e.g. `/dashboard/<workspace-uuid>`),
  every workspace-scoped entry URL is rewritten to
  `/dashboard/<workspace-uuid>/<feature>`. The rewrite is a no-op for
  organization-scoped entries.

### Route Guards

- Customer guards live in `components/dashboard/route-access.tsx`:
  `<RouteGuard>` for workspace-scoped routes and
  `<OrganizationRouteGuard>` for organization-scoped routes. Both detect
  401, 403, disabled-account, and disabled-workspace/disabled-organization
  states and render an explicit empty-state panel with the caller's
  current role and the page's allowed roles.
- Platform guard lives in `components/dashboard/platform-route-guard.tsx`:
  `<PlatformRouteGuard allowedRoles={...}>` wraps every `/admin/**` page.
  On unauthenticated, role mismatch, or 403 from the backend it renders
  `<PlatformAccessDenied>`, a calm `EmptyState` keyed off the same role
  matrix (`PlatformAccessDenied` lives in `route-access.tsx`).
- The role-denied panels use `LockKeyholeIcon` for customers and
  `ShieldOffIcon` for disabled workspaces; copy is plain and operational
  ("Your current role is Reviewer. This page is reserved for Owner,
  Admin."). Reserve `Alert variant="destructive"` for genuine backend
  failures — never for "you don't have access".
- Sensitive evidence access is gated by `SENSITIVE_EVIDENCE_VIEWERS`
  on the session detail page; the panel shows an `EyeOffIcon` plus an
  explanation that backend 403s are enforced even for direct fetches.
- `<DisabledAccountState>` renders two variants — `organization`
  (suspended / disabled at the org level) and `member` (single user
  account disabled by an owner). Both reuse the shared `EmptyState`.

### Role-Aware Sidebar Reference

Customer audience:

| Role          | Visible groups                                                                                                         |
| ------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Owner / Admin | Workspace (all), Organization (Workspaces, Team, Billing), Account (Settings), Developer (API console, Integration logs, Docs) |
| Reviewer      | Workspace (Overview, Verifications, Manual review, Assigned reviews, Completed reviews), Account (Settings), Developer (API console, Docs) |
| Developer     | Workspace (Overview, Verifications, Workflows, API keys, Webhooks), Account (Settings), Developer (API console, Integration logs, Docs) |

Platform audience:

| Role             | Visible Operator entries                                                                                    |
| ---------------- | ----------------------------------------------------------------------------------------------------------- |
| Platform Owner   | All Operator entries + legacy Admin group (Clients, Ledger, Review queue)                                   |
| Business Admin   | Overview, Organizations, Workspaces, Verifications, Billing & credits, Support, Audit logs                   |
| Support          | Overview, Organizations, Workspaces, Verifications, Support (read-only)                                     |
| Sales            | Overview, Sales (Customers, Plans, Usage Summary, Sales Notes)                                              |

Hidden surfaces must still render an explicit `<RouteAccessDenied>` or
`<PlatformAccessDenied>` state when accessed directly. Do not rely on
Next.js' default 404 for unauthorised routes.

## Subject Lifecycle Controls

The planned subject lifecycle surface extends the dashboard control language
without adding new colors or primitives.

- Ban status uses existing semantic status styling: permanent/active ban maps
  to destructive, soft ban maps to warning, lifted/no active ban maps to muted
  or success only when the copy says the user is clear.
- Reset verification and full subject deletion use destructive `Dialog`
  confirmations. The exact `external_user_id` must be visible in mono text
  before the operator confirms.
- Ban create/update uses the existing authenticated form drawer pattern
  (`Sheet` + form primitives), because it collects structured input.
- Copy must be operational and explicit about retention effects:
  reset/delete removes duplicate matchability; ban deletes session artifacts
  but retains a ban-match embedding while active.
- Never render embedding ids, vectors, face thumbnails, or biometric internals
  in lifecycle UI. Show counts and audit events instead.

## Verify Shell (additive, scoped)

The `/verify` route uses a dedicated shell that does not belong to the
landing or dashboard chrome families above. It is documented here so
every addition is consistent with the brand language.

### Components

- `VerifyShell` (in `src/app/verify/_components/verify-shell.tsx`) renders
  the warm-paper canvas, the dotted backdrop, the brand mark, the card
  surface, and the `Secured by HaloKYC` footer.
- `VerifyProgress` (in the same folder) renders a top progress bar bound
  to the verify state machine. Track uses `--muted`, indicator uses
  `--accent` (the same blue used by the landing CTA).
- `VerifyStepIntro`, `VerifySelfieStep`, `VerifyDocumentStep`,
  `VerifyStepProcessing`, `VerifyResultStep`, and `VerifyErrorStep` are
  the six step surfaces. Each is wrapped in `VerifyShell` and uses
  `.verify-step-enter` for the ≤ 150ms fade.

### Backdrop

A CSS radial-gradient dotted mesh (`.verify-shell-backdrop`) at 8%
opacity, masked to a soft ellipse so the edges fade. No third-party
asset. Matches the "evidence-first" feel without leaning cyber.

### Status colours

The verify terminal reuses the existing `--status-approved-*`,
`--status-review-*`, and `--status-rejected-*` pairs. The icon and the
text are paired (status pill + headline + body copy) so colour is never
the only signal. Approved → emerald, manual review → amber, rejected →
destructive. Do not introduce new status colours here.

### Liveness frame

When the workflow requests a selfie or liveness check, the camera canvas
renders a static SVG ellipse and a "Place your head within the frame"
pill. The check itself runs server-side via the
`HeuristicLivenessProvider` (ADR-012); the frame is honest UX, not a
fake promise. Do not animate the ellipse.

### Privacy footer

Every verify screen renders `Secured by HaloKYC` with the icon-color
`BrandLogo` variant. The intro screen also links to the
`End User Terms` and `Privacy Notice`. No language toggle (MVP
non-goal).

### Motion

`.verify-card` and `.verify-step-enter` are the only verify animations.
Both stay under 150ms and respect `prefers-reduced-motion`. Do not
import `motion/react` into the verify shell.

### Out of scope (deferred to v2)

A country / document-type picker on `/verify` (the "Choose your
verification document" step). See ADR-F022.
