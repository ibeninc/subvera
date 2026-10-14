# Landing Page Build Spec — "Revenue Engineered System" (Next.js)

> Source: `design_inspiration.mp4` (1600×1000 @ 60fps screen recording, 17.85s, full top-to-bottom scroll).
> Measurements were taken from the video at **1600px viewport = 1:1 CSS px**. Fonts, colour tokens and component CSS
> were checked against the archived production stylesheet of the page shown in the video (Webflow build, Dec 2025).
> Every value below is either **[measured]** from frames or **[source]** from the original CSS.

---

## 0. Important before you ship

- The video is the marketing site of a real company (Default). Use this spec for **layout, type, rhythm and motion**,
  but replace the **brand name, logo wordmark, customer logos, people's names/photos and quotes** with your own.
  Treat all copy below as placeholder text.
- Both typefaces are **commercial**. The original site even loaded a *trial* build of Saans. Buy licences, or use the
  free fallbacks in §2.3.

---

## 1. Tech stack

| Concern | Choice |
|---|---|
| Framework | Next.js 15 (App Router, RSC), TypeScript |
| Styling | Tailwind CSS v4 (`@theme` tokens in `globals.css`) + a few plain CSS utilities |
| Fonts | `next/font/local` (self-hosted woff2) |
| Motion | `motion` (Framer Motion v11+): `motion/react` |
| Icons | `lucide-react` (stroke 1.5) for UI icons; brand logos as SVG in `/public/logos` |
| Marquee | Pure CSS keyframes (no lib) |
| Images | `next/image`; avatars 96×96 source → 48×48 rendered |

```
app/
  layout.tsx            fonts, <Nav/>, <Footer/>
  page.tsx              section composition
  globals.css           tokens, dot-grid bg, marquee keyframes
components/
  nav/Nav.tsx
  ui/Button.tsx         variants: purple | black | login | navPill | storyPill
  ui/EmailCapture.tsx   variants: white | grey
  ui/Eyebrow.tsx
  ui/DotsCluster.tsx    animated 6-dot motif
  ui/LogoMarquee.tsx
  ui/Reveal.tsx         scroll reveal wrapper
  ui/MetricTestimonial.tsx
  sections/Hero.tsx
  sections/ProductShot.tsx        (app UI mock)
  sections/ProblemSolution.tsx
  sections/ControlLayer.tsx       (+ 3 use-case cards)
  sections/FeatureRow.tsx         (reused ×3)
  visuals/YellowWorkflow.tsx
  visuals/PinkWebhook.tsx
  visuals/PurpleScheduler.tsx
  visuals/ErrorPile.tsx
  visuals/StackAssemble.tsx
  sections/Testimonials.tsx
  sections/FinalCTA.tsx
  footer/Footer.tsx
public/fonts, public/logos, public/avatars, public/dots-bg.svg
```

---

## 2. Typography (exact)

### 2.1 Families [source]

| Role | Family | Weights used | Foundry |
|---|---|---|---|
| **Display / all headings (h1–h3)** | **NB International Pro** | Medium 500, Bold 700 | Neubau |
| **Body / UI / buttons / nav / inputs** | **Saans** (variable) | variable `wght` 570 (body), 670 (footer titles) | Displaay |

The body copy is **not** a plain 500. The site sets `font-weight:500` **and** `font-variation-settings:"wght" 570`.
That's why paragraphs look slightly heavier than a normal "Medium". Reproduce it exactly.

### 2.2 Loading

```ts
// app/fonts.ts
import localFont from "next/font/local";

export const nbInternational = localFont({
  src: [
    { path: "../public/fonts/NBInternationalPro-Medium.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/NBInternationalPro-Bold.woff2",   weight: "700", style: "normal" },
  ],
  variable: "--font-display",
  display: "swap",
  fallback: ["Arial", "sans-serif"],
});

export const saans = localFont({
  src: [{ path: "../public/fonts/Saans-VF.woff2", weight: "300 900", style: "normal" }],
  variable: "--font-sans",
  display: "swap",
  fallback: ["Arial", "sans-serif"],
});
```

```tsx
// app/layout.tsx
<html lang="en" className={`${nbInternational.variable} ${saans.variable}`}>
```

