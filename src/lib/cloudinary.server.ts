import { createHash } from "crypto";

/**
 * Uploads a data URL (or remote URL) to Cloudinary using a signed upload.
 * Returns the Cloudinary secure URL on success, or null on failure.
 */
export async function uploadImageToCloudinary(
  source: string,
  options: { folder?: string } = {},
): Promise<{ secureUrl: string; publicId: string } | null> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.error("Cloudinary credentials are not configured.");
    return null;
  }

  const folder = options.folder ?? "samples/Catalog";
  const timestamp = Math.floor(Date.now() / 1000).toString();

  // Build signature: sha1 of sorted "key=value" pairs (excluding file, api_key)
  // joined by "&", concatenated with api secret.
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
  const signature = createHash("sha1")
    .update(paramsToSign + apiSecret)
    .digest("hex");

  const form = new FormData();
  form.append("file", source);
  form.append("api_key", apiKey);
  form.append("timestamp", timestamp);
  form.append("folder", folder);
  form.append("signature", signature);

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: form },
    );
    if (!res.ok) {
      const txt = await res.text();
      console.error("Cloudinary upload failed", res.status, txt);
      return null;
    }
    const json = (await res.json()) as { secure_url?: string; public_id?: string };
    if (!json.secure_url || !json.public_id) {
      console.error("Cloudinary response missing fields", json);
      return null;
    }
    return { secureUrl: json.secure_url, publicId: json.public_id };
  } catch (err) {
    console.error("Cloudinary upload error", err);
    return null;
  }
}
