import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { AboutSubNav } from "@/components/about/AboutSubNav";
import hero1 from "@/assets/hero-1.jpg";
import sarees from "@/assets/collection-sarees.jpg";
import lehengas from "@/assets/collection-lehengas.jpg";
import suits from "@/assets/collection-suits.jpg";
import couture from "@/assets/collection-couture.jpg";
import phulkari from "@/assets/collection-phulkari.png";
  
export const Route = createFileRoute("/about/art-of-embroidery")({
  head: () => ({ meta: [{ title: "Art of Embroidery — Sheinar" }] }),
  component: ArtOfEmbroideryPage,
});

const crafts = [
  { name: "Zardozi", origin: "Mughal Courts", desc: "Gold and silver thread work of royal lineage, each motif a testament to centuries of refinement.", img: sarees },
  { name: "Chikankari", origin: "Lucknow", desc: "Delicate shadow-work embroidery on fine muslin — the poetry of the needle.", img: lehengas },
  { name: "Kantha", origin: "Bengal", desc: "Running stitch storytelling passed through generations of women, each thread a memory.", img: suits },
  { name: "Phulkari", origin: "Punjab", desc: "Vibrant floral embroidery celebrating life's milestones — from birth to bridal.", img: phulkari },
];

function ArtOfEmbroideryPage() {
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative h-[75vh] overflow-hidden">
        <motion.img src={hero1} alt="Art of Embroidery"
          initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 1.8, ease: "easeOut" }}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/20 to-background" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="lux-eyebrow text-secondary/80">The Craft</motion.span>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }}
            className="font-serif text-secondary text-5xl md:text-7xl mt-5 max-w-4xl leading-tight">
            Art of Embroidery
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.5 }}
            className="font-serif italic text-secondary/70 text-lg mt-4 max-w-xl">
            A timeless artistic language passed through generations
          </motion.p>
        </div>
      </section>

      <AboutSubNav active="art-of-embroidery" />

      {/* Intro */}
      <section className="py-24 px-6 max-w-3xl mx-auto text-center">
        <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="lux-eyebrow">Ancient Artistry</motion.span>
        <div className="lux-divider mx-auto mt-4 mb-8" />
        <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1 }}
          className="font-serif italic text-mocha text-xl md:text-2xl leading-relaxed">
          Embroidery is not merely decoration — it is a timeless artistic language passed through generations. References to embroidery appear in Vedic literature dating back thousands of years, reflecting its deep cultural significance.
        </motion.p>
      </section>

      {/* Craft grid */}
      <section className="max-w-7xl mx-auto px-6 pb-28">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {crafts.map((craft, i) => (
            <motion.div key={craft.name}
              initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.9, delay: i * 0.1 }}
              className="group relative overflow-hidden cursor-default"
            >
              <div className="relative overflow-hidden aspect-[4/3]">
                <img src={craft.img} alt={craft.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <span className="lux-eyebrow text-accent/80 block mb-2">{craft.origin}</span>
                <h3 className="font-serif text-secondary text-3xl mb-3">{craft.name}</h3>
                <p className="font-serif italic text-secondary/70 text-sm leading-relaxed max-w-sm
                  opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                  {craft.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Vedic reference banner */}
      <section className="relative py-32 overflow-hidden">
        <img src={lehengas} alt="" className="absolute inset-0 w-full h-full object-cover opacity-15" />
        <div className="absolute inset-0 bg-background/80" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="lux-eyebrow">Vedic Heritage</motion.span>
          <div className="lux-divider mx-auto mt-4 mb-10" />
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1 }}
            className="lux-heading text-4xl md:text-5xl mb-8">
            Thousands of Years of Artistry
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.3 }}
            className="font-serif italic text-mocha text-lg md:text-xl leading-relaxed">
            At Sheinar, we honour these traditions by working directly with artisans from tribal and nomadic communities — women whose extraordinary skills are reflections of their heritage and creativity. Every stitch is a conversation between past and present.
          </motion.p>
        </div>
      </section>
    </SiteLayout>
  );
}
