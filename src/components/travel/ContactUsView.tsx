import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, Check } from 'lucide-react';
import { WhatsAppIcon } from '../common/WhatsAppButton';
import { getWhatsAppSpecialistUrl } from '../../utils/whatsapp';

export const ContactUsView: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const openWhatsApp = () => {
    window.open(getWhatsAppSpecialistUrl(), '_blank');
  };

  return (
    <section id="contact-us" className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-[#FAFAFA] border-b border-gray-100">
      <div className="max-w-[1280px] mx-auto space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold text-[#C9A66B] uppercase tracking-widest block">
            We're Here To Help
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-serif text-[#0B5E8E]">
            Contact Our Travel Specialists
          </h2>
          <p className="text-xs sm:text-sm text-[#2F3A44]/80 leading-relaxed">
            Reach out via WhatsApp for immediate response, or send us a message and our Victoria Falls office will reply within 2 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Info & WhatsApp Box (Left 5 Cols) */}
          <div className="lg:col-span-5 space-y-6 bg-[#0B5E8E]/5 p-8 rounded-[24px] border border-[#0B5E8E]/15">
            <h3 className="font-bold text-xl text-[#0B5E8E] font-serif">Direct Contact Information</h3>

            <div className="space-y-4 text-xs sm:text-sm text-[#2F3A44]">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-white rounded-xl text-[#0B5E8E] shadow-sm shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-[#0B5E8E] text-xs font-bold uppercase tracking-wider mb-0.5">Victoria Falls Office:</strong>
                  <span>Suite 4, Mosi-oa-Tunya Commercial Centre, Victoria Falls, Zimbabwe</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-white rounded-xl text-[#0B5E8E] shadow-sm shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-[#0B5E8E] text-xs font-bold uppercase tracking-wider mb-0.5">Phone & WhatsApp:</strong>
                  <span>+263 714 701 721</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-white rounded-xl text-[#0B5E8E] shadow-sm shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-[#0B5E8E] text-xs font-bold uppercase tracking-wider mb-0.5">Email:</strong>
                  <span>travel@outboundholidays.co.zw</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-white rounded-xl text-[#0B5E8E] shadow-sm shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-[#0B5E8E] text-xs font-bold uppercase tracking-wider mb-0.5">Office Hours:</strong>
                  <span>Mon - Sun: 7:30 AM - 7:00 PM (CAT)</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#0B5E8E]/15">
              <button
                onClick={openWhatsApp}
                className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-sm py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <WhatsAppIcon className="w-5 h-5 shrink-0" />
                <span>Chat Instantly on WhatsApp (+263 714 701 721)</span>
              </button>
            </div>
          </div>

          {/* Message Form (Right 7 Cols) */}
          <div className="lg:col-span-7 bg-white p-8 rounded-[24px] border border-gray-200/80 shadow-[0_16px_40px_rgba(47,58,68,0.06)]">
            {submitted ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-16 h-16 bg-[#3F6B3C]/10 text-[#3F6B3C] rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold font-serif text-[#0B5E8E]">Message Sent!</h3>
                <p className="text-xs sm:text-sm text-[#2F3A44]/80 max-w-md mx-auto leading-relaxed">
                  Thank you for contacting Outbound Holidays. One of our Victoria Falls travel specialists will review your inquiry and get back to you shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="bg-[#0B5E8E] text-white font-bold text-xs px-6 py-3 rounded-xl hover:bg-[#094b72] cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-bold text-xl text-[#0B5E8E] font-serif mb-2">Send Us A Message</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#2F3A44] mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tendai Moyo"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0B5E8E]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#2F3A44] mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0B5E8E]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2F3A44] mb-1">Phone / WhatsApp Number</label>
                  <input
                    type="tel"
                    placeholder="+263 77 000 0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0B5E8E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2F3A44] mb-1">Your Message or Inquiry *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell us what you'd like to know about visiting Victoria Falls, packages, or lodging..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0B5E8E]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#E67E22] hover:bg-[#d36e17] text-white font-bold text-sm py-4 rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
