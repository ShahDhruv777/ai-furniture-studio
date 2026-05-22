import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/site/Layout";
import { getSessionId } from "@/lib/session";
import type { SavedCustomization } from "@/lib/types";
import { useEffect, useState } from "react";
import { Search, Sparkles, Trash2, ExternalLink, Download } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/saved")({
  head: () => ({ meta: [{ title: "My designs — FactoryOutlet" }] }),
  component: SavedPage,
});

function SavedPage() {
  const [sid, setSid] = useState("");
  useEffect(() => setSid(getSessionId()), []);
  const [q, setQ] = useState("");
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["saved-list", sid],
    enabled: !!sid,
    queryFn: async () => {
      const { data } = await supabase.from("saved_customizations").select("*").eq("session_id", sid).order("created_at", { ascending: false });
      return (data ?? []) as SavedCustomization[];
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => { await supabase.from("saved_customizations").delete().eq("id", id); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["saved-list", sid] }); toast.success("Deleted"); },
  });

  const items = (data ?? []).filter((d) => q === "" || `${d.product_name} ${d.prompt}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <header className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl">My designs</h1>
            <p className="mt-2 text-muted-foreground">Every AI generation, kept in one place.</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by product or prompt" className="w-full rounded-full border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </header>

        {isLoading ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="aspect-square animate-pulse rounded-2xl bg-card" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-dashed border-border p-16 text-center">
            <Sparkles className="mx-auto h-8 w-8 text-primary" />
            <p className="mt-4 text-lg">No designs yet.</p>
            <p className="mt-1 text-sm text-muted-foreground">Start a customization to see it appear here.</p>
            <Link to="/customize" className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground hover:bg-primary/90">Open studio</Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((it) => (
              <article key={it.id} className="overflow-hidden rounded-2xl border border-border bg-card">
                <div className="aspect-square overflow-hidden">
                  <img src={it.image_url} alt={it.product_name ?? ""} className="h-full w-full object-cover" />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{it.product_name}</div>
                      <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{it.prompt}</div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{new Date(it.created_at).toLocaleDateString()}</span>
                    <div className="flex gap-1">
                      <a href={it.image_url} download className="grid h-8 w-8 place-items-center rounded-full hover:bg-secondary"><Download className="h-3.5 w-3.5" /></a>
                      <Link to="/result/$id" params={{ id: it.id }} className="grid h-8 w-8 place-items-center rounded-full hover:bg-secondary"><ExternalLink className="h-3.5 w-3.5" /></Link>
                      <button onClick={() => del.mutate(it.id)} className="grid h-8 w-8 place-items-center rounded-full text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
