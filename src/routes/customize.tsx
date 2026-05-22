import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/site/Layout";
import type { Product } from "@/lib/types";
import { customizeFurniture } from "@/lib/customize.functions";
import { getSessionId } from "@/lib/session";
import {
  Wand2,
  Sparkles,
  Loader2,
  AlertCircle,
  Save,
  RefreshCw,
  Upload,
  Camera,
  SwitchCamera,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";

const search = z.object({ product: z.string().optional() });

export const Route = createFileRoute("/customize")({
  validateSearch: search,
  head: () => ({ meta: [{ title: "AI Customize — FactoryOutlet" }] }),
  component: CustomizePage,
});

// Category-aware quick prompts (also used for uploaded rooms when category is generic)
const PRESETS_BY_CATEGORY: Record<string, string[]> = {
  Sofas: [
    "Re-upholster in moss green velvet",
    "Cream linen cover with walnut legs",
    "Black leather with brushed steel feet",
    "Olive bouclé fabric",
    "Burnt orange cotton weave",
    "Charcoal grey wool blend",
  ],
  Chairs: [
    "Cane webbing back with oak frame",
    "Tan saddle leather seat",
    "Walnut finish with brass accents",
    "Matte black with terracotta cushion",
    "Natural rattan finish",
    "Soft sage green upholstery",
  ],
  Tables: [
    "Solid walnut top with black steel legs",
    "Carrara marble top, brass base",
    "Whitewashed oak finish",
    "Smoked glass top with bronze legs",
    "Reclaimed teak natural grain",
    "Travertine stone surface",
  ],
  Beds: [
    "Headboard in deep navy velvet",
    "Natural oak frame with linen headboard",
    "Boucle cream upholstered headboard",
    "Rattan cane headboard, walnut frame",
    "Charcoal performance fabric",
    "Warm cognac leather headboard",
  ],
  Storage: [
    "Fluted oak doors with brass pulls",
    "Matte black lacquer finish",
    "Cane front panels, walnut body",
    "Whitewashed pine with iron handles",
    "Walnut veneer with leather pulls",
    "Sage green painted finish",
  ],
  Room: [
    "Restyle the sofa in olive bouclé fabric",
    "Change the dining chairs to walnut with cane backs",
    "Re-upholster the bed headboard in cream linen",
    "Swap the coffee table to a travertine round top",
    "Change the armchair to tan saddle leather",
    "Restyle the cabinet doors with fluted oak",
  ],
};

function presetsFor(category: string | undefined) {
  return PRESETS_BY_CATEGORY[category ?? ""] ?? PRESETS_BY_CATEGORY.Sofas;
}

function CustomizePage() {
  const { product: slug } = Route.useSearch();
  const navigate = useNavigate();
  const customize = useServerFn(customizeFurniture);

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").order("name");
      return (data ?? []) as Product[];
    },
  });

  const [selectedId, setSelectedId] = useState<string>("");
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Only show product picker / preview card when the user came from the catalog via ?product=slug
  const cameFromCatalog = !!slug;

  // Uploaded / captured room image (data URL)
  const [userImage, setUserImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Camera state
  const [cameraOpen, setCameraOpen] = useState(false);
  const [facing, setFacing] = useState<"user" | "environment">("environment");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!products || products.length === 0) return;
    if (!cameFromCatalog) return;
    const initial = products.find((p) => p.slug === slug)?.id;
    if (initial && !selectedId) setSelectedId(initial);
  }, [products, slug, selectedId, cameFromCatalog]);

  const selected = cameFromCatalog ? products?.find((p) => p.id === selectedId) : undefined;

  const usingRoom = !!userImage;
  const sourceImage = userImage ?? selected?.image_url ?? "";
  const sourceName = usingRoom ? "Your room photo" : selected?.name ?? "Product";

  const activePresets = useMemo(
    () => presetsFor(usingRoom ? "Room" : selected?.category),
    [usingRoom, selected?.category],
  );

  // ---- Upload handling ----
  function onPickFile(file: File | null) {
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast.error("Please upload a JPG, PNG, or WEBP image.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image is too large (max 8MB).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setUserImage(String(reader.result));
      setResult(null);
      setError(null);
      toast.success("Room image loaded");
    };
    reader.readAsDataURL(file);
  }

  // ---- Camera handling ----
  async function openCamera(nextFacing: "user" | "environment" = facing) {
    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: nextFacing } },
        audio: false,
      });
      streamRef.current = stream;
      setFacing(nextFacing);
      setCameraOpen(true);
      // wait for next tick so the <video> mounts
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play();
        }
      }, 30);
    } catch (e) {
      console.error(e);
      toast.error("Could not open camera. Check browser permissions.");
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }

  function closeCamera() {
    stopCamera();
    setCameraOpen(false);
  }

  function switchCamera() {
    const next = facing === "user" ? "environment" : "user";
    void openCamera(next);
  }

  function capture() {
    const video = videoRef.current;
    if (!video) return;
    const w = video.videoWidth || 1280;
    const h = video.videoHeight || 720;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setUserImage(dataUrl);
    setResult(null);
    setError(null);
    closeCamera();
    toast.success("Captured");
  }

  useEffect(() => () => stopCamera(), []);

  const gen = useMutation({
    mutationFn: async () => {
      if (!sourceImage) throw new Error("Pick a product or upload a room photo.");
      const cleanPrompt = prompt.trim();
      if (cleanPrompt.length < 3)
        throw new Error("Please describe your customization (at least 3 characters).");
      const res = await customize({
        data: {
          productName: sourceName,
          imageUrl: sourceImage,
          prompt: cleanPrompt,
          mode: usingRoom ? "room" : "product",
        },
      });
      if (!res.ok) throw new Error(res.error);
      return res.imageUrl;
    },
    onMutate: () => {
      setError(null);
      setResult(null);
    },
    onSuccess: (img) => {
      setResult(img);
      toast.success("Customization ready");
    },
    onError: (e: Error) => {
      setError(e.message);
      toast.error(e.message);
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      if (!result) return;
      const { data, error } = await supabase
        .from("saved_customizations")
        .insert({
          session_id: getSessionId(),
          product_id: usingRoom ? null : selected?.id ?? null,
          product_name: sourceName,
          prompt: prompt.trim(),
          image_url: result,
          original_image_url: sourceImage,
          settings: { mode: usingRoom ? "room" : "product" },
        })
        .select("id")
        .single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: (id) => {
      toast.success("Saved to your designs");
      navigate({ to: "/result/$id", params: { id } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <header className="flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Studio</span>
            <h1 className="mt-1 text-4xl">AI Customizer</h1>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Choose a product, describe the change, and the AI re-renders it in seconds. Silhouette and proportions stay fixed — material, color, and finish change.
            </p>
          </div>
        </header>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          {/* Left: controls */}
          <div className="space-y-6 rounded-3xl border border-border bg-card p-6">
            {cameFromCatalog && !usingRoom && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Product</label>
                <select
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
                >
                  {(products ?? []).map((p) => (
                    <option key={p.id} value={p.id}>{p.name} — {p.material}</option>
                  ))}
                </select>
              </div>
            )}


            {selected && !usingRoom && (
              <div className="flex gap-4 rounded-2xl bg-background p-4">
                <img src={selected.image_url} alt={selected.name} className="h-24 w-24 rounded-xl object-cover" />
                <div className="text-sm">
                  <div className="font-medium">{selected.name}</div>
                  <div className="mt-1 text-muted-foreground">{selected.material} · {selected.color}</div>
                  <div className="mt-1 text-muted-foreground">{selected.dimensions}</div>
                </div>
              </div>
            )}

            {/* ---- Room photo (upload / camera) ---- */}
            <div className="rounded-2xl border border-border bg-background p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Use your room</div>
                  <div className="mt-1 text-xs text-muted-foreground">Upload a photo or capture one — AI restyles the furniture only, keeping your room intact.</div>
                </div>
                {usingRoom && (
                  <button
                    onClick={() => { setUserImage(null); setResult(null); }}
                    className="grid h-8 w-8 place-items-center rounded-full hover:bg-secondary"
                    aria-label="Remove room photo"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {usingRoom ? (
                <div className="mt-3 overflow-hidden rounded-xl">
                  <img src={userImage!} alt="Your room" className="h-40 w-full object-cover" />
                </div>
              ) : null}

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs hover:bg-secondary"
                >
                  <Upload className="h-3.5 w-3.5" /> Upload room image
                </button>
                <button
                  onClick={() => openCamera()}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs hover:bg-secondary"
                >
                  <Camera className="h-3.5 w-3.5" /> Open camera
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Style presets {usingRoom ? "· Room" : selected?.category ? `· ${selected.category}` : ""}
              </label>
              <div className="mt-3 flex flex-wrap gap-2">
                {activePresets.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPrompt((prev) => (prev ? prev + ", " + p.toLowerCase() : p))}
                    className="rounded-full border border-border bg-background px-3 py-1.5 text-xs hover:bg-secondary"
                  >
                    + {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                placeholder={usingRoom
                  ? "e.g. Re-upholster the sofa in moss green velvet, keep the rest of the room unchanged."
                  : "e.g. Re-upholster in moss green velvet with black walnut legs."}
                className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <div className="mt-1 text-xs text-muted-foreground">
                {usingRoom
                  ? "Walls, floor, lighting and perspective are preserved."
                  : "Silhouette and proportions are preserved."}
              </div>
            </div>

            <button
              onClick={() => gen.mutate()}
              disabled={gen.isPending || !sourceImage || prompt.trim().length < 3}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
            >
              {gen.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</> : <><Wand2 className="h-4 w-4" /> Generate</>}
            </button>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4" /> {error}
              </div>
            )}
          </div>

          {/* Right: preview */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Original</div>
                <div className="mt-2 aspect-square overflow-hidden rounded-2xl bg-card">
                  {sourceImage ? <img src={sourceImage} alt="" className="h-full w-full object-cover" /> : null}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">AI Preview</div>
                <div className="mt-2 aspect-square overflow-hidden rounded-2xl bg-card">
                  {result ? (
                    <img src={result} alt="AI generated" className="h-full w-full object-cover" />
                  ) : gen.isPending ? (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <div className="text-xs">Rendering your design…</div>
                    </div>
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-muted-foreground">
                      <Sparkles className="h-6 w-6" />
                      <div className="text-xs">Generation will appear here</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {result && (
              <div className="flex flex-wrap gap-3">
                <button onClick={() => save.mutate()} disabled={save.isPending} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                  <Save className="h-4 w-4" /> Save & open
                </button>
                <button onClick={() => gen.mutate()} className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium hover:bg-secondary">
                  <RefreshCw className="h-4 w-4" /> Regenerate
                </button>
                <a href={result} download="factoryoutlet-customization.png" className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium hover:bg-secondary">
                  Download
                </a>
                <Link to="/saved" className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium hover:bg-secondary">
                  View saved
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Camera modal */}
      {cameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="text-sm font-medium">Capture your room</div>
              <button onClick={closeCamera} className="grid h-8 w-8 place-items-center rounded-full hover:bg-secondary" aria-label="Close camera">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="relative aspect-video bg-black">
              <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
              <button onClick={switchCamera} className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs hover:bg-secondary">
                <SwitchCamera className="h-3.5 w-3.5" /> Switch ({facing === "user" ? "front" : "back"})
              </button>
              <div className="flex gap-2">
                <button onClick={closeCamera} className="rounded-full border border-border bg-background px-4 py-1.5 text-xs hover:bg-secondary">Cancel</button>
                <button onClick={capture} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">
                  <Camera className="h-3.5 w-3.5" /> Capture
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
