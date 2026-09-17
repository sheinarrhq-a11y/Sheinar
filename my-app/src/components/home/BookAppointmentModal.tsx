import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "/api";

interface Props { open: boolean; onClose: () => void; }

export function BookAppointmentModal({ open, onClose }: Props) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", date: "", time: "", store: "Flagship", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full border-b border-border bg-transparent py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent transition-colors duration-300 font-serif italic text-sm";

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
            className="bg-background w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-border">
              <div>
                <span className="lux-eyebrow block mb-1"> </span>
                <h2 className="font-serif text-2xl text-foreground">Book an Appointment</h2>
              </div>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-8 py-8">
              {submitted ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-10">
                  <div className="lux-divider mx-auto mb-6" />
                  <h3 className="font-serif text-2xl text-foreground mb-3">Your appointment is confirmed.</h3>
                  <p className="font-serif italic text-mocha text-sm leading-relaxed">
                    We will reach out within 24 hours to confirm your private session at the   .
                  </p>
                  <button onClick={onClose} className="lux-btn mt-8">Close</button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="lux-eyebrow block mb-2">Full Name</label>
                      <input required className={inputCls} placeholder="Your name" value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div>
                      <label className="lux-eyebrow block mb-2">Email</label>
                      <input required type="email" className={inputCls} placeholder="your@email.com" value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="lux-eyebrow block mb-2">Phone</label>
                      <input className={inputCls} placeholder="+9177196 66903" value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    </div>
                    {/* <div>
                      <label className="lux-eyebrow block mb-2">Store</label>
                      <select required className={inputCls} value={form.store}
                        onChange={(e) => setForm({ ...form, store: e.target.value })}>
                        <option value="Flagship">Flagship</option>
                        <option value="  ">  </option>
                      </select>
                    </div> */}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="lux-eyebrow block mb-2">Preferred Date</label>
                      <input required type="date" className={inputCls} value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })} />
                    </div>
                    <div>
                      <label className="lux-eyebrow block mb-2">Preferred Time</label>
                      <select required className={inputCls} value={form.time}
                        onChange={(e) => setForm({ ...form, time: e.target.value })}>
                        <option value="">Select a time</option>
                        <option>10:00 AM</option>
                        <option>11:00 AM</option>
                        <option>12:00 PM</option>
                        <option>2:00 PM</option>
                        <option>3:00 PM</option>
                        <option>4:00 PM</option>
                        <option>5:00 PM</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="lux-eyebrow block mb-2">Message (optional)</label>
                    <textarea rows={3} className={inputCls} placeholder="Tell us about the occasion or what you're looking for..."
                      value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                  </div>
                  {error && <p className="text-red-500 text-sm font-serif italic text-center">{error}</p>}
                  <button type="submit" disabled={loading} className="lux-btn w-full justify-center mt-2">
                    {loading ? "Sending…" : "Confirm Appointment"}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
