import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, Search, ShoppingBag, User, Instagram, Package, Heart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/contexts/WishlistContext";

const links = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const { itemCount, openCart } = useCart();
  const { itemCount: wishlistCount, openWishlist } = useWishlist();
  const { user, signOut } = useAuth();

  async function handleSignOut() {
    setAccountOpen(false);
    try {
      await signOut();
    } finally {
      window.location.assign("/login");
    }
  }

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const userLabel =
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    user?.email?.split("@")[0] ??
    "Account";

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 transition-all duration-500"
      style={{
        backdropFilter: scrolled ? "blur(18px) saturate(140%)" : "blur(0px)",
        backgroundColor: scrolled
          ? "color-mix(in oklab, var(--background) 78%, transparent)"
          : "transparent",
        borderBottom: scrolled
          ? "1px solid color-mix(in oklab, var(--primary) 10%, transparent)"
          : "1px solid transparent",
      }}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 lg:px-12">
        <Link to="/" className="flex items-center gap-3">
          <span className="font-display text-2xl italic tracking-tight text-primary">Drace</span>
          <span className="hidden h-4 w-px bg-primary/30 sm:block" />
          <span className="hidden text-[0.65rem] uppercase tracking-[0.4em] text-primary/70 sm:block">
            Core
          </span>
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="group relative text-[0.78rem] uppercase tracking-[0.22em] text-primary/80 transition hover:text-primary"
              activeProps={{ className: "text-primary" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-accent transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 text-primary">
          <IconBtn label="Search">
            <Search className="h-[18px] w-[18px]" />
          </IconBtn>

          <IconBtn label="Wishlist" badge={wishlistCount} onClick={openWishlist}>
            <Heart className="h-[18px] w-[18px]" />
          </IconBtn>
          <IconBtn label="Instagram" href="https://instagram.com">
            <Instagram className="h-[18px] w-[18px]" />
          </IconBtn>

          {/* Account Dropdown */}
          <div className="relative">
            <IconBtn label="Account" onClick={() => setAccountOpen((open) => !open)}>
              <User className="h-[18px] w-[18px]" />
            </IconBtn>
            {accountOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setAccountOpen(false)} />
                <div
                  className="absolute right-0 top-full z-50 mt-2 min-w-[180px] rounded-sm py-2 shadow-lg"
                  style={{
                    background: "color-mix(in oklab, var(--background) 95%, transparent)",
                    border: "1px solid color-mix(in oklab, var(--primary) 10%, transparent)",
                  }}
                >
                  {user ? (
                    <>
                      <p className="truncate px-4 py-2 text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                        {userLabel}
                      </p>
                      <Link
                        to="/orders"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-primary/80 transition hover:bg-primary/5 hover:text-primary"
                      >
                        <Package className="h-3.5 w-3.5" />
                        My orders
                      </Link>
                      <button
                        type="button"
                        onClick={() => void handleSignOut()}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-primary/80 transition hover:bg-primary/5 hover:text-primary"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        Sign out
                      </button>
                    </>
                  ) : (
                    <Link
                      to="/login"
                      search={{ redirect: undefined }}
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-primary/80 transition hover:bg-primary/5 hover:text-primary"
                    >
                      <User className="h-3.5 w-3.5" />
                      Sign in
                    </Link>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Cart */}
          <IconBtn label="Cart" badge={itemCount} onClick={openCart}>
            <ShoppingBag className="h-[18px] w-[18px]" />
          </IconBtn>
        </div>
      </div>
    </header>
  );
}

function IconBtn({
  children,
  label,
  href,
  badge,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  href?: string;
  badge?: number;
  onClick?: () => void;
}) {
  const className =
    "relative inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-primary/5";
  const badgeEl =
    badge !== undefined && badge > 0 ? (
      <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-medium text-white">
        {badge}
      </span>
    ) : null;

  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" aria-label={label} className={className}>
        {children}
        {badgeEl}
      </a>
    );
  }

  return (
    <button type="button" aria-label={label} className={className} onClick={onClick}>
      {children}
      {badgeEl}
    </button>
  );
}
