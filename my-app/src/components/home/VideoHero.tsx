import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";

interface VideoHeroProps {
  /** Public path or URL to the video file. Falls back to a poster image if video fails. */
  videoSrc?: string;
  /** Poster image shown while video loads */
  posterSrc?: string;
}

export function VideoHero({ videoSrc, posterSrc }: VideoHeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => {/* autoplay blocked — poster stays visible */});
  }, []);

  return (
    <section className="relative h-screen w-full overflow-hidden bg-foreground">
      {/* Video layer */}
      {videoSrc && (
        <video
          ref={videoRef}
          src={videoSrc}
          poster={posterSrc}
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {/* Fallback poster when no video provided */}
      {!videoSrc && posterSrc && (
        <img src={posterSrc} alt="Sheinar" className="absolute inset-0 h-full w-full object-cover" />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/60" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-end pb-28 px-6 text-center">
        <motion.span
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="block text-[11px] tracking-[6px] uppercase text-secondary/80 mb-6"
        >
       <img src="/logo.png" alt="" />   {/* SHEINAR · Heritage Couture */}
        </motion.span>

        {/* <motion.h1
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="font-serif text-secondary text-5xl md:text-7xl lg:text-8xl leading-[1.05] mb-6 max-w-4xl"
        >
          Woven from<br />the Soul of India
        </motion.h1> */}

        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="font-serif italic text-secondary/75 text-base md:text-lg leading-relaxed mb-12 max-w-xl"
        >
          Handcrafted couture that honours the artisan, the tradition, and the woman who wears it.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.1 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          <Link to="/collections" className="lux-btn lux-btn-light">Explore Collection</Link>
          <Link to="/about/out-story" className="lux-btn lux-btn-light">Our Story</Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-secondary/50 text-[10px] tracking-[4px] uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-8 bg-secondary/40"
        />
      </motion.div>
    </section>
  );
}
