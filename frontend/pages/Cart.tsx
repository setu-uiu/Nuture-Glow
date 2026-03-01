
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, CreditCard, ShieldCheck } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useTranslations } from '../i18n/I18nContext';

const Cart: React.FC = () => {
  const { items, removeItem, updateQty, subtotal, cartCount, clearCart } = useCart();
  const { t } = useTranslations();
  const navigate = useNavigate();

  const deliveryFee = subtotal > 0 ? 60 : 0;
  const total = subtotal + deliveryFee;

  const handleCheckout = () => {
    navigate('/pharmacy/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center space-y-8 animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
          <ShoppingBag size={48} />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Your cart is empty</h1>
          <p className="text-gray-500">Looks like you haven't added any essentials yet.</p>
        </div>
        <button 
          onClick={() => navigate('/pharmacy')}
          className="px-10 py-4 bg-teal-600 text-white rounded-2xl font-bold hover:bg-teal-700 transition-all flex items-center gap-2 mx-auto"
        >
          <ArrowLeft size={18} /> Back to Pharmacy
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/pharmacy')}
          className="p-3 bg-white rounded-2xl border border-gray-100 text-gray-400 hover:text-teal-600 transition-all shadow-sm"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-500">{cartCount} items in your basket</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Items List */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
            {items.map(item => (
              <div key={item.id} className="p-6 flex flex-col sm:flex-row items-center gap-6 group hover:bg-gray-50/30 transition-all">
                <div className="w-24 h-24 rounded-3xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                  <img src={item.image} loading="lazy" className="w-full h-full object-cover" alt={item.name} />
                </div>
                
                <div className="flex-1 space-y-1 text-center sm:text-left">
                  <p className="text-[10px] font-bold text-[#E6C77A] uppercase tracking-widest">{item.category}</p>
                  <h3 className="text-lg font-bold text-gray-800">{item.name}</h3>
                  <p className="text-teal-600 font-bold">৳{item.price}</p>
                </div>

                <div className="flex items-center gap-4 bg-[#F7F5EF] p-2 rounded-2xl">
                  <button 
                    onClick={() => updateQty(item.id, item.quantity - 1)}
                    className="p-2 hover:bg-white rounded-xl text-gray-500 transition-all active:scale-90"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center font-bold text-gray-800">{item.quantity}</span>
                  <button 
                    onClick={() => updateQty(item.id, item.quantity + 1)}
                    className="p-2 hover:bg-white rounded-xl text-gray-500 transition-all active:scale-90"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <div className="text-right sm:w-24">
                  <p className="text-lg font-bold text-gray-900">৳{item.price * item.quantity}</p>
                </div>

                <button 
                  onClick={() => removeItem(item.id)}
                  className="p-3 text-gray-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>

          <button 
            onClick={clearCart}
            className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-red-500 transition-all flex items-center gap-2 ml-4"
          >
            <Trash2 size={14} /> Clear Entire Cart
          </button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 space-y-6 sticky top-24">
            <h3 className="text-xl font-bold text-gray-800 border-b border-gray-50 pb-4">Order Summary</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-bold text-gray-800">৳{subtotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Delivery Fee</span>
                <span className="font-bold text-gray-800">৳{deliveryFee}</span>
              </div>
              <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                <span className="font-bold text-gray-800">Total Amount</span>
                <span className="text-2xl font-bold text-teal-600">৳{total}</span>
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              className="w-full py-5 bg-[#E6C77A] text-white rounded-3xl font-bold shadow-xl shadow-[#E6C77A]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
            >
              <CreditCard size={18} /> Proceed to Checkout
            </button>

            <div className="p-4 bg-teal-50 rounded-2xl flex gap-3">
              <ShieldCheck size={20} className="text-teal-600 flex-shrink-0" />
              <p className="text-[10px] text-teal-700 leading-relaxed font-medium">
                Your order is secured and clinical products are handled with professional care.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
