import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import h1 from "@/assets/hero-1.jpg";
import cLeh from "@/assets/collection-lehengas.jpg";
import cSar from "@/assets/collection-sarees.jpg";

const slides = [
  { img: h1, eyebrow: "Bridal ·   ", title: "The Heirloom Edit", text: "A trousseau of ivory and antique gold. Made by hand, made to outlast a season." },
  { img: cLeh, eyebrow: "Lehengas", title: "The Bridal Story", text: "Skirts that turn slowly, like memory itself. Each panel embroidered over months." },
  { img: cSar, eyebrow: " ", title: "Woven on the Pit-Loom", text: "Six-and-a-half metres of katan silk and twenty-four carat zari." },
];

export function SplitScreen() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % slides.length), 5500);
    return () => clearInterval(t);
  }, []);
  const s = slides[i];
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[640px]">
      <div className="bg-secondary flex items-center justify-center p-12 lg:p-20 order-2 lg:order-1">
        <AnimatePresence mode="wait">
          <motion.div key={i}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.7 }} className="max-w-md">
            <span className="lux-eyebrow">{s.eyebrow}</span>
            <span className="lux-divider mt-5 mb-5 block" />
            <h2 className="lux-heading text-4xl md:text-5xl mb-6">{s.title}</h2>
            <p className="font-serif italic text-mocha text-lg mb-10 leading-relaxed">{s.text}</p>
            <Link to="/collections" className="lux-btn">Discover</Link>
            <div className="mt-12 flex gap-3">
              {slides.map((_, idx) => (
                <button key={idx} onClick={() => setI(idx)}
                  className={`h-px transition-all duration-500 ${idx === i ? "w-12 bg-foreground" : "w-6 bg-border"}`} />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="relative order-1 lg:order-2 min-h-[420px] lg:min-h-0 overflow-hidden bg-muted">
        <AnimatePresence>
          <motion.img
            key={i} src={s.img} alt={s.title}
            initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>
      </div>
    </section>
  );
}
