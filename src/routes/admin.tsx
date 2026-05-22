import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/site/Layout";
import type { Product, SavedCustomization } from "@/lib/types";
import { LayoutGrid, Sparkles, ImageIcon, Activity, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — FactoryOutlet" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { data: products } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      return (data ?? []) as Product[];
    },
  });
  const { data: saves } = useQuery({
    queryKey: ["admin-saves"],
    queryFn: async () => {
      const { data } = await supabase.from("saved_customizations").select("*").order("created_at", { ascending: false }).limit(50);
      return (data ?? []) as SavedCustomization[];
    },
  });

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <header className="flex items-end justify-between border-b border-border pb-6">
          <div>
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Admin</span>
            <h1 className="mt-1 text-4xl">Operations dashboard</h1>
            <p className="mt-2 text-muted-foreground">Read-only overview. Catalog and generations at a glance.</p>
          </div>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-4">
          <Stat icon={LayoutGrid} label="Products" value={products?.length ?? 0} />
          <Stat icon={Sparkles} label="Generations" value={saves?.length ?? 0} />
          <Stat icon={ImageIcon} label="Featured" value={products?.filter(p => p.featured).length ?? 0} />
          <Stat icon={Activity} label="API health" value="OK" />
        </section>

        <section className="mt-12">
          <h2 className="text-xl">Catalog</h2>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-card text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 text-left">Name</th>
                  <th className="px-5 py-3 text-left">Category</th>
                  <th className="px-5 py-3 text-left">Material</th>
                  <th className="px-5 py-3 text-right">Price</th>
                  <th className="px-5 py-3 text-left">Stock</th>
                </tr>
              </thead>
              <tbody>
                {(products ?? []).map((p) => (
                  <tr key={p.id} className="border-t border-border">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.image_url} alt="" className="h-10 w-10 rounded-md object-cover" />
                        <span className="font-medium">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">{p.category}</td>
                    <td className="px-5 py-3">{p.material}</td>
                    <td className="px-5 py-3 text-right">${p.price.toLocaleString()}</td>
                    <td className="px-5 py-3"><span className={`inline-flex items-center gap-1 text-xs ${p.in_stock ? "text-primary" : "text-destructive"}`}><CheckCircle2 className="h-3 w-3" /> {p.in_stock ? "In stock" : "Out"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-xl">Recent AI generations</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(saves ?? []).slice(0, 8).map((s) => (
              <div key={s.id} className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="aspect-square overflow-hidden"><img src={s.image_url} className="h-full w-full object-cover" /></div>
                <div className="p-3">
                  <div className="truncate text-xs font-medium">{s.product_name}</div>
                  <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{s.prompt}</div>
                </div>
              </div>
            ))}
            {(!saves || saves.length === 0) && <div className="col-span-full rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">No generations yet.</div>}
          </div>
        </section>
      </div>
    </Layout>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground"><Icon className="h-4 w-4 text-primary" /> {label}</div>
      <div className="mt-2 text-3xl font-display">{value}</div>
    </div>
  );
}
