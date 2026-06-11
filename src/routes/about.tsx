import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Navigation } from "@/components/Navigation";
import { FloatingActions } from "@/components/FloatingActions";
import { Footer } from "@/components/Footer";
import aboutHands from "@/assets/about-hands.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Drace Core" },
      {
        name: "description",
        content: "The story behind Drace Core, a small Bengaluru skincare studio.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <Navigation />
      <FloatingActions />
      <main className="mx-auto grid max-w-[1400px] grid-cols-1 gap-14 px-6 pb-24 pt-44 lg:grid-cols-2 lg:px-12">
        <div>
          <div className="eyebrow">About</div>
          <h1 className="mt-3 font-display text-[clamp(2.4rem,6vw,4.6rem)] leading-[1.02] text-primary">
            A slow ceremony, <span className="italic text-accent">bottled</span>.
          </h1>
          <p className="mt-8 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
            Drace Core began at a quiet table in Bengaluru. A small set of jars, a curiosity for
            botanical chemistry, and the belief that looking after yourself should feel like an
            unhurried ritual.
          </p>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
            Every formula is blended by hand in batches of fewer than five hundred — numbered,
            dated, signed.
          </p>
          <Link to="/" className="btn-ghost mt-10">
            Back to home
          </Link>
        </div>
        <div
          className="relative aspect-[4/5] overflow-hidden rounded-sm"
          style={{ boxShadow: "var(--shadow-elegant)" }}
        >
          <img
            src={aboutHands}
            alt="Hands holding cream"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
