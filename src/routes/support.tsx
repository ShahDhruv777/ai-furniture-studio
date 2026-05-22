import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { useState } from "react";
import { toast } from "sonner";
import { Mail, MessageCircle, ChevronDown, Send } from "lucide-react";
import { z } from "zod";

export const Route = createFileRoute("/support")({
  head: () => ({ meta: [{ title: "Support — FactoryOutlet" }] }),
  component: SupportPage,
});

const FAQS = [
  { q: "How does AI customization work?", a: "Pick a product, describe the change (material, color, finish), and our model re-renders a photoreal preview while preserving the silhouette and proportions." },
  { q: "Can I order the AI-generated version?", a: "Most material and color customizations can be fulfilled in 4–8 weeks. Contact us with your saved design for a tailored quote." },
  { q: "What is the return policy?", a: "30-day returns on stocked items. Bespoke pieces are made-to-order and final sale once production begins." },
  { q: "Do you ship internationally?", a: "We ship across the EU and US. Other regions on request." },
];

const schema = z.object({
  name: z.string().trim().min(1, "Required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  category: z.string().min(1),
  message: z.string().trim().min(10, "Tell us a bit more").max(1000),
});

function SupportPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [form, setForm] = useState({ name: "", email: "", category: "General", message: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(form);
    if (!r.success) { toast.error(r.error.issues[0].message); return; }
    toast.success("Message received. We'll reply within 1 business day.");
    setForm({ name: "", email: "", category: "General", message: "" });
  };

  return (
    <Layout>
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="border-b border-border pb-6">
          <h1 className="text-4xl">Support</h1>
          <p className="mt-2 text-muted-foreground">Real answers from a small team. We reply within one business day.</p>
        </header>

        <div className="mt-10 grid gap-10 md:grid-cols-2">
          <section>
            <h2 className="text-2xl">FAQ</h2>
            <div className="mt-4 divide-y divide-border rounded-2xl border border-border bg-card">
              {FAQS.map((f, i) => (
                <button key={i} onClick={() => setOpenIdx(openIdx === i ? null : i)} className="w-full px-5 py-4 text-left">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-medium">{f.q}</span>
                    <ChevronDown className={`h-4 w-4 transition ${openIdx === i ? "rotate-180" : ""}`} />
                  </div>
                  {openIdx === i && <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>}
                </button>
              ))}
            </div>
            <div className="mt-6 grid gap-3">
              <a href="mailto:factoryoutletmaharajagroup@gmail.com" className="flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 hover:bg-secondary">
                <Mail className="h-5 w-5 text-primary" /><span className="text-sm">factoryoutletmaharajagroup@gmail.com</span>
              </a>
              <a href="https://wa.me/919825277725" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 hover:bg-secondary">
                <MessageCircle className="h-5 w-5 text-primary" /><span className="text-sm">WhatsApp +91 98252 77725</span>
              </a>
            </div>
          </section>

          <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-2xl">Contact us</h2>
            <div className="mt-6 space-y-4">
              <Field label="Name"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" /></Field>
              <Field label="Email"><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" /></Field>
              <Field label="Topic">
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm">
                  <option>General</option><option>Customization help</option><option>Shipping</option><option>Issue report</option>
                </select>
              </Field>
              <Field label="Message"><textarea rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" /></Field>
            </div>
            <button className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              <Send className="h-4 w-4" /> Send message
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span><div className="mt-2">{children}</div></label>;
}
