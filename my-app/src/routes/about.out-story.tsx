import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/layout/SiteLayout";
import hero from "@/assets/trademark.jpg";
import embroidery from "@/assets/our story page.jpg";
import founderImage from "@/assets/founder_portrait.png";
import textile from "@/assets/collection-phulkari.png";

export const Route = createFileRoute("/about/out-story")({
  head: () => ({ meta: [
    { title: "About Sheinar — Heritage, Craft, Vision" },
    { name: "description", content: "Discover Sheinar's story, design philosophy, and founder's vision for conscious Indian luxury." },
  ] }),
  component: SampleAboutPage,
});

const reveal = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const } },
};

const philosophyPillars = [
  ["I", "Preserving Traditional Art Forms", "We honour heritage textile traditions by preserving embroidery, weaving, and handcrafted techniques that carry generations of artistic wisdom."],
  ["II", "Empowering Skilled Artisans", "Every Sheinar creation celebrates the hands behind the craft, creating opportunities for artisans whose skills deserve recognition, dignity, and continuity."],
  ["III", "Encouraging Sustainable Fashion", "We believe in mindful craftsmanship over mass production — creating fashion that is conscious, enduring, and respectful of people and planet."],
  ["IV", "Creating Meaningful Employment", "By supporting handlooms and handicrafts, we help sustain communities whose artistry forms an invaluable part of India's cultural legacy."],
];

const founderStory = [
  "As a geographer and a passionate observer of cultures, I have always been fascinated by the diversity of traditions, lifestyles, and artistic expressions across India and the world.",
  "My travels and experiences introduced me to remarkable artisans from tribal and nomadic communities living in remote regions — women whose embroidery and weaving skills are extraordinary reflections of their heritage and creativity. Their artistry became the inspiration behind Sheinar.",
  "I wanted to create a space where traditional craftsmanship could coexist with modern expression — where forgotten and vanishing embroidery traditions could once again be appreciated and preserved.",
  "Born and raised in India, I have always believed that embroidery is not merely decoration, but a timeless artistic language passed through generations.",
  "Through Sheinar, my vision is to uplift artisan communities, revive age-old textile traditions, and create conscious fashion that carries meaning, heritage, and soul.",
];

