import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { ArrowUpRight, Leaf, HandHeart, Sparkles, MapPin } from "lucide-react";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { FlowingBackground } from "@/components/FlowingBackground";
import { Navigation } from "@/components/Navigation";
import { FloatingActions } from "@/components/FloatingActions";
import { ProductCard } from "@/components/ProductCard";
import { Footer } from "@/components/Footer";
import { createClient } from "@/lib/supabase/client";
import { fetchProducts, fetchProductsByCategory, categories } from "@/lib/products";
import type { Product } from "@/lib/products";
import heroBottle from "@/assets/hero-bottle.jpg";
import aboutHands from "@/assets/about-hands.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Drace Core — Handcrafted skincare for everyday rituals" },
      { name: "description", content: "Small-batch, handcrafted skincare made in India." },
    ],
  }),
  component: Index,
});

function Index() {
  const [activeCat, setActiveCat] = useState<string>("All");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts().then((data) => {
      setAllProducts(data);
      setFiltered(data.filter((p) => p.show_on_homepage).slice(0, 6));
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const homepageProducts = allProducts.filter((p) => p.show_on_homepage);
    if (activeCat === "All") {
      setFiltered(homepageProducts.slice(0, 6));
    } else {
      setFiltered(homepageProducts.filter((p) => p.category === activeCat).slice(0, 6));
    }
  }, [activeCat, allProducts]);

  return (
    <div className="relative min-h-screen text-foreground isolate">
      <FlowingBackground />
      <Navigation />
      <FloatingActions />
      <main className="relative">
        <Hero />
        <Marquee />
        <Featured products={allProducts} loading={loading} />
        <Values />
        <Shop active={activeCat} setActive={setActiveCat} filtered={filtered} loading={loading} />
        <Testimonials />
        <AboutPreview />
        <ContactPreview />
      </main>
      <Footer />
    </div>
  );
}

/* ---------- Hero ---------- */
function Hero() {
  return (
    <section className="relative overflow-hidden pt-36 lg:pt-44">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-end gap-12 px-6 pb-24 lg:grid-cols-[1.15fr_1fr] lg:px-12">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
            className="eyebrow flex items-center gap-3"
          >
            <span className="h-px w-10 bg-primary/30" />
            Est. 2024 · Bengaluru
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="show"
            transition={{ staggerChildren: 0.08, delayChildren: 0.1 }}
            className="mt-6 font-display text-[clamp(2.6rem,7vw,5.6rem)] leading-[0.98] tracking-tight text-primary"
          >
            {["Handcrafted", "skincare for", "everyday"].map((w, i) => (
              <motion.span
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 24 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.9, ease: [0.2, 0.7, 0.2, 1] },
                  },
                }}
                className="block"
              >
                {w}
              </motion.span>
            ))}
            <motion.span
              variants={{
                hidden: { opacity: 0, y: 24 },
                show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.2, 0.7, 0.2, 1] } },
              }}
              className="block italic text-accent"
              style={{ fontWeight: 400 }}
            >
              rituals.
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="mt-8 max-w-md text-[15px] leading-relaxed text-muted-foreground"
          >
            Slow-blended formulas of cold-pressed botanicals, sea minerals and quiet indulgence —
            bottled in small batches, made to be lingered over.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.75 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <a href="#shop" className="btn-primary">
              Shop the collection <ArrowUpRight className="h-4 w-4" />
            </a>
            <a href="#about" className="btn-ghost">
              Our story
            </a>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.2, 0.7, 0.2, 1] }}
          className="relative"
        >
          <div
            className="relative aspect-[4/5] overflow-hidden rounded-sm"
            style={{ boxShadow: "var(--shadow-elegant)" }}
          >
            <img
              src={heroBottle}
              alt="Drace Core hero serum"
              fetchPriority="high"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-6 left-6 max-w-[220px] rounded-sm bg-background/85 p-4 backdrop-blur"
              style={{ boxShadow: "var(--shadow-soft)" }}
            >
              <div className="eyebrow">New release</div>
              <div className="mt-1 font-display text-lg text-primary">Amber Glow Serum</div>
              <div className="mt-1 text-xs text-muted-foreground">Vitamin C · 30ml</div>
            </motion.div>
          </div>
          <div className="mt-4 flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            <span>No. 001</span>
            <span>Small batch · 412 of 500</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------- Marquee ---------- */
