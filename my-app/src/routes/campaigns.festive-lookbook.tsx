import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { ProductShowcase } from "@/components/home/ProductShowcase";
import hero from "@/assets/hero-3.jpg";
import sarees from "@/assets/collection-sarees.jpg";
import suits from "@/assets/collection-suits.jpg";

export const Route = createFileRoute("/campaigns/festive-lookbook")({
  head: () => ({ meta: [{ title: "Festive Lookbook — Sheinar" }] }),
  component: FestiveLookbookPage,
});

function FestiveLookbookPage() {
  return (
    <SiteLayout>
      <section className="relative h-[90vh] overflow-hidden">
        <motion.img src={hero} alt="Festive Lookbook"
          initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 2, ease: "easeOut" }}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/50 via-foreground/20 to-background" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="lux-eyebrow text-secondary/80">Diwali & Wedding Season</motion.span>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }}
            className="font-serif text-secondary text-5xl md:text-8xl mt-5 max-w-4xl leading-tight">
            Festive Lookbook
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.5 }}
            className="font-serif italic text-secondary/70 text-lg mt-6 max-w-2xl leading-relaxed">
            Dress the celebration. Pieces that honour the occasion — and the woman wearing them.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.8 }} className="mt-10">
            <Link to="/collections" className="lux-btn lux-btn-light">Shop Festive</Link>
          </motion.div>
        </div>
      </section>

      <section className="py-24 px-6 max-w-3xl mx-auto text-center">
        <span className="lux-eyebrow">The Season</span>
        <div className="lux-divider mx-auto mt-4 mb-8" />
        <p className="font-serif italic text-mocha text-xl leading-relaxed">
          From Diwali diyas to wedding mandaps — our festive edit is curated for every celebration on the calendar. Rich fabrics, luminous embroidery, and silhouettes that move with you through the night.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <img src={sarees} alt="Festive" className="w-full aspect-[4/5] object-cover" />
        <img src={suits} alt="Festive" className="w-full aspect-[4/5] object-cover" />
      </section>

      <ProductShowcase />
    </SiteLayout>
  );
}