### 2.3 Free fallbacks (if you don't license)

| Original | Closest free | Tweak to match |
|---|---|---|
| NB International Pro | **Inter Tight** (600 for "Bold", 500 for "Medium") | letter-spacing −0.025em |
| Saans | **Geist** (variable) or **Manrope** | `wght` 540, letter-spacing −0.005em |

Key glyph signatures to check against the video: single-storey **g**, straight-tailed **y**, angled cut on top of
**t**, straight-leg **R**, tight apertures. NB International has all of these, Inter Tight is the nearest free match.

### 2.4 Type scale (desktop ≥ 992px)

All headings: `font-family: var(--font-display); color:#202020; letter-spacing:-0.02em;` [source: computed −0.8px @40px, −0.64px @32px]

| Token | Used for | Size / line-height | Weight | Notes |
|---|---|---|---|---|
| `display-xl` | Hero H1 | **64px / 0.97** | 700 | `.heading-style-xlarge` |
| `display-lg` | Final CTA H2 | **72px / 1.0** | 700 | `.heading-style-large` (4.5rem) |
| `h2` | Section headings | **48px / 1.0** | 500 | `.heading-style-h2` (3rem) |
| `h2-sm` | Testimonials heading | **36px / 1.0** | 500 | `.heading-style-custom` (2.25rem) |
| `h3` | Problem/Solution card titles | **36px / 1.2** | 500 | |
| `h4` | Use-case card titles (RevOps…) | **26px / 1.0** | 500 | `.heading-style-h4.text-weight-medium` |
| `quote-lg` | Testimonial-grid quotes | **20px / 1.4** | Saans 570 | |
| `metric` | "147", "80+ rules", "3X" | **20px / 1.2** | Saans 570 | |
| `body-lg` | Hero & section sub copy | **18px / 1.4** | Saans 570 | [measured: 25px leading] |
| `body` | Default paragraph | **16px / 1.4** | Saans 570 | |
| `ui` | Buttons, nav, inputs, eyebrows | **14px / 1.2** | Saans 570 | |
| `caption` | Metric labels, small logos | **14px / 1.4**, opacity .6 / .8 | Saans 570 | |

Eyebrow ("Control & visibility", "Problem"): 14px, `opacity:.6`. [source `.text-size-small.text-style-xmuted`]

Tablet (≤991px): display-xl 48px, display-lg 56px, h2 40px. Mobile (≤767px): display-xl 40px (lh 0.97), h2 32px (lh 1),
h3 24px (lh 1.2), body-lg 16px. [source: mobile computed values]

---

## 3. Design tokens

### 3.1 Colour [source + measured]

```css
@theme {
  --color-ink:        #202020;  /* text, footer bg, black buttons */
  --color-purple:     #5757F8;  /* primary CTA */
  --color-grey:       #F5F5F5;  /* whitesmoke: section bg, cards, nav pills, login */
  --color-white:      #FFFFFF;
  --color-hairline:   #F7F5FD;  /* input + black-button border, nav shadow */
  --color-line:       rgba(32,32,32,.10); /* testimonial card border */
  --color-navy:       #2C2C6B;  /* floating hero dots */

  /* dots motif */
  --color-dot-dark:   #31296E;
  --color-dot-light:  #5151F1;

  /* feature visuals */
  --color-yellow:     #FEE700;
  --color-pink:       #FE7FF2;
  --color-violet:     #6D6DF1;  /* scheduler panel bg + "RevOps" cursor */
  --color-orange:     #FF7A1A;  /* "Marketing" cursor */
  --color-panel-dark: #23212A;  /* problem/solution visual panels */

  /* use-case icon chips */
  --color-chip-yellow:#FEE700;
  --color-chip-pink:  #FE7FF2;
  --color-chip-green: #16C45E;

  /* in-app UI mock */
  --color-app-purple: #6B6BF5;  /* Publish button */
  --color-app-tag-bg: #F0F0FE;  --color-app-tag-fg: #6B6BF5; /* "Inbound Demo Form" pills */
  --color-app-node-sel:#8E8EF7; /* selected node 1px border */
}
```

Text tiers: primary `#202020`, muted `opacity .8`, xmuted `opacity .6`, placeholder `rgba(32,32,32,.5)`.

