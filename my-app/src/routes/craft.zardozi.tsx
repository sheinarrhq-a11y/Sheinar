import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/layout/SiteLayout";
import hero from "@/assets/hero-2.jpg";
import sarees from "@/assets/collection-sarees.jpg";
import couture from "@/assets/collection-couture.jpg";

export const Route = createFileRoute("/craft/zardozi")({
  head: () => ({ meta: [{ title: "Zardozi — Sheinar" }] }),
  component: ZardoziPage,
});

const steps = [
  { num: "01", title: "The Frame (Adda)", desc: "Fabric is stretched taut on a wooden frame called the adda. The artisan sits cross-legged, working from above." },
  { num: "02", title: "Tracing the Design", desc: "Motifs are traced onto the fabric using chalk or pouncing — intricate patterns passed down through generations." },
  { num: "03", title: "The Hook (Ari)", desc: "A hooked needle called the ari pulls gold or silver thread through the fabric from below, creating each stitch by hand." },
  { num: "04", title: "Embellishment", desc: "Sequins, beads, pearls, and semi-precious stones are added — each placed with intention and cultural meaning." },
  { num: "05", title: "Finishing", desc: "The completed piece is inspected, pressed, and documented before it becomes a Sheinar creation." },
];

function ZardoziPage() {
  return (
    <SiteLayout>
      <section className="relative h-[75vh] overflow-hidden">
        <motion.img src={hero} alt="Zardozi"
          initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 1.8, ease: "easeOut" }}
          className="absolute inset-0 h-full w-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/20 to-background" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="lux-eyebrow text-secondary/80">The Craft</motion.span>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }}
            className="font-serif text-secondary text-5xl md:text-7xl mt-5 max-w-4xl leading-tight">
            Zardozi
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.5 }}
            className="font-serif italic text-secondary/70 text-lg mt-4 max-w-xl">
            Gold thread mastery from the Mughal courts
          </motion.p>
        </div>
      </section>

      <section className="py-24 px-6 max-w-3xl mx-auto text-center">
        <span className="lux-eyebrow">Royal Lineage</span>
        <div className="lux-divider mx-auto mt-4 mb-8" />
        <p className="font-serif italic text-mocha text-xl md:text-2xl leading-relaxed">
          Zardozi — from the Persian zar (gold) and dozi (sewing) — is the art of embroidering with metallic threads, once reserved exclusively for Mughal royalty. Today, the artisans of  Mohali and Lucknow keep this tradition alive, stitch by painstaking stitch.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <motion.img src={couture} alt="Zardozi process"
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
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1 }}
          className="relative overflow-hidden">
          <img src={sarees} alt="Zardozi detail" className="w-full aspect-[21/9] object-cover" />
          <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center">
            <p className="font-serif italic text-secondary text-2xl md:text-4xl text-center max-w-2xl px-6 leading-relaxed">
              "A single Zardozi piece can take four months of unbroken work."
            </p>
          </div>
        </motion.div>
      </section>
    </SiteLayout>
  );
}
