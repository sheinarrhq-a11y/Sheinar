import { motion } from "framer-motion";

export function EditorialNote() {
  return (
    <section className="bg-secondary py-32 px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }} transition={{ duration: 1 }}
        className="max-w-3xl mx-auto text-center"
      >
        <span className="lux-eyebrow">A Note from the   </span>
        <span className="lux-divider mx-auto block my-6" />
        <h2 className="lux-heading text-3xl md:text-5xl mb-8">
          Of slow hands, slower seasons,<br />and the quiet dignity of craft.
        </h2>
        <p className="font-serif italic text-mocha text-lg leading-relaxed">
          Each piece is meticulously handcrafted by skilled artisans, making subtle variations and natural imperfections
          a mark of authenticity, artistry, and timeless individuality.
        </p>
        <p className="font-serif italic text-mocha text-lg leading-relaxed mt-6">
          These unique details are not flaws, but a reflection of the human touch that makes every creation truly one of a kind.
        </p>
        <div className="mt-10 font-serif text-foreground">— The Founders</div>
      </motion.div>
    </section>
  );
}
