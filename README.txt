# TRASKOON FOOD POINT — Website starter

## Files
- `index.html`: public website structure
- `styles.css`: responsive light, black-and-yellow visual style
- `app.js`: menu, cart, totals and WhatsApp order message
- `supabase-schema.sql`: initial database schema to review and run later
- `assets/brand-cover-reference.png`: generated branding concept/reference (if included)

## Important current behavior
- Frontend demo uses the supplied menu prices.
- Plain Shami Burger is intentionally disabled because its exact price was not reliably available; no price was guessed.
- French Fries have the seven specified price options.
- Order details are prepared in WhatsApp. The customer must press Send in WhatsApp.
- This starter is NOT yet connected to Supabase and does not yet include the secure admin panel.
- The current food cards use lightweight emoji illustrations, not downloaded food photos. Replace with optimized food images before launch.
- Offers are intentionally deferred.
- Delivery is shown as free within 2 km, but distance is not automatically calculated in this first version.
- Do not deploy as a finished live ordering system until Supabase connection, admin authorization, database policies, image assets and testing are completed.

## Local preview
Open `index.html` in a browser, or use VS Code's Live Server extension.

## GitHub Pages
Upload the files (keep `index.html`, `styles.css`, `app.js` at repository root) to your GitHub repository, then enable GitHub Pages in repository Settings > Pages.

## Supabase setup later
1. Review `supabase-schema.sql`.
2. In Supabase Dashboard > SQL Editor, run it only after reviewing the schema.
3. Configure an admin-only access policy before adding any admin UI.
4. Use only the project's URL and publishable key in browser code, with proper RLS policies. Never expose secret/service_role keys in frontend code.

## Brand and menu notes
- Brand name: TRASKOON FOOD POINT
- Address: Abdul Jabbar Plaza, Orakzai Chowk, Indus Highway, Kohat, Pakistan
- Map pin: 33.520722, 71.476278
- WhatsApp: 03348807634 (international URL: 923348807634)
- Hours: daily 3 PM–9 PM
- Delivery: free within 2 km; pickup available
- Payments listed: Cash, JazzCash, Easypaisa
- Afghani Roll excluded per user instruction
- Prices must remain exactly as provided; do not invent prices for items with missing prices.


UPDATE NOTE: Menu photos in assets/ are AI-generated illustrative images, not photographs of the exact food served. Review and replace with real shop photos when available. The three Afghani roll entries are shown as unavailable until their exact prices are provided. Anda Shami Burger is Rs. 120. Theme updated to light blue and white.

Afghani Roll menu entries included: Small Afghani Roll, Small Chicken Afghani Roll, Double Chicken Afghani Roll. Their prices remain unset until confirmed from the original menu; no prices were guessed.
