import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import logoSrc from "/logo_trasparentheader.png";

/* ── Heritage mandala SVG ornament ── */
function HeritageOrnament() {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      className="absolute inset-0 m-auto"
      aria-hidden="true"
    >
      {/* Outer rotating ring */}
      <motion.circle
        cx="60" cy="60" r="54"
        stroke="oklch(0.65 0.09 75)"
        strokeWidth="0.6"
        strokeDasharray="8 4"
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        style={{ originX: "60px", originY: "60px" }}
      />
      {/* Inner counter-rotating ring */}
      <motion.circle
        cx="60" cy="60" r="44"
        stroke="oklch(0.65 0.09 75 / 0.5)"
        strokeWidth="0.5"
        strokeDasharray="4 6"
        animate={{ rotate: -360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        style={{ originX: "60px", originY: "60px" }}
      />
      {/* 8-petal lotus */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.ellipse
          key={i}
          cx="60" cy="44"
          rx="4" ry="10"
          fill="oklch(0.65 0.09 75 / 0.25)"
          stroke="oklch(0.65 0.09 75)"
          strokeWidth="0.5"
          style={{
            originX: "60px",
            originY: "60px",
            rotate: `${i * 45}deg`,
          }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 + i * 0.06, duration: 0.5 }}
        />
      ))}
      {/* Center dot */}
      <motion.circle
        cx="60" cy="60" r="3"
        fill="oklch(0.65 0.09 75)"
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.4, 1] }}
        transition={{ delay: 0.8, duration: 0.6 }}
      />
      {/* 4 cardinal diamonds */}
      {[0, 90, 180, 270].map((deg, i) => (
        <motion.rect
          key={deg}
          x="58.5" y="26"
          width="3" height="3"
          fill="oklch(0.65 0.09 75)"
          style={{ originX: "60px", originY: "60px", rotate: `${deg + 45}deg` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 + i * 0.08 }}
        />
      ))}
    </svg>
  );
}

/* ── Gold shimmer progress bar ── */
function ProgressBar() {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-[oklch(0.65_0.09_75/0.15)]">
      <motion.div
        className="h-full bg-[oklch(0.65_0.09_75)]"
        initial={{ scaleX: 0, originX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

interface PageLoaderProps {
  /** Pass false to trigger the exit animation */
  visible: boolean;
  onExited?: () => void;
}

export function PageLoader({ visible, onExited }: PageLoaderProps) {
  return (
    <AnimatePresence onExitComplete={onExited}>
      {visible && (
        <motion.div
          key="page-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.7, ease: "easeInOut" } }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[oklch(0.969_0.012_85)]"
          aria-label="Loading Sheinar"
          role="status"
        >
          {/* Ornament container */}
          <div className="relative w-[120px] h-[120px] mb-8">
            <HeritageOrnament />
          </div>

          {/* Logo */}
          <motion.img
            src={logoSrc}
            alt="Sheinar"
            className="h-12 w-auto object-contain"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Tagline */}
          <motion.p
            className="mt-4 font-serif italic text-[oklch(0.55_0.04_70)] text-[11px] tracking-[4px] uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            Heritage · Craft · Soul
          </motion.p>

          <ProgressBar />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Hook: initial page load (home + first visit) ── */
export function usePageLoader() {
  const [loading, setLoading] = useState(true);
  const [exited, setExited] = useState(false);

  useEffect(() => {
    // Minimum display time so the loader feels intentional
    const minTimer = setTimeout(() => setLoading(false), 2400);

    const onLoad = () => {
      clearTimeout(minTimer);
      setTimeout(() => setLoading(false), 2400);
    };

    if (document.readyState === "complete") {
      onLoad();
    } else {
      window.addEventListener("load", onLoad, { once: true });
    }

    return () => {
      clearTimeout(minTimer);
      window.removeEventListener("load", onLoad);
    };
  }, []);

  return { loading, exited, onExited: () => setExited(true) };
}

/* ── Slim route-transition bar (top of page) ── */
export function RouteProgressBar({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="route-bar"
          className="fixed top-0 left-0 right-0 z-[9998] h-[2px] bg-[oklch(0.65_0.09_75)]"
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: 0.85 }}
          exit={{ scaleX: 1, opacity: 0, transition: { duration: 0.3 } }}
          transition={{ duration: 1.8, ease: "easeOut" }}
        />
      )}
    </AnimatePresence>
  );
}
