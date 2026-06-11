import { MessageCircle, Instagram } from "lucide-react";

export function FloatingActions() {
  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      <FAB href="https://wa.me/919999999999" label="WhatsApp" accent>
        <MessageCircle className="h-5 w-5" />
      </FAB>
      <FAB href="https://instagram.com" label="Instagram">
        <Instagram className="h-5 w-5" />
      </FAB>
    </div>
  );
}

function FAB({
  children,
  href,
  label,
  accent,
}: {
  children: React.ReactNode;
  href: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="group relative flex items-center">
      <span className="pointer-events-none absolute right-full mr-3 -translate-x-2 whitespace-nowrap rounded-full bg-primary px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-primary-foreground opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
        {label}
      </span>
      <span
        aria-label={label}
        className="flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 group-hover:scale-110"
        style={{
          background: accent
            ? "color-mix(in oklab, var(--accent) 90%, transparent)"
            : "color-mix(in oklab, var(--background) 70%, transparent)",
          color: accent ? "var(--accent-foreground)" : "var(--primary)",
          border: "1px solid color-mix(in oklab, var(--primary) 18%, transparent)",
          backdropFilter: "blur(14px) saturate(140%)",
          boxShadow: "var(--shadow-elegant)",
        }}
      >
        {children}
      </span>
    </a>
  );
}
