import { Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  LogOut,
  Menu,
  X,
  Home,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { verifyAdminUser } from "@/lib/auth/admin";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/homepage", label: "Homepage", icon: Home },
  { to: "/admin/testimonials", label: "Testimonials", icon: MessageSquare },
  { to: "/admin/customers", label: "Customers", icon: Users },
] as const;

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checking, setChecking] = useState(true);
  const [denied, setDenied] = useState(false);

  const checkAdmin = useCallback(async () => {
    if (loading) return;

    if (!user) {
      navigate({ to: "/admin/login", replace: true });
      return;
    }

    try {
      const isAdmin = await verifyAdminUser(user.id);
      if (!isAdmin) {
        setDenied(true);
        await signOut();
        window.location.assign("/admin/login");
        return;
      }
      setChecking(false);
    } catch (err) {
      console.error("AdminLayout: Admin check failed:", err);
      setDenied(true);
      window.location.assign("/admin/login");
    }
  }, [user, loading, navigate, signOut]);

  useEffect(() => {
    void checkAdmin();
  }, [checkAdmin]);

  async function handleSignOut() {
    try {
      await signOut();
    } finally {
      window.location.assign("/admin/login");
    }
  }

  if (loading || checking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#FAF7F4]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2D2A26]/20 border-t-[#2D2A26]" />
        <p className="text-sm text-[#2D2A26]/50">Loading admin panel...</p>
      </div>
    );
  }

  if (denied) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[#FAF7F4]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: "color-mix(in oklab, #FAF7F4 95%, transparent)",
          backdropFilter: "blur(20px)",
          borderRight: "1px solid color-mix(in oklab, #2D2A26 8%, transparent)",
        }}
      >
        <div className="flex items-center justify-between border-b border-[#2D2A26]/8 px-6 py-5">
          <div>
            <p className="font-display text-xl italic text-[#2D2A26]">Drace Core</p>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#2D2A26]/50">Admin Panel</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="text-[#2D2A26]/50 lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-6">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: "exact" in item ? item.exact : false }}
              className="flex items-center gap-3 rounded-sm px-4 py-3 text-sm text-[#2D2A26]/70 transition hover:bg-[#2D2A26]/5 hover:text-[#2D2A26]"
              activeProps={{
                className:
                  "flex items-center gap-3 rounded-sm px-4 py-3 text-sm bg-[#2D2A26] text-white",
              }}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="space-y-1 border-t border-[#2D2A26]/8 px-4 py-4">
          <p className="truncate px-4 py-2 text-[10px] uppercase tracking-[0.15em] text-[#2D2A26]/40">
            {user?.email}
          </p>
          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="flex w-full items-center gap-3 rounded-sm px-4 py-3 text-sm text-[#2D2A26]/70 transition hover:bg-[#2D2A26]/5 hover:text-[#2D2A26]"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div
          className="flex items-center gap-4 border-b border-[#2D2A26]/8 px-6 py-4 lg:hidden"
          style={{ background: "color-mix(in oklab, #FAF7F4 95%, transparent)" }}
        >
          <button onClick={() => setSidebarOpen(true)} className="text-[#2D2A26]/70">
            <Menu className="h-5 w-5" />
          </button>
          <p className="font-display text-lg italic text-[#2D2A26]">Drace Core Admin</p>
        </div>

        <main className="flex-1 overflow-auto p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