### 3.2 Radii

| Token | Value | Used on |
|---|---|---|
| `pill` | `9999px` | all CTA buttons, Login |
| `lg` | `12px` | product screenshot frame |
| `md` | `10px` | email capture field |
| `sm` | `8px` | cards, nav pills, feature visuals, badge |
| `xs` | `6px` | in-app nodes, Publish, social icons |
| `chip` | `4px` | use-case icon squares, avatars |

### 3.3 Layout & spacing

- **Container:** `max-width: 80rem (1280px)`, side padding `2.5rem (40px)` → content spans x=160…1440 at 1600px. [source + measured]
- **Nav container:** `max-width: 100rem`, padding 0 40px (logo sits at x=40). [source]
- **Grid gaps:** 40px (2- and 3-up cards), 20px (testimonial grid), 80px column gap in feature rows (text col ≈480px, visual col 580px).
- **Section padding:** large = 96px top / 64px bottom, medium = 80px, CTA card padding 40px, card padding 20px (use-case cards 24px).
- **Shadows:** essentially none. Separation comes from flat grey vs white. Nav hairline: `box-shadow: 0 17px 0 -16px #F7F5FD`.

### 3.4 Dot-grid background (hero + visuals)

Hero bg = `#F5F5F5` + repeating dot grid. [measured: 44px pitch, ~3.5px dots, colour ≈ `#D6D6D6`]

```css
.bg-dots {
  background-color: var(--color-grey);
  background-image: radial-gradient(circle, #D6D6D6 1.75px, transparent 2px);
  background-size: 44px 44px;
  background-position: 22px 22px;
}
/* coloured visual panels use the same pattern, finer & tinted */
.bg-dots-tint { background-image: radial-gradient(circle, rgba(0,0,0,.10) 1px, transparent 1.5px); background-size: 16px 16px; }
.bg-dots-dark { background-image: radial-gradient(circle, rgba(255,255,255,.08) 1px, transparent 1.5px); background-size: 16px 16px; }
```

---

## 4. Shared components

### 4.1 Buttons [source]

All buttons: Saans 14px/1.2, `wght 570`, `display:inline-flex; align-items:center; gap:10px; transition: .2s`. Trailing
arrow `→` = lucide `ArrowRight` 14px, stroke 2.

| Variant | Bg / text | Padding | Radius | Hover |
|---|---|---|---|---|
| `purple` | `#5757F8` / `#F5F5F5` | 10px 20px (h≈37) | pill | bg `#202020` |
| `black` | `#202020` / `#FFF`, border 1px `#F7F5FD` | 10px 20px (h≈39) | pill | bg `#F5F5F5`, text `#202020`, border `#202020` |
| `login` | `#F5F5F5` / `#202020` | 10px 16px | pill | bg `#202020`, text `#F5F5F5` |
| `navPill` | `#F5F5F5` / `#202020` | 5px 10px; margin 0 5px | 8px | bg `#202020`, text `#FFF` |
| `storyPill` ("Read story →") | `#202020` / `#FFF` | 5px 10px | pill | bg `#F5F5F5`, text `#202020` |

### 4.2 Nav (fixed)

- `position:fixed; inset:0 0 auto; height:59.8px (3.7373rem); background:#FFF; z-index:40;` hairline shadow as above.
- Left: wordmark logo, width **120px** (icon glyph + "Default" set in NB International Bold ~28px).
- Centre (absolutely centred): `navPill`s: **Platform · Use cases ↓ · Pricing · Resources**. "Use cases" has a 12px
  `ArrowDown` icon and opens a dropdown (max-width 40rem, white card, radius 8).
- Right: `login` "Login" + `purple` "Book a demo →", gap 16px.
- Never hides on scroll (stays visible across the whole recording).

### 4.3 EmailCapture

- Wrapper: width **480px**, height **56px**, bg `#FFF` (or `#F5F5F5` grey variant), border 1px `#F7F5FD`, radius 10px, padding 16px 20px.
- Input placeholder "What's your work email?" 14px `rgba(32,32,32,.5)`.
- Submit = `purple` button absolutely positioned `right:10px; top:50%; translateY(-50%)`, padding `10px 40px 10px 20px` with arrow at right.

