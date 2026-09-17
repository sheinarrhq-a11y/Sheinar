import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { VideoHero } from "@/components/home/VideoHero";
import { ProductShowcase } from "@/components/home/ProductShowcase";
import { StoreBanner } from "@/components/home/StoreBanner";// Assets
import sarees from "@/assets/collection-sarees.jpg";
import lehengas from "@/assets/collection-lehengas.jpg";
import couture from "@/assets/collection-couture.jpg";
import phulkari from "@/assets/collection-phulkari.png";
import suits from "@/assets/collection-suits.jpg";
import hero1 from  "@/assets/story_page.jpg";
import hero2 from "@/assets/Products.jpg";

export const Route = createFileRoute("/")(
  { component: Index }
);

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.9, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const crafts = [
  { name: "Zardozi", origin: "Mughal Courts", desc: "Gold and silver thread work of royal lineage — each motif a testament to centuries of refinement.", img: sarees },
  { name: "Chikankari", origin: "Lucknow", desc: "Delicate shadow-work embroidery on fine muslin — the poetry of the needle.", img: lehengas },
  { name: "Kantha", origin: "Bengal", desc: "Running stitch storytelling passed through generations of women, each thread a memory.", img: suits },
  { name: "Phulkari", origin: "Punjab", desc: "Vibrant floral embroidery celebrating life's milestones — from birth to bridal.", img: phulkari },
];

function Index() {
  return (
    <SiteLayout>
    
      <VideoHero
        // videoSrc="/hero.mp4"
        posterSrc="/Hero.jpg"
      />

      {/* ── 2. EDITORIAL NOTE ── */}
      <section className="bg-secondary py-32 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }} transition={{ duration: 1 }}
          className="max-w-3xl mx-auto text-center"
        >
          <span className="lux-eyebrow">Born from a Quiet Longing</span>
          <span className="lux-divider mx-auto block my-6" />
          <h2 className="lux-heading text-3xl md:text-5xl mb-8 uppercase leading-tight">
            Of Slow Hands, Slower Seasons,<br />And The Quiet Dignity Of Craft.
          </h2>
          <p className="font-serif italic text-mocha text-lg leading-relaxed">
            SHEINAR was born from a longing to preserve the soul of tradition in a world moving too fast to notice the beauty of handmade art. Rooted in the richness of Indian heritage, every weave carries the warmth of human touch.
          </p>
          <p className="font-serif italic text-mocha text-lg leading-relaxed mt-6">
            We believe true luxury is not found in excess, but in authenticity — in fabrics patiently handwoven, in crafts lovingly nurtured, and in imperfections that make every piece beautifully unique.
          </p>
          <Link to="/about/out-story" className="lux-btn mt-12 inline-flex">Discover Our Story</Link>
        </motion.div>
      </section>

      {/* ── 3. FOUNDER'S VISION — SPLIT ── */}
      {/* <section className="max-w-7xl mx-auto px-6 py-28 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }} transition={{ duration: 1 }}
          className="relative"
        >
         {/* <img src={couture} alt="Anu Kaushal" className="w-full aspect-[3/4] object-cover" /> */}
          {/* <div className="absolute -bottom-5 -right-5 w-full h-full border border-accent/30 -z-10 hidden md:block" />
          <div className="absolute -bottom-6 left-6 bg-foreground text-secondary px-6 py-4 max-w-[220px] hidden md:block">
            <span className="font-serif italic text-sm leading-relaxed">"Tradition is a living language."</span> */}
          {/* </div> */}
        {/* </motion.div> */}

        {/* <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} className="space-y-6 lg:pt-4">
          <motion.span variants={fadeUp} custom={0} className="lux-eyebrow">Founder's Vision</motion.span>
          <motion.div variants={fadeUp} custom={0.3} className="lux-divider mb-2" />
          <motion.h2 variants={fadeUp} custom={0.5} className="lux-heading text-3xl md:text-4xl upp"> Anu Kaushal</motion.h2>
          <motion.span variants={fadeUp} custom={0.7} className="font-sans text-xs tracking-[3px] uppercase text-muted-foreground block">
            Founder
          </motion.span>
          {[
            "As a geographer and passionate observer of cultures, I have always been fascinated by the diversity of traditions and artistic expressions across India and the world.",
            "My travels introduced me to the remarkable craftsmanship of Artisans from tribal and nomadic communities — women whose embroidery and weaving skills are extraordinary reflections of their heritage.",
            "Through Sheinar, my vision is to uplift artisan communities, revive age-old textile traditions, and create conscious fashion that carries meaning, heritage, and soul.",
          ].map((p, i) => (
            <motion.p key={i} variants={fadeUp} custom={i + 1} className="font-serif italic text-mocha text-base md:text-lg leading-relaxed">{p}</motion.p>
          ))}
          {/* <motion.div variants={fadeUp} custom={4}>
            <Link to="/about/founders-vision" className="lux-btn mt-4 inline-flex">Read Full Vision</Link>
          </motion.div> */}
        {/* </motion.div> */} 
      {/* // </section> */}

      {/* ── 6. ARTISAN PROMISE — FULL-WIDTH IMAGE ── */}
      <section className="relative py-40 overflow-hidden">
        <motion.div
          initial={{ scale: 1.05 }} whileInView={{ scale: 1 }}
          viewport={{ once: true }} transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <img src={hero2} alt="" className="w-full h-full object-cover object-top" />
          <div className="absolute inset-0 bg-foreground/65" />
        </motion.div>
        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          {/* <motion.span
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true }} className="lux-eyebrow text-accent"
          >
            The Artisan Promise
          </motion.span> */}
          <div className=" mx-auto mt-4 mb-10 bg-secondary" />
          <motion.h2
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 1 }}
            className="font-serif text-secondary text-4xl md:text-6xl leading-tight mb-8"
          >
            Hands That Keep Traditions Alive
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true }} transition={{ duration: 1, delay: 0.3 }}
            className="font-serif italic text-secondary/70 text-lg leading-relaxed mb-12"
          >
            Behind every Sheinar piece are artisans whose skilled hands keep fading traditions alive. At Sheinar, tradition is not recreated — it is reawakened for the modern woman who carries grace, strength, and heritage within her.
          </motion.p>
          {/* <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.5 }}>
            <Link to="/about/legacy" className="lux-btn lux-btn-light">The Sheinar Legacy</Link>
          </motion.div> */}
        </div>
      </section>

      {/* ── 7. NEW ARRIVALS ── */}
      <ProductShowcase />

      {/* ── 8. CLOSING QUOTE ── */}
      {/* <section className="py-28 px-6 text-center max-w-2xl mx-auto">
        <motion.div
          initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }}
          viewport={{ once: true }} transition={{ duration: 0.8 }}
          className="lux-divider mx-auto mb-10"
        />
        <motion.p
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          viewport={{ once: true }} transition={{ duration: 1 }}
          className="font-serif italic text-foreground text-2xl md:text-3xl leading-relaxed"
        >
          "Tradition is not recreated — it is reawakened."
        </motion.p>
        <motion.span
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          viewport={{ once: true }} transition={{ duration: 1, delay: 0.4 }}
          className="lux-eyebrow mt-6 block"
        >
          — Sheinar
        </motion.span>
      </section> */}

      {/* ── 9. STORE BANNER ── */}
      <StoreBanner />
    </SiteLayout>
  );
}
