# Design

How the pages of **Homecoming** are laid out and styled (Week 9). The brand itself (name, colours, fonts, shape and voice) is in [BRAND.md](BRAND.md). This file says how to use it on the pages. The tokens, the shared layout and the homepage use it now; the other pages follow one by one. Screenshots of the design before the change are in [docs/design/](docs/design/).

Back to [README.md](README.md)

---

## References

**Colours, fonts and voice come from [BRAND.md](BRAND.md) only, never from the references.** We take only structure from the references: layout, spacing, the shape of a table, and how an empty state is built. We take no colours, fonts, logos, copy or illustrations from them.

We looked at [awesome-design-md](https://github.com/VoltAgent/awesome-design-md), 83 sites with a DESIGN.md each, and at [Refero Styles](https://styles.refero.design). We read the DESIGN.md of the sites that fit a clean, readable, table-and-profile-heavy directory: Notion, Mercury, Cal.com, Airtable, Linear, Stripe, Supabase, PostHog and Intercom. We kept three:

| | Site | DESIGN.md we read | What we take |
| --- | --- | --- | --- |
| **ref-1: layout, spacing, rhythm** (primary reference) | Cal.com | [getdesign.md/cal/design-md](https://getdesign.md/cal/design-md) | One centred column of about 1200px, a 4px base unit, 24px gutters, and cards 3-up, then 2-up, then 1-up. Whitespace is "generous but not excessive", and lists are "never densely packed". |
| **ref-2: the table** | Mercury | [getdesign.md/mercury/design-md](https://getdesign.md/mercury/design-md) | Data table cells: a small, medium-weight header label (14px, weight 500), body text at the normal size (16px), a 12px × 16px cell padding (8px × 16px on our scale) and a 1px rule between rows. |
| **ref-3: the empty state** | Notion | [getdesign.md/notion/design-md](https://getdesign.md/notion/design-md) | The empty-state card: a soft framed area with large padding (32px; 40px on our scale) and a short caption. Notion gives no copy for it, so the words come from BRAND.md's Voice. |

**Dropped:**

| Site | DESIGN.md | Why we dropped it |
| --- | --- | --- |
| Airtable | [getdesign.md/airtable/design-md](https://getdesign.md/airtable/design-md) | Its only table is the pricing comparison, and its 96px "editorial bands" are made for marketing pages, not a directory. No empty state. |
| Linear | [getdesign.md/linear.app/design-md](https://getdesign.md/linear.app/design-md) | Its layout is built on a dark canvas ("the dark canvas IS the whitespace"). No table and no empty state. |

The other four (Stripe, Supabase, PostHog, Intercom) have no table or empty-state component in their DESIGN.md. Stripe only adds tabular numbers for money tables.

**Primary reference for layout: ref-1, Cal.com.** Where the references disagree on layout, Cal.com wins. Where a reference disagrees with BRAND.md, BRAND.md wins. Every number is rounded to the BRAND.md scale (radius 8, spacing 4 · 8 · 16 · 24 · 40, no shadows).

---

## Tokens

This block is at the top of `app/globals.css`. The values come from [BRAND.md](BRAND.md). The fonts are loaded with `next/font/google` in `app/layout.tsx`, which sets `--font-source-serif-4` and `--font-inter` on `<html>` (subsets `latin` and `latin-ext`, for Turkish letters).

```css
:root {
  /* Colour (BRAND.md) */
  --color-paper: #F6F4EE;   /* page background */
  --color-ink: #162033;     /* text and headings */
  --color-action: #2F5D50;  /* buttons and links */
  --color-accent: #D9A441;  /* small highlights only, never text (2.04:1 on paper) */
  --color-danger: #B3261E;  /* delete buttons and error messages */

  /* Mixed from the brand colours, not new colours */
  --color-muted: color-mix(in srgb, var(--color-ink) 70%, var(--color-paper));        /* secondary text and input borders, 5.77:1 on paper */
  --color-line: color-mix(in srgb, var(--color-ink) 15%, var(--color-paper));         /* dividers only (too faint for input borders) */
  --color-highlight: color-mix(in srgb, var(--color-accent) 25%, var(--color-paper)); /* notices, badges, a new table row, the avatar; ink on it is 12.51:1 */
  --color-tint: color-mix(in srgb, var(--color-ink) 5%, var(--color-paper));          /* a table row under the pointer */

  /* Type (BRAND.md); the two font variables are set by next/font in app/layout.tsx */
  --font-heading: var(--font-source-serif-4), Georgia, serif;
  --font-body: var(--font-inter), system-ui, sans-serif;
  --font-size-h1: 40px;     /* page title */
  --font-size-h2: 28px;     /* section heading */
  --font-size-h3: 20px;     /* smaller heading */
  --font-size-body: 16px;   /* normal text */
  --font-size-small: 14px;  /* table headers, hints, small print */

  /* Shape (BRAND.md) */
  --radius: 8px;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 16px;
  --space-4: 24px;
  --space-5: 40px;

  /* Motion (BRAND.md) */
  --motion-fast: 150ms;     /* hover and press */
  --motion-base: 250ms;     /* cards and rows entering, link underline, count-up */
  --motion-slow: 300ms;     /* page entrance only */
  --motion-stagger: 50ms;   /* the gap between cards or rows entering, at most 6 steps */
  --ease: ease-out;

  /* Layout (ref-1) */
  --content-width: 1200px;

  /* Sizes */
  --reading-width: 760px;     /* text-heavy pages and detail pages: about 75 characters per line */
  --form-width: 560px;        /* every form */
  --avatar-size: 80px;        /* the initials avatar */
  --avatar-size-small: 64px;  /* the initials avatar on phones */
  --hero-title-width: 16em;   /* the hero heading wraps before it gets too long */
  --hero-text-width: 36em;    /* the hero line */
  --facts-column-min: 200px;  /* the profile's label / value columns */
}
```

---

## Rules for the pages

1. **One layout.** `app/layout.tsx` wraps every page: the header with the wordmark "Homecoming" and the navigation (only pages that exist), one centred column (`max-width: var(--content-width)`), and the footer in `--color-ink` with paper text. Pages fill the column; they never add their own header, footer or page background. The one exception is a band that spans the full width, such as the homepage hero: `<main>` is a grid with a centred content track, and a direct child with the class `full-bleed` spans the whole width while its content stays aligned in a `.column`.
2. **One stylesheet.** All styles live in `app/globals.css`. There are no CSS modules, no inline `style={{ ... }}` and no second stylesheet.
3. **Colours only as `var(--...)`.** No hex, `rgb()` or named colours outside `:root`.
4. **Spacing, radius and fonts only as `var(--...)`.** Margins, paddings and gaps use `--space-1` to `--space-5`; corners use `--radius`; text uses the two font families and the five sizes. There is no `box-shadow` anywhere.
5. **Layout (ref-1).** Sections are separated by whitespace (`--space-5`). Card grids go 3-up, then 2-up below 1024px, then 1-up below 768px, with a `--space-4` gap.
6. **Tables (ref-2).** Header labels use `--font-size-small` at weight 500 in `--color-muted`; cells use `--font-size-body` with a padding of `var(--space-2) var(--space-3)`; rows are separated by a 1px `--color-line` rule. No zebra stripes and no row shadows. Every table row gets the `--color-tint` background under the pointer (users and job postings alike).
7. **Empty states (ref-3).** When a list has no rows, show one framed area where the list would be: a 1px dashed `--color-muted` border, `--radius`, `--space-5` padding, one sentence and at most one action, worded as in BRAND.md ("No postings yet. Post the first one."). Always through `components/EmptyState.tsx` (the action is optional). An empty state is never used for an error message: that is a `.notice`.
8. **Words from BRAND.md.** Labels, headings and messages follow BRAND.md's Voice.
9. **Motion (BRAND.md).** Durations and easing only as `var(--motion-*)` and `var(--ease)`. Only `opacity`, `translate`/`transform` and colours move, so nothing shifts the layout. Page entrance: the content of `<main>` fades in and rises `--space-2` (8px) over `--motion-slow`. List entrance: `.grid` and `.card-list` items and table rows enter `--motion-stagger` apart, at most 6 steps. Hover: link cards lift 2px and their border turns `--color-action`; text links in navigation and cards get an underline that slides in; buttons change colour. Press: buttons scale to 0.98. The homepage numbers count up once (`components/CountUp.tsx`; the final number is in the HTML, so it shows without JavaScript). Every animation and transition sits inside `@media (prefers-reduced-motion: no-preference)`, so people who ask for reduced motion get none: colours change instantly. Nothing loops.
10. **One of each component.** One card: `.card`, with `.card-title` (an h2 or h3 at 20px) and `.card-text` (14px, muted); `.card.is-new` marks a just-added item. One button hover for every button: it fills with ink, with paper text. One standalone link style: `.text-link` (14px, weight 500), with `.page-back` around the back link at the top of a page. One table: `.table` in a `.table-wrap`. One form width: `--form-width`. One empty state: `EmptyState`. One notice style for messages: `.notice`. One section-heading style: `h2.section-title`. Repeated widths are variables (`--reading-width`, `--form-width`, the avatar and hero sizes); only tiny values such as the 2px focus outline are written directly.

---

## What changes when this is applied

**Done (Week 9, task 6a):** `app/globals.css` is built from the tokens above. The old variables (`--navy`, `--navy-light`, `--gold`, `--bg`, `--card`, `--text`, `--muted`, `--border`), the 17 hard-coded colours, the 6, 10 and 999px radii, the hover shadow and the hero gradient are gone. `app/layout.tsx` is the one layout (the wordmark "Homecoming", the navigation, one centred column and the footer), loads the fonts, and the homepage is redesigned. The pages no longer have their own `<main className="container">`.

**Done (Week 9, task 6b):** the homepage is livelier: a full-width hero band in `--color-action` with paper text and two buttons (filled paper, outlined paper), a stats strip with real counts from the database (users, announcements, job postings), the 3 newest announcements and job postings, and one "Coming soon" line. The navigation shows only Home, About, Users and Announcements, and the footer is `--color-ink` with paper text.

**Done (Week 9, task 6c):** the announcements pages are redesigned: cards newest first with a date badge, a 2-line preview and "Read more"; a dashed empty state; a reading-width details page; forms with labels above the fields and errors under them. The inline styles in `AnnouncementForm.tsx` (with `#b42318`) and `AnnouncementDetails.tsx` are gone, and the page titles end in "| Homecoming".

**Done (Week 9, task 6e):** the users pages and About are redesigned: a users table (name as a link, email, school, alumni badge, graduation year) with row hover and a 1px row rule; a profile with an initials avatar on `--color-highlight`, the name in large serif and a job postings table; forms with labels above the fields and errors under them; and a short About page in the BRAND.md voice. The alumni status is read-only on these pages (`UserModel.getAllWithStatus` and `getProfile` through `UserDirectoryController`); the API and the forms still don't use it.

**Done (Week 9, task 6f):** designed 404 and 500 pages (`app/not-found.tsx`, `app/error.tsx`, `app/global-error.tsx`, sharing `components/StatusPage.tsx`): the status code in the largest heading size (40px; BRAND.md has no bigger size) with a small accent bar, one plain line, and the actions. The 500 page never shows the error message, a digest or a stack trace.


**Done (Week 9, task 7, the audit):** one of each component (rule 10); "users" everywhere in the pages; plain form errors ("Full name is required.") while the API keeps its messages; "No postings yet." without an invitation; a count line on the announcements page; "Edit user" and "Edit announcement"; the profile at reading width; every browser tab titled "X | Homecoming" (404, 500 and Swagger included); the shared header and footer also on the `global-error` page; the size variables above; and the unused `UserController.index` and `showWithJobs` removed.

Every page now follows this design.
