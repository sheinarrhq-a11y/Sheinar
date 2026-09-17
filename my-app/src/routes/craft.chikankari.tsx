import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/layout/SiteLayout";
import hero from "@/assets/hero-3.jpg";
import lehengas from "@/assets/collection-lehengas.jpg";
import suits from "@/assets/collection-suits.jpg";

export const Route = createFileRoute("/craft/chikankari")({
  head: () => ({ meta: [{ title: "Chikankari — Sheinar" }] }),
  component: ChikankariPage,
});

const stitches = [
  { name: "Taipchi", desc: "The most basic running stitch — the foundation of all Chikankari work, creating delicate shadow effects." },
  { name: "Bakhiya", desc: "Shadow work done from the reverse side of the fabric, creating a subtle, ghostly floral impression." },
  { name: "Murri", desc: "A tiny knot stitch forming rice-grain shapes — used to fill flower centres and create texture." },
  { name: "Phanda", desc: "Smaller than Murri, these millet-grain knots create the finest textural details in the embroidery." },
  { name: "Jali", desc: "Open lattice work created by pulling threads apart — the most intricate and prized of all Chikankari techniques." },
  { name: "Keel Kangan", desc: "Chain stitch variation creating bold outlines and borders with a raised, rope-like appearance." },
];

function ChikankariPage() {
  return (
    <SiteLayout>
      <section className="relative h-[75vh] overflow-hidden">
        <motion.img src={hero} alt="Chikankari"
          initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 1.8, ease: "easeOut" }}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/20 to-background" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="lux-eyebrow text-secondary/80">The Craft</motion.span>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }}
            className="font-serif text-secondary text-5xl md:text-7xl mt-5 max-w-4xl leading-tight">
            Chikankari
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.5 }}
            className="font-serif italic text-secondary/70 text-lg mt-4 max-w-xl">
            Shadow-work poetry from the city of Nawabs
          </motion.p>
        </div>
      </section>

      <section className="py-24 px-6 max-w-3xl mx-auto text-center">
        <span className="lux-eyebrow">Lucknow's Gift</span>
        <div className="lux-divider mx-auto mt-4 mb-8" />
        <p className="font-serif italic text-mocha text-xl md:text-2xl leading-relaxed">
          Chikankari is the poetry of the needle — delicate white thread on fine muslin, creating shadow and light through over 32 distinct stitches. Born in the courts of Lucknow, it is said to have been introduced by Nur Jahan herself.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start mb-24">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {stitches.map((s, i) => (
              <motion.div key={s.name}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.7, delay: i * 0.08 }}
                className="border border-border p-6 hover:border-accent transition-colors duration-300"
              >
                <h3 className="font-serif text-foreground text-lg mb-3">{s.name}</h3>
                <p className="font-serif italic text-mocha text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
          <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 1 }}>
            <img src={lehengas} alt="Chikankari detail" className="w-full aspect-[4/5] object-cover" />
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1 }}
          className="relative overflow-hidden">
          <img src={suits} alt="Chikankari" className="w-full aspect-[21/9] object-cover" />
          <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center">
            <p className="font-serif italic text-secondary text-2xl md:text-4xl text-center max-w-2xl px-6 leading-relaxed">
              "The needle whispers what the heart cannot say."
            </p>
          </div>
        </motion.div>
      </section>
    </SiteLayout>
  );
}
