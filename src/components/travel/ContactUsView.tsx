import React, { useState } from 'react';
import { Phone, Mail, MapPin, MessageSquare, Clock, Send, Check } from 'lucide-react';
import { useScrollReveal } from '../../hooks';

export const ContactUsView: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const { ref, isVisible } = useScrollReveal(0.1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const openWhatsApp = () => {
    const text = encodeURIComponent('Hi Outbound Holidays! I am interested in planning a Victoria Falls trip and would like advice.');
    window.open(`https://wa.me/263771234567?text=${text}`, '_blank');
  };

  return (
    <div id="contact-us" className="py-20 md:py-24 bg-[#FAFAFA]">
      <div
        ref={ref}
        className={`container-center ${isVisible ? 'animate-reveal visible' : 'animate-reveal'}`}
      >
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="section-label">We're Here To Help</span>
          <h2 className="section-heading text-[#0B5E8E]">
            Contact Our Travel Specialists
          </h2>
          <p className="text-[#2F3A44] text-base sm:text-lg">
            Reach out via WhatsApp for immediate response, or send us a message and our Victoria Falls office will reply within 2 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Info & WhatsApp Direct Box */}
          <div className="lg:col-span-5 bg-[#0B5E8E] text-white p-8 sm:p-10 rounded-3xl flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-xl font-serif mb-6">Direct Contact Information</h3>

              <div className="space-y-5 text-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-[#C9A66B]" />
                  </div>
                  <div>
                    <strong className="block text-white font-semibold mb-0.5">Victoria Falls Office:</strong>
                    <span className="text-white/80">Suite 4, Mosi-oa-Tunya Commercial Centre, Victoria Falls, Zimbabwe</span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-[#C9A66B]" />
                  </div>
                  <div>
                    <strong className="block text-white font-semibold mb-0.5">Phone Line:</strong>
                    <span className="text-white/80">+263 77 123 4567 / +263 13 44000</span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-[#C9A66B]" />
                  </div>
                  <div>
                    <strong className="block text-white font-semibold mb-0.5">Email:</strong>
                    <span className="text-white/80">travel@outboundholidays.co.zw</span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-[#C9A66B]" />
                  </div>
                  <div>
                    <strong className="block text-white font-semibold mb-0.5">Office Hours:</strong>
                    <span className="text-white/80">Mon - Sun: 7:30 AM - 7:00 PM (CAT) &bull; 24/7 Concierge for active travellers</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-white/15">
              <button
                onClick={openWhatsApp}
                className="w-full bg-[#3F6B3C] hover:bg-[#345731] text-white font-bold text-sm py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all duration-300 hover:-translate-y-0.5"
              >
                <MessageSquare className="w-5 h-5" />
                <span>Chat Instantly on WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl border border-gray-200">
            {submitted ? (
              <div className="text-center py-12 space-y-5">
                <div className="w-16 h-16 bg-[#3F6B3C]/10 text-[#3F6B3C] rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-[#0B5E8E] font-serif">Message Sent!</h3>
                <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                  Thank you for contacting Outbound Holidays. One of our Victoria Falls travel specialists will review your inquiry and get back to you shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="bg-[#0B5E8E] text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-[#094b72] transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h3 className="font-bold text-xl font-serif text-[#0B5E8E] mb-1">Send Us A Message</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tendai Moyo"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B5E8E] focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B5E8E] focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Phone / WhatsApp Number</label>
                  <input
                    type="tel"
                    placeholder="+263 77 000 0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B5E8E] focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Your Message or Inquiry *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell us what you'd like to know about visiting Victoria Falls, packages, or lodging..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B5E8E] focus:border-transparent transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#0B5E8E] hover:bg-[#094b72] text-white font-bold text-sm py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
