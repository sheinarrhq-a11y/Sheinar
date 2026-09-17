import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { ProductShowcase } from "@/components/home/ProductShowcase";
import hero from "@/assets/hero-1.jpg";
import sarees from "@/assets/collection-sarees.jpg";
import lehengas from "@/assets/collection-lehengas.jpg";

export const Route = createFileRoute("/campaigns/heirloom-edit")({
  head: () => ({ meta: [{ title: "The Heirloom Edit — Sheinar" }] }),
  component: HeirloomEditPage,
});

function HeirloomEditPage() {
  return (
    <SiteLayout>
      <section className="relative h-[90vh] overflow-hidden">
        <motion.img src={hero} alt="The Heirloom Edit"
          initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 2, ease: "easeOut" }}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/50 via-foreground/20 to-background" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="lux-eyebrow text-secondary/80">Spring · Banaras</motion.span>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }}
            className="font-serif text-secondary text-5xl md:text-8xl mt-5 max-w-4xl leading-tight">
            The Heirloom Edit
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.5 }}
            className="font-serif italic text-secondary/70 text-lg mt-6 max-w-2xl leading-relaxed">
            A trousseau of ivory and antique gold. Pieces made to outlast a season — made to outlast a lifetime.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.8 }} className="mt-10">
            <Link to="/collections" className="lux-btn lux-btn-light">Explore the Edit</Link>
          </motion.div>
        </div>
      </section>

      <section className="py-24 px-6 max-w-3xl mx-auto text-center">
        <span className="lux-eyebrow">The Story</span>
        <div className="lux-divider mx-auto mt-4 mb-8" />
        <p className="font-serif italic text-mocha text-xl leading-relaxed">
          The Heirloom Edit is our most considered collection — pieces chosen not for the season, but for the decades. Each garment is handcrafted in our  Mohali   , using techniques that have remained unchanged for centuries.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <img src={sarees} alt="Heirloom Edit" className="w-full aspect-[4/5] object-cover" />
        <img src={lehengas} alt="Heirloom Edit" className="w-full aspect-[4/5] object-cover" />
      </section>

      <ProductShowcase />
    </SiteLayout>
  );
}
