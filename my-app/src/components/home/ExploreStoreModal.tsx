import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Clock, Phone, Mail } from "lucide-react";

interface Props { open: boolean; onClose: () => void; onBook: () => void; }

const stores = [
  {
    city: "Mohali, SAS Nagar",
    // label: "Flagship   ",
    address: "H.No. 01, Sector 69, Mohali, SAS Nagar, Punjab",
    phone: "+917719490036",
    email: " @sheinar.co",
    hours: [
      { day: "Mon – Sat", time: "10:00 AM – 7:00 PM" },
      { day: "Sunday", time: "11:00 AM – 5:00 PM" },
    ],
    mapSrc: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3444.5!2d76.7227478!3d30.6974773!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzDCsDQxJzUwLjkiTiA3NsKwNDMnMjEuOSJF!5e0!3m2!1sen!2sin!4v1700000000000",
  },
  // {
  //   city: "  ",
  //   label: "     ",
  //   address: "Shop 4, Kala Ghoda Arts District, Fort,   , Maharashtra — 400001",
  //   phone: "+91 98151 55394",
  //   email: "  @sheinar.co",
  //   hours: [
  //     { day: "Mon – Sat", time: "11:00 AM – 8:00 PM" },
  //     { day: "Sunday", time: "12:00 PM – 6:00 PM" },
  //   ],
  //   mapSrc: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3444.5!2d76.7227478!3d30.6974773!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzDCsDQxJzUwLjkiTiA3NsKwNDMnMjEuOSJF!5e0!3m2!1sen!2sin!4v1700000000000",
  // },
];

export function ExploreStoreModal({ open, onClose, onBook }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-foreground/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="bg-background w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-border">
              <div>
                <span className="lux-eyebrow block mb-1">Our Locations</span>
                <h2 className="font-serif text-2xl text-foreground">Explore Our Stores</h2>
              </div>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="divide-y divide-border">
              {stores.map((store) => (
                <div key={store.city} className="px-8 py-8 space-y-6">
                  {/* Store title */}
                  <div>
                    <span className="lux-eyebrow block mb-1">{store.city}</span>
                    <h3 className="font-serif text-xl text-foreground">{store.label}</h3>
                  </div>

                  {/* Map */}
                  <div className="w-full h-52 overflow-hidden border border-border">
                    <iframe
                      src={store.mapSrc}
                      width="100%" height="100%"
                      style={{ border: 0 }} allowFullScreen loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title={`${store.city} store map`}
                    />
                  </div>

                  {/* Details grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex gap-3">
                      <MapPin className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                      <div>
                        <span className="lux-eyebrow block mb-1">Address</span>
                        <p className="font-serif italic text-mocha text-sm leading-relaxed">{store.address}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Clock className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                      <div>
                        <span className="lux-eyebrow block mb-1">Hours</span>
                        {store.hours.map((h) => (
                          <p key={h.day} className="font-serif italic text-mocha text-sm">{h.day}: {h.time}</p>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Phone className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                      <div>
                        <span className="lux-eyebrow block mb-1">Contact</span>
                        <p className="font-serif italic text-mocha text-sm">{store.phone}</p>
                        <div className="flex gap-1 items-center mt-1">
                          <Mail className="h-3 w-3 text-accent" />
                          <p className="font-serif italic text-mocha text-sm">{store.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer CTA */}
            <div className="px-8 py-6 border-t border-border bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="font-serif italic text-mocha text-sm">
                A private appointment — a quiet hour with the    and a cup of cardamom tea.
              </p>
              <button
                onClick={() => { onClose(); onBook(); }}
                className="lux-btn shrink-0"
              >
                Book Appointment
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