function SampleAboutPage() {
  return (
    <SiteLayout>
      <main>
        <section className="relative h-[52vh] min-h-[360px] w-full overflow-hidden sm:h-[60vh] md:h-[86vh] md:min-h-[680px]">
          <img src={hero} alt="Sheinar heritage fashion" className="absolute inset-0 h-full w-full object-cover object-center" />
        </section>

        <section className="px-6 py-24 md:px-12 md:py-36">
          <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={reveal}>
              <span className="lux-eyebrow text-accent">The Sheinar Story</span>
              <h1 className="mt-5 font-serif text-5xl leading-[0.95] text-foreground md:text-7xl">A quiet longing for what lasts.</h1>
            </motion.div>
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={reveal} className="space-y-7 border-l border-border pl-6 md:pl-12 font-serif italic text-mocha text-lg leading-relaxed md:text-xl">
              <p className="font-serif text-xl italic leading-relaxed text-mocha md:text-2xl">Sheinar was born from a quiet longing — a longing to preserve the soul of tradition in a world moving too fast to notice the beauty of handmade art.</p>
              <p className="leading-8 text-mocha">Rooted in the richness of Indian heritage, Sheinar is a celebration of stories woven through threads, hands, and generations. Every weave carries the warmth of human touch, every embroidery echoes ancient artistry, and every creation reflects the spirit of the earth it comes from.</p>
              <p className="leading-8 text-mocha">We believe true luxury is not found in excess, but in authenticity: fabrics patiently handwoven, crafts lovingly nurtured, and imperfections that make every piece beautifully unique.</p>
            </motion.div>
          </div>
        </section>

   <section className="grid grid-cols-1 md:grid-cols-2">
  {/* Portrait Image */}
  <div className="relative min-h-[500px] overflow-hidden md:min-h-[700px]">
    <img
      src={embroidery}
      alt="Artisan embroidery"
      className="absolute inset-0 h-full w-full object-cover"
      style={{ objectPosition: "center center" }}
    />
  </div>

  {/* Content */}
  <div className="flex items-center bg-[#faf7f2] px-7 py-20 md:px-16 md:py-32">
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      variants={reveal}
      className="max-w-xl"
    >
      <span className="lux-eyebrow text-accent">
        The Artisan Promise
      </span>

      <h2 className="mt-5 font-serif text-4xl text-foreground md:text-6xl">
        Hands that keep traditions alive.
      </h2>

      <p className="mt-8 font-serif italic text-mocha text-lg md:text-2xl mt-8 max-w-3xl mx-auto leading-relaxed">
        Behind every Sheinar piece are artisans whose skilled hands keep
        fading traditions alive. Every creation becomes a bridge between
        heritage and modern expression.
      </p>
    </motion.div>
  </div>
</section>

        <section className="px-4 py-10 md:px-10 md:py-10">
          <div className="mx-auto max-w-7xl">
           
        <div className="relative z-10 max-w-2xl mx-auto px-4 py-2 md:py-20 text-center">
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
            className="font-serif text-foreground text-3xl md:text-3xl lg:text-4xl mt-6 leading-[1.05]"
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
            Sheinar creates fashion that feels rooted in culture while staying relevant in the modern world.
          </motion.p>
        </div>
          <section className="py-0 px-4 max-w-5xl mx-auto text-center">
        {/* <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="lux-eyebrow text-accent"
        >
          Design Philosophy
        </motion.span> */}

        <div className="mx-auto mt-2 mb-0" />

        {[
          "We work with handwoven fabrics, heritage techniques, and artisan detail to keep craftsmanship visible, intentional, and meaningful.",
          "Our collections blend ethnic character with contemporary ease, so tradition can feel current without losing its soul.",
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

            <div className="mt-16 grid gap-5 md:grid-cols-2">
              {philosophyPillars.map(([num, title, text], index) => (
                <motion.article key={num} initial="hidden" whileInView="show" viewport={{ once: true }} variants={reveal} transition={{ delay: index * 0.08 }} className="border border-border bg-muted/30 p-8 md:p-10">
                  <span className="font-serif text-6xl text-accent/30">{num}</span>
                  <h3 className="mt-6 font-serif text-2xl text-foreground md:text-3xl">{title}</h3>
                  <p className="mt-5 font-serif italic text-lg leading-relaxed text-mocha">{text}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 bg-[#100f0c] text-secondary md:grid-cols-[0.85fr_1.15fr]">
          <div className="relative min-h-[480px] md:min-h-[680px]"><img src={founderImage} alt="Anu Kaushal, founder of Sheinar" className="absolute inset-0 h-full w-full object-cover object-top" /></div>
          <div className="px-7 py-24 md:px-16 md:py-32 lg:px-24">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={reveal}>
              <span className="lux-eyebrow text-accent">Founder's Vision</span>
              <h2 className="mt-5 font-serif text-5xl leading-none md:text-7xl">Anu Kaushal</h2>
              <p className="mt-6 font-serif italic leading-7 text-secondary/70 text-[15px]">A geographer and passionate observer of cultures, dedicated to preserving traditional craftsmanship through meaningful and conscious fashion.</p>
              <div className="mt-10 space-y-6 border-t border-secondary/20 pt-8 font-serif italic text-mocha text-lg leading-relaxed md:text-xl">
                {founderStory.map((paragraph) => <p key={paragraph} className="leading-8 text-secondary/75">{paragraph}</p>)}
              </div>
            </motion.div>
          </div>
        </section>
   <section className="bg-[#140f0c] py-24 px-6 lg:px-12">
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
        
      </main>
    </SiteLayout>
  );
}
