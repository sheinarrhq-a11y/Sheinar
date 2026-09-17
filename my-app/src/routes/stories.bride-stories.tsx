import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { ProductShowcase } from "@/components/home/ProductShowcase";
import hero from "@/assets/hero-2.jpg";
import lehengas from "@/assets/collection-lehengas.jpg";
import couture from "@/assets/collection-couture.jpg";

export const Route = createFileRoute("/stories/bride-stories")({
  head: () => ({ meta: [{ title: "Bride Stories — Sheinar" }] }),
  component: BrideStoriesPage,
});

const brides: Array<{ name: string; location: string; piece: string; img: string; story: string }> = [];

function BrideStoriesPage() {
  return (
    <SiteLayout>
      <section className="relative h-[75vh] overflow-hidden">
        <motion.img src={hero} alt="Bride Stories"
          initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 1.8, ease: "easeOut" }}
          className="absolute inset-0 h-full w-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/20 to-background" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="lux-eyebrow text-secondary/80">Stories</motion.span>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }}
            className="font-serif text-secondary text-5xl md:text-7xl mt-5 max-w-3xl leading-tight">
            Bride Stories
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.5 }}
            className="font-serif italic text-secondary/70 text-lg mt-4">Real brides, real heirlooms</motion.p>
        </div>
      </section>

      <section className="py-24 px-6 max-w-3xl mx-auto text-center">
        <span className="lux-eyebrow">Their Moments</span>
        <div className="lux-divider mx-auto mt-4 mb-8" />
        <p className="font-serif italic text-mocha text-xl leading-relaxed">
          Every Sheinar bride carries something more than a garment — she carries a story, a tradition, a piece of someone's life's work. These are their words.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-28 space-y-20">
        {brides.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-20 text-center text-muted-foreground">
            No bride stories are available yet.
          </div>
        ) : (
          brides.map((b, i) => (
            <motion.div key={b.name}
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.9 }}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center ${i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""}`}
            >
              <img src={b.img} alt={b.name} className="w-full aspect-[4/3] object-cover" />
              <div className="space-y-6">
                <div className="lux-divider" />
                <blockquote className="font-serif italic text-mocha text-xl leading-relaxed">"{b.story}"</blockquote>
                <div>
                  <p className="font-serif text-foreground text-lg">{b.name}</p>
                  <p className="font-sans text-[10px] tracking-[2px] uppercase text-muted-foreground mt-1">{b.location} · {b.piece}</p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </section>

      <ProductShowcase />
    </SiteLayout>
  );
}
