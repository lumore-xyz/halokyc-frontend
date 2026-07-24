# DESIGN_SYSTEM.md

# Design System

**See also:** [`AI_RULES.md`](AI_RULES.md) §"Component Conventions" · [`frontend/ARCHITECTURE.md`](ARCHITECTURE.md) (data flow) · [`frontend/DECISIONS.md`](DECISIONS.md) (ADRs that introduced new tokens or primitives)

HaloKYC's frontend uses shadcn/ui (base-nova style) on top of Tailwind, with a few customizations to match the brand and product language. The design system is documented here as of V1, version
v5. This document is the source of truth for the design language: every
visual decision the team makes should trace back to a token or
primitive documented here.

## Brand Foundations

HaloKYC is the **calm anti-abuse layer for serious products**. The brand
voice is developer-first, direct about fraud, calm under pressure, and
respectful of operator time. It should feel like premium trust
infrastructure built by people who understand both technology and the
human consequences of identity decisions.

### Archetype: Guardian + Challenger

The brand sits at the intersection of two character archetypes:

- **Guardian** — protective, dependable, humane, and composed. Sensitive
  identity data is handled with care, and every user-facing decision is
  explained clearly.
- **Challenger** — blunt about fraud, developer-first, and willing to
  question weak industry defaults. HaloKYC should sound experienced,
  not loud.

Five words anchor every design decision:

- **Clarity** — every state is legible at a glance
- **Calm** — interfaces reduce anxiety instead of amplifying it
- **Restraint** — decoration supports comprehension
- **Humanity** — people remain visible behind the verification process
- **Auditability** — the UI shows its work and preserves the source

The product should feel:

- premium, but not luxurious for its own sake
- calm, but not passive
- technical, but not cold
- organic, but not playful
- trustworthy, but not bureaucratic

The landing page may be more expressive through large photography,
editorial spacing, and bold green surfaces. The dashboard stays denser
and operational, using the same palette with quieter contrast and
stronger information hierarchy. The two modes are related by colour,
type, radius, and rhythm rather than by identical layouts.

## Visual Direction

HaloKYC uses a **calm editorial technology** system inspired by premium
wellness and human-services brands: deep forest green canvases, warm
cream typography, soft olive surfaces, lime action accents, rounded
photography, generous whitespace, and restrained motion.

The visual system must still communicate trust infrastructure. Organic
styling is used to humanise the product, not to make security controls
feel casual.

### Reference characteristics

- Deep monochromatic green backgrounds with subtle tonal layering
- Warm cream text instead of pure white
- Acid-lime accents used only for primary actions and key highlights
- Large, confident sans-serif headlines with tight tracking
- Rounded image crops and soft rectangular cards
- Natural photography showing real people and real environments
- Thin translucent borders instead of heavy shadows
- Spacious editorial layouts with clear section numbering
- Pill-shaped actions and compact circular icon controls

### Avoid

- Purple or pink AI gradients
- Neon cyber-security palettes
- Heavy glassmorphism
- Pure black backgrounds
- Cartoon SaaS illustrations
- Large decorative blobs unrelated to content
- Excessive shadows or glowing cards
- Dense walls of cards on marketing pages
- Scroll-jacking, bouncy motion, or constant animation
- Compliance claims the product has not earned

### Reference mood

- Premium wellness calm
- Editorial clarity
- Human-centred technology
- Boutique service confidence
- Developer-grade precision
- “Serious verification without cold enterprise theatre”

## Color Palette

The core product uses a dark forest-green theme with warm cream text.
Authenticated product screens may introduce lighter green surfaces for
dense data views, but the brand should never fall back to generic white
SaaS chrome.

All core colours are defined as CSS variables in `src/app/globals.css`
and exposed via `@theme inline` to Tailwind utilities.

```css
/* Core app tokens */
--background: #173426; /* primary forest canvas */
--foreground: #f7f3e8; /* warm cream text */

--card: #234333; /* raised green surface */
--card-foreground: #f7f3e8;

--popover: #294b39;
--popover-foreground: #f7f3e8;

--primary: #c8e64f; /* lime primary action */
--primary-foreground: #172318;

--secondary: #2d503d;
--secondary-foreground: #f4f0e5;

--muted: #294736;
--muted-foreground: #aeb8a6;

--accent: #c8e64f;
--accent-foreground: #172318;

--destructive: #e78178;
--destructive-foreground: #25110f;

--border: rgba(247, 243, 232, 0.1);
--input: rgba(247, 243, 232, 0.14);
--ring: #d6f15a;

--radius: 1rem;
```

