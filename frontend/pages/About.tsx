import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, Eye, Target, ArrowRight } from 'lucide-react';
import { useTranslations } from '../i18n/I18nContext';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import { SmoothScrollProvider } from '../components/landing/SmoothScrollProvider';
import { Reveal } from '../components/landing/motion/Reveal';
import { Stagger, StaggerItem } from '../components/landing/motion/Stagger';
import { ParallaxImage } from '../components/landing/motion/ParallaxImage';

const About: React.FC = () => {
  const { t } = useTranslations();

  return (
    <SmoothScrollProvider>
      <div className="min-h-screen bg-[#F7F5EF]">
        <Navbar />
        <main className="pt-24">
          {/* Hero Section */}
          <section className="py-20 px-6">
            <div className="max-w-4xl mx-auto text-center">
              <Reveal>
                <h1 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 mb-6">{t('about.title')}</h1>
              </Reveal>
              <Reveal delay={0.2}>
                <p className="text-xl text-gray-600 leading-relaxed italic">"{t('about.subtitle')}"</p>
              </Reveal>
            </div>
          </section>

          {/* Story Section */}
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <Reveal>
                <div className="relative">
                  <ParallaxImage 
                    src="https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=1000" 
                    alt="Healthcare Professional" 
                    className="rounded-[48px] shadow-2xl aspect-[4/5]"
                  />
                  <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-[#BFE6DA] rounded-full -z-10"></div>
                </div>
              </Reveal>
              
              <div className="space-y-8">
                <Reveal>
                  <h2 className="text-4xl font-serif font-bold text-gray-900">{t('about.storyTitle')}</h2>
                </Reveal>
                <Reveal delay={0.2}>
                  <p className="text-lg text-gray-500 leading-relaxed">{t('about.storyBody')}</p>
                </Reveal>
                
                <Stagger staggerDelay={0.1}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                    <StaggerItem>
                      <div className="p-6 bg-[#F7F5EF] rounded-3xl h-full">
                        <Target className="text-[#D4B56A] mb-4" size={32} />
                        <h4 className="font-bold mb-2">{t('about.mission')}</h4>
                        <p className="text-xs text-gray-400">{t('about.missionDesc')}</p>
                      </div>
                    </StaggerItem>
                    <StaggerItem>
                      <div className="p-6 bg-[#F7F5EF] rounded-3xl h-full">
                        <Eye className="text-[#D4B56A] mb-4" size={32} />
                        <h4 className="font-bold mb-2">{t('about.vision')}</h4>
                        <p className="text-xs text-gray-400">{t('about.visionDesc')}</p>
                      </div>
                    </StaggerItem>
                    <StaggerItem>
                      <div className="p-6 bg-[#F7F5EF] rounded-3xl h-full">
                        <Heart className="text-[#D4B56A] mb-4" size={32} />
                        <h4 className="font-bold mb-2">{t('about.values')}</h4>
                        <p className="text-xs text-gray-400">{t('about.valuesDesc')}</p>
                      </div>
                    </StaggerItem>
                  </div>
                </Stagger>
              </div>
            </div>
          </section>

          {/* Safety & Trust */}
          <section className="py-24 px-6">
            <Reveal y={40}>
              <div className="max-w-3xl mx-auto bg-white p-12 rounded-[48px] shadow-sm border border-gray-100 text-center">
                <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                  <ShieldCheck size={40} />
                </div>
                <h2 className="text-3xl font-serif font-bold text-gray-900 mb-6">{t('about.safetyTitle')}</h2>
                <p className="text-gray-500 leading-relaxed mb-10">{t('about.safetyBody')}</p>
                <Link 
                  to="/register"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-[#E6C77A] text-white rounded-full font-bold shadow-lg shadow-[#E6C77A]/20 hover:scale-105 transition-all"
                >
                  Join Our Community
                  <ArrowRight size={18} />
                </Link>
              </div>
            </Reveal>
          </section>
        </main>
        <Footer />
      </div>
    </SmoothScrollProvider>
  );
};

export default About;
