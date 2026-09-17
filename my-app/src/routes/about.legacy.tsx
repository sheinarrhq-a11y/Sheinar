import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import hero3 from "@/assets/hero-3.jpg";
import sarees from "@/assets/collection-sarees.jpg";
import lehengas from "@/assets/collection-lehengas.jpg";
import couture from "@/assets/collection-couture.jpg";
import suits from "@/assets/collection-suits.jpg";
import phulkari from "@/assets/collection-phulkari.png";

export const Route = createFileRoute("/about/legacy")({
  head: () => ({ meta: [{ title: "The Sheinar Legacy" }] }),
  component: LegacyPage,
});

/* ── Ornamental SVG divider ── */
function OrnamentDivider({ light = false }: { light?: boolean }) {
  const c = light ? "oklch(0.65 0.09 75 / 0.6)" : "oklch(0.65 0.09 75)";
  return (
    <div className="flex items-center justify-center gap-4 my-2">
      <div className="h-px flex-1 max-w-[80px]" style={{ background: c }} />
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <rect x="7" y="0" width="4" height="4" fill={c} transform="rotate(45 9 2)" />
        <rect x="7" y="12" width="4" height="4" fill={c} transform="rotate(45 9 16)" />
        <rect x="0" y="7" width="4" height="4" fill={c} transform="rotate(45 2 9)" />
        <rect x="12" y="7" width="4" height="4" fill={c} transform="rotate(45 16 9)" />
        <circle cx="9" cy="9" r="1.5" fill={c} />
      </svg>
      <div className="h-px flex-1 max-w-[80px]" style={{ background: c }} />
    </div>
  );
}

const milestones = [
  {
    label: "The Beginning",
    title: "A Geographer's Journey",
    body: "Anu Kaushal's travels across India's remote regions introduced her to extraordinary tribal and nomadic craftswomen whose artistry would become Sheinar's foundation. In the silence of distant villages, she heard a language spoken only in thread.",
    img: sarees,
    stat: { value: "12+", unit: "States Explored" },
  },
  {
    label: "The Inspiration",
    title: "Voices in Thread",
    body: "Encountering embroidery traditions on the verge of disappearing, the vision crystallised: create a platform where these voices could be heard, valued, and preserved — not as museum pieces, but as living, breathing art.",
    img: lehengas,
    stat: { value: "200+", unit: "Artisan Families" },
  },
  {
    label: "The Birth",
    title: "Sheinar is Founded",
    body: "Born from a quiet longing, Sheinar opened its doors — a space where traditional craftsmanship and modern expression could coexist. The name itself carries the weight of heritage and the lightness of hope.",
    img: suits,
    stat: { value: "∞", unit: "Stories Woven" },
  },
  {
    label: "The Craft",
    title: "Artisan Partnerships",
    body: "Deep collaborations with artisan communities across India, building relationships rooted in respect, fair practice, and shared purpose. Every partnership is a promise — to the artisan, to the craft, and to the future.",
    img: phulkari,
    stat: { value: "8+", unit: "Craft Traditions" },
  },
  {
    label: "The Future",
    title: "Reawakening Tradition",
    body: "Continuing to revive age-old textile traditions for the modern woman who carries grace, strength, and heritage within her. Tradition is not recreated — it is reawakened, one thread at a time.",
    img: couture,
    stat: { value: "100%", unit: "Handcrafted" },
  },
];

const values = [
  { num: "01", title: "Authenticity", desc: "Every imperfection is a signature. We celebrate the human hand over the machine." },
  { num: "02", title: "Dignity", desc: "Fair practice, fair pay, and deep respect for every artisan who brings our vision to life." },
  { num: "03", title: "Continuity", desc: "We do not preserve traditions behind glass — we wear them, live them, pass them on." },
  { num: "04", title: "Consciousness", desc: "Slow fashion rooted in intention. Every piece is made to be kept, not discarded." },
];

/* ── Parallax hero ── */
function ParallaxHero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);

  return (
    <section ref={ref} className="relative h-[90vh] min-h-[600px] overflow-hidden">
      <motion.div style={{ y }} className="absolute inset-0 scale-110">
        <img src={hero3} alt="The Sheinar Legacy" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/70 via-foreground/30 to-background" />
      </motion.div>

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
        <motion.span
          initial={{ opacity: 0, letterSpacing: "8px" }}
          animate={{ opacity: 1, letterSpacing: "6px" }}
          transition={{ duration: 1.2 }}
          className="lux-eyebrow text-accent mb-6"
        >
          Through Time
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="font-serif text-secondary text-6xl md:text-8xl lg:text-[96px] leading-[0.92] tracking-tight max-w-4xl"
        >
          The Sheinar<br />Legacy
        </motion.h1>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-10 w-16 h-px bg-accent"
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-6 font-serif italic text-secondary/70 text-lg md:text-xl max-w-xl leading-relaxed"
        >
          A living heritage — woven through hands, seasons, and generations.
        </motion.p>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="absolute bottom-10 flex flex-col items-center gap-2"
        >
          <span className="font-sans text-[9px] tracking-[4px] uppercase text-secondary/40">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            className="w-px h-8 bg-secondary/30"
          />
        </motion.div>
      </div>
    </section>
  );
}

/* ── Opening statement ── */
function OpeningStatement() {
  return (
    <section className="py-28 px-6 bg-secondary">
      <div className="max-w-4xl mx-auto text-center">
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="lux-eyebrow"
        >
          A Living Heritage
        </motion.span>
        <OrnamentDivider />
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.1 }}
          className="font-serif text-foreground text-2xl md:text-4xl leading-snug mt-8"
        >
          Legacy is not what we leave behind —<br className="hidden md:block" />
          <em className="italic"> it is what we keep alive.</em>
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.3 }}
          className="font-serif italic text-mocha text-lg md:text-xl leading-relaxed mt-6 max-w-2xl mx-auto"
        >
          At Sheinar, every thread is a promise to the past and a gift to the future. We do not recreate tradition — we reawaken it.
        </motion.p>
      </div>
    </section>
  );
}

