import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { motion } from "framer-motion";
import { useState } from "react";
import { BookAppointmentModal } from "@/components/home/BookAppointmentModal";

export const Route = createFileRoute("/contact-us")({
  component: ContactUsPage,
});

function ContactUsPage() {
  const [appointmentOpen, setAppointmentOpen] = useState(false);
  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <SiteLayout>
      <div className="pt-32 px-6 lg:px-12 max-w-[1200px] mx-auto pb-24">
        {/* Header */}
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
          <span className="lux-eyebrow">Get in Touch</span>
          <h1 className="font-serif text-4xl md:text-5xl mt-4 mb-4">Contact Us</h1>
          <p className="font-serif italic text-mocha text-lg max-w-2xl mx-auto">
            We'd love to hear from you. Reach out with any questions or inquiries about our collections.
          </p>
        </motion.div>

        {/* Contact Grid */}
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} className="grid gap-12 lg:grid-cols-2 lg:items-start mb-20">
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-1">
          {[
            {
              icon: Mail,
              label: "Email",
              value: "sheinarrhq@gmail.com",
              href: "mailto:sheinarrhq@gmail.com",
            },
            {
              icon: Phone,
              label: "Phone",
              value: "+91 7719490036",
              href: "tel:+917719490036",
            },
            {
              icon: MapPin,
              label: "Address",
              value: "Sheinar   ,  Mohali, India",
              href: "#",
            },
            {
              icon: MessageCircle,
              label: "WhatsApp",
              value: "Start a Conversation",
              href: "https://wa.me/917719490036?text=Hello%20Sheinar%2C%20I%27d%20love%20to%20know%20more%20about%20your%20collections%20and%20receive%20assistance%20with%20my%20order.",
            },
          ].map((item, idx) => (
            <motion.a
              key={item.label}
              href={item.href}
              target={item.href.startsWith("http") ? "_blank" : undefined}
              rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
              variants={fadeUp}
              custom={idx * 0.1}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="group"
            >
              <div className="h-full border border-border p-4 sm:p-6 hover:border-accent transition-colors duration-300">
                <item.icon className="h-5 w-5 text-accent mb-3" />
                <h3 className="font-serif text-foreground text-base sm:text-lg mb-2">{item.label}</h3>
                <p className="text-mocha text-sm group-hover:text-accent transition-colors">{item.value}</p>
              </div>
            </motion.a>
          ))}
          </div>
          <div className="border border-border p-6 sm:p-8 lg:p-10">
            <span className="lux-eyebrow block mb-3"> </span>
            <h2 className="font-serif text-3xl text-foreground mb-4">Book an Appointment</h2>
            <p className="font-serif italic text-mocha leading-relaxed">
              Reserve a private session with our curators and explore the collection one-on-one.
            </p>
            <button type="button" onClick={() => setAppointmentOpen(true)} className="lux-btn mt-7 w-full justify-center">
              Open Booking Form
            </button>
          </div>
        </motion.div>

        {/* CTA */}
        {/* <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-center">
          <button onClick={() => setAppointmentOpen(true)} className="lux-btn">
            Book an Appointment
          </button>
        </motion.div> */}
      </div>
      <BookAppointmentModal open={appointmentOpen} onClose={() => setAppointmentOpen(false)} />
    </SiteLayout>
  );
}