Equivalent OKLCH values may be used when the shadcn theme remains in
OKLCH format:

```css
--background: oklch(0.28 0.055 150);
--foreground: oklch(0.96 0.018 90);
--card: oklch(0.34 0.055 150);
--card-foreground: oklch(0.96 0.018 90);
--popover: oklch(0.38 0.055 150);
--popover-foreground: oklch(0.96 0.018 90);
--primary: oklch(0.86 0.17 115);
--primary-foreground: oklch(0.24 0.035 145);
--secondary: oklch(0.4 0.055 150);
--secondary-foreground: oklch(0.95 0.018 90);
--muted: oklch(0.37 0.045 150);
--muted-foreground: oklch(0.74 0.025 125);
--accent: oklch(0.86 0.17 115);
--accent-foreground: oklch(0.24 0.035 145);
--destructive: oklch(0.68 0.14 25);
--destructive-foreground: oklch(0.2 0.03 25);
--border: oklch(0.96 0.018 90 / 10%);
--input: oklch(0.96 0.018 90 / 14%);
--ring: oklch(0.89 0.18 115);
```

### Extended Brand Tokens

```css
--forest-950: #10271c;
--forest-900: #173426;
--forest-850: #1d3b2c;
--forest-800: #234333;
--forest-750: #294b39;
--forest-700: #2d503d;

--cream-50: #fbf8ef;
--cream-100: #f7f3e8;
--cream-200: #e8e2d3;
--cream-300: #d1ccbf;

--lime-400: #d6f15a;
--lime-500: #c8e64f;
--lime-600: #afd33d;
--lime-soft: rgba(200, 230, 79, 0.12);

--olive-400: #aebc8b;
--olive-500: #87956f;
--olive-soft: rgba(174, 188, 139, 0.12);
```

### Semantic Accent Tokens

Semantic colours remain distinct from the brand lime. Use them only for
status, alerts, and data meaning.

```css
--success: #82cf8a;
--success-soft: rgba(130, 207, 138, 0.13);
--warning: #e7c46f;
--warning-soft: rgba(231, 196, 111, 0.13);
--danger: #e78178;
--danger-soft: rgba(231, 129, 120, 0.13);
--info: #8eb8d8;
--info-soft: rgba(142, 184, 216, 0.13);
--ink-soft: #d1ccbf;
--paper: #f7f3e8;
--paper-edge: #dcd6c8;
```

### Status-Specific Accents

Status pills must pair colour with text and an icon. Colour alone is
never the signal.

| Status             | Foreground | Background              | Border                  |
| ------------------ | ---------- | ----------------------- | ----------------------- |
| `approved`         | `#9DDEA2`  | `rgba(130,207,138,.13)` | `rgba(130,207,138,.30)` |
| `rejected`         | `#F09A92`  | `rgba(231,129,120,.13)` | `rgba(231,129,120,.30)` |
| `manual_review`    | `#EED48F`  | `rgba(231,196,111,.13)` | `rgba(231,196,111,.30)` |
| `processing`       | `#A8CBE4`  | `rgba(142,184,216,.13)` | `rgba(142,184,216,.30)` |
| `awaiting_credits` | `#A8CBE4`  | `rgba(142,184,216,.13)` | `rgba(142,184,216,.30)` |
| `pending_upload`   | `#C9D0C1`  | `rgba(174,188,139,.10)` | `rgba(174,188,139,.24)` |

Do not introduce new colour tokens without updating this file. Any new
accent used across more than one component must be documented here and
recorded in `DECISIONS.md`.

## Typography

HaloKYC uses a restrained sans-serif type system. The reference style
gets its personality from scale, spacing, and weight rather than from a
decorative display face.

- **Display / marketing / page titles:** `Manrope` — modern, geometric,
  warm, and highly legible at large sizes.
- **Body / UI / dashboard:** `Inter` — neutral and efficient for dense
  product interfaces.