### 4.4 Eyebrow
`<p class="text-[14px] opacity-60">Control &amp; visibility</p>`, sits 12px above the H2.

### 4.5 DotsCluster (signature motif)

Six 9px circles on a 2-row × 4-col lattice, **22px pitch**, box ≈ 95×64px. Colours: mix of `--color-dot-dark`
and `--color-dot-light` (roughly 4 dark / 2 light). Appears above: control-layer heading (centred), each feature row
eyebrow (left), final CTA (top-right, `inset: 18px 12px auto auto`).

**Animation** (originally a Rive file; rebuild in Motion):
- Every **~1.1s** each dot springs to a new free lattice slot (`type:"spring", stiffness:260, damping:22`).
- Occasionally one dot swaps colour (dark↔light) with a 200ms fade.
- Some variants scatter off-lattice diagonally (see "Stop losing leads": 4 dots on a diagonal), so allow a
  `layouts: Point[][]` prop and cycle through preset layouts instead of pure random.
- Pause when off-screen (`useInView`).

### 4.6 LogoMarquee

- Clip container width = container (1280), `overflow:hidden; position:relative`.
- Fade overlay: `linear-gradient(90deg, BG 0%, transparent 10%, transparent 90%, BG 100%)` where BG = section bg.
- Track: logos at **height ~32px** (wordmarks vary 28–36px), each item margin 0 24px → ~150px pitch.
- Duplicate list ×2; `@keyframes marquee { to { transform: translateX(-50%) } }`, `animation: marquee 40s linear infinite`.
- Hover item: `opacity:.8`.
- Logo order (hero): Paragon, Cortex, Browserbase, Airbyte, PostHog, Plain, Rootly, ABTasty, lemlist, Bridge, QUO, Unify, Stack…
  (replace with your customers; keep the full-colour originals, no greyscale filter).

### 4.7 Reveal (scroll-in)

The recording shows headings and cards ghosting in with a slight blur.
```ts
initial={{ opacity:0, y:16, filter:"blur(8px)" }}
whileInView={{ opacity:1, y:0, filter:"blur(0px)" }}
viewport={{ once:true, margin:"-10% 0px" }}
transition={{ duration:.6, ease:[0.22,1,0.36,1] }}
```
Stagger children 0.06s. Respect `prefers-reduced-motion` (render final state).

### 4.8 MetricTestimonial card

White (or grey on white sections) card, width **480px**, radius 8, padding 20px, gap 40px.
- Top row: quote (16px/1.4, max 3 lines, ellipsis `line-clamp-3`) left; `storyPill` "Read story →" right.
- Author row: 48×48 avatar (radius 4), name 14px + title 14px muted, stacked, gap 4.
- Metrics row: 3 columns; value 20px; label 14px `opacity:.8`, max-width ~120px.

---

## 5. Page sections (top → bottom)

Coordinates are at 1600px viewport.

### S1 · Hero  (`.bg-dots`, padding-top 128px, centred)

1. **Badge**: white pill radius 8, padding 4px 9px 4px 8px, 14px text "Introducing Default Handoff →". y≈128.
2. **H1** `display-xl`, centred, 2 lines (force break): "Run revenue like an / engineered system". Text width ≈535px. 24px below badge.
3. **Sub** `body-lg`, centred, max-width **640px**: "Default is a revenue-grade workflow engine that lets you see your revenue machine, understand how it all connects, and scale without breaking anything." 48px below H1.
4. **EmailCapture** (white), centred, 48px below.
5. **LogoMarquee** (BG = `#F5F5F5`), 64px below form.
6. **Floating dots**: 3 navy (`#2C2C6B`) 8px dots absolutely placed around the H1 (≈ x 440/670/1285, y 265–350), each drifting slowly
   (`y: [0,-12,0]`, `x:[0,8,0]`, 6–9s, ease-in-out, infinite, different delays). They also parallax-up slightly on scroll (`useScroll` → `y: -40px`).
7. **ProductShot** (S2) starts 48px below the marquee and **straddles** the grey→white edge: the grey bg ends ≈215px below
   the screenshot's top edge. Implement as `background: linear-gradient(#F5F5F5 0 calc(100% - Hpx), #FFF 0)` or a
   white section with the shot pulled up with negative margin.

