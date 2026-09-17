import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/layout/SiteLayout";
import hero from "@/assets/hero-1.jpg";
import sarees from "@/assets/collection-sarees.jpg";
import lehengas from "@/assets/collection-lehengas.jpg";
import suits from "@/assets/collection-suits.jpg";
import couture from "@/assets/collection-couture.jpg";

export const Route = createFileRoute("/campaigns/artisan-portraits")({
  head: () => ({ meta: [{ title: "Artisan Portraits — Sheinar" }] }),
  component: ArtisanPortraitsPage,
});

const artisans = [
  { name: "Razia Begum", craft: "Zardozi", location: " Mohali, UP", years: "32 years", img: sarees, quote: "My mother taught me. Her mother taught her. The needle is our language." },
  { name: "Kamla Devi", craft: "Chikankari", location: "Lucknow, UP", years: "28 years", img: lehengas, quote: "Each stitch is a prayer. I don't count them — I feel them." },
  { name: "Sunita Bai", craft: "Kantha", location: "Murshidabad, WB", years: "40 years", img: suits, quote: "We stitch our stories into the cloth. Every piece is a memory." },
  { name: "Fatima Sheikh", craft: "Banarasi Weaving", location: " Mohali, UP", years: "22 years", img: couture, quote: "The loom is alive. You have to listen to it." },
];

function ArtisanPortraitsPage() {
  return (
    <SiteLayout>
      <section className="relative h-[75vh] overflow-hidden">
        <motion.img src={hero} alt="Artisan Portraits"
          initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 1.8, ease: "easeOut" }}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/20 to-background" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="lux-eyebrow text-secondary/80">Behind the Karkhana</motion.span>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }}
            className="font-serif text-secondary text-5xl md:text-7xl mt-5 max-w-4xl leading-tight">
            Artisan Portraits
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.5 }}
            className="font-serif italic text-secondary/70 text-lg mt-4 max-w-xl">
            The hands behind every Sheinar creation
          </motion.p>
        </div>
      </section>

      <section className="py-24 px-6 max-w-3xl mx-auto text-center">
        <span className="lux-eyebrow">Their Stories</span>
        <div className="lux-divider mx-auto mt-4 mb-8" />
        <p className="font-serif italic text-mocha text-xl md:text-2xl leading-relaxed">
          Behind every Sheinar piece are women whose extraordinary skills are reflections of their heritage and creativity. We travel to their workshops, sit beside them, and listen. These are their stories.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-28">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {artisans.map((a, i) => (
            <motion.div key={a.name}
              initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.9, delay: i * 0.1 }}
            >
              <div className="relative overflow-hidden aspect-[4/3]">
                <img src={a.img} alt={a.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <span className="lux-eyebrow text-accent/80 block mb-1">{a.craft} · {a.location}</span>
                  <h3 className="font-serif text-secondary text-2xl">{a.name}</h3>
                  <p className="font-sans text-[10px] tracking-[2px] uppercase text-secondary/60 mt-1">{a.years} of craft</p>
                </div>
              </div>
              <blockquote className="mt-6 px-2">
                <p className="font-serif italic text-mocha text-lg leading-relaxed">"{a.quote}"</p>
                <footer className="mt-3 lux-eyebrow">— {a.name}</footer>
              </blockquote>
            </motion.div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
