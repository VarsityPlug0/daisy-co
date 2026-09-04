"use client";
import { useState } from "react";
import { MapPin, Mail, Clock } from "lucide-react";

type FormData = {
  name: string;
  phone: string;
  email: string;
  type: string;
  message: string;
};

export default function ContactPage() {
  const [form, setForm] = useState<FormData>({ name: "", phone: "", email: "", type: "General Enquiry", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20">

      <div className="mb-14 text-center">
        <p className="section-label mb-3">Get In Touch</p>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Contact <span className="gold-text">Us</span></h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Reach us by email, or fill in the form and we&apos;ll get back to you quickly.
        </p>
      </div>

      <div className="grid md:grid-cols-5 gap-10">

        {/* Contact info */}
        <div className="md:col-span-2 space-y-5">
          {[
            {
              icon: Mail, label: "Email",
              content: <a href="mailto:daisygadgetsco@gmail.com" className="text-white font-semibold hover:text-[#D4AF37] transition-colors text-sm">daisygadgetsco@gmail.com</a>,
              sub: "We reply within 24 hours",
            },
            {
              icon: MapPin, label: "Address",
              content: <span className="text-white font-semibold">Unit 7, Eagle Street, Okavango Park, Bellville, Cape Town</span>,
              sub: "Walk-ins by appointment",
            },
            {
              icon: Clock, label: "Hours",
              content: <span className="text-white font-semibold">Mon–Sat: 8am–6pm</span>,
              sub: "Sunday: 9am–3pm",
            },
          ].map(({ icon: Icon, label, content, sub }) => (
            <div key={label} className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-5 flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
                <Icon size={18} color="#D4AF37" strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wide font-semibold mb-1">{label}</p>
                <div className="text-sm">{content}</div>
                <p className="text-gray-600 text-xs mt-1">{sub}</p>
              </div>
            </div>
          ))}

          <div className="bg-[#111111] border border-[#D4AF37]/20 rounded-2xl p-5">
            <p className="text-white font-bold text-sm mb-2">Fastest Response</p>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              For the quickest help, email us directly. We typically reply within a few hours.
            </p>
            <a href="mailto:daisygadgetsco@gmail.com"
              className="btn-gold w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
              <Mail size={14} />
              Email Us
            </a>
          </div>
        </div>

        {/* Form */}
        <div className="md:col-span-3">
          {status === "done" ? (
            <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-10 text-center h-full flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <h3 className="text-xl font-bold text-white">Message Sent!</h3>
              <p className="text-gray-400">Thanks for reaching out. We&apos;ll be in touch within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-8 space-y-5">
              <h2 className="text-lg font-bold text-white mb-2">Send Us a Message</h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Full Name *</label>
                  <input required type="text" value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="John Smith"
                    className="w-full bg-[#0A0A0A] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Phone *</label>
                  <input required type="tel" value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="082 000 0000"
                    className="w-full bg-[#0A0A0A] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600" />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Email</label>
                <input type="email" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="john@example.com"
                  className="w-full bg-[#0A0A0A] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600" />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Enquiry Type</label>
                <select value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  className="w-full bg-[#0A0A0A] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm">
                  {["General Enquiry", "Product Availability", "Order Tracking", "Delivery Information", "Returns & Refunds", "Warranty Claim", "Bulk / Business Order", "Other"].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Message *</label>
                <textarea required rows={5} value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Tell us what you need..."
                  className="w-full bg-[#0A0A0A] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 resize-none" />
              </div>

              {status === "error" && (
                <p className="text-red-400 text-sm">Something went wrong. Please try emailing us instead.</p>
              )}

              <button type="submit" disabled={status === "loading"}
                className="btn-gold w-full py-4 rounded-xl font-bold text-base disabled:opacity-50">
                {status === "loading" ? "Sending…" : "Send Message"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
