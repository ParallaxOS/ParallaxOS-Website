# Marketing site — cohesion review (2026-06-13)

Review of the live marketing site (`ParallaxOS-Website` → `www.parallaxos.com.au`) done while adding the RTO page + "For RTOs" tab + RTO demo CTA. Overall the site is well-built and internally consistent (shared `styles.css` tokens, one nav/footer pattern, consistent voice). Findings below, most-actionable first.

## Fixed in this change
- **RTO was nearly invisible.** Before this PR, RTO appeared only in two `faq.html` Q&As and one `contact.html` dropdown option — no nav entry, no page, nothing on the homepage or pricing. Added: `rto.html` (dedicated page), a **"For RTOs"** nav tab + footer link across **all 17 pages** (6 top-level + 11 docs), a homepage RTO callout band, and RTO context in the demo form (`?org=rto` preselect + RTO tiers).
- **Nav/footer consistency:** the new tab was applied uniformly (nav + footer "Product" column) on every page, so the header stays identical site-wide.

## Recommended next (not done here — flagged to avoid colliding with other workstreams)
1. **Avetta naming drift (app vs site).** The app has renamed **"Avetta Pack" → "Avetta Report"** (merged in the ParallaxOS app). The marketing site still says "Avetta pack", "Avetta Monthly Pack", "Avetta auto-pack" (`index.html`, `features.html`, `pricing.html`). Align the site copy to "Avetta Report" for a consistent product name. Left untouched here because that rename is owned by another workstream.
2. **Stale duplicate marketing page in the app repo.** A *second*, older single-page marketing site exists at `ParallaxOS/ops/marketing/index.html` — different nav ("What it does", "Trust"), different prices ($99 / $299 / $799), and a `canonical` pointing at `parallax.industries`. It is **not** what serves `www.parallaxos.com.au` (this repo is). Recommend deleting or clearly archiving it so no one edits the wrong site. (Lives in the main app repo, so out of scope for this PR.)
3. **Pricing page has no RTO tiers.** `pricing.html` lists only the contractor ladder (Starter $599 / Professional $999 / Enterprise). RTO tiers (RTO Lite $149 / RTO Pro $349 / RTO Enterprise Custom) now live on `rto.html`; consider adding an RTO section or a "Contractor / RTO" toggle to `pricing.html` so both ladders are discoverable from one place.
4. **No RTO entry in `docs/`.** The docs set covers contractor concepts (portals, Avetta, edge-mode, AI agents) but nothing on AVETMISS/RTO. Consider `docs/rto-avetmiss.html` for the technical audience.

## Minor / cosmetic
- **Mobile nav weight.** The top nav is now 8 items (was 7) + 2 CTAs. It collapses to the `menu-toggle` hamburger on small screens (handled in `styles.css`/`script.js`), so this is fine — worth a visual check on a phone.
- **Canonical URLs are correct on the live site** (`https://www.parallaxos.com.au/...` on each page). The `parallax.industries` canonical issue is only in the *stale* `ops/marketing` copy (see #2), not here.
- **`faq.html`** already carries two accurate RTO/AVETMISS Q&As — good; they now have a page to link to (`rto.html`).
- **Honest data framing** on the homepage ("Demo dataset — not live customer data", "Hunter Valley reference dataset") is good and should be preserved on any new sections.

## Verification
- Open `rto.html`, `index.html` (RTO callout), and `contact.html?org=rto#demo` (heading reframes to "Book an RTO demo", org type + tier preselect to RTO) in the Pages preview.
- Confirm the "For RTOs" tab appears and is active on `rto.html`, and links resolve on both top-level (`rto.html`) and docs (`../rto.html`) pages.
