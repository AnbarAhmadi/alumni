# Brand kit

The design rules for the Alumni Tracking System's new look (Week 9). The site doesn't use them yet. Screenshots of the current design, taken before the change, are in [docs/design/](docs/design/) (`before-users.png`, `before-user.png`).

Back to [README.md](README.md)

---

## Name and promise

**Homecoming** · where our graduates are now

---

## Colour

| Name | Hex | What it is for |
| --- | --- | --- |
| Paper | `#F6F4EE` | Page background |
| Ink | `#162033` | Text and headings |
| Action | `#2F5D50` | Buttons, links and anything the user can click to move forward |
| Accent | `#D9A441` | Small highlights only, such as a marker, an underline or a badge |
| Danger | `#B3261E` | Delete buttons and error messages |

Contrast (WCAG 2.1; body text needs at least 4.5:1):

| Pair | Ratio | Use |
| --- | --- | --- |
| Ink on paper | 14.82:1 | All text |
| Action on paper, or paper on action | 6.81:1 | Links; button labels |
| Danger on paper, or paper on danger | 5.94:1 | Error text; delete buttons |
| Ink on accent | 7.25:1 | Text on an accent badge |
| Accent on paper | **2.04:1** | **Never for text** or as the only sign of something; decoration only |

---

## Type

| Role | Font | Sizes (px) |
| --- | --- | --- |
| Headings | Source Serif 4 | 40 · 28 · 20 |
| Body | Inter | 16 · 14 |

40 is the page title, 28 a section heading and 20 a smaller heading. 16 is the normal text size, and 14 is for small print such as table details and hints.

---

## Shape

- **Radius:** 8 px on buttons, inputs, cards and tables.
- **Spacing:** only 4 · 8 · 16 · 24 · 40 px.
- **No shadows.**

---

## Voice

Plain, specific and calm. Say what the page does and what to do next.

| We say | We never say |
| --- | --- |
| "Find a graduate" | "Unlock your network" |
| "No postings yet. Post the first one." | "Oops! Nothing here." |

---

## Mark

The wordmark is the word **Homecoming**, set in the heading font (Source Serif 4). There is no separate logo or icon.

---

## Motion

Motion is subtle. It helps the eye follow what changed and never gets in the way.

| Name | Duration | Used for |
| --- | --- | --- |
| Fast | 150 ms | Hover and press: colour changes, the card lift, the button press |
| Base | 250 ms | Cards and list rows entering, the link underline, the count-up of the homepage numbers |
| Slow | 300 ms | The page entrance only |

- **Easing:** one curve, ease-out.
- **What may move:**
  - **Page entrance:** the content fades in and rises 8 px.
  - **Hover and press:** a card lifts 2 px, a link's underline slides in, and a button changes colour and shrinks to 98% while it is pressed.
  - **List entrance:** cards and table rows appear one after another, 50 ms apart, in at most 6 steps. The numbers on the homepage count up once when they first appear.
- **Never:** nothing loops, nothing moves on its own once the page has settled, nothing shifts the layout, and there are no shadows.
- **Reduced motion:** people who ask their system for less motion (`prefers-reduced-motion: reduce`) get no movement at all. Colours still change, instantly.