function Marquee() {
  const items = [
    "Cold-pressed botanicals",
    "Cruelty free",
    "Made in India",
    "Plastic-light packaging",
    "Small batch",
    "Handblended",
  ];
  return (
    <div className="overflow-hidden border-y border-primary/10 py-6">
      <div className="flex w-max animate-marquee gap-16 whitespace-nowrap pr-16">
        {[...items, ...items, ...items].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-16 text-[0.78rem] uppercase tracking-[0.32em] text-primary/70"
          >
            <span>{t}</span>
            <span className="inline-block h-1 w-1 rounded-full bg-accent" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Featured ---------- */
function Featured({ products, loading }: { products: Product[]; loading: boolean }) {
  const bestSellers = products.filter((p) => p.is_best_seller).slice(0, 4);

  if (!loading && bestSellers.length === 0) return null;

  return (
    <section className="relative py-28">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="flex items-end justify-between gap-8">
          <div>
            <div className="eyebrow">Featured</div>
            <h2 className="mt-3 max-w-xl font-display text-[clamp(2rem,4vw,3.4rem)] leading-tight text-primary">
              A quiet edit of <span className="italic text-accent">our bestsellers</span>.
            </h2>
          </div>
          <Link
            to="/shop"
            className="hidden text-[0.78rem] uppercase tracking-[0.22em] text-primary/80 hover:text-accent md:inline-flex md:items-center md:gap-2"
          >
            View all <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? [...Array(4)].map((_, i) => (
                <div key={i} className="flex flex-col gap-4">
                  <div className="aspect-[4/5] w-full animate-pulse rounded-sm bg-secondary/50" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-secondary/50" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-secondary/50" />
                </div>
              ))
            : bestSellers.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </div>
    </section>
  );
}

/* ---------- Values ---------- */
function Values() {
  const items = [
    {
      Icon: Leaf,
      title: "Natural ingredients",
      body: "Cold-pressed oils, botanical extracts, nothing fillers.",
    },
    {
      Icon: HandHeart,
      title: "Handcrafted",
      body: "Blended by hand in small batches in our Bengaluru studio.",
    },
    { Icon: Sparkles, title: "Cruelty free", body: "Tested on rituals — never on animals." },
    { Icon: MapPin, title: "Made in India", body: "Sourced and produced locally, end to end." },
  ];
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div
          className="w-full rounded-[32px] p-6 md:p-10 border shadow-lg backdrop-blur-md bg-white/20 border-white/30"
          style={{ boxShadow: "var(--shadow-soft)" }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {items.map(({ Icon, title, body }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.08 }}
                className="flex flex-col items-center px-6 py-8 text-center group transition-all duration-300 border-b border-white/20 last:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0"
              >
                <Icon
                  className="h-6 w-6 text-accent group-hover:-translate-y-1 group-hover:text-primary transition-all duration-300"
                  strokeWidth={1.4}
                />
                <div className="mt-5 font-display text-lg text-primary/85 group-hover:text-primary transition-colors duration-300">
                  {title}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground group-hover:text-primary/70 transition-colors duration-300">
                  {body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Shop ---------- */
function Shop({
  active,
  setActive,
  filtered,
  loading,
}: {
  active: string;
  setActive: (c: string) => void;
  filtered: Product[];
  loading: boolean;
}) {
  return (
    <section id="shop" className="relative py-28">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div>
            <div className="eyebrow">Shop</div>
            <h2 className="mt-3 font-display text-[clamp(2rem,4vw,3.4rem)] leading-tight text-primary">
              The full <span className="italic text-accent">collection</span>.
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActive(c)}
                className="rounded-full border px-4 py-2 text-[0.72rem] uppercase tracking-[0.22em] transition"
                style={{
                  borderColor:
                    active === c
                      ? "var(--primary)"
                      : "color-mix(in oklab, var(--primary) 18%, transparent)",
                  background: active === c ? "var(--primary)" : "transparent",
                  color:
                    active === c
                      ? "var(--primary-foreground)"
                      : "color-mix(in oklab, var(--primary) 75%, transparent)",
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="flex flex-col gap-4">
                <div className="aspect-[4/5] w-full animate-pulse rounded-sm bg-secondary/50" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-secondary/50" />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="col-span-full py-16 text-center text-sm text-muted-foreground">
              New {active.toLowerCase()} pieces — coming soon.
            </div>
          ) : (
            filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)
          )}
        </div>

        {!loading && (
          <div className="mt-16 flex justify-center">
            <Link to="/shop" className="btn-ghost inline-flex items-center gap-2">
              Explore Shop <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------- About Preview ---------- */
function AboutPreview() {
  return (
    <section id="about" className="relative py-28">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-14 px-6 lg:grid-cols-2 lg:px-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="relative aspect-[4/5] overflow-hidden rounded-sm"
          style={{ boxShadow: "var(--shadow-elegant)" }}
        >
          <img
            src={aboutHands}
            alt="Hands holding a ceramic bowl of cream"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </motion.div>

        <div>
          <div className="eyebrow">Our story</div>
          <h2 className="mt-3 font-display text-[clamp(2rem,4vw,3.4rem)] leading-tight text-primary">
            Skincare as a <span className="italic text-accent">slow ceremony</span>.
          </h2>
          <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
            Drace Core began at a quiet table in Bengaluru — a small set of jars, a curiosity for
            botanical chemistry, and the belief that looking after yourself should feel like an
            unhurried ritual, not a transaction.
          </p>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
            Today, every formula is still blended by hand in batches of fewer than five hundred —
            numbered, dated, signed.
          </p>
          <Link to="/about" className="btn-ghost mt-10 inline-flex">
            Read our story
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------- Contact Preview ---------- */
function ContactPreview() {
  return (
    <section id="contact" className="relative py-28">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div
          className="relative overflow-hidden rounded-sm p-10 md:p-16"
          style={{
            background: "color-mix(in oklab, var(--secondary) 55%, transparent)",
            border: "1px solid color-mix(in oklab, var(--primary) 10%, transparent)",
            boxShadow: "var(--shadow-soft)",
          }}
        >
          <div className="grid gap-10 md:grid-cols-[1.3fr_1fr]">
            <div>
              <div className="eyebrow">Contact</div>
              <h2 className="mt-3 max-w-xl font-display text-[clamp(2rem,4vw,3.2rem)] leading-tight text-primary">
                Talk to a human, on <span className="italic text-accent">WhatsApp</span>.
              </h2>
              <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted-foreground">
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
            <div className="grid content-start gap-6 text-sm text-primary/80">
              <Detail label="Studio" value="14, MG Road, Bengaluru 560001" />
              <Detail label="Hours" value="Mon — Sat · 10:00 to 18:00 IST" />
              <Detail label="Care" value="care@dracecore.com" />
              <Detail label="Wholesale" value="trade@dracecore.com" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="eyebrow">{label}</div>
      <div className="mt-1.5 font-display text-lg leading-snug text-primary">{value}</div>
    </div>
  );
}

type Testimonial = {
  id: string;
  name: string;
  location: string | null;
  review: string;
  rating: number;
  image_url: string | null;
};

/* ---------- Testimonials ---------- */
function Testimonials() {
  const [list, setList] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("testimonials")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .then(({ data }) => {
        setList(data || []);
        setLoading(false);
      });
  }, []);

  if (!loading && list.length === 0) return null;

  return (
    <section className="relative py-28 border-y border-primary/5">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <div className="eyebrow">Testimonials</div>
          <h2 className="font-display text-[clamp(2rem,4vw,3.4rem)] leading-tight text-primary">
            Lingering <span className="italic text-accent">impressions</span>.
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Real stories from people who have integrated our small-batch formulas into their daily
            skincare rituals.
          </p>
        </div>

        {loading ? (
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl h-64 bg-[#E8D8C8]/10 border border-[#E8D8C8]/20"
              />
            ))}
          </div>
        ) : (
          <>
            {/* Desktop & Tablet Grid */}
            <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
              {list.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.08 }}
                  className="group flex flex-col justify-between rounded-2xl border border-white/30 bg-white/20 p-8 shadow-md backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="space-y-4">
                    <div className="text-amber-500 text-sm flex gap-0.5">
                      {"★".repeat(t.rating) + "☆".repeat(5 - t.rating)}
                    </div>
                    <p className="text-sm italic leading-relaxed text-primary/80 group-hover:text-primary transition-colors">
                      "{t.review}"
                    </p>
                  </div>

                  <div className="mt-8 flex items-center gap-4">
                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-white/40 shadow-sm bg-neutral-100">
                      {t.image_url ? (
                        <img
                          src={t.image_url}
                          alt={t.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-primary/5 text-xs text-primary/50 uppercase font-medium">
                          {t.name[0]}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-display text-sm font-semibold text-primary">{t.name}</p>
                      {t.location && (
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
                          {t.location}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Mobile Carousel (Horizontal Scroll Snap) */}
            <div className="flex sm:hidden overflow-x-auto snap-x snap-mandatory gap-6 pb-6 mt-12 scrollbar-none">
              {list.map((t) => (
                <div
                  key={t.id}
                  className="w-[85vw] shrink-0 snap-center flex flex-col justify-between rounded-2xl border border-white/30 bg-white/20 p-6 shadow-md backdrop-blur-md"
                >
                  <div className="space-y-4">
                    <div className="text-amber-500 text-sm flex gap-0.5">
                      {"★".repeat(t.rating) + "☆".repeat(5 - t.rating)}
                    </div>
                    <p className="text-sm italic leading-relaxed text-primary/80">"{t.review}"</p>
                  </div>

                  <div className="mt-6 flex items-center gap-4">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/40 shadow-sm bg-neutral-100">
                      {t.image_url ? (
                        <img
                          src={t.image_url}
                          alt={t.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-primary/5 text-xs text-primary/50 uppercase font-medium">
                          {t.name[0]}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-display text-sm font-semibold text-primary">{t.name}</p>
                      {t.location && (
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
                          {t.location}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <style>{`
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
