import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, Star, Sparkles, Heart } from 'lucide-react';
import { useTranslations } from '../i18n/I18nContext';
import { apiFetch } from '../services/api';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import { SmoothScrollProvider } from '../components/landing/SmoothScrollProvider';
import { Reveal } from '../components/landing/motion/Reveal';
import { Stagger, StaggerItem } from '../components/landing/motion/Stagger';

interface PlanRow {
  id: number;
  plan_name: string;
  price: number;
  currency: string;
  billing_cycle: string;
  features: string[];
  is_popular: number;
  badge_text: string | null;
}

interface FaqRow {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const PLAN_ICONS = [
  <Heart className="text-gray-400" />,
  <Star className="text-[#E6C77A]" />,
  <Sparkles className="text-emerald-600" />
];

const Products: React.FC = () => {
  const { t } = useTranslations();
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [faqs, setFaqs] = useState<FaqRow[]>([]);

  // SQL: Load subscription plans from database
  useEffect(() => {
    const loadPlans = async () => {
      try {
        const data = await apiFetch<{ items: PlanRow[] }>('/api/subscription-plans');
        if (data.items) setPlans(data.items);
      } catch (err) {
        console.error('Failed to load plans from DB:', err);
      }
    };
    loadPlans();
  }, []);

  // SQL: Load FAQs from database
  useEffect(() => {
    const loadFaqs = async () => {
      try {
        const data = await apiFetch<{ items: FaqRow[] }>('/api/faqs');
        if (data.items) setFaqs(data.items);
      } catch (err) {
        console.error('Failed to load FAQs from DB:', err);
      }
    };
    loadFaqs();
  }, []);

  return (
    <SmoothScrollProvider>
      <div className="min-h-screen bg-[#F7F5EF]">
        <Navbar />
        <main className="pt-24">
          {/* Hero */}
          <section className="py-20 px-6 text-center">
            <div className="max-w-4xl mx-auto">
              <Reveal>
                <h1 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 mb-6">{t('products.title')}</h1>
              </Reveal>
              <Reveal delay={0.2}>
                <p className="text-xl text-gray-500">{t('products.subtitle')}</p>
              </Reveal>
            </div>
          </section>

          {/* Plans */}
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6">
              <Stagger staggerDelay={0.15}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {plans.map((p, i) => {
                    const featured = !!p.is_popular;
                    const icon = PLAN_ICONS[i] || PLAN_ICONS[0];
                    const priceStr = p.price.toLocaleString();
                    return (
                    <StaggerItem key={p.id} y={30}>
                      <div className={`p-10 rounded-[48px] border-2 transition-all flex flex-col h-full ${featured ? 'border-[#E6C77A] bg-[#F7F5EF] shadow-xl scale-105' : 'border-gray-50 bg-white shadow-sm'}`}>
                        <div className="flex justify-between items-start mb-8">
                          <div className="p-4 bg-white rounded-2xl shadow-inner">{icon}</div>
                          {featured && <span className="bg-[#E6C77A] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">{p.badge_text || 'Popular'}</span>}
                        </div>
                        <h3 className="text-2xl font-bold mb-2">{p.plan_name}</h3>
                        <div className="flex items-baseline gap-1 mb-8">
                          <span className="text-4xl font-bold">{p.currency}{priceStr}</span>
                          <span className="text-gray-400 text-sm">/ {p.billing_cycle}</span>
                        </div>
                        <ul className="space-y-4 mb-10 flex-1">
                          {p.features.map((f, j) => (
                            <li key={j} className="flex gap-3 text-sm text-gray-600">
                              <Check size={18} className="text-[#E6C77A] shrink-0" /> {f}
                            </li>
                          ))}
                        </ul>
                        <button className={`w-full py-4 rounded-2xl font-bold transition-all ${featured ? 'bg-[#E6C77A] text-white shadow-lg shadow-[#E6C77A]/30 hover:scale-105' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                          {featured ? t('products.upgrade') : 'Current Plan'}
                        </button>
                      </div>
                    </StaggerItem>
                    );
                  })}
                </div>
              </Stagger>
            </div>
          </section>

          {/* FAQs */}
          <section className="py-24 px-6">
            <div className="max-w-4xl mx-auto">
              <Reveal>
                <h2 className="text-4xl font-serif font-bold text-center mb-16">{t('products.faqTitle')}</h2>
              </Reveal>
              <Stagger staggerDelay={0.1}>
                <div className="space-y-6">
                  {faqs.map((faq) => (
                    <StaggerItem key={faq.id} y={20}>
                      <div className="p-8 bg-white rounded-[32px] shadow-sm border border-gray-100">
                        <h4 className="font-bold text-lg mb-3">{faq.question}</h4>
                        <p className="text-gray-500">{faq.answer}</p>
                      </div>
                    </StaggerItem>
                  ))}
                </div>
              </Stagger>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </SmoothScrollProvider>
  );
};

export default Products;
