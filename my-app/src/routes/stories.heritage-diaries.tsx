import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/layout/SiteLayout";
import hero from "@/assets/hero-1.jpg";
import sarees from "@/assets/collection-sarees.jpg";
import lehengas from "@/assets/collection-lehengas.jpg";
import suits from "@/assets/collection-suits.jpg";

export const Route = createFileRoute("/stories/heritage-diaries")({
  head: () => ({ meta: [{ title: "Heritage Diaries — Sheinar" }] }),
  component: HeritageDiariesPage,
});

const entries = [
  { era: "3000 BCE", title: "The First Threads", desc: "Archaeological evidence from the Indus Valley Civilisation shows cotton cultivation and weaving — making India one of the world's oldest textile traditions.", img: sarees },
  { era: "Mughal Era", title: "The Golden Age of Craft", desc: "The Mughal courts elevated Indian textiles to an art form. Zardozi, Kinkhab, and Brocade weaving reached their zenith under imperial patronage.", img: lehengas },
  { era: "Colonial Period", title: "Resistance Through Cloth", desc: "Gandhi's Swadeshi movement made the handloom a symbol of resistance. The charkha became the emblem of self-reliance and cultural pride.", img: suits },
  { era: "Today", title: "The Revival", desc: "A new generation of designers and artisans is reclaiming India's textile heritage — not as nostalgia, but as a living, breathing practice.", img: sarees },
];

function HeritageDiariesPage() {
  return (
    <SiteLayout>
      <section className="relative h-[75vh] overflow-hidden">
        <motion.img src={hero} alt="Heritage Diaries"
          initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 1.8, ease: "easeOut" }}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/20 to-background" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="lux-eyebrow text-secondary/80">Stories</motion.span>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }}
            className="font-serif text-secondary text-5xl md:text-7xl mt-5 max-w-3xl leading-tight">
            Heritage Diaries
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.5 }}
            className="font-serif italic text-secondary/70 text-lg mt-4">Banaras through the ages</motion.p>
        </div>
      </section>

      <section className="py-24 px-6 max-w-3xl mx-auto text-center">
        <span className="lux-eyebrow">A Living History</span>
        <div className="lux-divider mx-auto mt-4 mb-8" />
        <p className="font-serif italic text-mocha text-xl leading-relaxed">
          India's textile history is not a museum piece — it is alive in every loom, every needle, every thread. These are the chapters of that story.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-28">
        <div className="relative">
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2 hidden md:block" />
          <div className="space-y-16">
            {entries.map((e, i) => (
              <motion.div key={e.era}
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.9, delay: i * 0.1 }}
                className={`relative grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center ${i % 2 === 0 ? "" : "md:[&>*:first-child]:order-2"}`}
              >
                <div className="absolute left-4 md:left-1/2 top-6 w-3 h-3 bg-accent rounded-full -translate-x-1/2 hidden md:block" />
                <div className={`${i % 2 === 0 ? "md:text-right md:pr-12" : "md:pl-12"}`}>
                  <span className="lux-eyebrow block mb-3">{e.era}</span>
                  <h3 className="lux-heading text-2xl md:text-3xl mb-4">{e.title}</h3>
                  <p className="font-serif italic text-mocha leading-relaxed">{e.desc}</p>
                </div>
                <div className={`${i % 2 === 0 ? "md:pl-12" : "md:pr-12 md:text-right"}`}>
                  <img src={e.img} alt={e.title} className="w-full aspect-[4/3] object-cover" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
