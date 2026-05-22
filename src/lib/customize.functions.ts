import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { uploadImageToCloudinary } from "./cloudinary.server";

const CustomizeInput = z.object({
  productName: z.string().min(1).max(200),
  imageUrl: z
    .string()
    .min(1)
    .refine(
      (v) => v.startsWith("http://") || v.startsWith("https://") || v.startsWith("data:image/"),
      "Image must be a URL or a data: image",
    ),
  prompt: z.string().trim().min(3, "Please describe the change in a few words.").max(800),
  mode: z.enum(["product", "room"]).optional().default("product"),
});

// Calls Lovable AI Gateway with the Gemini image-preview model.
// Returns a base64 data URL of the generated image.
export const customizeFurniture = createServerFn({ method: "POST" })
  .inputValidator((input) => CustomizeInput.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return { ok: false as const, error: "AI gateway not configured." };
    }

    const systemPrompt =
      data.mode === "room"
        ? "You are an expert interior visualizer. You receive a real photograph of a room. PRESERVE the original room completely: do not change walls, floor, ceiling, windows, decorations, lighting, shadows, camera angle, perspective, or depth. ONLY restyle the furniture that the user references (its material, color, finish, upholstery, or style). Keep all furniture in the exact same position, scale, and silhouette. Match the room's original lighting and natural shadows so the result looks photorealistic and physically plausible. Output a single photorealistic image."
        : "You are an expert furniture visualizer. Re-render the provided furniture piece applying the user's customization while preserving the product's silhouette, proportions, perspective, and the original studio background. Only change the requested attributes (material, color, finish, style). Output a single photorealistic image.";

    const userText =
      data.mode === "room"
        ? `Room photo provided by the user.\nCustomization request: ${data.prompt}\n\nRestyle only the furniture as requested. Preserve the rest of the room exactly. Return one photorealistic image.`
        : `Product: ${data.productName}\nCustomization request: ${data.prompt}\n\nReturn one photorealistic image of the customized piece.`;

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image-preview",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: [
                { type: "text", text: userText },
                { type: "image_url", image_url: { url: data.imageUrl } },
              ],
            },
          ],
          modalities: ["image", "text"],
        }),
      });

      if (res.status === 429) {
        return { ok: false as const, error: "Rate limit reached. Please wait a moment and try again." };
      }
      if (res.status === 402) {
        return { ok: false as const, error: "AI credits exhausted. Add credits in the workspace to continue." };
      }
      if (!res.ok) {
        const txt = await res.text();
        console.error("AI gateway error", res.status, txt);
        return { ok: false as const, error: `Generation failed (${res.status}).` };
      }

      const payload = await res.json();
      const message = payload?.choices?.[0]?.message;
      const imageUrl: string | undefined =
        message?.images?.[0]?.image_url?.url ??
        message?.images?.[0]?.url;

      if (!imageUrl) {
        console.error("No image in response", JSON.stringify(payload).slice(0, 500));
        return { ok: false as const, error: "No image returned by the model." };
      }

      // Upload to Cloudinary so we store a small URL instead of a multi-MB data URL.
      const uploaded = await uploadImageToCloudinary(imageUrl);
      const finalUrl = uploaded?.secureUrl ?? imageUrl;

      return { ok: true as const, imageUrl: finalUrl };
    } catch (e) {
      console.error("Customize failed", e);
      return { ok: false as const, error: "Generation request failed. Please try again." };
    }
  });
