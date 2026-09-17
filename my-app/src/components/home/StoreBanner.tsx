import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import banner from "@/assets/store.jpg";

export function StoreBanner() {
  return (
    <section className="relative h-[90vh] overflow-hidden">
      <img src={banner} alt="Sheinar store" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-foreground/45" />
      <motion.div
        initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 1 }}
        className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6"
      >
        <span className="lux-divider mx-auto my-7 bg-secondary block" />
        <h2 className="font-serif text-secondary text-5xl md:text-7xl mb-6">Visit Our Store</h2>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link to="/our-store" className="lux-btn lux-btn-light">Explore Store</Link>
          <Link to="/contact-us" className="lux-btn lux-btn-light">Contact Us</Link>
        </div>
      </motion.div>
    </section>
  );
}
