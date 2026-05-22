import { Link } from "@tanstack/react-router";
import { Heart, Sparkles, LayoutGrid, Menu, X } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo-mark.png";

const nav = [
  { to: "/catalog", label: "Catalog" },
  { to: "/customize", label: "Customize" },
  { to: "/saved", label: "Saved" },
  { to: "/compare", label: "Compare" },
  { to: "/support", label: "Support" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3" aria-label="FactoryOutlet — Maharaja Group">
          <img src={logo} alt="" className="h-10 w-auto md:h-11" />
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg tracking-tight md:text-xl">FactoryOutlet</span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Maharaja Group</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-sm text-foreground font-medium" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Link
            to="/favorites"
            className="grid h-9 w-9 place-items-center rounded-full border border-border text-foreground transition hover:bg-secondary"
            aria-label="Favorites"
          >
            <Heart className="h-4 w-4" />
          </Link>
          <Link
            to="/customize"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            <Sparkles className="h-4 w-4" /> Start designing
          </Link>
        </div>
        <button
          className="grid h-9 w-9 place-items-center rounded-full border border-border md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="flex flex-col gap-1 p-4">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm text-foreground hover:bg-secondary"
              >
                {n.label}
              </Link>
            ))}
            <Link
              to="/favorites"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm text-foreground hover:bg-secondary"
            >
              Favorites
            </Link>
            <Link
              to="/admin"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary"
            >
              <LayoutGrid className="mr-2 inline h-4 w-4" /> Admin
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
