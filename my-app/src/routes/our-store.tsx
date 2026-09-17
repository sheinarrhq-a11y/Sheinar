import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { MapPin, Clock, Phone, Mail, Globe } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import storeInterior from "@/assets/store.jpg";
import embroidery from "@/assets/hero-3.jpg";
import textile from "@/assets/collection-phulkari.png";

export const Route = createFileRoute("/our-store")({
  component: OurStorePage,
});

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function OurStorePage() {
  const store = {
    name: "Sheinar   ",
    address: " Mohali, India",
    phone: "+91 7719666903",
    email: "sheinarrhq@gmail.com",
    hours: "12:00 PM – 8:00 PM",
    days: "Monday – Saturday",
    description: "An intimate    where heritage craftsmanship meets modern luxury. Every consultation is curated for discerning clients who seek timeless elegance.",
    specialties: [
      "Private couture consultations",
      "Bespoke design and fittings",
      "Handcrafted textile artistry",
    ],
  };

  const highlights = [
    {
      title: "Curated Appointments",
      description: "Book a private consultation and explore our most exclusive creations in a tranquil setting.",
      icon: Globe,
    },
    {
      title: "Bespoke Craftsmanship",
      description: "Experience custom tailoring shaped by artistic tradition, refined with modern sensibility.",
      icon: Clock,
    },
    {
      title: "Personalized Service",
      description: "From design direction to finished heirloom pieces, every detail is crafted for you.",
      icon: Mail,
    },
  ];

  return (
    <SiteLayout>
      <div className="pt-24 sm:pt-32 px-5 sm:px-6 lg:px-12 max-w-[1400px] mx-auto">
        <nav className="flex items-center gap-2 text-[9px] tracking-[2px] uppercase text-mocha mb-8 sm:mb-10">
          <Link to="/" className="hover:text-accent">Home</Link>
          <span className="text-foreground">/</span>
          <span className="text-foreground">Our Store</span>
        </nav>

        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="relative min-h-[540px] sm:min-h-[620px] overflow-hidden mb-20 sm:mb-28"
        >
          <img src={storeInterior} alt="Sheinar    interior" className="absolute inset-0 h-full w-full object-cover" />
          <div className="relative z-10 mt-40 flex h-full max-w-2xl flex-col justify-end p-7 text-left text-secondary sm:p-12 lg:ml-auto lg:p-20 lg:text-right">
            {/* <span className="lux-eyebrow text-secondary/80">The    ·  Mohali</span> */}
            <h1 className="font-serif text-white text-5xl leading-[0.95] sm:text-7xl mt-5">Where heritage becomes personal.</h1>
            {/* <p className="font-serif italic text-secondary/85 text-base sm:text-lg leading-7 sm:leading-8 mt-6 max-w-lg">
              Step into a quiet world of handwork, heirloom textiles and considered fittings, shaped around the woman who wears them.
            </p> */}
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center lg:justify-end">
              <a href="#visit" className="lux-btn lux-btn-light justify-center">Plan your visit</a>
              <span className="text-[10px] tracking-[2px] uppercase text-secondary/70">Private consultations · By appointment</span>
            </div>
          </div>
        </motion.section>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="grid gap-10 lg:grid-cols-[1.35fr_0.85fr] mb-20 sm:mb-28"
        >
          <div className="rounded-[2rem] overflow-hidden border border-border shadow-[0_40px_120px_-80px_rgba(83,62,45,0.15)]">
            <div className="bg-[radial-gradient(circle_at_top,_rgba(255,245,235,0.25),_transparent_55%)] p-5 sm:p-10">
              <div className="bg-background/90 p-6 sm:p-10 border border-border">
                <div className="mb-8 sm:mb-10">
                  {/* <span className="lux-eyebrow text-accent mb-4 block">   Details</span> */}
                  <h2 className="font-serif text-3xl text-foreground mb-4">A refined destination for bespoke couture.</h2>
                  <p className="text-mocha leading-8">
                    Our store is designed as a private residence for craftsmanship: quiet, elegant, and curated to showcase the beauty of heritage textiles.
                  </p>
                </div>

                <div className="grid gap-6">
                  <div className="rounded-3xl border border-border p-6 bg-muted/80">
                    <div className="flex items-center gap-3 text-mocha mb-4">
                      <MapPin className="h-5 w-5 text-accent" />
                      <span className="font-medium uppercase tracking-[2px] text-xs">Location</span>
                    </div>
                    <p className="text-foreground text-lg font-medium mb-2">{store.address}</p>
                    <p className="text-sm text-muted-foreground">Every visit is thoughtfully arranged to honor your time and preferences.</p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-3xl border border-border p-6 bg-background">
                      <div className="flex items-center gap-3 text-mocha mb-4">
                        <Clock className="h-5 w-5 text-accent" />
                        <span className="font-medium uppercase tracking-[2px] text-xs">Opening Hours</span>
                      </div>
                      <p className="text-foreground font-medium">{store.hours}</p>
                      <p className="text-sm text-muted-foreground">{store.days}</p>
                    </div>

                    <div className="rounded-3xl border border-border p-6 bg-background">
                      <div className="flex items-center gap-3 text-mocha mb-4">
                        <Phone className="h-5 w-5 text-accent" />
                        <span className="font-medium uppercase tracking-[2px] text-xs">Contact</span>
                      </div>
                      <a href={`tel:${store.phone}`} className="block text-foreground font-medium mb-1 hover:text-accent transition-colors">
                        {store.phone}
                      </a>
                      <a href={`mailto:${store.email}`} className="text-sm text-muted-foreground hover:text-accent transition-colors">
                        {store.email}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Link to="/contact-us" className="lux-btn inline-flex justify-center w-full sm:w-auto">
                    Request a Private Visit
                  </Link>
                  <a
                    href="https://www.google.com/maps?q=30.697477340698242,76.72274780273438&z=17&hl=en"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lux-btn text-sm font-medium"
                  >
                    View on map
                  </a>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="border border-border bg-muted p-6 sm:p-8 shadow-[0_24px_80px_-40px_rgba(83,62,45,0.2)]">
              <span className="lux-eyebrow text-accent mb-4 block">Our Experience</span>
              <p className="text-mocha leading-8">
                At Sheinar, every visit is more than a storefront appointment — it is a private immersion into luxury, tradition, and tailored design.
              </p>
            </div>

            <div className="border border-border bg-background p-6 sm:p-8">
              <div className="space-y-6">
                {highlights.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="flex gap-4">
                      <div className="rounded-full bg-accent/10 p-3 text-accent">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{item.title}</h3>
                        <p className="text-sm text-mocha leading-6">{item.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        </motion.div>

        {/* <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="grid grid-cols-1 gap-4 sm:grid-cols-[1.1fr_0.9fr] mb-20 sm:mb-28"
        >
          <div className="relative min-h-[360px] overflow-hidden bg-muted sm:min-h-[500px]">
            <img src={embroidery} alt="Handcrafted embroidery at the Sheinar   " className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/75 to-transparent p-6 sm:p-8">
              <span className="lux-eyebrow text-secondary/80">The hands behind the piece</span>
              <p className="font-serif text-2xl text-secondary mt-3 max-w-sm">Every thread carries a memory.</p>
            </div>
          </div>
          <div className="relative min-h-[360px] overflow-hidden bg-muted sm:min-h-[500px]">
            <img src={textile} alt="Heritage textile detail" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-foreground/15" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/70 to-transparent p-6 sm:p-8">
              <span className="lux-eyebrow text-secondary/80">Textile library</span>
              <p className="font-serif text-2xl text-secondary mt-3">A living archive of Indian craft.</p>
            </div>
          </div>
        </motion.section> */}

       
<motion.section
  initial="hidden"
  whileInView="show"
  viewport={{ once: true }}
  variants={fadeUp}
  className="mb-20 sm:mb-28"
>
  <div
    id="visit"
    className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-end sm:justify-between"
  >
    <div>
      <span className="lux-eyebrow text-accent">Find us</span>
      {/* <h2 className="font-serif text-3xl text-foreground mt-2">Find the</h2> */}
    </div>

    <p className="text-sm text-mocha max-w-sm">
      30.697477° N, 76.722748° E ·  Mohali
    </p>
  </div>

  <div className="w-full h-[320px] sm:h-[440px] overflow-hidden border border-border bg-muted">
    <iframe
      width="100%"
      height="440"
      style={{ border: 0 }}
      loading="lazy"
      allowFullScreen
      referrerPolicy="no-referrer-when-downgrade"
      src="https://maps.google.com/maps?q=30.697477340698242,76.72274780273438&z=17&output=embed"
    />
  </div>

  {/* Get Directions Button */}
  <div className="mt-5 flex justify-center sm:justify-start">
    <a
      href="https://www.google.com/maps/dir/?api=1&destination=30.697477340698242,76.72274780273438"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-2 bg-accent px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
    >
      Get Directions
      <span aria-hidden="true">↗</span>
    </a>
  </div>
</motion.section>
{/* 
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="rounded-[2rem] border border-border bg-background p-10 text-center"
        >
          <p className="text-mocha uppercase tracking-[3px] text-xs mb-4">The perfect destination for curated design</p>
          <h2 className="font-serif text-3xl text-foreground mb-6">Begin your bespoke journey today</h2>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link to="/contact-us" className="lux-btn inline-flex justify-center w-full sm:w-auto">
              Request a Consultation
            </Link>
            <a
              href={`mailto:${store.email}`}
              className="lux-link inline-flex justify-center w-full sm:w-auto"
            >
              Email us directly
            </a>
          </div>
        </motion.section> */}
      </div>
    </SiteLayout>
  );
}