### S2 · Product screenshot (app UI mock)

Frame: width 1280, white, radius 12, border 1px `#F8F8F8`, total visible height ≈ 620px (crop with `overflow:hidden`; bottom fades out
with `mask-image: linear-gradient(#000 80%, transparent)`).

Build as real JSX (sharper than a PNG, and it animates on hover). If time is short, export a 2× PNG instead.
- **Left rail** 60px: icons (PanelLeft, logo avatar 28px black circle, Bell, BookOpen, Table, Video, Layers, **Workflow (active: bg #F0F0F0 radius 6)**, Route, Calendar, BookSearch, GraduationCap, FileText), 22px apart, stroke 1.5, `#555`.
- **Header** (h 56): breadcrumb `Workflow icon · Workflows › Inbound Workflow` (15px; second item muted); right: "Share" text button, **Publish** (`#6B6BF5`, white text, radius 6, 6px 12px), kebab.
- **Tabs**: "Workflow" (active, 2px `#202020` underline) · "Logs" (muted). 1px `#EEE` divider.
- **Canvas**: bg `#FAFAFA` + 16px dot grid. Nodes (white, radius 8, 1px `#EEE`, 320px wide):
  1. *Form Submission* (green `#22C55E` icon tile 32px radius 6) – row "Form: [Inbound Demo Form]" (tag bg `#F0F0FE`, text `#6B6BF5`, radius 4, 13px).
  2. connector: 1px `#CCC` line with 8px hollow circle + arrowhead.
  3. *Enrich with waterfall* (black icon tile, **selected: 1px `#8E8EF7` border**) – "Enrichment Priority:" then 3 grey rows (`#F3F3F3`, radius 6): `1 Apollo.io`, `2 Clearbit`, `3 Harmonic` with tiny brand marks.
  4. *Display Scheduler* (grey calendar tile) – "Meeting Type: [30 Minute Demo]".
- **Objects panel** (right, 310px, white, radius 8, border): title "Objects" + close X; tabs Objects | Recipes (active underline);
  group "Actions": Redirect to URL, Webhook, Wait, Send Data (each row: 36px purple `#6B6BF5` icon tile radius 6, label 15px, 6-dot drag handle); group "CRMs": Create Record (Salesforce cloud icon), Update Salesforce…
- **Far-right tool column**: 44px square white buttons radius 8 (Info, Workflow (active: purple border), Sparkles, Clock).
- Bottom-left canvas: tiny floating badges "Marketing" / "RevOps" cursors (same as S6) faintly visible.

### S3 · Problem / Solution  (white, padding 96/64)

- **H2** centred, 48px: "Your revenue stack is a / collection of parts, not a system". 64px below → cards.
- 2 cards, each 620×550, grey `#F5F5F5`, radius 8, padding 20px, gap 40px.
  - Eyebrow ("Problem" / "Solution") 14px muted → H3 36px ("Stop firefighting" / "Start architecting") → body 16px, max 2 lines:
    - "You manage multiple schedulers, routing tools, and enrichment vendors. Every time you make a change, something breaks."
    - "Default gives you best-in-class scheduling, routing, enrichment, workflows, and forms – in one platform designed to work together."
  - Visual panel pinned to bottom: 580×330, `#23212A` + `.bg-dots-dark`, radius 8.
- **ErrorPile** (problem visual): ~11 frosted chips (`bg: rgba(255,255,255,.85)`, `backdrop-filter: blur(6px)`, radius 8,
  padding 8px 12px, 15px text, shadow `0 2px 6px rgba(0,0,0,.25)`), each with a 20px icon: red triangle `AlertTriangle` (`#E5322D`) or
  orange circle "i" (`#E8890C`). Labels: Ineffective CTAs, Empty Queue, Unexpected Error, Something…, No Data, Low Quality Leads,
  Limit Reached, Low Capacity, Lead Not Qualified. Piled at the bottom with rotations −12°…+8°, overlapping, slightly clipped.
  **Animation:** on enter, chips fall from `y:-360` with stagger 0.07s, `spring({stiffness:180, damping:14})`, landing at preset (x, y, rotate).
- **StackAssemble** (solution visual): light-grey tiles (`#E4E4E6`, radius 8, 1px white top highlight) in a 4-col mosaic:
  Marketo (tall), Attio, Hubspot, Clay (tall), Salesforce (wide), Outreach, Apollo. Each tile has a 28px white icon square + label 14px.
  A large white bar (540×88, radius 10) with the centred logo wordmark overlaps the bottom row.
  **Animation:** tiles slide in from slight offsets (±24px) and settle into the grid; the white bar rises from `y:40` last.

### S4 · Control layer  (white)

- **DotsCluster** centred, 48px above H2.
- **H2** centred 48px: "Default is the control layer / for revenue operations".
- Sub `body-lg` centred, max 400px: "A single control layer to run every revenue workflow across RevOps, Marketing, and Sales."
- Buttons centred, gap 16: `purple` "Book a demo →", `black` "See an interactive demo". 56px below → cards.
- **3 use-case cards**: 400×270, grey, radius 8, padding 24px, gap 40. Title `h4` 26px. List gap 10px, 16px text, each item
  prefixed by a 24px chip (radius 4, coloured bg, 14px dark line icon inside, stroke 1.5):
  - **RevOps** (yellow): Build AI workflows · Route leads & accounts · Score leads & accounts · Enrich visitors & accounts · Automate intent signals
  - **Marketing** (pink): Schedule inbound demos · Enrich website visitors · Enrich product signups · Fix marketing attribution · Automate event follow-up
  - **Sales** (green): Schedule outbound demos · SDR-to-AE handoff · Assign account ownership · Fix round-robin fairness · No-show automation
- Hover: card bg → `#202020`, text → white (200ms), matching the testimonial cards.

### S5–S7 · Feature rows (`FeatureRow` ×3)

Shared: 2-col grid, `align-items:center`, column gap 80px, section padding 96px. Visual = **580×495**, radius 8, solid colour + `.bg-dots-tint`.
Text column: DotsCluster → (24px) Eyebrow → (12px) H2 48px (2 lines, max-width 480) → (24px) body-lg max-width 400 → (24px) purple button →
(48px) testimonial card.

| # | Section bg | Order | Eyebrow | H2 | Body | Button | Visual |
|---|---|---|---|---|---|---|---|
| S5 | `#F5F5F5` | text L / visual R | Control & visibility | Run your stack the way you wish it worked | Default gives you one place to see how everything works, and the power to change it without breaking anything. | Default for RevOps → | **Yellow** |
| S6 | `#FFF` | visual L / text R | Connected foundation | Every tool speaks the same language | Default unifies every field and object around one shared data model, so your entire stack finally agrees on reality. | Platform overview → | **Pink** |
| S7 | `#F5F5F5` | text L / visual R | Revenue-grade execution | Stop losing leads you already paid for | Default automatically catches every qualified lead and ensures nothing gets dropped. | Default for Marketing → | **Violet** |

In S5 and S6 the H2 sits at the top of the text column (no DotsCluster above it in S5). S6 and S7 show the cluster above the eyebrow.

Testimonial cards:
- **S5** (white MetricTestimonial): quote "I don't just see Default as a Chili Piper replacement anymore. It's the control layer we're going to use to run GTM fro…" · Matt McGonegle, Director of GTM Operations · metrics **147** tools consolidated under a single GTM control layer / **80+ rules** routing rules defined once and reused across the GTM / **3** systems replaced with one workflow engine.
- **S6** (grey, full text-column width 560, no metrics): logo "People Data Labs" (12px bold) / "after using Default" muted / 32px gap / quote 16px: "Default replaced a clunky LeanData + Marketo + Salesforce setup in a workflow that we set up in just few hours." · storyPill top-right.
- **S7** (white MetricTestimonial): "Someone literally posted on Twitter wondering if the self-serve experience was hand-built. It wasn't—it was Default…" · Nick Lafferty, Growth Marketing · **3X** higher inbound conversions / **140%** Increase in pipeline / **7 Days** from demo to go-live.

**Visuals**
- **YellowWorkflow** (`#FEE700`): two white nodes 330px wide, centred upper half: "New Form Submission" (green icon) with "Form: [Demo Form]" row, connector, "Display Scheduler" (grey calendar icon). Two cursors with name flags:
  orange arrow + "Marketing" flag (orange bg, white 12px, radius 4) near node 1 drag handle; violet arrow + "RevOps" flag near node 2.
  **Loop (6s):** cursors wander ±30px on smooth paths (`animate` keyframes), node 2 is "dragged" by the RevOps cursor a few px then snaps back.
- **PinkWebhook** (`#FE7FF2`): node "Webhook – Object Created" (violet icon) / "Record Type: [Lead]". **On enter:** it drops in at 2° tilt, 70% opacity, frosted, then straightens and becomes opaque (0.6s). Then node 2 "Marketing Sourced?" (branch icon) / "Conditions: [1 condition]" slides up from +40px with −3° tilt and settles under it, and the connector draws (`pathLength 0→1`).
- **PurpleScheduler** (`#6D6DF1`): a white booking widget (400×370, radius 8) rises from `y:120, scale:.92` into the centre. Left pane: logo, "Product Demo", "A longer chat to go through the product.", 30 mins / Durban, South Africa ▾ / Zoom link; month grid "June 2025" with dots under available days, **24 selected** (navy `#2C2C6B` square, white text). Right pane: "Select a time" + 12hr/24hr toggle; Morning / Afternoon / Evening groups with time-slot rows (9:30 am … 7:30 pm, 1px `#EEE` boxes). A black cursor glides onto the slot list. All text in the widget is 8–11px.

### S8 · Testimonials  (white, padding 160px top / 96 bottom)

- Header row: `justify-between; align-items:end`. Left: H2 `h2-sm` 36px, max-width 520, 3 lines: "The world's best revenue leaders know exactly what's happening in their funnel". Right: EmailCapture **grey variant**, CTA "See how Default works →".
- 64px gap → **grid 3×2**, gap 20px, each card ≈413×305, white, border 1px `rgba(32,32,32,.10)`, radius 8, padding 20px, `justify-between`, gap 40px.
  - Logo (height 20–28px, mono or brand colour), quote `quote-lg` 20px/1.4, author row (48px avatar radius 4, name 14px, title 14px).
  - Hover: border `rgba(32,32,32,.1)` → bg `#202020`, text white, 200ms.
- Cards (logo · quote · name · role):
  1. Cortex · "I don't just see Default as a Chili Piper replacement anymore. It's the control layer we're using to run GTM from the same brain." · Matt McGonegle · Director of GTM Operations at Cortex
  2. People Data Labs · It's night and day compared to before. Thanks to Default, our revenue system just works, and the team trusts it. · Korey Beaver · Marketing Operations Manager at PDL
  3. Profound · The jump in open pipeline was so large that our team thought the number was fake. But it was real and it started right after we launched Default. · Nick Lafferty · Growth Marketing at Profound
  4. FERMÀT · "Because we moved to Default, we were able to bring more structure to how we think about go-to-market. We couldn't have done that with Chili Piper." · Sarah Madden · Head of Revenue Operations & Strategy
  5. Equals · With Default, you can move faster because you don't have to worry about everything breaking every time you make a change. · Abbey Minondo · Chief of Staff @ Equals
  6. Rootly · My favorite part about Default is having everything in one place. It makes building better routing easier and is 10x more intuitive than Chili Piper. · Liza Dukhova · RevOps Manager at Rootly

### S9 · Final CTA  (white)

- Card: container width, grey `#F5F5F5`, radius 8, padding 40px, height ≈330. DotsCluster top-right (`inset: 18px 12px auto auto`, single row of 4 + 2 below).
- H2 `display-lg` 72px bold, 2 lines: "Take back control of / your revenue machine".
- Bottom row (`justify-between; align-items:end`, 56px below H2): sub 20px/1.4, max 500: "See your entire go-to-market machine, understand how it all connects, and scale without breaking things." · buttons `purple` "Book a demo →" + `black` "Interactive demo →", gap 16.
- Then **LogoMarquee** (BG white), 40px below, padding-bottom 64px.

### S10 · Footer  (`#202020`, padding 40px top)

- Columns (`display:flex; gap:50px`), title Saans 16px `wght 670` `#F5F5F5`, 20px gap to links; links 16px, 4px gap (line 26px), `#F5F5F5`, hover `opacity:.5`.
  - **Use Cases**: RevOps, Marketing, Sales
  - **Features**: Lead Routing Software, Sales Scheduling Software, Sales Workflows Software, Waterfall Enrichment Software, Lead Qualification Software, Lead Distribution Software
  - **Solutions**: Inbound Marketing Software, Revenue Operations Software, Website Visitor Identification Software, CRM Data Hygiene Software, Product Signup Routing Software, Trade Show Leads Followup Software
  - **Resources**: Case Studies, Reports, Blogs, Templates, Partners, Become a Partner, Careers
  - **Compare**: Chili Piper, LeanData, HubSpot, Calendly, RevenueHero
  - **Social**: X and LinkedIn icon buttons, 40×40, border 1px `rgba(255,255,255,.15)`, radius 6, icon 20px white.
- 60px gap → **giant wordmark**: white SVG logo, `max-width:85%` of container (≈1090px wide, ≈280px tall), bottom-aligned and
  bleeding off the page bottom (only the top ~70% visible). Small copyright/legal row optional on the right.

---

## 6. Motion summary

| Element | Trigger | Spec |
|---|---|---|
| Section headings, cards | in view (once) | Reveal: opacity/y16/blur8 → 0, 0.6s `[0.22,1,0.36,1]`, stagger .06 |
| Hero floating dots | always | 6–9s sine drift, ±8–12px; scroll parallax −40px |
| DotsCluster | in view, loop | spring re-layout every 1.1s |
| Logo marquee | always | 40s linear infinite, pause on hover optional |
| ErrorPile | in view | chips fall with spring + rotation, stagger .07 |
| StackAssemble | in view | tiles settle from offsets, bar rises last |
| YellowWorkflow | loop 6s | two named cursors drift; node nudge |
| PinkWebhook | in view | node 1 tilt→flat, node 2 slides in, connector draws |
| PurpleScheduler | in view | widget rises + scales in; cursor glides to slots |
| Buttons / nav pills | hover | colour swap 200ms (see §4.1) |
| Cards (use-case, testimonial) | hover | invert to `#202020` / white 200ms |

All motion off under `prefers-reduced-motion: reduce`.

---

## 7. Responsive

| Breakpoint | Changes |
|---|---|
| ≥1280 | as specified |
| 992–1279 | container fluid with 40px padding; feature visuals scale with `aspect-ratio: 580/495` |
| ≤991 | nav centre links collapse into a hamburger (full-screen white sheet, links 24px/1.4 as in source); 2-col rows stack (visual below text); use-case cards 1 col; testimonial grid 2 cols; footer columns wrap |
| ≤767 | padding-global 20px; hero padding-top 112px; email form full width, button below the input; testimonial grid 1 col; CTA buttons stack; product shot scrolls horizontally inside its frame or swaps to a cropped image |

---

## 8. Assets checklist

- [ ] `NBInternationalPro-Medium.woff2`, `NBInternationalPro-Bold.woff2` (licensed)
- [ ] `Saans-VF.woff2` (licensed variable)
- [ ] Your wordmark logo SVG (nav 120px, CTA bar, footer giant)
- [ ] Customer logo SVGs (~14, full colour)
- [ ] Avatars 96×96 (×7)
- [ ] Integration icons: Marketo, Attio, HubSpot, Clay, Salesforce, Outreach, Apollo, Clearbit, Harmonic, Zoom
- [ ] lucide icons for app mock + use-case chips

## 9. QA against the video

1. Screenshot the build at 1600×1000 and compare with frames at t = 0, 2, 3, 6, 8, 10, 12, 13, 15, 17s.
2. H1 baseline gap = 62px (64px × 0.97); hero sub leading 25px; content edges at x=160 / 1440.
3. Purple CTA = `#5757F8` exactly; grey surfaces `#F5F5F5`; text `#202020`.
4. Body text weight looks "570", not 500 or 600. Check `font-variation-settings`.
5. Section order and bg alternation: grey-dots hero → white → white → **grey** (S5) → white (S6) → **grey** (S7) → white → white CTA → **#202020** footer.
