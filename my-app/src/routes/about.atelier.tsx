import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { AboutSubNav } from "@/components/about/AboutSubNav";
import hero from "@/assets/hero.png";
import couture from "@/assets/collection-couture.jpg";
import suits from "@/assets/collection-suits.jpg";
import storeBanner from "@/assets/store-banner.jpg";

export const Route = createFileRoute("/about/atelier")({
  head: () => ({ meta: [{ title: "The    — Sheinar" }] }),
  component:   Page,
});

const steps = [
  { num: "01", title: "Concept & Inspiration", desc: "Each collection begins with deep research into regional textile traditions, archival references, and artisan communities." },
  { num: "02", title: "Artisan Collaboration", desc: "We travel to source communities, working hand-in-hand with master craftspeople to develop exclusive techniques." },
  { num: "03", title: "Handloom & Weave", desc: "Fabrics are handwoven on traditional looms — a process that can take weeks for a single length of cloth." },
  { num: "04", title: "Embroidery & Embellishment", desc: "Skilled hands apply intricate embroidery, each motif placed with intention and cultural meaning." },
  { num: "05", title: "Finishing & Curation", desc: "Every piece is hand-finished, quality-reviewed, and documented before it becomes a Sheinar creation." },
];

function   Page() {
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative h-[75vh] overflow-hidden">
        <motion.img src={storeBanner} alt="The   "
          initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 1.8, ease: "easeOut" }}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/20 to-background" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="lux-eyebrow text-secondary/80">Where It Begins</motion.span>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }}
            className="font-serif text-secondary text-5xl md:text-7xl mt-5 max-w-3xl leading-tight">
            The Designer's   
          </motion.h1>
        </div>
      </section>

      <AboutSubNav active="  " />

      {/* Intro */}
      <section className="py-24 px-6 max-w-3xl mx-auto text-center">
        <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="lux-eyebrow">The Process</motion.span>
        <div className="lux-divider mx-auto mt-4 mb-8" />
        <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1 }}
          className="font-serif italic text-mocha text-xl md:text-2xl leading-relaxed">
          Every Sheinar creation is born from a meticulous process that honours both the artisan's skill and the wearer's story.
        </motion.p>
      </section>

      {/* Process steps */}
      <section className="max-w-7xl mx-auto px-6 pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <motion.img src={couture} alt="   process"
            initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 1 }}
            className="w-full aspect-[4/5] object-cover"
          />
          <div className="space-y-0">
            {steps.map((step, i) => (
              <motion.div key={step.num}
                initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.7, delay: i * 0.1 }}
                className="border-b border-border py-8 group"
              >
                <div className="flex items-start gap-6">
                  <span className="font-serif text-accent/40 text-3xl leading-none mt-1">{step.num}</span>
                  <div>
                    <h3 className="font-serif text-foreground text-xl mb-2 group-hover:text-accent transition-colors duration-300">{step.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Wide image */}
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1 }}
          className="relative overflow-hidden">
          <img src={suits} alt="Sheinar   " className="w-full aspect-[21/9] object-cover" />
          <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center">
            <p className="font-serif italic text-secondary text-2xl md:text-4xl text-center max-w-2xl px-6 leading-relaxed">
              "We make few pieces. We take long seasons."
            </p>
          </div>
        </motion.div>
      </section>
    </SiteLayout>
  );
}
