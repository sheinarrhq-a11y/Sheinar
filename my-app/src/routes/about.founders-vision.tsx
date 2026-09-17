import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { AboutSubNav } from "@/components/about/AboutSubNav";

export const Route = createFileRoute("/about/founders-vision")({
  head: () => ({ meta: [{ title: "Founder's Vision — Sheinar" }] }),
  component: FoundersVisionPage,
});

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9 } },
};

function FoundersVisionPage() {
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden text-secondary">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_left,_rgba(255,208,129,0.18),_transparent_32%)]" />
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_bottom_right,_rgba(198,169,132,0.18),_transparent_30%)]" />

        {/* <div className="relative max-w-6xl mx-auto px-6 py-24 md:py-32 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight mt-6 max-w-4xl mx-auto"
          >
            My Story
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4 }}
            className="font-serif italic text-black sm:text-lg md:text-xl mt-6 max-w-3xl mx-auto leading-relaxed"
          >
            A journey inspired by culture, craftsmanship, and the timeless
            artistry of embroidery traditions.
          </motion.p>
        </div> */}
      </section>

      <AboutSubNav active="founders-vision" />

      <section className="py-20 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16">
          <div className="space-y-4">
            <span className="lux-eyebrow text-accent">
              Founder & Creative Visionary
            </span>

            <h2 className="font-serif text-4xl xl:text-5xl text-foreground">
               Anu Kaushal
            </h2>

            <p className="font-serif italic text-mocha leading-relaxed">
              A geographer and passionate observer of cultures, dedicated to
              preserving traditional craftsmanship through meaningful and
              conscious fashion.
            </p>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {[
              "As a geographer and a passionate observer of cultures, I have always been fascinated by the diversity of traditions, lifestyles, and artistic expressions across India and the world.",

              "My travels and experiences introduced me to the remarkable craftsmanship of Artisans from tribal and nomadic communities living in remote regions — women whose embroidery and weaving skills are extraordinary reflections of their heritage and creativity. Their artistry became the inspiration behind Sheinar.",

              "I wanted to create a space where traditional craftsmanship could coexist with modern expression — where forgotten and vanishing embroidery traditions could once again be appreciated and preserved.",

              "Born and raised in India, a land celebrated for its rich cultural heritage and diversity, I have always believed that embroidery is not merely decoration, but a timeless artistic language passed through generations.",

              "References to embroidery even appear in Vedic literature dating back thousands of years, reflecting its deep cultural significance.",

              "Through Sheinar, my vision is to uplift artisan communities, revive age-old textile traditions, and create conscious fashion that carries meaning, heritage, and soul.",
            ].map((text, index) => (
              <motion.p
                key={index}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={index}
                className="font-serif text-mocha text-base md:text-lg leading-relaxed"
              >
                {text}
              </motion.p>
            ))}
          </div>
        </div>
{/* 
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="bg-foreground border border-border p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.08)]"
          >
            <span className="lux-eyebrow text-accent">Our Purpose</span>

            <h3 className="font-serif text-3xl mt-5 mb-4 text-secondary">
              Preserving Heritage Through Craft
            </h3>

            <p className="font-serif italic text-mocha leading-relaxed">
              Sheinar was created to celebrate the beauty of traditional
              embroidery and weaving while empowering the artisan communities
              who keep these timeless traditions alive.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={1}
            className="bg-foreground border border-border p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.08)]"
          >
            <span className="lux-eyebrow text-accent">The Vision</span>

            <h3 className="font-serif text-3xl mt-5 mb-4 text-secondary">
              Tradition Meets Modern Expression
            </h3>

            <p className="font-serif italic text-mocha leading-relaxed">
              Every Sheinar creation blends cultural heritage with contemporary
              elegance, ensuring that handcrafted artistry remains relevant,
              valued, and meaningful for generations to come.
            </p>
          </motion.div>
        </div> */}

        {/* <div className="space-y-14">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              {
                title: "Uplift Artisans",
                text: "Support women artisans and craft communities by creating opportunities that honor their talent and heritage.",
              },
              {
                title: "Revive Traditions",
                text: "Preserve and revive age-old embroidery and weaving techniques that are slowly disappearing.",
              },
              {
                title: "Conscious Fashion",
                text: "Create meaningful fashion rooted in culture, craftsmanship, and timeless beauty.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-background border border-border p-8 rounded-3xl"
              >
                <h4 className="font-serif text-2xl text-foreground mb-3">
                  {item.title}
                </h4>

                <p className="font-serif italic text-mocha leading-relaxed">
                  {item.text}
                </p>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={1}
            className="space-y-6"
          >
            <span className="lux-eyebrow text-accent">
              What Guides Sheinar
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                "Respect for heritage and craftsmanship.",
                "Empowerment of artisan communities.",
                "Preservation of cultural identity.",
                "Fashion created with purpose and soul.",
              ].map((line) => (
                <div
                  key={line}
                  className="bg-foreground border border-border p-6 rounded-3xl"
                >
                  <p className="font-serif italic text-mocha leading-relaxed">
                    {line}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div> */}
      </section>

      <section className="bg-[#100f0c] py-24 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto text-center">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lux-eyebrow text-accent"
          >
            A Final Thought
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-serif text-4xl md:text-5xl text-secondary mt-6 mb-6 leading-tight"
          >
            "Embroidery is not merely decoration, but a timeless artistic
            language passed through generations."
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-serif italic text-mocha text-lg leading-relaxed max-w-3xl mx-auto"
          >
            Sheinar is a tribute to culture, craftsmanship, and the remarkable
            artisans whose artistry continues to inspire stories woven with
            heritage, beauty, and soul.
          </motion.p>
        </div>
      </section>
    </SiteLayout>
  );
}