- **Mono:** `JetBrains Mono` — reserved for evidence data, identifiers,
  hashes, timestamps, API snippets, and tabular numerals.

### Font Loading

Use `next/font/google` unless the project later decides to self-host
fonts for stricter privacy or performance control.

```ts
import { Inter, JetBrains_Mono, Manrope } from "next/font/google";

export const display = Manrope({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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
<html
  className="{`${sans.variable}"
  ${display.variable}
  ${mono.variable}`}
></html>
```

`globals.css` exposes `--font-display`, `--font-sans`, and `--font-mono`
through `@theme inline`.

### Usage Rules

- `Manrope` is used for landing-page headlines, section titles,
  dashboard page titles, modal titles, large metrics, and prominent card
  headings.
- Display headlines rely on size, line height, and controlled weight.
  Do not use italics as a brand device.
- `Inter` is the default for navigation, buttons, forms, table content,
  helper text, long body copy, and dense dashboard surfaces.
- `JetBrains Mono` is reserved for IDs, hashes, JSON, API snippets,
  timestamps, document numbers, risk scores, and numeric developer
  surfaces.
- Never use more than these three families without updating this file.

### Type Scale

#### Display — Manrope

| Token             | Size                         | Weight | Line height | Usage                          |
| ----------------- | ---------------------------- | ------ | ----------- | ------------------------------ |
| `text-display-xl` | `clamp(3.5rem, 7vw, 6.5rem)` | 600    | 0.98        | Landing hero                   |
| `text-display-lg` | `clamp(2.5rem, 5vw, 4.5rem)` | 600    | 1.02        | Landing sections and final CTA |
| `text-display-md` | `clamp(2rem, 3vw, 3rem)`     | 600    | 1.08        | Dashboard page titles          |
| `text-display-sm` | `1.5rem`                     | 600    | 1.2         | Card and modal titles          |

Display sizes use `tracking-[-0.035em]` at XL/LG and
`tracking-[-0.02em]` at MD/SM.

#### UI — Inter

| Role       | Class                 | Weight | Line height | Usage                           |
| ---------- | --------------------- | ------ | ----------- | ------------------------------- |
| Body large | `text-base leading-7` | 400    | 1.7         | Landing body and long-form copy |
| Body       | `text-sm leading-6`   | 400    | 1.6         | Dashboard, forms, and cards     |
| Label      | `text-sm`             | 500    | 1.4         | Form labels and controls        |
| Caption    | `text-xs leading-5`   | 400    | 1.5         | Metadata and helper text        |

#### Mono — JetBrains Mono

| Role    | Class     | Weight | Line height | Usage                          |
| ------- | --------- | ------ | ----------- | ------------------------------ |
| Mono-md | `text-sm` | 500    | 1.5         | Stats, routes, and metadata    |
| Mono-sm | `text-xs` | 500    | 1.4         | Inline evidence and audit rows |

No font size below `text-xs`. Every numeric value — risk score,
timestamp, verification count, and amount — uses `tabular-nums`.

### Copy Rhythm

- Landing headlines are short, calm, and confident.
- Prefer plain verbs: verify, review, approve, reject, detect, protect,
  resolve, and disclose.
- Use sentence case everywhere except compact eyebrow labels.
- Eyebrow labels may use uppercase with `tracking-[0.16em]` at `text-xs`.
- Dashboard text is literal and operational.
- Avoid hype words such as “revolutionary”, “magical”, “unlimited”, or
  “bank-grade” unless legally and technically true.
- Error messages explain what happened, why it happened, and what the
  operator should do next.

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

The system uses soft, confident geometry inspired by the reference.
Corners should feel premium and human without becoming bubbly.

```css
--radius-sm: 0.75rem; /* 12px */
--radius-md: 1rem; /* 16px */
--radius-lg: 1.25rem; /* 20px */
--radius-xl: 1.75rem; /* 28px */
--radius-full: 999px;
```

Usage:

- Buttons and compact controls: `rounded-full` or `rounded-xl`
- Inputs and selects: `rounded-xl`
- Dashboard cards: `rounded-2xl`
- Marketing cards and image frames: `rounded-[1.25rem]`
- Feature panels and final CTA surfaces: up to `rounded-[1.75rem]`
- Avatars, status dots, and icon chips: `rounded-full`

