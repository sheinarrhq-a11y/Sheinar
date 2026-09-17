import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/layout/SiteLayout";
import hero from "@/assets/hero-1.jpg";
import sarees from "@/assets/collection-sarees.jpg";
import lehengas from "@/assets/collection-lehengas.jpg";
import suits from "@/assets/collection-suits.jpg";
import couture from "@/assets/collection-couture.jpg";

export const Route = createFileRoute("/craft/handloom-weaves")({
  head: () => ({ meta: [{ title: "Handloom Weaves — Sheinar" }] }),
  component: HandloomWeavesPage,
});

const weaves = [
  { name: "Banarasi Katan Silk", origin: " Mohali", desc: "Woven on the pit-loom over weeks, Katan silk is the finest of Banarasi weaves — dense, lustrous, and heavy with real zari.", img: sarees },
  { name: "Chanderi", origin: "Madhya Pradesh", desc: "Sheer, lightweight fabric with a crisp texture — woven with silk warp and cotton weft, adorned with delicate butis.", img: lehengas },
  { name: "Jamdani", origin: "Bengal", desc: "A UNESCO-recognised craft — supplementary weft technique creating intricate floral motifs directly on the loom.", img: suits },
  { name: "Paithani", origin: "Maharashtra", desc: "Handwoven silk with oblique interlocking tapestry technique, each saree taking months to complete.", img: couture },
];

function HandloomWeavesPage() {
  return (
    <SiteLayout>
      <section className="relative h-[75vh] overflow-hidden">
        <motion.img src={hero} alt="Handloom Weaves"
          initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 1.8, ease: "easeOut" }}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/20 to-background" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="lux-eyebrow text-secondary/80">The Craft</motion.span>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }}
            className="font-serif text-secondary text-5xl md:text-7xl mt-5 max-w-4xl leading-tight">
            Handloom Weaves
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.5 }}
            className="font-serif italic text-secondary/70 text-lg mt-4 max-w-xl">
            Threads of tradition, woven by hand across generations
          </motion.p>
        </div>
      </section>

      <section className="py-24 px-6 max-w-3xl mx-auto text-center">
        <span className="lux-eyebrow">Pit-Loom Traditions</span>
        <div className="lux-divider mx-auto mt-4 mb-8" />
        <p className="font-serif italic text-mocha text-xl md:text-2xl leading-relaxed">
          India's handloom heritage is among the richest in the world. Each weave carries the identity of its region — its soil, its water, its people. At Sheinar, we work directly with master weavers to bring these living traditions into the modern wardrobe.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-28">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {weaves.map((w, i) => (
            <motion.div key={w.name}
              initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.9, delay: i * 0.1 }}
              className="group relative overflow-hidden"
            >
              <div className="relative overflow-hidden aspect-[4/3]">
                <img src={w.img} alt={w.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <span className="lux-eyebrow text-accent/80 block mb-2">{w.origin}</span>
                <h3 className="font-serif text-secondary text-3xl mb-3">{w.name}</h3>
                <p className="font-serif italic text-secondary/70 text-sm leading-relaxed max-w-sm opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">{w.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="relative py-32 overflow-hidden">
        <img src={sarees} alt="" className="absolute inset-0 w-full h-full object-cover opacity-15" />
        <div className="absolute inset-0 bg-background/80" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <span className="lux-eyebrow">Our Promise</span>
          <div className="lux-divider mx-auto mt-4 mb-10" />
          <p className="font-serif italic text-mocha text-lg md:text-xl leading-relaxed">
            Every Sheinar handloom piece is woven by artisans paid fairly for their time and skill. We believe slow fashion begins at the loom — and that the hours spent weaving deserve to be honoured in the price of every piece.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
