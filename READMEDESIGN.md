# Handoff: Nest — Login Page & Club Discovery

## Overview
Nest is a university student platform for discovering clubs and streamlining the application process. This handoff covers two surfaces:

1. **Login Page** — Split-panel authentication screen (student or club login)
2. **Club Discovery Page** — Search, filter, and browse clubs

The approved visual direction is the **Warm Academic** theme with the **Radial Arcs** left-panel texture.

---

## About the Design Files
The files in this bundle (`nest-login-textures.html`, `nest-discovery-themes.html`) are **HTML design references** — high-fidelity prototypes showing intended look, layout, and interactions. They are **not** production code to ship directly.

Your task is to **recreate these designs in the target codebase's existing environment** (e.g. React + Tailwind, Next.js, etc.) using its established patterns, components, and libraries.

---

## Fidelity
**High-fidelity.** These are pixel-precise mockups with final colors, typography, spacing, and interactions. Recreate them as closely as possible using the codebase's tooling.

---

## Design Tokens

### Colors
| Token | Value | Usage |
|---|---|---|
| `bg-primary` | `#faf7f2` | Page / form background |
| `bg-left` | `#f2ebe0` | Left panel background |
| `accent` | `#b5451b` | CTA button, links, active states |
| `accent-shadow` | `rgba(181,69,27,0.28)` | Button drop shadow |
| `text-heading` | `#2a1f14` | Headings, primary text |
| `text-muted` | `#a09180` | Labels, secondary text |
| `text-faint` | `#b8a898` | Placeholder, tertiary |
| `border` | `#e0d8cc` | Input borders, dividers |
| `border-light` | `#e8e0d4` | Card borders, panel dividers |
| `arc-stroke` | `rgba(181,69,27,0.18)` | Radial arc lines |
| `arc-stroke-dark` | `rgba(122,74,42,0.18)` | Secondary arc lines |
| `toggle-bg` | `#f0ebe3` | Role toggle track |

### Typography
| Role | Font | Size | Weight | Notes |
|---|---|---|---|---|
| Logotype | Instrument Serif | 56px | Regular | Italic |
| Page heading | Instrument Serif | 26px | Regular | — |
| Body | DM Sans | 13–14px | 400/500/600 | — |
| Labels / caps | Space Grotesk | 10–11px | 400/600 | `letter-spacing: 0.06em`, uppercase |
| Tagline | DM Sans | 14px | 400 | `line-height: 1.6` |

### Spacing
- Panel padding: `48px 40px`
- Input vertical padding: `11px 14px`
- Input border-radius: `10px`
- Button border-radius: `10px`
- Role toggle border-radius: `10px` outer, `8px` inner
- Field gap: `14px`
- Section gap below heading: `28px`

### Shadows
- Button: `0 4px 16px rgba(181,69,27,0.28)`
- Input (subtle): `0 1px 3px rgba(0,0,0,0.04)`

---

## Screens / Views

### 1. Login Page (`nest-login-textures.html` → "Radial Arcs" option)

**Layout:** Full-viewport horizontal split. Left panel is `flex: 1`, right form panel is fixed `width: 380px`.

#### Left Panel
- Background: `#f2ebe0`
- Contains: SVG radial arcs texture + centered logotype + tagline + footer rule

**Radial Arcs SVG** (absolutely positioned, `inset: 0`, `width/height: 100%`, `opacity: 0.18`):
- `viewBox="0 0 620 600"`, `preserveAspectRatio="xMidYMid slice"`
- 5 concentric `<circle>` elements centered at `cx=310, cy=600` (bottom-center):
  - `r=420`, stroke `#b5451b`, strokeWidth `1.5`
  - `r=340`, stroke `#b5451b`, strokeWidth `1`
  - `r=260`, stroke `#7a4a2a`, strokeWidth `0.8`
  - `r=180`, stroke `#7a4a2a`, strokeWidth `0.8`
  - `r=100`, stroke `#b5451b`, strokeWidth `1`
- Vertical hairline: `x1=310 y1=0 x2=310 y2=600`, stroke `#b5451b`, strokeWidth `0.6`, opacity `0.5`
- Horizontal hairline: `x1=-100 y1=350 x2=720 y2=350`, stroke `#7a4a2a`, strokeWidth `0.4`, opacity `0.5`

**Radial vignette overlay** (on top of SVG, absolutely positioned):
- `background: radial-gradient(ellipse 55% 55% at 50% 48%, #f2ebe0 30%, rgba(242,235,224,0.3) 80%, transparent 100%)`

**Centered content** (relative z-index, centered):
- Logotype: `"nest"` in Instrument Serif Italic, 56px, `#2a1f14`, `letter-spacing: -1px`
- Tagline: `"All your campus opportunities, in one place"` in DM Sans 14px, `#a09180`, centered, max-width 260px, line-height 1.6

**Footer rule** (absolute, `bottom: 48px`, `left: 48px`, `right: 48px`):
- Horizontal flex with two `1px` lines in `rgba(181,69,27,0.2)` flanking centered text
- Text: `"QUEEN'S UNIVERSITY"` in Space Grotesk 10px, `#b8a090`, `letter-spacing: 0.1em`

#### Right Panel (Form)
- Background: `#faf7f2`
- Border-left: `1px solid #e8e0d4`
- Width: `380px`, padding: `48px 40px`
- Vertically centered (`display: flex; flex-direction: column; justify-content: center`)

**Content top-to-bottom:**

