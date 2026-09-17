import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Youtube, Send, MapPin, Phone, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const navLinks = {
  Explore: [
    { label: "Collections", to: "/collections" },
    // { label: "Campaigns", to: "/" },
    { label: "Philosophy", to: "/philosophy" },
    // { label: "Stories", to: "/" },
    // { label: "Craft", to: "/" },
  ],
  About: [
    { label: "Our Story", to: "/about/out-story" },
    { label: "Contact Us", to: "/contact-us" },
    // { label: "Art of Embroidery", to: "/about/art-of-embroidery" },
    // { label: "The   ", to: "/about/  " },
    // { label: "Legacy", to: "/about/legacy" },
  ],
  "Customer Care": [
    // { label: "Contact Us", to: "/contact-us" },
    { label: "Shipping & Delivery", to: "/shipping-delivery" },
    { label: "Returns & Cancellations", to: "/returns-cancellations" },
    { label: "Track Order", to: "/track" },
    // { label: "Size Guide", to: "/" },
    { label: "Book Appointment", to: "/book-appointment" },
  ],
  Policies: [
    { label: "Privacy Policy", to: "/privacy-policy" },
    { label: "Terms of Service", to: "/terms-of-service" },
    { label: "Cookie Policy", to: "/cookie-policy" },
    { label: "Accessibility", to: "/accessibility" },
  ],
};

const socials = [
  { icon: Instagram, label: "Instagram", href: "#" },
  { icon: Facebook, label: "Facebook", href: "#" },
  { icon: Youtube, label: "YouTube", href: "#" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] } }),
};

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubscribed(true);
  };

  return (
    <footer className="bg-foreground text-secondary">
      {/* Top marquee strip */}
      <div className="border-b border-secondary/10 overflow-hidden">
        <div className="flex whitespace-nowrap py-3 lux-marquee">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="px-10 text-[10px] tracking-[4px] uppercase font-sans opacity-40">
              Handwoven <span className="text-accent mx-4">✦</span> Heritage <span className="text-accent mx-4">✦</span> Handcrafted <span className="text-accent mx-4">✦</span> Timeless
            </span>
          ))}
        </div>
      </div>

      {/* Main footer body */}
      <div className="max-w-[1500px] mx-auto px-6 lg:px-12 pt-20 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 pb-16 border-b border-secondary/10">

          {/* Brand column */}
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true }}
            className="lg:col-span-4 xl:col-span-3"
          >
            <motion.div variants={fadeUp} custom={0}>
              <Link to="/">
                <h2 className="font-serif text-[32px] tracking-[0.45em] text-secondary">SHEINAR</h2>
                {/* <span className="block text-[9px] tracking-[5px] uppercase text-secondary/40 mt-1 font-sans">
                  Couture · Est. Heritage
                </span> */}
              </Link>
            </motion.div>

            {/* <motion.p variants={fadeUp} custom={1} className="font-serif italic text-secondary/55 mt-7 text-sm leading-relaxed max-w-xs">
              Born from a quiet longing to preserve the soul of tradition. Every thread, a story. Every weave, a memory.
            </motion.p> */}

            {/* Contact */}
            <motion.div variants={fadeUp} custom={2} className="mt-8 space-y-3">
              {[
                { icon: MapPin, text: "sheinar   ,  Mohali     , India" },
                { icon: Phone, text: "+9177196 66903" },
                { icon: Mail, text: "sheinarrhq@gmail.com" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <Icon className="h-3.5 w-3.5 text-accent shrink-0" />
                  <span className="font-sans text-[12px] text-secondary/50 tracking-wide">{text}</span>
                </div>
              ))}
            </motion.div>

            {/* Socials */}
            <motion.div variants={fadeUp} custom={3} className="flex gap-4 mt-8">
              {socials.map(({ icon: Icon, label, href }) => (
                <a key={label} href={href} aria-label={label}
                  className="w-9 h-9 border border-secondary/15 flex items-center justify-center text-secondary/50 hover:text-accent hover:border-accent transition-all duration-300">
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </motion.div>
          </motion.div>

          {/* Nav columns */}
          <div className="lg:col-span-5 xl:col-span-6 grid grid-cols-2 md:grid-cols-4 gap-10">
            {Object.entries(navLinks).map(([title, links], colIdx) => (
              <motion.div
                key={title}
                initial="hidden" whileInView="show" viewport={{ once: true }}
              >
                <motion.h4 variants={fadeUp} custom={colIdx * 0.1}
                  className="font-sans text-[10px] tracking-[3.5px] uppercase text-secondary/35 mb-6">
                  {title}
                </motion.h4>
                <ul className="space-y-3.5">
                  {links.map((l, i) => (
                    <motion.li key={l.label} variants={fadeUp} custom={colIdx * 0.1 + i * 0.05}>
                      <Link to={l.to}
                        className="font-serif text-[13px] text-secondary/55 hover:text-accent transition-colors duration-300 leading-snug block">
                        {l.label}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Newsletter column */}
          {/* <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true }}
            className="lg:col-span-3"
          >
            <motion.span variants={fadeUp} custom={0} className="font-sans text-[10px] tracking-[3.5px] uppercase text-secondary/35 block mb-6">
              The Sheinar Edit
            </motion.span>
            <motion.h3 variants={fadeUp} custom={0.5} className="font-serif text-secondary text-xl leading-snug mb-3">
              Stories, craft & new arrivals — in your inbox.
            </motion.h3>
            <motion.p variants={fadeUp} custom={1} className="font-sans text-[12px] text-secondary/40 leading-relaxed mb-7">
              Join our circle of conscious fashion lovers. No noise — only heritage.
            </motion.p>

            <motion.form variants={fadeUp} custom={1.5} onSubmit={handleSubscribe}>
              {subscribed ? (
                <p className="font-serif italic text-accent text-sm">Thank you for joining us. ✦</p>
              ) : (
                <div className="flex border-b border-secondary/25 pb-2 focus-within:border-accent transition-colors duration-300">
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    className="flex-1 bg-transparent font-sans text-[12px] text-secondary placeholder:text-secondary/30 focus:outline-none tracking-wide"
                  />
                  <button type="submit" aria-label="Subscribe" className="text-secondary/40 hover:text-accent transition-colors duration-300 ml-3">
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </motion.form>

            {/* Trust badges */}
            {/* <motion.div variants={fadeUp} custom={2} className="mt-10 space-y-3">
              {[
                "Handcrafted in India",
                "Artisan-made, always",
                "Conscious & sustainable",
              ].map((badge) => (
                <div key={badge} className="flex items-center gap-3">
                  <span className="text-accent text-xs">✦</span>
                  <span className="font-sans text-[11px] tracking-[1.5px] uppercase text-secondary/35">{badge}</span>
                </div>
              ))}
            </motion.div> */}
          {/* </motion.div> */} 
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="font-sans text-[10px] tracking-[2.5px] uppercase text-secondary/25">
            © {new Date().getFullYear()} Sheinar. All rights reserved.
          </span>
          <span className="font-serif italic text-secondary/25 text-[12px] normal-case tracking-normal">
            Crafted in     · Worn around the world
          </span>
          <div className="flex items-center gap-6">
            {["Privacy", "Terms", "Cookies"].map((l) => (
              <a key={l} href="#" className="font-sans text-[10px] tracking-[2px] uppercase text-secondary/25 hover:text-secondary/60 transition-colors duration-300">
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