/* ── Timeline ── */
function Timeline() {
  return (
    <section className="py-24 px-6 bg-background overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="lux-eyebrow"
          >
            The Journey
          </motion.span>
          <OrnamentDivider />
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9 }}
            className="font-serif text-foreground text-4xl md:text-5xl mt-6"
          >
            Five Chapters of Purpose
          </motion.h2>
        </div>

        <div className="relative">
          {/* Centre spine — desktop */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2 hidden lg:block" />

          <div className="space-y-0">
            {milestones.map((m, i) => {
              const isLeft = i % 2 === 0;
              return (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 1, delay: 0.1 }}
                  className="relative grid grid-cols-1 lg:grid-cols-2 gap-0 items-stretch"
                >
                  {/* Gold dot on spine */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden lg:flex items-center justify-center">
                    <div className="w-4 h-4 bg-accent rounded-full ring-4 ring-background" />
                  </div>

                  {/* Text block */}
                  <div className={`flex items-center ${isLeft ? "lg:justify-end lg:pr-16" : "lg:order-2 lg:pl-16"}`}>
                    <div className={`py-16 px-6 max-w-md w-full ${isLeft ? "lg:text-right" : ""}`}>
                      <span className="lux-eyebrow block mb-3">{m.label}</span>
                      <h3 className="font-serif text-foreground text-3xl md:text-4xl mb-5 leading-tight">{m.title}</h3>
                      <p className="font-serif italic text-mocha text-base md:text-lg leading-relaxed mb-8">{m.body}</p>
                      {/* Stat */}
                      <div className={`inline-flex flex-col ${isLeft ? "lg:items-end" : "items-start"}`}>
                        <span className="font-serif text-accent text-4xl">{m.stat.value}</span>
                        <span className="font-sans text-[10px] tracking-[3px] uppercase text-muted-foreground mt-1">{m.stat.unit}</span>
                      </div>
                    </div>
                  </div>

                  {/* Image block */}
                  <div className={`relative overflow-hidden ${isLeft ? "lg:order-2" : ""}`}>
                    <motion.div
                      initial={{ scale: 1.06 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.4, ease: "easeOut" }}
                      className="h-full min-h-[360px]"
                    >
                      <img
                        src={m.img}
                        alt={m.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-foreground/10" />
                    </motion.div>
                    {/* Chapter number watermark */}
                    <span className="absolute bottom-4 right-5 font-serif text-secondary/20 text-8xl leading-none select-none">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Core values ── */
function CoreValues() {
  return (
    <section className="bg-foreground py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="lux-eyebrow text-accent"
          >
            What We Stand For
          </motion.span>
          <OrnamentDivider light />
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9 }}
            className="font-serif text-secondary text-4xl md:text-5xl mt-6"
          >
            The Pillars of Sheinar
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-secondary/10">
          {values.map((v, i) => (
            <motion.div
              key={v.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              className="bg-foreground p-10 group hover:bg-foreground/80 transition-colors duration-500"
            >
              <span className="font-serif text-accent/30 text-6xl block mb-6">{v.num}</span>
              <h3 className="font-serif text-secondary text-2xl mb-4">{v.title}</h3>
              <div className="w-8 h-px bg-accent mb-5 group-hover:w-16 transition-all duration-500" />
              <p className="font-serif italic text-secondary/60 text-sm leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Artisan promise full-bleed ── */
function ArtisanPromise() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section ref={ref} className="relative py-48 overflow-hidden">
      <motion.div style={{ y }} className="absolute inset-0 scale-110">
        <img src={couture} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-foreground/72" />
      </motion.div>
      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="lux-eyebrow text-accent"
        >
          The Artisan Promise
        </motion.span>
        <OrnamentDivider light />
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="font-serif text-secondary text-4xl md:text-6xl leading-tight mt-8 mb-8"
        >
          Hands That Keep<br />Traditions Alive
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.3 }}
          className="font-serif italic text-secondary/70 text-lg leading-relaxed mb-12"
        >
          Behind every Sheinar piece are artisans whose skilled hands keep fading traditions alive. At Sheinar, tradition is not recreated — it is reawakened for the modern woman who carries grace, strength, and heritage within her.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <Link to="/collections" className="lux-btn lux-btn-light">Explore the Collection</Link>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Closing quote ── */
function ClosingQuote() {
  return (
    <section className="py-32 px-6 bg-secondary text-center">
      <div className="max-w-3xl mx-auto">
        <OrnamentDivider />
        <motion.blockquote
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="font-serif text-foreground text-2xl md:text-4xl leading-snug mt-8 mb-6"
        >
          "The legacy continues —<br />
          <em className="italic text-accent">one thread at a time.</em>"
        </motion.blockquote>
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.3 }}
          className="lux-eyebrow"
        >
          — Sheinar
        </motion.span>
        <OrnamentDivider />
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-10"
        >
          <Link to="/about/out-story" className="lux-btn">Discover Our Story</Link>
        </motion.div>
      </div>
    </section>
  );
}

function LegacyPage() {
  return (
    <SiteLayout>
      <ParallaxHero />
      <OpeningStatement />
      <Timeline />
      <CoreValues />
      <ArtisanPromise />
      <ClosingQuote />
    </SiteLayout>
  );
}
