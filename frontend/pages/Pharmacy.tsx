import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Plus, ShoppingCart, CheckCircle2, Heart, Sparkles, Settings, AlertCircle } from 'lucide-react';
import { db } from '../services/db';
import { Medicine } from '../types';
import { useCart } from '../contexts/CartContext';
import { SubscriptionModal } from '../components/SubscriptionModal';

// ─── Memoized product card to avoid re-rendering every card when one changes ──
const ProductCard = React.memo<{
  product: Medicine;
  isFav: boolean;
  onToggleFav: (e: React.MouseEvent, id: string) => void;
  onAddToCart: (m: Medicine) => void;
}>(({ product: m, isFav, onToggleFav, onAddToCart }) => (
  <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden group hover:border-[#BFE6DA] transition-all flex flex-col">
    <div className="aspect-square relative overflow-hidden bg-gray-50">
      <img src={m.image} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={m.name} />
      <button
        type="button"
        aria-pressed={isFav}
        aria-label={isFav ? "Remove from favourites" : "Add to favourites"}
        onClick={(e) => onToggleFav(e, m.id)}
        className={`absolute top-4 right-4 p-3 bg-white/80 backdrop-blur-md rounded-full transition-all shadow-lg cursor-pointer ${isFav ? 'text-red-500' : 'text-red-400 hover:text-red-500'}`}
      >
        <Heart size={18} fill={isFav ? "currentColor" : "none"} />
      </button>
    </div>
    <div className="p-8 space-y-4 flex-1 flex flex-col justify-between">
      <div>
        <p className="text-[10px] font-bold text-[#E6C77A] uppercase tracking-widest mb-1">{m.category}</p>
        <h3 className="text-xl font-bold text-gray-800 leading-tight">{m.name}</h3>
      </div>
      <div className="flex justify-between items-center pt-4">
        <p className="text-2xl font-bold text-gray-900">৳{m.price}</p>
        <button
          onClick={() => onAddToCart(m)}
          className="p-4 bg-teal-600 text-white rounded-2xl shadow-xl shadow-teal-600/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Plus size={20} />
        </button>
      </div>
    </div>
  </div>
));

const Pharmacy: React.FC = () => {
  const { addItem, cartCount } = useCart();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderedItem, setOrderedItem] = useState('');
  
  // Favourites state
  const [favourites, setFavourites] = useState<string[]>(() => {
    const saved = localStorage.getItem('ng_pharmacy_favourites');
    return saved ? JSON.parse(saved) : [];
  });

  // Subscription States
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subData, setSubData] = useState<any>(null);
  const [showSubModal, setShowSubModal] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    localStorage.setItem('ng_pharmacy_favourites', JSON.stringify(favourites));
  }, [favourites]);

  useEffect(() => {
    const saved = localStorage.getItem('ng_subscription');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSubData(parsed);
        setIsSubscribed(parsed.status === 'ACTIVE');
      } catch (e) {
        localStorage.removeItem('ng_subscription');
      }
    }
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const categories = useMemo(() => {
    const base = new Set<string>(['All', 'Favourites']);
    medicines.forEach((m) => {
      if (m.category) base.add(m.category);
    });
    return Array.from(base);
  }, [medicines]);

  useEffect(() => {
    const loadMedicines = async () => {
      const data = await db.getMedicines();
      setMedicines(data || []);
    };
    loadMedicines();
  }, []);

  const filtered = medicines.filter(m => {
    const matchesQuery = m.name.toLowerCase().includes(query.toLowerCase());
    if (activeCategory === 'Favourites') {
      return favourites.includes(m.id) && matchesQuery;
    }
    const matchesCategory = activeCategory === 'All' || m.category === activeCategory;
    return matchesCategory && matchesQuery;
  });

  const handleAddToCart = (item: any) => {
    addItem(item);
    setOrderedItem(item.name);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const toggleFavourite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    setFavourites(prev => 
      prev.includes(id) ? prev.filter(favId => favId !== id) : [...prev, id]
    );
  };

  const handleSubConfirm = (data: any) => {
    // Persistence
    localStorage.setItem('ng_subscription', JSON.stringify(data));
    localStorage.setItem('ng_subscription_status', 'ACTIVE');
    
    // UI Update
    setSubData(data);
    setIsSubscribed(true);
    setShowSubModal(false);
    
    showToast("Subscription activated! Next delivery scheduled.");
  };

  const handleSubCancel = () => {
    const confirmed = window.confirm("Are you sure you want to cancel your Maternal Subscription? You will miss out on trimester-specific care essentials.");
    
    if (confirmed) {
      // 1) Update localStorage
      localStorage.setItem("ng_subscription_status", "CANCELLED");
      localStorage.removeItem("ng_subscription");

      // 2) Reflect in UI state
      setIsSubscribed(false);
      setSubData(null);
      setShowSubModal(false);
      
      // 3) Feedback to user
      showToast("Subscription cancelled successfully.", "success");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-10 animate-in fade-in duration-500 pb-20">
      <SubscriptionModal 
        isOpen={showSubModal}
        onClose={() => setShowSubModal(false)}
        onConfirm={handleSubConfirm}
        onCancelSubscription={handleSubCancel}
        existingData={subData}
      />

      {toast && (
        <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[1000] px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 ${
          toast.type === 'success' ? 'bg-teal-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="text-sm font-bold">{toast.message}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Health Pharmacy</h1>
          <p className="text-gray-500">Essential prenatal supplements and baby care delivered home.</p>
        </div>
        <div className="flex items-center gap-4">
           <button 
            onClick={() => navigate('/pharmacy/cart')}
            className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3 hover:border-teal-500 transition-all group relative active:scale-95 cursor-pointer"
           >
              <div className="relative">
                <ShoppingCart size={24} className="text-[#E6C77A] group-hover:text-teal-600 transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-teal-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full animate-in zoom-in">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-sm font-bold text-gray-700">Basket</span>
           </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="pl-4 text-gray-400"><Search size={20}/></div>
          <input 
            type="text" 
            placeholder="Search medicine or product..." 
            className="flex-1 py-3 bg-transparent outline-none font-medium text-gray-700"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
          {categories.map(c => (
            <button 
              key={c} 
              onClick={() => setActiveCategory(c)}
              className={`px-6 py-4 rounded-2xl text-xs font-bold transition-all border whitespace-nowrap cursor-pointer ${activeCategory === c ? 'bg-[#E6C77A] border-[#E6C77A] text-white shadow-lg' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {showSuccess && (
        <div className="bg-green-50 border border-green-100 p-6 rounded-[32px] flex items-center gap-4 animate-in slide-in-from-top-4 fixed top-24 left-1/2 -translate-x-1/2 z-[100] shadow-2xl backdrop-blur-md bg-green-50/90">
           <div className="p-3 bg-green-500 text-white rounded-2xl"><CheckCircle2/></div>
           <div>
              <p className="font-bold text-green-800">Added {orderedItem} to cart!</p>
              <p className="text-xs text-green-600">Items persist across your journey.</p>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {filtered.map(m => (
          <ProductCard
            key={m.id}
            product={m}
            isFav={favourites.includes(m.id)}
            onToggleFav={toggleFavourite}
            onAddToCart={handleAddToCart}
          />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-20 text-center opacity-40">
             <ShoppingBag size={64} className="mx-auto mb-4 text-gray-400" />
             <p className="text-lg font-bold">No products found in this category.</p>
          </div>
        )}
      </div>

      <div className="p-10 bg-white rounded-[48px] border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-10 shadow-sm relative overflow-hidden">
         {isSubscribed && (
           <div className="absolute top-6 left-6 flex items-center gap-2 px-4 py-1.5 bg-teal-500 text-white rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-teal-500/20 animate-in zoom-in duration-300">
             <CheckCircle2 size={14} /> Active Subscription
           </div>
         )}
         
         <div className="max-w-xl space-y-4 text-center md:text-left z-10">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Sparkles className="text-[#E6C77A]" size={24} />
              <h3 className="text-3xl font-serif font-bold text-gray-900">Maternal Subscription Box</h3>
            </div>
            <p className="text-gray-500 font-light leading-relaxed text-lg">Get a monthly bundle of essential supplements, organic snacks, and skincare tailored to your trimester.</p>
            
            {isSubscribed ? (
              <button 
                type="button"
                onClick={() => setShowSubModal(true)}
                className="px-10 py-5 bg-teal-600 text-white rounded-2xl font-bold shadow-xl shadow-teal-600/20 hover:scale-105 transition-all uppercase tracking-widest text-xs flex items-center gap-3 cursor-pointer"
              >
                <Settings size={18} /> Manage Subscription
              </button>
            ) : (
              <button 
                type="button"
                onClick={() => setShowSubModal(true)}
                className="px-10 py-5 bg-[#E6C77A] text-white rounded-2xl font-bold shadow-xl shadow-[#E6C77A]/20 hover:scale-105 transition-all uppercase tracking-widest text-xs cursor-pointer"
              >
                Subscribe for ৳1,500/mo
              </button>
            )}
         </div>
         <div className="w-64 h-64 bg-[#F7F5EF] rounded-full flex items-center justify-center border-8 border-white shadow-inner relative overflow-hidden group">
             <ShoppingBag size={80} className="text-teal-600 opacity-10 group-hover:scale-110 transition-transform duration-700" />
             <div className="absolute inset-0 flex items-center justify-center"><p className="text-3xl font-serif font-bold text-[#E6C77A]">{isSubscribed ? 'Active' : 'Premium'}</p></div>
         </div>
      </div>
    </div>
  );
};

export default Pharmacy;
