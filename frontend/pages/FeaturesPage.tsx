import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Syringe, Calendar, Baby, Apple, Users, ShoppingBag, 
  BrainCircuit, Languages, LayoutDashboard, User, BookOpen, Droplet,
  ArrowRight, CheckCircle2
} from 'lucide-react';
import { useTranslations } from '../i18n/I18nContext';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import { SmoothScrollProvider } from '../components/landing/SmoothScrollProvider';
import { Reveal } from '../components/landing/motion/Reveal';
import { Stagger, StaggerItem } from '../components/landing/motion/Stagger';

const FeaturesPage: React.FC = () => {
  const { t } = useTranslations();

  const features = [
    { icon: <Calendar />, title: t('nav.appointments'), color: 'bg-orange-50 text-orange-600' },
    { icon: <Syringe />, title: t('nav.vaccines'), color: 'bg-blue-50 text-blue-600' },
    { icon: <Baby />, title: t('nav.pregnancy'), color: 'bg-emerald-50 text-emerald-700' },
    { icon: <Apple />, title: t('nav.nutrition'), color: 'bg-green-50 text-green-600' },
    { icon: <BookOpen />, title: t('nav.journal'), color: 'bg-indigo-50 text-indigo-600' },
    { icon: <Users />, title: t('nav.community'), color: 'bg-slate-50 text-slate-700' },
    { icon: <Droplet />, title: t('nav.donors'), color: 'bg-red-50 text-red-600' },
    { icon: <ShoppingBag />, title: t('nav.pharmacy'), color: 'bg-teal-50 text-teal-600' },
    { icon: <BrainCircuit />, title: t('nav.assistant'), color: 'bg-[#BFE6DA]/20 text-teal-800' },
    { icon: <Languages />, title: t('nav.translator'), color: 'bg-gray-50 text-gray-600' },
    { icon: <User />, title: t('nav.profile'), color: 'bg-amber-50 text-amber-600' },
    { icon: <LayoutDashboard />, title: t('nav.dashboard'), color: 'bg-sky-50 text-sky-600' },
  ];

  return (
    <SmoothScrollProvider>
      <div className="min-h-screen bg-[#F7F5EF]">
        <Navbar />
        <main className="pt-24">
          {/* Hero */}
          <section className="py-20 px-6 text-center">
            <div className="max-w-4xl mx-auto">
              <Reveal>
                <h1 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 mb-6">{t('featuresPage.title')}</h1>
              </Reveal>
              <Reveal delay={0.2}>
                <p className="text-xl text-gray-500">{t('featuresPage.subtitle')}</p>
              </Reveal>
            </div>
          </section>

          {/* Feature Grid */}
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6">
              <Stagger staggerDelay={0.08}>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                  {features.map((f, i) => (
                    <StaggerItem key={i} y={18}>
                      <div className="p-8 bg-[#F7F5EF] rounded-[40px] hover:scale-105 transition-all group h-full flex flex-col">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm ${f.color} group-hover:rotate-6 transition-transform`}>
                          {/* 
                            Fix: Using React.ReactElement<any> to allow the 'size' prop when cloning the icon element. 
                            Lucide icons accept size but React.ReactElement's default props type is unknown.
                          */}
                          {React.cloneElement(f.icon as React.ReactElement<any>, { size: 28 })}
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">{f.title}</h3>
                        <div className="mt-auto">
                          <Link to="/register" className="text-xs font-bold text-[#D4B56A] uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                            Learn More <ArrowRight size={14} />
                          </Link>
                        </div>
                      </div>
                    </StaggerItem>
                  ))}
                </div>
              </Stagger>
            </div>
          </section>

          {/* How it Works */}
          <section className="py-24 px-6">
            <div className="max-w-7xl mx-auto">
              <Reveal>
                <h2 className="text-4xl font-serif font-bold text-center text-gray-900 mb-16">{t('featuresPage.howItWorks')}</h2>
              </Reveal>
              <Stagger staggerDelay={0.2}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  {[
                    { step: '01', title: t('featuresPage.step1'), desc: t('featuresPage.step1Desc') },
                    { step: '02', title: t('featuresPage.step2'), desc: t('featuresPage.step2Desc') },
                    { step: '03', title: t('featuresPage.step3'), desc: t('featuresPage.step3Desc') },
                  ].map((s, i) => (
                    <StaggerItem key={i} y={30}>
                      <div className="relative p-10 bg-white rounded-[48px] shadow-sm border border-gray-100 h-full">
                        <div className="absolute -top-6 -left-6 w-16 h-16 bg-[#BFE6DA] text-teal-900 font-serif font-bold text-2xl flex items-center justify-center rounded-2xl shadow-lg">
                          {s.step}
                        </div>
                        <h3 className="text-xl font-bold mb-4 mt-2">{s.title}</h3>
                        <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                      </div>
                    </StaggerItem>
                  ))}
                </div>
              </Stagger>
            </div>
          </section>

          {/* CTA */}
          <section className="py-24 bg-teal-900 text-white overflow-hidden relative">
            <Reveal y={50}>
              <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                <h2 className="text-4xl font-serif font-bold mb-8">Ready to start your journey?</h2>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/register" className="px-10 py-5 bg-[#E6C77A] text-white rounded-full font-bold shadow-xl hover:scale-105 transition-all">Create Account</Link>
                  <Link to="/login" className="px-10 py-5 bg-white/10 backdrop-blur-md text-white rounded-full font-bold border border-white/20 hover:bg-white/20 transition-all">Sign In</Link>
                </div>
              </div>
            </Reveal>
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-[80px]"></div>
          </section>
        </main>
        <Footer />
      </div>
    </SmoothScrollProvider>
  );
};

export default FeaturesPage;
