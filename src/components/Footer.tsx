import { Instagram, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative mt-32 border-t border-primary/10 pb-10 pt-20">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="font-display text-3xl italic text-primary">Drace Core</div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Small-batch skincare, blended by hand in Bengaluru. A slow ritual, bottled.
            </p>
          </div>
          <FCol title="Shop" items={["Face Care", "Body Care", "Lip Care", "Eye Care"]} />
          <FCol title="Brand" items={["About", "Journal", "Ingredients", "Sustainability"]} />
          <FCol title="Help" items={["Contact", "Shipping", "Returns", "Care Guide"]} />
        </div>
        <div className="hairline mt-16" />
        <div className="mt-6 flex flex-col items-start justify-between gap-4 text-xs uppercase tracking-[0.2em] text-muted-foreground md:flex-row md:items-center">
          <div>© {new Date().getFullYear()} Drace Core · Made in India</div>
          <div className="flex items-center gap-4">
            <a
              href="https://instagram.com"
              className="inline-flex items-center gap-2 hover:text-primary"
            >
              <Instagram className="h-4 w-4" /> Instagram
            </a>
            <a
              href="https://wa.me/919999999999"
              className="inline-flex items-center gap-2 hover:text-primary"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FCol({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="eyebrow">{title}</div>
      <ul className="mt-5 space-y-3">
        {items.map((i) => (
          <li key={i}>
            <a className="text-sm text-primary/80 transition hover:text-accent" href="#">
              {i}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
