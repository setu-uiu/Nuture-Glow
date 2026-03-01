import React, { useEffect } from 'react';
import { 
  CheckCircle2, Mail, Send,
  Syringe, Calendar, Baby, Apple, Users, ShoppingBag, 
  BrainCircuit, Heart, Sparkles, Star, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import Footer from '../components/landing/Footer';
import { useTranslations } from '../i18n/I18nContext';

const Landing: React.FC = () => {
  const { t } = useTranslations();
  const [formData, setFormData] = React.useState({ name: '', email: '' });
  const [formStatus, setFormStatus] = React.useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('submitting');
    
    // Simulate API call
    setTimeout(() => {
      setFormStatus('success');
      setFormData({ name: '', email: '' });
      setTimeout(() => setFormStatus('idle'), 3000);
    }, 1000);
  };

  // Robust Scroll Reveal Observer
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          // Once revealed, we don't need to observe it anymore
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach(el => observer.observe(el));
    
    return () => observer.disconnect();
  }, []);

  const featureCards = [
    { icon: <Calendar />, title: t('landing.features.items.appointments'), desc: t('landing.features.items.appointmentsDesc'), color: "bg-emerald-50 text-emerald-700", gradient: "from-emerald-50 to-green-50" },
    { icon: <Syringe />, title: t('landing.features.items.vaccines'), desc: t('landing.features.items.vaccinesDesc'), color: "bg-slate-50 text-slate-700", gradient: "from-slate-50 to-gray-50" },
    { icon: <Apple />, title: t('landing.features.items.nutrition'), desc: t('landing.features.items.nutritionDesc'), color: "bg-yellow-50 text-yellow-800", gradient: "from-yellow-50 to-amber-50" },
    { icon: <Baby />, title: t('landing.features.items.journey'), desc: t('landing.features.items.journeyDesc'), color: "bg-amber-50 text-amber-900", gradient: "from-amber-50 to-yellow-50" },
    { icon: <BrainCircuit />, title: t('landing.features.items.assistant'), desc: t('landing.features.items.assistantDesc'), color: "bg-teal-50 text-teal-800", gradient: "from-teal-50 to-cyan-50" },
    { icon: <ShoppingBag />, title: t('landing.features.items.pharmacy'), desc: t('landing.features.items.pharmacyDesc'), color: "bg-green-50 text-green-800", gradient: "from-green-50 to-emerald-50" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 via-amber-50 to-white selection:bg-yellow-200 selection:text-gray-900 overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />

        {/* Section: About */}
        <section id="about" className="py-20 bg-gradient-to-r from-yellow-50 via-amber-50 to-yellow-25">
          <div className="max-w-[1400px] mx-auto px-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="reveal">
                <span className="inline-block px-4 py-2 bg-yellow-200 text-yellow-900 font-bold text-xs uppercase tracking-[0.2em] mb-4 rounded-full shadow-sm">{t('landing.about.badge')}</span>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-[1.15] tracking-tight mb-4 font-display">
                  {t('landing.about.title')}
                </h2>
                <p className="text-base text-gray-700 leading-[1.8] font-normal mt-4 mb-8 max-w-xl font-sans">
                  {t('landing.about.desc')}
                </p>
                <div className="grid grid-cols-2 gap-8 pt-4">
                  <div className="space-y-1">
                    <p className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-green-700 bg-clip-text text-transparent font-display">{t('landing.about.accuracyPercent')}</p>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-[0.15em] font-sans">{t('landing.about.accuracy')}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-3xl font-bold bg-gradient-to-r from-amber-900 to-yellow-800 bg-clip-text text-transparent font-display">{t('landing.about.supportTime')}</p>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-[0.15em] font-sans">{t('landing.about.support')}</p>
                  </div>
                </div>
              </div>
              <div className="reveal relative" style={{ transitionDelay: '0.3s' }}>
                <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-8 border-white/80">
                  <img src="https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=1200" loading="lazy" className="w-full h-full object-cover" alt="Nurturing Pregnancy Care" />
                </div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-emerald-600 to-green-700 rounded-2xl z-10 flex items-center justify-center shadow-2xl border-4 border-white">
                   <Heart className="text-white" size={40} fill="currentColor" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Features */}
        <section id="features" className="py-20 bg-white">
          <div className="max-w-[1400px] mx-auto px-10">
            <div className="reveal text-center max-w-4xl mx-auto mb-16">
              <span className="inline-block px-4 py-2 bg-yellow-200 text-yellow-900 font-bold text-xs uppercase tracking-[0.2em] mb-4 rounded-full shadow-sm">{t('landing.features.badge')}</span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight leading-[1.15] font-display">{t('landing.features.title')}</h2>
              <p className="text-gray-700 text-lg font-normal leading-[1.7] font-sans">{t('landing.features.desc')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featureCards.map((f, i) => (
                <div 
                  key={i} 
                  className={`reveal group relative p-6 bg-white rounded-2xl hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden hover:-translate-y-1 bg-gradient-to-br ${f.gradient}`}
                  style={{ transitionDelay: `${i * 0.1}s` }}
                >
                  {/* Decorative gradient blob */}
                  <div className="absolute -top-16 -right-16 w-40 h-40 bg-gradient-to-br from-emerald-200 to-transparent rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
                  
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-md transition-all group-hover:scale-110 bg-white ${f.color}`}>
                    {React.cloneElement(f.icon as React.ReactElement<any>, { size: 24 })}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 tracking-tight font-sans">{f.title}</h3>
                  <p className="text-gray-700 text-sm leading-[1.65] font-sans">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section: Pricing */}
        <section id="pricing" className="py-20 bg-gradient-to-b from-slate-50 to-white">
          <div className="max-w-[1400px] mx-auto px-10">
            <div className="reveal flex flex-col lg:flex-row justify-between items-end mb-12 gap-8">
              <div className="max-w-3xl">
                <span className="inline-block px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-[0.2em] mb-4 rounded-full shadow-sm">{t('landing.pricing.badge')}</span>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-[1.15] tracking-tight font-display">{t('landing.pricing.title')}</h2>
              </div>
              <Link to="/signup" className="px-8 py-3 bg-gradient-to-r from-emerald-700 to-emerald-600 text-white rounded-full font-semibold text-sm uppercase tracking-wider hover:shadow-lg hover:-translate-y-0.5 transition-all">{t('landing.pricing.compare')}</Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: t('landing.pricing.plans.essential'), price: "0", icon: <Heart size={28}/>, features: ["Basic Health Logs", "Public Community", "Vaccine Alerts"], color: "from-emerald-50 to-yellow-50" },
                { name: t('landing.pricing.plans.glowing'), price: "1,200", icon: <Star size={28}/>, featured: true, features: ["AI Health Ally", "Video Consults", "Priority Pharmacy"], color: "from-slate-50 to-emerald-50" },
                { name: t('landing.pricing.plans.legacy'), price: "2,500", icon: <Sparkles size={28}/>, features: ["Family Hub", "Emergency Care", "Home Sample Pickup"], color: "from-amber-50 to-orange-50" },
              ].map((plan, i) => (
                <div 
                  key={i} 
                  className={`reveal relative p-6 rounded-3xl border-2 transition-all flex flex-col h-full group ${plan.featured ? 'border-emerald-300 bg-gradient-to-br from-emerald-50 via-yellow-25 to-slate-50 shadow-2xl -translate-y-4 ring-1 ring-emerald-200' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                  style={{ transitionDelay: `${i * 0.15}s` }}
                >
                  {plan.featured && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-full">Popular</div>
                  )}
                  <div className="mb-6 p-3 bg-white rounded-2xl w-fit text-emerald-700 shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all">{plan.icon}</div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900 tracking-tight font-sans">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-3xl font-bold text-gray-900 font-display">৳{plan.price}</span>
                    {plan.price !== "0" && <span className="text-gray-600 text-sm font-medium font-sans">/mo</span>}
                  </div>
                  <ul className="space-y-3 mb-6 flex-1">
                    {plan.features.map((f, j) => (
                      <li key={j} className="text-sm text-gray-700 flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-700 flex-shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Link 
                    to="/signup" 
                    className={`w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider text-center transition-all flex items-center justify-center gap-2 ${plan.featured ? 'bg-gradient-to-r from-emerald-700 to-emerald-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-1' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    {t('landing.pricing.select')} <ArrowRight size={16} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section: Contact */}
        <section id="contact" className="py-20 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
          <div className="max-w-[1400px] mx-auto px-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="reveal text-white space-y-8">
                  <div>
                    <h2 className="text-4xl md:text-5xl font-bold leading-[1.15] tracking-tight font-display">{t('landing.contact.title')} <br /><span className="bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent italic">{t('landing.contact.italic')}</span></h2>
                    <p className="text-gray-300 text-base font-normal mt-6 leading-[1.7] max-w-lg font-sans">{t('landing.contact.desc')}</p>
                  </div>
                  <div className="flex gap-6 items-center group">
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300"><Mail size={24} /></div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-[0.15em] mb-1 font-sans">{t('landing.contact.concierge')}</p>
                      <p className="font-bold text-xl tracking-tight text-white font-sans">hello@nurtureglow.com</p>
                    </div>
                  </div>
                </div>

                <div className="reveal bg-white p-8 rounded-3xl shadow-2xl" style={{ transitionDelay: '0.3s' }}>
                    <form className="space-y-4" onSubmit={handleFormSubmit}>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-[0.15em] ml-2 font-sans">{t('landing.contact.form.name')}</label>
                        <input 
                          required 
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full p-3 bg-gray-50 rounded-xl outline-none border-2 border-gray-200 focus:border-amber-400 transition-colors font-medium text-gray-900 font-sans"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-[0.15em] ml-2 font-sans">{t('landing.contact.form.email')}</label>
                        <input 
                          type="email" 
                          required 
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full p-3 bg-gray-50 rounded-xl outline-none border-2 border-gray-200 focus:border-amber-400 transition-colors font-medium text-gray-900 font-sans"
                        />
                      </div>
                      {formStatus === 'success' && (
                        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium text-center">
                          ✓ Thank you! We'll get back to you soon.
                        </div>
                      )}
                      <button 
                        type="submit" 
                        disabled={formStatus === 'submitting'}
                        className="w-full py-3 bg-gradient-to-r from-emerald-700 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3 uppercase tracking-wider text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {formStatus === 'submitting' ? 'Sending...' : t('landing.contact.form.submit')} <Send size={18} />
                      </button>
                    </form>
                </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Landing;
