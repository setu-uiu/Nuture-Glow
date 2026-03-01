import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { useTranslations } from '../i18n/I18nContext';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import { SmoothScrollProvider } from '../components/landing/SmoothScrollProvider';
import { Reveal } from '../components/landing/motion/Reveal';
import { Stagger, StaggerItem } from '../components/landing/motion/Stagger';

const Contact: React.FC = () => {
  const { t } = useTranslations();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate database storage
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
    }, 1500);
  };

  return (
    <SmoothScrollProvider>
      <div className="min-h-screen bg-[#F7F5EF]">
        <Navbar />
        <main className="pt-24">
          {/* Hero */}
          <section className="py-20 px-6 text-center">
            <div className="max-w-4xl mx-auto">
              <Reveal>
                <h1 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 mb-6">{t('contact.title')}</h1>
              </Reveal>
              <Reveal delay={0.2}>
                <p className="text-xl text-gray-500">{t('contact.subtitle')}</p>
              </Reveal>
            </div>
          </section>

          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20">
              {/* Contact Info */}
              <div className="space-y-12">
                <Reveal>
                  <h2 className="text-4xl font-serif font-bold text-gray-900">Let's Talk Care.</h2>
                </Reveal>
                
                <Stagger staggerDelay={0.15}>
                  <div className="space-y-8">
                    <StaggerItem y={15}>
                      <div className="flex gap-6 items-center">
                        <div className="w-16 h-16 bg-[#BFE6DA]/20 text-teal-600 rounded-3xl flex items-center justify-center shadow-inner">
                          <Mail size={24} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Email Us</p>
                          <p className="text-xl font-bold text-gray-800">{t('contact.email')}</p>
                        </div>
                      </div>
                    </StaggerItem>
                    
                    <StaggerItem y={15}>
                      <div className="flex gap-6 items-center">
                        <div className="w-16 h-16 bg-[#BFE6DA]/20 text-teal-600 rounded-3xl flex items-center justify-center shadow-inner">
                          <Phone size={24} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Call Support</p>
                          <p className="text-xl font-bold text-gray-800">{t('contact.phone')}</p>
                        </div>
                      </div>
                    </StaggerItem>
                    
                    <StaggerItem y={15}>
                      <div className="flex gap-6 items-center">
                        <div className="w-16 h-16 bg-[#BFE6DA]/20 text-teal-600 rounded-3xl flex items-center justify-center shadow-inner">
                          <MapPin size={24} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Our Office</p>
                          <p className="text-xl font-bold text-gray-800">{t('contact.location')}</p>
                        </div>
                      </div>
                    </StaggerItem>
                  </div>
                </Stagger>
              </div>

              {/* Form */}
              <Reveal delay={0.3}>
                <div className="bg-[#F7F5EF] p-10 rounded-[48px] shadow-inner">
                  {submitted ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in-95 duration-300">
                      <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg">
                        <CheckCircle2 size={40} />
                      </div>
                      <h3 className="text-2xl font-bold">{t('contact.success')}</h3>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">{t('contact.formName')}</label>
                          <input 
                            required 
                            className="w-full p-4 bg-white border-none rounded-2xl focus:ring-2 focus:ring-[#BFE6DA] outline-none shadow-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">{t('contact.formEmail')}</label>
                          <input 
                            type="email" 
                            required 
                            className="w-full p-4 bg-white border-none rounded-2xl focus:ring-2 focus:ring-[#BFE6DA] outline-none shadow-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">{t('contact.formMsg')}</label>
                        <textarea 
                          required 
                          rows={5}
                          className="w-full p-4 bg-white border-none rounded-2xl focus:ring-2 focus:ring-[#BFE6DA] outline-none shadow-sm resize-none"
                        ></textarea>
                      </div>
                      <button 
                        disabled={loading}
                        className="w-full py-5 bg-[#E6C77A] text-white rounded-2xl font-bold shadow-xl shadow-[#E6C77A]/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        {loading ? t('common.loading') : (
                          <>
                            {t('contact.send')}
                            <Send size={18} />
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </Reveal>
            </div>
          </section>

          {/* Map Placeholder */}
          <section className="py-24 px-6">
            <Reveal y={40}>
              <div className="max-w-7xl mx-auto h-[400px] bg-gray-200 rounded-[48px] flex items-center justify-center relative overflow-hidden group">
                <img 
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=2000" 
                  alt="Map Background" 
                  loading="lazy"
                  className="w-full h-full object-cover opacity-50 grayscale group-hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-[#E6C77A]/10"></div>
                <div className="absolute p-8 bg-white rounded-3xl shadow-2xl flex items-center gap-4">
                  <MapPin className="text-[#E6C77A]" size={24} />
                  <p className="font-bold">Banani, Dhaka - 1213</p>
                </div>
              </div>
            </Reveal>
          </section>
        </main>
        <Footer />
      </div>
    </SmoothScrollProvider>
  );
};

export default Contact;
