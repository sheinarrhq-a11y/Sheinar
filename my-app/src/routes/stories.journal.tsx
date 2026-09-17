import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/layout/SiteLayout";
import hero from "@/assets/hero-2.jpg";
import sarees from "@/assets/collection-sarees.jpg";
import lehengas from "@/assets/collection-lehengas.jpg";
import suits from "@/assets/collection-suits.jpg";

export const Route = createFileRoute("/stories/journal")({
  head: () => ({ meta: [{ title: "Journal — Sheinar" }] }),
  component: JournalPage,
});

const posts = [
  { title: "On the Meaning of Slow Fashion", date: "March 2025", category: "   Notes", img: sarees, excerpt: "In a world that moves too fast, we choose to move slowly. A reflection on why we make fewer pieces, take longer seasons, and resist the culture of disposability." },
  { title: "The Women Who Weave Our World", date: "February 2025", category: "Artisan Stories", img: lehengas, excerpt: "A journey to the karkhanas of  Mohali — meeting the women whose hands bring every Sheinar piece to life." },
  { title: "Zardozi: A Love Letter to Gold", date: "January 2025", category: "Craft", img: suits, excerpt: "The history of Zardozi embroidery, from the Mughal courts to our    — and why we believe it deserves to be preserved." },
];

function JournalPage() {
  return (
    <SiteLayout>
      <section className="relative h-[60vh] overflow-hidden">
        <motion.img src={hero} alt="Journal"
          initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 1.8, ease: "easeOut" }}
          className="absolute inset-0 h-full w-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/20 to-background" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="lux-eyebrow text-secondary/80">Stories</motion.span>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }}
            className="font-serif text-secondary text-5xl md:text-7xl mt-5">
            Journal
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.5 }}
            className="font-serif italic text-secondary/70 text-lg mt-4">Notes from the   </motion.p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {posts.map((post, i) => (
            <motion.article key={post.title}
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.8, delay: i * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="overflow-hidden aspect-[4/3] bg-muted">
                <img src={post.img} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="mt-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="lux-eyebrow">{post.category}</span>
                  <span className="text-border">·</span>
                  <span className="font-sans text-[10px] text-muted-foreground tracking-wide">{post.date}</span>
                </div>
                <h2 className="font-serif text-foreground text-xl group-hover:text-accent transition-colors duration-300 leading-snug">{post.title}</h2>
                <p className="font-serif italic text-mocha text-sm mt-3 leading-relaxed">{post.excerpt}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