1. **Heading** — "Welcome back" — Instrument Serif 26px, `#2a1f14`, `margin-bottom: 5px`
2. **Subheading** — "Sign in to continue to nest" — DM Sans 13px, `#a09180`, `margin-bottom: 28px`
3. **Role toggle** — "I AM A" label (Space Grotesk 10px, caps, `#a09180`, `letter-spacing: 0.06em`) above a segmented control:
   - Track: `background: #f0ebe3`, `border: 1px solid #e0d8cc`, `border-radius: 10px`, `padding: 3px`
   - Each option: `flex: 1`, `padding: 8px`, `border-radius: 8px`, font DM Sans 13px
   - Active: `background: #fff`, `color: #2a1f14`, `font-weight: 600`, `box-shadow: 0 1px 4px rgba(0,0,0,0.08)`
   - Inactive: `background: transparent`, `color: #a09180`
   - Options: "Student", "Club"
4. **Email field** — label "EMAIL" (Space Grotesk 10px caps), input with placeholder "Enter your email"
5. **Password field** — label "PASSWORD", input type password
   - Input style: `width: 100%`, `padding: 11px 14px`, `border-radius: 10px`, `border: 1px solid #e0d8cc`, `background: #fff`, `font-size: 13px`, DM Sans
6. **Remember / Forgot row** — flex space-between:
   - Checkbox + "Remember me" (DM Sans 12px, `#a09180`)
   - "Forgot password?" (DM Sans 12px, `#b5451b`, `font-weight: 500`, cursor pointer)
   - `margin-bottom: 22px`
7. **Sign in button** — full width, `padding: 12px`, `border-radius: 10px`, `background: #b5451b`, `color: #fff`, DM Sans 14px 600, `box-shadow: 0 4px 16px rgba(181,69,27,0.28)`
8. **Register link** — centered, DM Sans 12px, `#b8a898` with `"Register"` in `#b5451b`, `font-weight: 500`

---

### 2. Club Discovery Page (`nest-discovery-themes.html` → "Warm Academic" option)

**Layout:** Horizontal flex. Left sidebar `56px` wide + main content area.

#### Left Sidebar
- Background: `#f3ede3`
- Border-right: `1px solid #e8e0d4`
- Width: `56px`, `padding-top: 18px`
- Nav icons: `36×36px` rounded `8px` buttons, vertically stacked with `6px` gap
  - Active: `background: #ede8df`, `color: #b5451b`
  - Inactive: `color: #c4b89e`

#### Top Bar
- Padding: `20px 26px 0`
- Page title: "Discover your community" — Instrument Serif Italic 22px, `#2a1f14`, `margin-bottom: 14px`
- Search + Sort + Filter row:
  - Search input: `flex: 1`, `background: #fff`, `border: 1px solid #e8e0d4`, `border-radius: 12px`, `padding: 10px 14px`, `box-shadow: 0 1px 4px rgba(0,0,0,0.04)`
  - Sort / Filter buttons: same border/radius/shadow style, `color: #a0917e`, DM Sans 12px

#### Category Filter Pills
- Padding: `14px 26px 0`
- Pills: DM Sans 11px, `border-radius: 20px`, `padding: 5px 13px`
  - Active: `background: #b5451b`, `color: #fff`, no border
  - Inactive: `background: #fff`, `color: #a0917e`, `border: 1px solid #e8e0d4`
- Categories: All, Academic, Arts, Business, Culture, Community, Sports, Health, Technology, Social

#### Club Cards Grid
- `display: grid`, `grid-template-columns: repeat(4, 1fr)`, `gap: 14px`
- Padding: `16px 26px`

**Card anatomy:**
- `background: #fff`, `border-radius: 16px`, `border: 1px solid #ede8df`
- `box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)`
- Hover: `box-shadow: 0 4px 24px rgba(0,0,0,0.1)`, `transform: translateY(-2px)`
- **Image area**: `height: 110px`, club color background, club abbreviation in Instrument Serif Italic 32px `rgba(255,255,255,0.18)`
  - "Accepting" badge (when open): `background: #b5451b`, `color: #fff`, 9px, `padding: 3px 8px`, `border-radius: 20px`, top-right `10px`
- **Body**: `padding: 13px 14px 14px`
  - Tags: Space Grotesk 10px, `color: #a0917e`, `background: #f5f0e8`, `padding: 2px 7px`, `border-radius: 4px`
  - Member count: Space Grotesk 10px, `color: #c4b89e`, margin-left auto
  - Club name: Instrument Serif 14px, `#2a1f14`, `line-height: 1.4`, `margin-bottom: 12px`
  - CTA button: full width, `padding: 8px`, `border-radius: 10px`, DM Sans 11px 600
    - Open: `background: #b5451b`, `color: #fff`, no border
    - Closed: `background: transparent`, `color: #c4b89e`, `border: 1px solid #e8e0d4`

---

## Interactions & Behavior

- **Role toggle**: clicking "Student" or "Club" swaps the active segment (React `useState`)
- **Category filters**: clicking a pill sets it as active; used to filter cards
- **Card hover**: `translateY(-2px)` + elevated shadow; transition `0.2s`
- **Sign in button**: triggers auth flow (implement with existing auth library)
- **Forgot password / Register**: navigate to respective routes

---

## Assets
- No external images required — club logo areas use colored placeholder backgrounds with initials
- Fonts loaded from Google Fonts: `Instrument Serif`, `DM Sans`, `DM Serif Display`, `Space Grotesk`

---

## Files
| File | Contents |
|---|---|
| `nest-login-textures.html` | Login page — all 5 texture variants; implement the **"Radial Arcs"** option |
| `nest-discovery-themes.html` | Club discovery — all 5 themes; implement the **"Warm Academic"** option |
