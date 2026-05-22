import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/site/Layout";
import type { Product } from "@/lib/types";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, Star } from "lucide-react";

export const Route = createFileRoute("/catalog")({
  head: () => ({
    meta: [
      { title: "Catalog — FactoryOutlet" },
      { name: "description", content: "Browse premium furniture: sofas, chairs, tables, beds, and storage. Filter by material, room, and style." },
    ],
  }),
  component: CatalogPage,
});

function CatalogPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("featured", { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
  });

  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [room, setRoom] = useState<string>("All");
  const [sort, setSort] = useState<string>("featured");
  // price filter removed

  const categories = useMemo(() => ["All", ...Array.from(new Set((data ?? []).map((p) => p.category)))], [data]);
  const rooms = useMemo(() => ["All", ...Array.from(new Set((data ?? []).map((p) => p.room)))], [data]);

  const filtered = useMemo(() => {
    let r = (data ?? []).filter((p) =>
      (category === "All" || p.category === category) &&
      (room === "All" || p.room === room) &&
      p.price <= maxPrice &&
      (q === "" || `${p.name} ${p.material} ${p.style}`.toLowerCase().includes(q.toLowerCase()))
    );
    if (sort === "price-asc") r = [...r].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") r = [...r].sort((a, b) => b.price - a.price);
    if (sort === "rating") r = [...r].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    return r;
  }, [data, q, category, room, sort, maxPrice]);

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <header className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl">Catalog</h1>
            <p className="mt-2 text-muted-foreground">{filtered.length} pieces ready to be reimagined.</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search furniture, materials, styles"
              className="w-full rounded-full border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </header>

        <div className="mt-8 grid gap-10 md:grid-cols-[240px_1fr]">
          <aside className="space-y-8 md:sticky md:top-24 md:self-start">
            <div className="flex items-center gap-2 text-sm font-medium">
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </div>
            <FilterGroup label="Category" options={categories} value={category} onChange={setCategory} />
            <FilterGroup label="Room" options={rooms} value={room} onChange={setRoom} />
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Max price</div>
              <input type="range" min={400} max={2000} step={50} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="mt-3 w-full accent-[color:var(--primary)]" />
              <div className="mt-1 text-sm">Up to ${maxPrice.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sort</div>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="mt-3 w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
                <option value="featured">Featured</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="rating">Top rated</option>
              </select>
            </div>
          </aside>

          <section>
            {isLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => <div key={i} className="aspect-[4/5] animate-pulse rounded-2xl bg-card" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-16 text-center">
                <p className="text-muted-foreground">No furniture matches those filters.</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((p) => (
                  <Link key={p.id} to="/product/$slug" params={{ slug: p.slug }} className="group">
                    <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-card">
                      <img src={p.image_url} alt={p.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
                    </div>
                    <div className="mt-4">
                      <div className="flex items-start justify-between">
                        <div className="font-medium">{p.name}</div>
                        <div className="text-sm">${p.price.toLocaleString()}</div>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{p.material}</span>
                        <span>•</span>
                        <span>{p.style}</span>
                        <span className="ml-auto inline-flex items-center gap-1">
                          <Star className="h-3 w-3 fill-current text-primary" /> {p.rating?.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </Layout>
  );
}

function FilterGroup({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={`rounded-full border px-3 py-1.5 text-xs transition ${value === o ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:bg-secondary"}`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
