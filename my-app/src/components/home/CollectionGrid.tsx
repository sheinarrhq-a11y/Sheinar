import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { fetchCollections, type Collection } from "@/data/products";
import { LazyImage } from "@/components/ui/LazyImage";

export function CollectionGrid() {
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    fetchCollections().then(setCollections);
  }, []);

  return (
    <section className="bg-background py-28 px-6 lg:px-12">
      <div className="max-w-[1500px] mx-auto">
        <div className="text-center mb-16">
          <span className="lux-eyebrow">The Collections</span>
          <h2 className="lux-heading text-4xl md:text-5xl mt-4">An Anthology of Heritage</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {collections.map((c, i) => (
            <motion.div
              key={c.slug}
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.9, delay: i * 0.12 }}
            >
              <Link to="/collections/$slug" params={{ slug: c.slug }} className="group block">
                <div className="relative overflow-hidden bg-muted aspect-[3/4]">
                  {c.image ? (
                    <>
                      <LazyImage src={c.image} alt={c.title} wrapperClassName="absolute inset-0 h-full w-full"
                        className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110" />
                      <span className="absolute top-4 left-4 lux-eyebrow text-secondary">{c.tag}</span>
                    </>
                  ) : (
                    <div className="absolute inset-0 bg-[#111] flex items-center justify-center p-6">
                      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_left,rgba(176,141,87,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.05),transparent_30%)]" />
                      <div className="relative text-center">
                        <span className="lux-eyebrow text-secondary mb-3 block">{c.tag}</span>
                        <h3 className="font-serif text-2xl md:text-3xl text-white uppercase tracking-[4px] leading-tight">
                          {c.title}
                        </h3>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/15 transition-colors duration-700" />
                </div>
                <div className="mt-5 flex items-center justify-between">
                  <h3 className="font-serif text-xl text-foreground">{c.title}</h3>
                  <span className="inline-flex items-center gap-1 text-[11px] tracking-[3px] uppercase text-mocha group-hover:text-accent transition-colors">
                    Discover <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
