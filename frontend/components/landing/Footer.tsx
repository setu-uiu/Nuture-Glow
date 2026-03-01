import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Instagram, Twitter, Facebook } from 'lucide-react';
import { Logo } from '../../constants';
import { useTranslations } from '../../i18n/I18nContext';

const Footer: React.FC = () => {
  const { locale, setLocale, t } = useTranslations();

  return (
    <footer className="bg-white pt-24 pb-12 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Logo />
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-800 leading-tight">{t('footer.brandName')}</h1>
                <span className="text-xl font-bold text-gray-800 leading-tight">{t('footer.brandTagline')}</span>
              </div>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              {t('footer.description')}
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-[#E6C77A] transition-colors"><Instagram size={18}/></a>
              <a href="#" className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-[#E6C77A] transition-colors"><Twitter size={18}/></a>
              <a href="#" className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-[#E6C77A] transition-colors"><Facebook size={18}/></a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-6">{t('footer.platform')}</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><Link to="/how-it-works" className="hover:text-[#E6C77A]">{t('footer.howItWorks')}</Link></li>
              <li><Link to="/features" className="hover:text-[#E6C77A]">{t('footer.features')}</Link></li>
              <li><Link to="/pricing" className="hover:text-[#E6C77A]">{t('footer.pricing')}</Link></li>
              <li><Link to="/mobile-app" className="hover:text-[#E6C77A]">{t('footer.mobileApp')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-6">{t('footer.support')}</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><Link to="/help-center" className="hover:text-[#E6C77A]">{t('footer.helpCenter')}</Link></li>
              <li><Link to="/privacy" className="hover:text-[#E6C77A]">{t('footer.privacy')}</Link></li>
              <li><Link to="/terms" className="hover:text-[#E6C77A]">{t('footer.terms')}</Link></li>
              <li><Link to="/cookie-policy" className="hover:text-[#E6C77A]">{t('footer.cookie')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-6">{t('footer.language')}</h4>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => setLocale('en')}
                aria-pressed={locale === 'en'}
                className={`flex items-center justify-start gap-3 px-5 py-3 rounded-2xl text-sm font-bold transition-all border ${
                  locale === 'en' 
                    ? 'bg-[#BFE6DA] border-[#BFE6DA] text-teal-900 shadow-sm scale-[1.02]' 
                    : 'bg-white border-gray-100 text-gray-400 hover:border-[#BFE6DA] hover:text-teal-600'
                }`}
              >
                <div className={`p-1 rounded-lg ${locale === 'en' ? 'bg-white text-teal-600' : 'bg-gray-50 text-gray-300'}`}>
                  <Globe size={16}/>
                </div>
                English
              </button>
              <button 
                onClick={() => setLocale('bn')}
                aria-pressed={locale === 'bn'}
                className={`flex items-center justify-start gap-3 px-5 py-3 rounded-2xl text-sm font-bold transition-all border ${
                  locale === 'bn' 
                    ? 'bg-[#BFE6DA] border-[#BFE6DA] text-teal-900 shadow-sm scale-[1.02]' 
                    : 'bg-white border-gray-100 text-gray-400 hover:border-[#BFE6DA] hover:text-teal-600'
                }`}
              >
                <div className={`p-1 rounded-lg ${locale === 'bn' ? 'bg-white text-teal-600' : 'bg-gray-50 text-gray-300'}`}>
                  <Globe size={16}/>
                </div>
                বাংলা
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-xs">© {locale === 'bn' ? '২০২৪' : '2024'} {t('footer.brandName')} {t('footer.brandTagline')}. {t('footer.rights')}</p>
          <div className="flex items-center gap-6 text-xs text-gray-400">
            <Link to="/privacy" className="hover:text-gray-600">{t('footer.privacyLink')}</Link>
            <Link to="/terms" className="hover:text-gray-600">{t('footer.termsLink')}</Link>
            <Link to="/sitemap" className="hover:text-gray-600">{t('footer.sitemap')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;