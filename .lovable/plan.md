## Goal

Store AI-generated customization images in Cloudinary (cloud `dtybzk02y`) and persist only their secure URLs in Lovable Cloud. All other data (products, favorites, saved customizations metadata) stays in the existing Supabase tables.

## Changes

### 1. Secrets
Add three runtime secrets (server-only, never bundled to client):
- `CLOUDINARY_CLOUD_NAME` = `dtybzk02y`
- `CLOUDINARY_API_KEY` = `765156342927413`
- `CLOUDINARY_API_SECRET` = `yC9cUSmLDHLZFdx2rlCAiKen3Fc`

I'll request these via the secrets tool so they aren't checked into code.

### 2. Server-side upload helper
New file `src/lib/cloudinary.server.ts`:
- Signs an upload request with HMAC-SHA1 (Node `crypto`, already supported in the Worker runtime).
- `uploadDataUrlToCloudinary(dataUrl, { folder: "ai-furniture-studio/customizations" })` → returns `{ secureUrl, publicId }`.
- No external SDK needed; uses `fetch` against `https://api.cloudinary.com/v1_1/<cloud>/image/upload`.

### 3. Wire it into `customizeFurniture`
In `src/lib/customize.functions.ts`, after the Lovable AI gateway returns a base64 data URL:
- Upload that data URL to Cloudinary.
- Return `{ ok: true, imageUrl: <cloudinarySecureUrl> }` instead of the raw data URL.
- On upload failure, fall back to returning the data URL with a non-fatal warning so the user still sees the result.

### 4. Save to Supabase as a URL
`src/routes/customize.tsx` already inserts the returned `image_url` into `saved_customizations`. Once step 3 is in place, that column will contain a Cloudinary URL instead of a multi-MB data URL — no schema change needed.

### 5. No schema changes
The existing `products`, `favorites`, and `saved_customizations` tables already store image URLs as `text`. Cloudinary URLs fit. No migration required.

## Out of scope
- Seeded product images stay on Unsplash (unchanged).
- No client-side Cloudinary calls — the secret never leaves the server.
- No Cloudinary delete-on-row-delete (can be added later if you want).

## Technical notes
- Signed uploads avoid needing an unsigned preset.
- Folder `ai-furniture-studio/customizations` will be auto-created on first upload.
- Cloudinary URL secret was shared in chat — I recommend rotating it in the Cloudinary console after we wire this up, then updating the `CLOUDINARY_API_SECRET` secret.
