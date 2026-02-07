# AGENTS.md — Observability Citations Site

## Snapshot
This repo powers a GitHub Pages site with two views:
- **Video page** (`index.html`): plays the presentation and syncs citations.
- **Citations page** (`citations.html`): browsable, filterable list of all citations.

Citation data is authored in YAML **outside** this repo and converted to the JS file used by the site.

---

## Core Files
- `citations-data.js` — **generated** data consumed by the site (`window.CITATIONS = [...]`).
- `script.js` — renders citations, filters, and deep-link behavior.
- `index.html` — video view with citation sidebar + detail panel.
- `citations.html` — citations-only view with filters.
- `styles.css` — shared styling for both pages.

External source of truth:
- `citations-data.yaml` — **not in this repo**. Maintained elsewhere and converted before publishing.

---

## How the Site Works
- **Deep links**: `citations.html#cite=claim-01` scrolls and highlights the citation.
- **Filters** on the citations page use `presentation.slide` and `presentation.usage`.
- **Source types**:
  - `image`: shows a preview image on citations page and detail panel.
  - `link`: shows a file card instead of an image.
- **Accents**: orange is used sparingly; buttons are white with black text.

---

## YAML → JS Conversion (Required Workflow)
When updating citations:
1) Edit the external `citations-data.yaml`.
2) Convert YAML → `citations-data.js` using the mapping below.
3) Copy/overwrite `citations-data.js` in this repo before publishing.

### YAML Schema (external)
```yaml
citations:
  - number: 1
    slug: claim-01
    time: 30              # optional (seconds into video)
    presentation:
      slide: 1            # optional
      usage: Header       # optional (Header/Body/Footer/etc.)
    claim: "..."
    notes: "..."          # optional
    source:
      type: image|link
      title: "..."
      author: "..."
      year: "2024"
      attribution: "..."
      logo: "assets/logos/..."
      path: "assets/sources/..."   # required if type=image
      url: "assets/sources/..."    # required if type=link (can be local or external)
```

### JS Output Schema (citations-data.js)
```js
window.CITATIONS = [
  {
    number: 1,
    slug: "claim-01",
    time: 30,
    presentation: { slide: 1, usage: "Header" },
    claim: "...",
    notes: "...",
    source: {
      type: "image" | "link",
      title: "...",
      author: "...",
      year: "2024",
      attribution: "...",
      logo: "assets/logos/...",
      path: "assets/sources/...", // if type=image
      url: "assets/sources/...",  // if type=link
    },
  },
];
```

### Mapping Rules
- Use **exact keys** above (case-sensitive).
- Keep `presentation.slide` and `presentation.usage` inside `presentation`.
- If `source.type === "image"`, use `source.path` and **omit** `source.url`.
- If `source.type === "link"`, use `source.url` and **omit** `source.path`.
- `slug` is used for deep links and must be unique.

---

## UI Behavior Notes (for future edits)
- `script.js` normalizes data and drives:
  - citation rendering
  - slide/usage filters
  - deep-link scroll + highlight
  - synchronized highlighting on the video page
- The citations-only page is intentionally roomy and horizontal.
- The video page is compact with a fixed citation sidebar.

---

## Styling Principles
- **Palette**: ink black background; white text; orange only as a subtle accent.
- **Buttons**: white background with black text.
- **Typography**: serif heading; clean sans body.

---

## If You Change the Schema
- Update YAML comments (external).
- Update normalization logic in `script.js`.
- Update any UI that reads the changed fields.

---

## Quick Sanity Checks
- Open `index.html`, click a citation, confirm detail panel updates.
- Open `citations.html`, verify filters work.
- Open `citations.html#cite=claim-01`, confirm highlight + scroll.