Avoid exaggerated blob radii, asymmetrical blobs, and unrelated organic
shapes on operational product surfaces.

## Borders and Shadows

HaloKYC uses tonal surfaces and translucent borders more than shadows.
Cards should feel layered through colour before elevation.

- Sticky headers: `border-b border-white/10 bg-background/85 backdrop-blur-xl`
- Product cards: 1px translucent cream border, no default shadow
- Marketing cards: tonal border with an optional soft ambient shadow
- Image cards: no border when the image reaches the edge
- Hover lift: allowed only on landing cards, upload zones, and primary
  selection cards
- Dashboard cards: no dramatic elevation or spring movement

Recommended shadows:

```css
--shadow-card:
  0 1px 2px rgba(8, 20, 13, 0.12), 0 16px 48px rgba(8, 20, 13, 0.16);

--shadow-hover:
  0 2px 4px rgba(8, 20, 13, 0.16), 0 24px 64px rgba(8, 20, 13, 0.22);
```

Do not use neon glow shadows. Lime glows are limited to tiny focus or
status accents and must never surround large cards.

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

- `halokyc-hr-dark.svg` - horizontal wordmark for light surfaces.
- `halokyc-hr-light.svg` - horizontal wordmark for dark landing and
  auth surfaces.
- `halokyc-icon.svg` - square app icon for browser metadata and
  light-background icon use.
- `halokyc-color-icon.svg` - square lime-accented icon for compact dark app
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
- `hero-section` - large sans-serif headline, floating VerificationReceipt, halo
- `trusted-pipeline` - 6 check cells animating on scroll
- `problem-section` - forest-surface editorial block
- `feature-grid` - 8 verification primitives on deep forest canvas
- `api-section` - code + signed-webhook payload
- `workflow-section` - 6-step vertical timeline
- `use-cases-section` - 6 product-shape cards
- `client-control-section` - mock client policy/review controls with audit labels
- `pricing-section` - 3 plans, no hardcoded prices
- `security-section` - 8-point checklist
- `final-cta` - soft lime halo with two CTAs
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
- Text contrast must remain readable on deep forest and warm cream and tinted surfaces

## Landing Page Tokens (additive, scoped)

`src/app/page.tsx` uses the most expressive version of the brand:
forest-green sections, warm cream text, lime actions, natural
photography, spacious layouts, and rounded image-led cards. Landing
tokens are separately namespaced so they never unintentionally change
dashboard primitives.

```css
--landing-bg: #173426;
--landing-bg-deep: #10271c;
--landing-surface: #234333;
--landing-surface-raised: #294b39;
--landing-surface-soft: #2d503d;
--landing-ink: #f7f3e8;
--landing-ink-soft: #d1ccbf;
--landing-muted: #aeb8a6;
--landing-rule: rgba(247, 243, 232, 0.1);
--landing-lime: #c8e64f;
--landing-lime-hover: #d6f15a;
--landing-lime-soft: rgba(200, 230, 79, 0.12);
--landing-olive: #aebc8b;
--landing-cream: #fbf8ef;
```

Landing-page visual motifs:

- Large human photography mosaics
- Rounded editorial image cards
- Section counters such as `01 / Platform`
- Floating evidence receipt or verification card
- Calm statistics with thin rules
- Human stories paired with product proof
- Compact lime action pills
- Testimonial panels with portrait photography
- Dark-on-cream contrast cards used sparingly

A landing section should normally have one visual idea. Prefer one
large composition over a grid of decorative widgets. Product visuals
must remain truthful representations of HaloKYC workflows.

### Landing Chrome (additive, scoped)

The landing page remains predominantly dark green. Contrast sections
may use warm cream, but black, slate, and blue cyber-security canvases
are not part of the visual identity.

```css
--landing-canvas: #173426;
--landing-canvas-deep: #10271c;
--landing-canvas-edge: #234333;
--landing-canvas-soft: #2d503d;
--landing-canvas-ink: #f7f3e8;
--landing-canvas-ink-soft: #d1ccbf;
--landing-canvas-mute: #aeb8a6;
--landing-hair: rgba(247, 243, 232, 0.1);
--landing-action: #c8e64f;
--landing-action-hover: #d6f15a;
--landing-action-edge: #afd33d;
--landing-warning: #e7c46f;
--landing-success: #82cf8a;
```

