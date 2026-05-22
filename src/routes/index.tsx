import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/site/Layout";
import type { Product } from "@/lib/types";
import { ArrowRight, Sparkles, Wand2, Heart, Layers, Image as ImageIcon, ShieldCheck, Truck } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FactoryOutlet — AI-Customized Premium Furniture" },
      { name: "description", content: "Premium furniture you can reimagine with AI. Browse the catalog, describe your vision, and see photoreal previews in seconds." },
    ],
  }),
  component: Home,
});

function Home() {
  const { data: featured } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products").select("*").eq("featured", true).limit(4);
      if (error) throw error;
      return data as Product[];
    },
  });

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-sand via-background to-background" />
        <div className="mx-auto grid max-w-7xl gap-12 px-6 pt-16 pb-24 md:grid-cols-2 md:gap-16 md:pt-24 md:pb-32">
          <div className="flex flex-col justify-center">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary" /> AI-powered design studio
            </span>
            <h1 className="mt-5 text-5xl leading-[1.05] tracking-tight md:text-6xl">
              Furniture that adapts <span className="italic text-primary">to your taste.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground">
              Explore a curated catalog of premium pieces, then reimagine any of them — new material, new finish, new mood — with one prompt.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/catalog" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90">
                Browse catalog <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/customize" className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-6 py-3 text-sm font-medium transition hover:bg-secondary">
                <Wand2 className="h-4 w-4" /> Try AI customizer
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> 5-year warranty</div>
              <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-primary" /> Free shipping</div>
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1400&q=85"
              alt="Linen sofa hero"
              className="aspect-[4/5] w-full rounded-3xl object-cover shadow-2xl"
            />
            <div className="absolute -bottom-6 -left-6 w-60 rounded-2xl border border-border bg-background/95 p-4 shadow-xl backdrop-blur">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Wand2 className="h-3 w-3 text-primary" /> AI prompt
              </div>
              <p className="mt-1 text-sm">“Re-upholster in deep olive bouclé, keep oak legs.”</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Featured</span>
            <h2 className="mt-1 text-3xl md:text-4xl">This season's signatures</h2>
          </div>
          <Link to="/catalog" className="hidden text-sm text-primary hover:underline md:inline-flex">View all →</Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {(featured ?? Array.from({ length: 4 })).map((p: Product | undefined, i) =>
            p ? (
              <Link key={p.id} to="/product/$slug" params={{ slug: p.slug }} className="group">
                <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-card">
                  <img src={p.image_url} alt={p.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                </div>
                <div className="mt-4">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-sm text-muted-foreground">{p.material}</div>
                </div>
              </Link>
            ) : (
              <div key={i} className="aspect-[4/5] animate-pulse rounded-2xl bg-card" />
            )
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-card">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <span className="text-xs uppercase tracking-wider text-muted-foreground">How it works</span>
              <h2 className="mt-1 text-3xl md:text-4xl">Three steps from browse to bespoke.</h2>
              <p className="mt-4 max-w-md text-muted-foreground">
                FactoryOutlet blends a curated furniture catalog with an AI design studio. Every piece is yours to reimagine, save, and share.
              </p>
            </div>
            <div className="space-y-6">
              {[
                { icon: Layers, title: "Pick a piece", desc: "Browse the catalog and choose a product you love." },
                { icon: Wand2, title: "Describe the change", desc: "Type a prompt or pick a preset — new fabric, new color, new mood." },
                { icon: ImageIcon, title: "See it instantly", desc: "Receive a photoreal preview, save it to your history, share, or order." },
              ].map((s, idx) => (
                <div key={idx} className="flex gap-4 rounded-2xl bg-background p-5">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium">{s.title}</div>
                    <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="text-3xl md:text-4xl">Loved by designers and homeowners.</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { q: "I previewed eight finishes in five minutes. Saved me a trip to the showroom.", a: "Maya, interior designer" },
            { q: "The quality of the visuals is genuinely surprising — clients say yes faster.", a: "Daniel, studio owner" },
            { q: "Bought the sofa after seeing it in my exact palette. Zero regret.", a: "Priya, homeowner" },
          ].map((t, i) => (
            <figure key={i} className="rounded-2xl border border-border bg-card p-6">
              <blockquote className="text-lg leading-snug">“{t.q}”</blockquote>
              <figcaption className="mt-4 text-sm text-muted-foreground">— {t.a}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="overflow-hidden rounded-3xl bg-primary p-10 text-primary-foreground md:p-16">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <h3 className="text-3xl md:text-4xl">Ready to design your space?</h3>
              <p className="mt-3 opacity-90">Start with any piece in the catalog. The AI does the rest.</p>
            </div>
            <Link to="/customize" className="inline-flex items-center gap-2 rounded-full bg-background px-6 py-3 text-sm font-medium text-foreground hover:bg-secondary">
              <Heart className="h-4 w-4" /> Open the studio
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
