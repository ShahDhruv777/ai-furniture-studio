import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/site/Layout";
import type { SavedCustomization } from "@/lib/types";
import { Download, Share2, ThumbsUp, ThumbsDown, Trash2, ArrowLeft, Wand2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/result/$id")({
  component: ResultPage,
});

function ResultPage() {
  const { id } = Route.useParams();
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ["saved", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("saved_customizations").select("*").eq("id", id).single();
      if (error) throw error;
      return data as SavedCustomization;
    },
  });

  const del = useMutation({
    mutationFn: async () => {
      await supabase.from("saved_customizations").delete().eq("id", id);
    },
    onSuccess: () => {
      qc.invalidateQueries();
      toast.success("Deleted");
      window.location.href = "/saved";
    },
  });

  if (!data) return <Layout><div className="mx-auto max-w-7xl px-6 py-20"><div className="h-[60vh] animate-pulse rounded-3xl bg-card" /></div></Layout>;

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <Link to="/saved" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to saved</Link>
        <h1 className="mt-4 text-3xl md:text-4xl">{data.product_name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Generated {new Date(data.created_at).toLocaleString()}</p>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <figure>
            <figcaption className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Original</figcaption>
            <div className="aspect-square overflow-hidden rounded-3xl bg-card">
              {data.original_image_url && <img src={data.original_image_url} alt="" className="h-full w-full object-cover" />}
            </div>
          </figure>
          <figure>
            <figcaption className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">AI customization</figcaption>
            <div className="aspect-square overflow-hidden rounded-3xl bg-card">
              <img src={data.image_url} alt="" className="h-full w-full object-cover" />
            </div>
          </figure>
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Prompt</div>
          <p className="mt-2 leading-relaxed">{data.prompt}</p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <a href={data.image_url} download={`factoryoutlet-${id}.png`} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Download className="h-4 w-4" /> Download
          </a>
          <button
            onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied"); }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium hover:bg-secondary"
          >
            <Share2 className="h-4 w-4" /> Share
          </button>
          <Link to="/customize" className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium hover:bg-secondary">
            <Wand2 className="h-4 w-4" /> Regenerate
          </Link>
          <div className="ml-auto flex gap-2">
            <button onClick={() => toast.success("Thanks for the feedback")} className="grid h-10 w-10 place-items-center rounded-full border border-border hover:bg-secondary"><ThumbsUp className="h-4 w-4" /></button>
            <button onClick={() => toast.success("Reported — we'll review")} className="grid h-10 w-10 place-items-center rounded-full border border-border hover:bg-secondary"><ThumbsDown className="h-4 w-4" /></button>
            <button onClick={() => del.mutate()} className="grid h-10 w-10 place-items-center rounded-full border border-destructive/30 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