Use deep forest tokens for hero, feature, API, workflow, pricing, and
final CTA sections. Use warm cream contrast panels for customer stories,
legal explanations, long-form content, or image-led human sections.
The alternation follows content intent, not a fixed dark/light pattern.

## Dashboard Chrome Tokens (additive, scoped)

Authenticated routes use a quieter continuation of the landing system:
a deep forest navigation shell, tonal green surfaces, warm cream text,
subtle borders, and high-contrast semantic status colours. Dense tables
may use a slightly lighter forest surface to improve scanning.

```css
--dashboard-rule: rgba(247, 243, 232, 0.1);
--dashboard-canvas: #173426;
--dashboard-canvas-deep: #10271c;
--dashboard-paper: #234333;
--dashboard-paper-raised: #294b39;
--dashboard-ink: #f7f3e8;
--dashboard-ink-soft: #d1ccbf;
--dashboard-muted: #aeb8a6;
--dashboard-action: #c8e64f;
--dashboard-success: #82cf8a;
--dashboard-warning: #e7c46f;
--dashboard-danger: #e78178;
--dashboard-info: #8eb8d8;
```

Dashboard chrome rules:

- The sidebar uses the deepest forest surface.
- Main content uses `--dashboard-canvas`; cards use
  `--dashboard-paper` or `--dashboard-paper-raised`.
- Primary actions use lime. Do not use lime for ordinary decorative
  borders, large backgrounds, or every selected state.
- Repeated list items rely on borders, spacing, and tonal contrast.
- Table headers may use `rgba(247,243,232,.04)` to separate columns.
- Dense evidence JSON and code surfaces may use `--dashboard-canvas-deep`.
- Human photography belongs primarily to marketing, onboarding, empty
  states, and support content — not routine audit tables.

### Landing Motion (additive)

The `motion/react` library (the renamed `framer-motion`) is the only
allowed motion source for landing-only components. Use the
`Reveal` primitive for scroll-triggered fade-ups and
`GradientOrb` for hero / CTA halos. All keyframe utilities
(`landing-rise`, `landing-float`, `landing-stamp`, `landing-halo`,
`landing-orbit`, `landing-stripe`) respect
`prefers-reduced-motion: reduce` and pause automatically.

### Landing Font (additive)

`Manrope` is loaded through `next/font/google` and exposed as
`--font-display`. Landing hero and section headlines use `font-display`
with medium or semibold weights, tight tracking, and compact line
heights. Dashboard page and card titles also use `font-display`, while
body copy, controls, and data tables stay on Inter.

The personality comes from scale and rhythm rather than from decorative
letterforms. Do not add a serif font, script font, or italic brand style
without a documented design decision.

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

| Role          | Visible groups                                                                                                                             |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Owner / Admin | Workspace (all), Organization (Workspaces, Team, Billing), Account (Settings), Developer (API console, Integration logs, Docs)             |
| Reviewer      | Workspace (Overview, Verifications, Manual review, Assigned reviews, Completed reviews), Account (Settings), Developer (API console, Docs) |
| Developer     | Workspace (Overview, Verifications, Workflows, API keys, Webhooks), Account (Settings), Developer (API console, Integration logs, Docs)    |

Platform audience:

| Role           | Visible Operator entries                                                                   |
| -------------- | ------------------------------------------------------------------------------------------ |
| Platform Owner | All Operator entries + legacy Admin group (Clients, Ledger, Review queue)                  |
| Business Admin | Overview, Organizations, Workspaces, Verifications, Billing & credits, Support, Audit logs |
| Support        | Overview, Organizations, Workspaces, Verifications, Support (read-only)                    |
| Sales          | Overview, Sales (Customers, Plans, Usage Summary, Sales Notes)                             |

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
  the forest-surface canvas, the dotted backdrop, the brand mark, the card
  surface, and the `Secured by HaloKYC` footer.
- `VerifyProgress` (in the same folder) renders a top progress bar bound
  to the verify state machine. Track uses `--muted`, indicator uses
  `--accent` (the same lime used by the landing CTA).
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
