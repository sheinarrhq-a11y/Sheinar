import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/layout/SiteLayout";

export const Route = createFileRoute("/philosophy")({
  head: () => ({
    meta: [
      { title: "Philosophy — Sheinar" },
      {
        name: "description",
        content:
          "Sheinar's design philosophy — rooted in Indian heritage, handcrafted with soul.",
      },
    ],
  }),
  component: PhilosophyPage,
});

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.9,
      delay: i * 0.12,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

const pillars = [
  {
    num: "I",
    title: "Preserving Traditional Art Forms",
    desc: "We honour heritage textile traditions by preserving embroidery, weaving, and handcrafted techniques that carry generations of artistic wisdom.",
  },
  {
    num: "II",
    title: "Empowering Skilled Artisans",
    desc: "Every Sheinar creation celebrates the hands behind the craft, creating opportunities for artisans whose skills deserve recognition, dignity, and continuity.",
  },
  {
    num: "III",
    title: "Encouraging Sustainable Fashion",
    desc: "We believe in mindful craftsmanship over mass production — creating fashion that is conscious, enduring, and respectful of both people and the planet.",
  },
  {
    num: "IV",
    title: "Creating Meaningful Employment",
    desc: "By supporting handlooms and handicrafts, we help sustain communities whose artistry forms an invaluable part of India’s cultural legacy.",
  },
];

export function PhilosophyPage() {
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#f8f5f0]">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_left,_rgba(176,141,87,0.15),_transparent_35%)]" />
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_bottom_right,_rgba(176,141,87,0.15),_transparent_40%)]" />

        <div className="relative z-10 max-w-2xl mx-auto px-4 py-20 md:py-30 text-center">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="lux-eyebrow text-accent"
          >
            Our Ethos
          </motion.span>

          <motion.h3
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="font-serif text-foreground text-2xl md:text-7xl lg:text-2xl mt-6 leading-[1.05]"
          >
            The Sheinar Philosophy
          </motion.h3>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="lux-divider mx-auto mt-8"
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="font-serif italic text-mocha text-lg md:text-2xl mt-8 max-w-3xl mx-auto leading-relaxed"
          >
            Deeply inspired by India’s timeless artistic traditions and the
            beauty of human craftsmanship.
          </motion.p>
        </div>
      </section>

      {/* Intro */}
      <section className="py-8 px-6 max-w-5xl mx-auto text-center">
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="lux-eyebrow text-accent"
        >
          Design Philosophy
        </motion.span>

        <div className="lux-divider mx-auto mt-5 mb-12" />

        {[
          "Sheinar’s design philosophy is deeply inspired by India’s timeless artistic traditions and the beauty of human craftsmanship.",

          "We work with handwoven fabrics, intricate embroideries, and heritage textile techniques that honour the hands behind every creation. In a world dominated by fast fashion and machine-made uniformity, we celebrate the uniqueness, imperfections, and soul of handcrafted artistry.",

          "Our creations blend ethnic aesthetics with contemporary sensibilities, allowing traditional crafts to find their place in the modern wardrobe. Every thread, weave, and embroidery pattern carries the essence of culture, patience, and skilled artistry.",
        ].map((text, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: i * 0.2 }}
            className="font-serif italic text-mocha text-xl md:text-2xl leading-relaxed mb-10"
          >
            {text}
          </motion.p>
        ))}
      </section>

      {/* Philosophy Pillars */}
      <section className="py-24 px-6 bg-[#faf7f2] border-y border-border/40">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="lux-eyebrow text-accent"
            >
              What We Stand For
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="font-serif text-4xl md:text-5xl text-foreground mt-6"
            >
              Craftsmanship With Purpose
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {pillars.map((item, i) => (
              <motion.div
                key={item.num}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={i}
                className="bg-background border border-border/50 rounded-[2rem] p-10 shadow-[0_20px_60px_rgba(0,0,0,0.04)]"
              >
                <span className="font-serif text-accent/30 text-6xl block mb-6">
                  {item.num}
                </span>

                <h3 className="font-serif text-2xl md:text-3xl text-foreground mb-5">
                  {item.title}
                </h3>

                <p className="font-serif italic text-mocha leading-relaxed text-lg">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="bg-[#100f0c] py-32 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="lux-eyebrow text-accent"
          >
            Our Vision
          </motion.span>

          <div className="lux-divider mx-auto mt-5 mb-12" />

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="font-serif text-secondary text-4xl md:text-6xl leading-tight mb-10"
          >
            Fashion that is environmentally conscious, culturally rooted, and
            timeless in spirit.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            className="font-serif italic text-secondary/70 text-lg md:text-xl leading-relaxed max-w-3xl mx-auto"
          >
            Sheinar envisions a world where heritage craftsmanship continues to
            thrive — where tradition and modernity exist in harmony, and every
            creation carries meaning, beauty, and soul.
          </motion.p>
        </div>
      </section>

      {/* Closing Statement */}
      <section className="py-32 px-6 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="lux-divider mx-auto mb-12"
        />

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="font-serif italic text-foreground text-2xl md:text-4xl leading-relaxed"
        >
          “In every thread lives a story. In every creation lives a legacy.”
        </motion.p>

        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.3 }}
          className="lux-eyebrow text-accent mt-8 block"
        >
          — Sheinar
        </motion.span>

        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="lux-divider mx-auto mt-12"
        />
      </section>
    </SiteLayout>
  );
}