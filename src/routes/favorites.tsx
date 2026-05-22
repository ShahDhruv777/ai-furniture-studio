import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/site/Layout";
import { getSessionId } from "@/lib/session";
import type { Product } from "@/lib/types";
import { Heart, Trash2, Wand2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/favorites")({
  head: () => ({ meta: [{ title: "Favorites — FactoryOutlet" }] }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const [sid, setSid] = useState("");
  useEffect(() => setSid(getSessionId()), []);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["favorites", sid],
    enabled: !!sid,
    queryFn: async () => {
      const { data } = await supabase.from("favorites").select("product_id, products(*)").eq("session_id", sid);
      return (data ?? []).map((r: any) => r.products as Product).filter(Boolean);
    },
  });

  const remove = useMutation({
    mutationFn: async (productId: string) => {
      await supabase.from("favorites").delete().eq("session_id", sid).eq("product_id", productId);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["favorites", sid] }); toast.success("Removed"); },
  });

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <header className="border-b border-border pb-6">
          <h1 className="text-4xl">Favorites</h1>
          <p className="mt-2 text-muted-foreground">Pieces you want to revisit, all in one place.</p>
        </header>

        {isLoading ? null : !data || data.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-dashed border-border p-16 text-center">
            <Heart className="mx-auto h-8 w-8 text-primary" />
            <p className="mt-4 text-lg">No favorites yet.</p>
            <Link to="/catalog" className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground hover:bg-primary/90">Browse the catalog</Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((p) => (
              <div key={p.id} className="group rounded-2xl border border-border bg-card overflow-hidden">
                <Link to="/product/$slug" params={{ slug: p.slug }} className="block aspect-[4/5] overflow-hidden">
                  <img src={p.image_url} alt={p.name} className="h-full w-full object-cover transition group-hover:scale-105" />
                </Link>
                <div className="p-4">
                  <div className="text-sm">
                    <span className="font-medium">{p.name}</span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{p.material}</div>
                  <div className="mt-4 flex gap-2">
                    <Link to="/customize" search={{ product: p.slug }} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-3 py-2 text-xs text-primary-foreground hover:bg-primary/90">
                      <Wand2 className="h-3 w-3" /> Customize
                    </Link>
                    <button onClick={() => remove.mutate(p.id)} className="grid h-9 w-9 place-items-center rounded-full border border-border text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
