import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";

const links = [
  { label: "Founder's Vision", to: "/about/founders-vision", key: "founders-vision" },
  // { label: "Art of Embroidery", to: "/about/art-of-embroidery", key: "art-of-embroidery" },
  // { label: "The   ", to: "/about/  ", key: "  " },
  // { label: "Legacy", to: "/about/legacy", key: "legacy" },
];

export function AboutSubNav({ active }: { active: string }) {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
      className="mt-[80px] z-40 bg-background/95 backdrop-blur-sm border-b border-border"
    >
      <div className="max-w-7xl mx-auto px-6 overflow-x-auto">
        <div className="flex items-center gap-0 min-w-max">
          {links.map((l) => (
            <Link
              key={l.key}
              to={l.to}
              className={`relative px-5 py-4 font-sans text-[11px] tracking-[2.5px] uppercase transition-colors duration-300 whitespace-nowrap
                ${active === l.key ? "text-accent" : "text-muted-foreground hover:text-foreground"}`}
            >
              {l.label}
              {active === l.key && (
                <motion.div layoutId="about-subnav-indicator" className="absolute bottom-0 left-0 right-0 h-px bg-accent" />
              )}
            </Link>
          ))}
        </div>
      </div>
    </motion.nav>
  );
}
