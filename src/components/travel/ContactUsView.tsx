import React, { useState } from 'react';
import { Phone, Mail, MapPin, MessageSquare, Clock, Send, Check } from 'lucide-react';

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
    const text = encodeURIComponent('Hi Outbound Holidays! I am interested in planning a Victoria Falls trip and would like advice.');
    window.open(`https://wa.me/263771234567?text=${text}`, '_blank');
  };

  return (
    <div id="contact-us" className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-[#C9A66B] uppercase tracking-widest block">
            We're Here To Help
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-serif text-[#0B5E8E]">
            Contact Our Travel Specialists
          </h2>
          <p className="text-xs sm:text-sm text-gray-600">
            Reach out via WhatsApp for immediate response, or send us a message and our Victoria Falls office will reply within 2 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Info & WhatsApp Direct Box */}
          <div className="lg:col-span-5 space-y-6 bg-white p-8 rounded-2xl border border-gray-200 shadow-xs">
            <h3 className="font-bold text-lg text-[#0B5E8E] font-serif mb-4">Direct Contact Information</h3>

            <div className="space-y-4 text-xs text-gray-700">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-[#0B5E8E]/10 rounded-lg text-[#0B5E8E]">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-gray-900 text-sm">Victoria Falls Office:</strong>
                  <span>Suite 4, Mosi-oa-Tunya Commercial Centre, Victoria Falls, Zimbabwe</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-[#0B5E8E]/10 rounded-lg text-[#0B5E8E]">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-gray-900 text-sm">Phone Line:</strong>
                  <span>+263 77 123 4567 / +263 13 44000</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-[#0B5E8E]/10 rounded-lg text-[#0B5E8E]">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-gray-900 text-sm">Email:</strong>
                  <span>travel@outboundholidays.co.zw</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-[#0B5E8E]/10 rounded-lg text-[#0B5E8E]">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-gray-900 text-sm">Office Hours:</strong>
                  <span>Mon - Sun: 7:30 AM - 7:00 PM (CAT) • 24/7 Concierge for active travellers</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <button
                onClick={openWhatsApp}
                className="w-full bg-[#3F6B3C] hover:bg-[#345731] text-white font-bold text-sm py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors"
              >
                <MessageSquare className="w-5 h-5" />
                <span>Chat Instantly on WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7 bg-white p-8 rounded-2xl border border-gray-200 shadow-xs">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-[#3F6B3C]/10 text-[#3F6B3C] rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-[#0B5E8E]">Message Sent!</h3>
                <p className="text-xs text-gray-600 max-w-md mx-auto">
                  Thank you for contacting Outbound Holidays. One of our Victoria Falls travel specialists will review your inquiry and get back to you shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="bg-[#0B5E8E] text-white font-bold text-xs px-6 py-2.5 rounded-md hover:bg-[#094b72]"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-bold text-lg text-[#0B5E8E] font-serif mb-2">Send Us A Message</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tendai Moyo"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Phone / WhatsApp Number</label>
                  <input
                    type="tel"
                    placeholder="+263 77 000 0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Your Message or Inquiry *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell us what you'd like to know about visiting Victoria Falls, packages, or lodging..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#0B5E8E] hover:bg-[#094b72] text-white font-bold text-sm py-3 rounded-lg shadow-md flex items-center justify-center gap-2 transition-colors"
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
