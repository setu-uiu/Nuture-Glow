import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from '../../i18n/I18nContext';

const Hero: React.FC = () => {
  const { user } = useAuth();
  const { t, locale } = useTranslations();
  const [imgError, setImgError] = useState(false);

  // High-res professional maternal image matching the requested "soft, warm, caring" vibe
  const primaryHeroImg = "https://images.unsplash.com/photo-1544126592-807daa2b567b?q=80&w=2574&auto=format&fit=crop";
  const fallbackImg = "https://images.unsplash.com/photo-1531983412531-1f49a365ffed?q=80&w=2574&auto=format&fit=crop";

  return (
    <section id="home" className="relative h-screen min-h-[600px] w-full overflow-hidden flex items-center bg-gradient-to-br from-yellow-50 via-amber-50 to-white">
      {/* Background Layer: Cinematic Image */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img 
          src={imgError ? fallbackImg : primaryHeroImg} 
          alt="Nurture Glow - Premium Mother & Baby Care" 
          className="w-full h-full object-cover object-center animate-hero-bg opacity-60"
          onError={() => setImgError(true)}
        />
        
        {/* Modern Gradient Overlay - Rose to Purple */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-300/30 via-slate-200/20 to-slate-100/30 z-10" />
        
        {/* Vignette effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent z-10" />
      </div>

      {/* Content Layer with Staggered Animation */}
      <div className="relative z-20 max-w-[1500px] mx-auto px-10 w-full pt-16 hero-content-wrapper">
        <div className="max-w-4xl space-y-6 md:space-y-10">
          
          {/* Badge Pill */}
          <div className="animate-hero-content" style={{ animationDelay: '0.2s' }}>
            <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-white/60 shadow-lg hover:shadow-xl transition-all">
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500"></span>
              <span className="text-xs font-bold text-gray-700 uppercase tracking-widest">
                {t('landing.hero.badge')}
              </span>
            </div>
          </div>

          {/* Main Headline */}
          <div className={locale === 'bn' ? 'flex items-center gap-2' : 'space-y-2'}>
            <h1 
              className={`text-6xl md:text-7xl font-bold leading-tight tracking-tight animate-hero-content whitespace-nowrap ${
                locale === 'bn' ? 'text-emerald-800' : 'text-gray-900'
              }`}
              style={{ animationDelay: '0.4s' }}
            >
              {t('landing.hero.title')}
            </h1>
            <h2 
              className={`text-6xl md:text-7xl font-bold leading-tight tracking-tight animate-hero-content whitespace-nowrap ${
                locale === 'bn' ? 'text-emerald-800' : 'bg-gradient-to-r from-emerald-700 to-emerald-600 bg-clip-text text-transparent'
              }`}
              style={{ animationDelay: '0.6s' }}
            >
              {t('landing.hero.subtitle')}
            </h2>
          </div>

          {/* Subtitle Text */}
          <p 
            className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-2xl font-normal animate-hero-content"
            style={{ animationDelay: '0.8s' }}
          >
            {t('landing.hero.desc')}
          </p>

          {/* Action Buttons */}
          <div 
            className="flex flex-col sm:flex-row items-center gap-5 pt-6 animate-hero-content"
            style={{ animationDelay: '1.0s' }}
          >
            <Link 
              to={user ? "/dashboard" : "/signup"} 
              className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-emerald-700 to-emerald-600 text-white rounded-xl font-bold shadow-lg hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-2"
            >
              {t('landing.hero.cta')}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 opacity-40 animate-bounce">
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-widest">{t('landing.hero.scroll')}</span>
        <div className="w-0.5 h-8 bg-gradient-to-b from-emerald-500 to-transparent rounded-full" />
      </div>
    </section>
  );
};

export default Hero;
