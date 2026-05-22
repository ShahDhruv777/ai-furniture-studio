import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo-mark.png";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <img src={logo} alt="" className="h-12 w-auto" />
            <div className="flex flex-col leading-none">
              <span className="font-display text-xl">FactoryOutlet</span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Maharaja Group</span>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Premium furniture, reimagined by AI. Browse, customize, and save the pieces that fit your space.
          </p>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Shop</div>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/catalog" className="hover:text-primary">All furniture</Link></li>
            <li><Link to="/favorites" className="hover:text-primary">Favorites</Link></li>
            <li><Link to="/compare" className="hover:text-primary">Compare</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Studio</div>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/customize" className="hover:text-primary">AI Customize</Link></li>
            <li><Link to="/customize" className="hover:text-primary">Open the studio — upload room</Link></li>
            <li><Link to="/saved" className="hover:text-primary">My designs</Link></li>
            <li><Link to="/admin" className="hover:text-primary">Admin</Link></li>
          </ul>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Support</div>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/support" className="hover:text-primary">Contact us</Link></li>
            <li><Link to="/support" className="hover:text-primary">Shipping & returns</Link></li>
            <li><Link to="/support" className="hover:text-primary">FAQ</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} FactoryOutlet. Crafted with care.</span>
          <span>Made with Lovable</span>
        </div>
      </div>
    </footer>
  );
}
