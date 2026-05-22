import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/site/Layout";
import { getSessionId } from "@/lib/session";
import type { Product } from "@/lib/types";
import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";

export const Route = createFileRoute("/compare")({
  head: () => ({ meta: [{ title: "Compare — FactoryOutlet" }] }),
  component: ComparePage,
});

function ComparePage() {
  const [sid, setSid] = useState("");
  useEffect(() => setSid(getSessionId()), []);

  // Only products that the user has favorited OR customized are eligible for comparison.
  const { data: products, isLoading } = useQuery({
    queryKey: ["compare-eligible", sid],
    enabled: !!sid,
    queryFn: async () => {
      const [favRes, savedRes] = await Promise.all([
        supabase.from("favorites").select("product_id").eq("session_id", sid),
        supabase.from("saved_customizations").select("product_id").eq("session_id", sid),
      ]);
      const ids = new Set<string>();
      (favRes.data ?? []).forEach((r: any) => r.product_id && ids.add(r.product_id));
      (savedRes.data ?? []).forEach((r: any) => r.product_id && ids.add(r.product_id));
      if (ids.size === 0) return [] as Product[];
      const { data } = await supabase
        .from("products")
        .select("*")
        .in("id", Array.from(ids))
        .order("name");
      return (data ?? []) as Product[];
    },
  });
  const [slots, setSlots] = useState<(string | null)[]>([null, null, null]);


  const set = (i: number, v: string | null) => setSlots((s) => s.map((x, idx) => (idx === i ? v : x)));
  const items = slots.map((id) => (id ? products?.find((p) => p.id === id) : undefined));

  const rows: { label: string; get: (p: Product) => string }[] = [
    { label: "Category", get: (p) => p.category },
    { label: "Material", get: (p) => p.material },
    { label: "Color", get: (p) => p.color },
    { label: "Style", get: (p) => p.style },
    { label: "Room", get: (p) => p.room },
    { label: "Dimensions", get: (p) => p.dimensions ?? "—" },
    { label: "Rating", get: (p) => `${p.rating ?? "—"} / 5` },
  ];

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <header className="border-b border-border pb-6">
          <h1 className="text-4xl">Compare</h1>
          <p className="mt-2 text-muted-foreground">
            Hold up to three pieces side by side — only your favorited or customized items appear here.
          </p>
        </header>

        {!isLoading && (products?.length ?? 0) === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-border bg-card p-8 text-sm text-muted-foreground">
            Nothing to compare yet. <Link to="/catalog" className="text-primary hover:underline">Add favorites</Link> or <Link to="/customize" className="text-primary hover:underline">customize a piece</Link> to populate this list.
          </div>
        )}


        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {slots.map((id, i) => {
            const p = items[i];
            return (
              <div key={i} className="rounded-2xl border border-border bg-card p-4">
                {p ? (
                  <div>
                    <div className="aspect-square overflow-hidden rounded-xl">
                      <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="mt-3 flex items-start justify-between">
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-muted-foreground">{p.material}</div>
                      </div>
                      <button onClick={() => set(i, null)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-secondary"><X className="h-4 w-4" /></button>
                    </div>
                  </div>
                ) : (
                  <div className="flex aspect-square flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border text-muted-foreground">
                    <Plus className="h-6 w-6" />
                    <span className="text-xs">Add a product</span>
                  </div>
                )}
                <select
                  value={id ?? ""}
                  onChange={(e) => set(i, e.target.value || null)}
                  className="mt-3 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select…</option>
                  {(products ?? []).map((pp) => <option key={pp.id} value={pp.id}>{pp.name}</option>)}
                </select>
              </div>
            );
          })}
        </div>

        {items.some(Boolean) && (
          <div className="mt-10 overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-sm">
              <tbody>
                {rows.map((r) => (
                  <tr key={r.label} className="border-b border-border last:border-0">
                    <th className="bg-card px-5 py-3 text-left font-medium text-muted-foreground">{r.label}</th>
                    {items.map((p, i) => (
                      <td key={i} className="px-5 py-3">{p ? r.get(p) : "—"}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
