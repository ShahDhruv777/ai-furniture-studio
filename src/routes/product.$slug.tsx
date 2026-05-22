import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/site/Layout";
import type { Product } from "@/lib/types";
import { getSessionId } from "@/lib/session";
import { Heart, Wand2, Ruler, Truck, ShieldCheck, RotateCcw, ChevronRight, Star } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/product/$slug")({
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [sessionId, setSessionId] = useState("");
  useEffect(() => setSessionId(getSessionId()), []);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("slug", slug).single();
      if (error) throw error;
      return data as Product;
    },
  });

  const { data: related } = useQuery({
    queryKey: ["related", product?.category],
    enabled: !!product,
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").eq("category", product!.category).neq("id", product!.id).limit(3);
      return (data ?? []) as Product[];
    },
  });

  const { data: isFav } = useQuery({
    queryKey: ["fav", sessionId, product?.id],
    enabled: !!sessionId && !!product,
    queryFn: async () => {
      const { data } = await supabase.from("favorites").select("id").eq("session_id", sessionId).eq("product_id", product!.id).maybeSingle();
      return !!data;
    },
  });

  const toggleFav = useMutation({
    mutationFn: async () => {
      if (!product) return;
      if (isFav) {
        await supabase.from("favorites").delete().eq("session_id", sessionId).eq("product_id", product.id);
      } else {
        await supabase.from("favorites").insert({ session_id: sessionId, product_id: product.id });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fav", sessionId, product?.id] });
      qc.invalidateQueries({ queryKey: ["favorites", sessionId] });
      toast.success(isFav ? "Removed from favorites" : "Saved to favorites");
    },
  });

  if (isLoading || !product) {
    return <Layout><div className="mx-auto max-w-7xl animate-pulse px-6 py-20"><div className="h-[60vh] rounded-3xl bg-card" /></div></Layout>;
  }

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <nav className="flex items-center gap-1 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/catalog" className="hover:text-foreground">Catalog</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-3xl bg-card">
              <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
            </div>
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-square overflow-hidden rounded-xl bg-card">
                  <img src={product.image_url} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{product.category} • {product.room}</div>
            <h1 className="mt-2 text-4xl md:text-5xl">{product.name}</h1>
            <div className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Star className="h-3 w-3 fill-current text-primary" /> {product.rating?.toFixed(1)} rating</span>
              <span>•</span>
              <span className={product.in_stock ? "text-primary" : "text-destructive"}>{product.in_stock ? "In stock" : "Out of stock"}</span>
            </div>
            <p className="mt-6 text-lg text-muted-foreground">{product.description}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => navigate({ to: "/customize", search: { product: product.slug } })}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                <Wand2 className="h-4 w-4" /> Customize with AI
              </button>
              <button
                onClick={() => toggleFav.mutate()}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-6 py-3 text-sm font-medium transition hover:bg-secondary"
              >
                <Heart className={`h-4 w-4 ${isFav ? "fill-current text-primary" : ""}`} /> {isFav ? "Saved" : "Save"}
              </button>
            </div>

            <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-border pt-8">
              <Info icon={Ruler} label="Dimensions" value={product.dimensions ?? "—"} />
              <Info icon={ShieldCheck} label="Warranty" value="5 years" />
              <Info icon={Truck} label="Delivery" value="Free, 2–4 weeks" />
              <Info icon={RotateCcw} label="Returns" value="30-day window" />
            </dl>

            <div className="mt-10">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">About this piece</h3>
              <p className="mt-3 leading-relaxed">{product.long_description}</p>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4 text-sm">
              <Spec label="Material" value={product.material} />
              <Spec label="Color" value={product.color} />
              <Spec label="Style" value={product.style} />
            </div>
          </div>
        </div>

        {related && related.length > 0 && (
          <section className="mt-20">
            <h3 className="text-2xl">You may also like</h3>
            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              {related.map((p) => (
                <Link key={p.id} to="/product/$slug" params={{ slug: p.slug }} className="group">
                  <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-card">
                    <img src={p.image_url} alt={p.name} className="h-full w-full object-cover transition group-hover:scale-105" />
                  </div>
                  <div className="mt-3 text-sm">
                    <span>{p.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}

function Info({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 text-primary" />
      <div>
        <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
        <dd className="text-sm">{value}</dd>
      </div>
    </div>
  );
}
function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}
