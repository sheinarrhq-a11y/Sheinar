import { useEffect, useState, memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import h1 from "@/assets/1.jpg";
import h2 from "@/assets/2.jpg";
import h3 from "@/assets/3.jpg";

const slides: Array<{
  img: string;
  eyebrow: string;
  title: string;
  subtitle: string;
}> = [];

// No demo slides are configured for this component; it is not used in the active home page.

/* ── Memoised slide image — only re-renders when src changes ── */
const SlideImage = memo(({ src, alt, priority }: { src: string; alt: string; priority: boolean }) => (
  <img
    src={src}
    alt={alt}
    className="h-full w-full object-cover"
    fetchPriority={priority ? "high" : "low"}
    decoding={priority ? "sync" : "async"}
    loading="eager"
  />
));

/* ── Memoised slide text — only re-renders when content changes ── */
const SlideText = memo(({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) => (
  <motion.div className="max-w-3xl">
    <motion.span
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="block text-[11px] tracking-[6px] uppercase text-secondary/90 mb-6"
    >
      {eyebrow}
    </motion.span>
    <motion.h2
      initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="font-serif text-secondary text-5xl md:text-7xl lg:text-8xl mb-6"
    >
      {title}
    </motion.h2>
    <motion.p
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.55 }}
      className="font-serif italic text-secondary/85 text-base md:text-lg leading-relaxed mb-10 max-w-xl mx-auto"
    >
      {subtitle}
    </motion.p>
    <motion.div
      initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.75 }}
      className="flex flex-wrap gap-4 justify-center"
    >
      <Link to="/collections" className="lux-btn lux-btn-light">Discover</Link>
      <Link to="/collections" className="lux-btn lux-btn-light">Explore Collection</Link>
    </motion.div>
  </motion.div>
));

export function Hero() {
  if (!slides.length) return null;

  const [i, setI] = useState(0);

  const next = useCallback(() => setI((p) => (p + 1) % slides.length), []);

  useEffect(() => {
    const t = setInterval(next, 4500);
    return () => clearInterval(t);
  }, [next]);

  const s = slides[i];

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">
      <AnimatePresence mode="sync">
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.04 }}
            animate={{ scale: 1 }}
            transition={{ duration: 5, ease: "linear" }}
          >
            <SlideImage src={s.img} alt={s.title} priority={i === 0} />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-black/30" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 h-full flex flex-col items-center justify-end pb-24 px-6 text-center">
        <AnimatePresence mode="wait">
          <SlideText key={i} eyebrow={s.eyebrow} title={s.title} subtitle={s.subtitle} />
        </AnimatePresence>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3">
          {slides.map((_, idx) => (
            <button key={idx} onClick={() => setI(idx)} aria-label={`Slide ${idx + 1}`}
              className={`h-px transition-all duration-700 ${idx === i ? "w-14 bg-secondary" : "w-8 bg-secondary/40"}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
