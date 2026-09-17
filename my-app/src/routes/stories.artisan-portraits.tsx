import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/layout/SiteLayout";
import hero from "@/assets/hero-3.jpg";
import sarees from "@/assets/collection-sarees.jpg";
import lehengas from "@/assets/collection-lehengas.jpg";
import suits from "@/assets/collection-suits.jpg";
import couture from "@/assets/collection-couture.jpg";
import phulkari from "@/assets/collection-phulkari.png";

export const Route = createFileRoute("/stories/artisan-portraits")({
  head: () => ({ meta: [{ title: "Artisan Portraits — Sheinar Stories" }] }),
  component: StoriesArtisanPortraitsPage,
});

const portraits = [
  { name: "Meena Kumari", craft: "Phulkari", location: "Patiala, Punjab", img: phulkari, story: "Meena learned Phulkari from her grandmother at age seven. Today, at 54, she teaches 12 women in her village — keeping the tradition alive one stitch at a time." },
  { name: "Zubeda Khatoon", craft: "Zardozi", location: " Mohali, UP", img: lehengas, story: "Zubeda's family has worked in Zardozi for four generations. She is the first woman in her family to run her own workshop, employing 8 other women." },
  { name: "Parvati Devi", craft: "Kantha", location: "Birbhum, WB", img: suits, story: "Parvati's Kantha work tells the story of her village — its festivals, its seasons, its women. Each piece is a living document of rural Bengal." },
  { name: "Anita Bai", craft: "Chikankari", location: "Lucknow, UP", img: couture, story: "Anita has been doing Chikankari for 35 years. She can identify any stitch by touch alone — her fingers have memorised what her eyes no longer need to see." },
];

function StoriesArtisanPortraitsPage() {
  return (
    <SiteLayout>
      <section className="relative h-[75vh] overflow-hidden">
        <motion.img src={hero} alt="Artisan Portraits"
          initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 1.8, ease: "easeOut" }}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/20 to-background" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="lux-eyebrow text-secondary/80">Stories</motion.span>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }}
            className="font-serif text-secondary text-5xl md:text-7xl mt-5 max-w-3xl leading-tight">
            Artisan Portraits
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.5 }}
            className="font-serif italic text-secondary/70 text-lg mt-4">The hands behind the craft</motion.p>
        </div>
      </section>

      <section className="py-24 px-6 max-w-3xl mx-auto text-center">
        <span className="lux-eyebrow">Their Voices</span>
        <div className="lux-divider mx-auto mt-4 mb-8" />
        <p className="font-serif italic text-mocha text-xl leading-relaxed">
          Every Sheinar piece is made by a woman with a name, a story, and a skill passed down through generations. We believe their stories deserve to be told alongside the garments they create.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-28 space-y-24">
        {portraits.map((p, i) => (
          <motion.div key={p.name}
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.9 }}
            className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center ${i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""}`}
          >
            <img src={p.img} alt={p.name} className="w-full aspect-[4/3] object-cover" />
            <div className="space-y-5">
              <span className="lux-eyebrow">{p.craft} · {p.location}</span>
              <h2 className="font-serif text-foreground text-3xl md:text-4xl">{p.name}</h2>
              <p className="font-serif italic text-mocha text-lg leading-relaxed">{p.story}</p>
            </div>
          </motion.div>
        ))}
      </section>
    </SiteLayout>
  );
}
