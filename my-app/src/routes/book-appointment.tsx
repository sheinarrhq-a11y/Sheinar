import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { BookAppointmentModal } from "@/components/home/BookAppointmentModal";
import { useState } from "react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/book-appointment")({
  component: BookAppointmentPage,
});

function BookAppointmentPage() {
  const [formOpen, setFormOpen] = useState(true);

  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <SiteLayout>
      <div className="pt-32 px-6 lg:px-12 max-w-[1000px] mx-auto pb-24">
        {/* Header */}
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
          <span className="lux-eyebrow"> </span>
          <h1 className="font-serif text-4xl md:text-5xl mt-4 mb-4">Book an Appointment</h1>
          <p className="font-serif italic text-mocha text-lg max-w-2xl mx-auto">
            Reserve a private session at our flagship    or explore collections one-on-one with our curators.
          </p>
        </motion.div>

        {/* Info Cards */}
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {[
            // {
            //   title: "Flagship   ",
            //   desc: "Explore our complete collection in a curated private setting.",
            //   location: " Mohali",
            // },
            {
              title: "Personal Consultation",
              desc: "Get expert styling advice from our    team.",
              location: "By Appointment",
            },
          ].map((item, idx) => (
            <motion.div
              key={item.title}
              variants={fadeUp}
              custom={idx * 0.1}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="border border-border p-6"
            >
              <h3 className="font-serif text-lg text-foreground mb-2">{item.title}</h3>
              <p className="text-mocha text-sm mb-3">{item.desc}</p>
              <p className="lux-eyebrow text-[9px]">{item.location}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Form */}
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
          {formOpen ? (
            <BookAppointmentModal open={formOpen} onClose={() => setFormOpen(false)} />
          ) : (
            <button onClick={() => setFormOpen(true)} className="lux-btn">Open Booking Form</button>
          )}
        </motion.div>
      </div>
    </SiteLayout>
  );
}
