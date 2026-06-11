import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Navigation } from "@/components/Navigation";
import { FloatingActions } from "@/components/FloatingActions";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Drace Core" },
      { name: "description", content: "Reach the Drace Core studio on WhatsApp or email." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <Navigation />
      <FloatingActions />
      <main className="mx-auto max-w-[1400px] px-6 pb-24 pt-44 lg:px-12">
        <div className="eyebrow">Contact</div>
        <h1 className="mt-3 font-display text-[clamp(2.4rem,6vw,4.6rem)] leading-[1.02] text-primary">
          Say <span className="italic text-accent">hello</span>.
        </h1>
        <div className="mt-12 grid gap-10 md:grid-cols-2">
          <div>
            <p className="max-w-md text-[15px] leading-relaxed text-muted-foreground">
              For orders, ingredient questions or just a recommendation — write to us. We usually
              reply within a few hours.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <a href="https://wa.me/919999999999" className="btn-primary">
                Message on WhatsApp
              </a>
              <a href="mailto:hello@dracecore.com" className="btn-ghost">
                hello@dracecore.com
              </a>
            </div>
          </div>
          <div className="space-y-6">
            <Row label="Studio" value="14, MG Road, Bengaluru 560001" />
            <Row label="Hours" value="Mon — Sat · 10:00 to 18:00 IST" />
            <Row label="Care" value="care@dracecore.com" />
            <Row label="Wholesale" value="trade@dracecore.com" />
          </div>
        </div>
        <Link to="/" className="btn-ghost mt-16">
          Back to home
        </Link>
      </main>
      <Footer />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="eyebrow">{label}</div>
      <div className="mt-1.5 font-display text-lg leading-snug text-primary">{value}</div>
    </div>
  );
}
