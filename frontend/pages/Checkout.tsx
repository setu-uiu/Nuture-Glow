import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Phone, User, FileText, Truck, CreditCard,
  Banknote, ShieldCheck, CheckCircle2, Loader2, Package, AlertCircle
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { OrderService, DeliveryAddress } from '../services/orderService';
import { ALL_DISTRICTS } from '../data/bangladeshDonors';

const PAYMENT_METHODS = [
  { id: 'cod', label: 'Cash on Delivery', icon: Banknote, desc: 'Pay when you receive' },
  { id: 'bkash', label: 'bKash', icon: CreditCard, desc: 'Mobile payment' },
  { id: 'nagad', label: 'Nagad', icon: CreditCard, desc: 'Mobile payment' },
  { id: 'card', label: 'Card Payment', icon: CreditCard, desc: 'Visa / Mastercard' },
];

const Checkout: React.FC = () => {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const deliveryFee = subtotal > 0 ? 60 : 0;
  const total = subtotal + deliveryFee;

  const [step, setStep] = useState<'address' | 'payment' | 'review' | 'placing' | 'success'>('address');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [orderError, setOrderError] = useState('');
  const [placedOrder, setPlacedOrder] = useState<any>(null);

  const [address, setAddress] = useState<DeliveryAddress>({
    fullName: '',
    phone: '',
    district: '',
    area: '',
    streetAddress: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if cart is empty
  if (items.length === 0 && step !== 'success') {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center space-y-8 animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
          <Package size={48} />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Your cart is empty</h1>
          <p className="text-gray-500">Add items to proceed to checkout.</p>
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

  const validateAddress = () => {
    const newErrors: Record<string, string> = {};
    if (!address.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!address.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^[\d\s+()-]{7,15}$/.test(address.phone)) newErrors.phone = 'Enter a valid phone number';
    if (!address.district) newErrors.district = 'Select your district';
    if (!address.area.trim()) newErrors.area = 'Area is required';
    if (!address.streetAddress.trim()) newErrors.streetAddress = 'Street address is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextToPayment = () => {
    if (validateAddress()) {
      setStep('payment');
      window.scrollTo(0, 0);
    }
  };

  const handleNextToReview = () => {
    setStep('review');
    window.scrollTo(0, 0);
  };

  const handlePlaceOrder = async () => {
    setStep('placing');
    setOrderError('');
    window.scrollTo(0, 0);

    try {
      const order = await OrderService.createOrder({
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          category: item.category,
        })),
        deliveryAddress: address,
        deliveryFee,
        notes: address.notes || '',
        paymentMethod,
      });

      setPlacedOrder(order);
      clearCart();
      setStep('success');

      // Trigger notification bell refresh for the current user
      window.dispatchEvent(new CustomEvent('new-notification'));
    } catch (err: any) {
      setOrderError(err?.message || 'Failed to place order. Please try again.');
      setStep('review');
    }
  };

  // Step indicators
  const steps = [
    { key: 'address', label: 'Address', num: 1 },
    { key: 'payment', label: 'Payment', num: 2 },
    { key: 'review', label: 'Review', num: 3 },
  ];
  const currentStepNum = step === 'address' ? 1 : step === 'payment' ? 2 : 3;

  // SUCCESS PAGE
  if (step === 'success' && placedOrder) {
    return (
      <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500 pb-20">
        <div className="text-center space-y-6 py-8">
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto animate-in zoom-in-50 duration-500">
            <CheckCircle2 size={56} className="text-green-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Order Placed Successfully!</h1>
            <p className="text-gray-500">Your order has been confirmed and is being processed.</p>
          </div>
        </div>

        <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-50 pb-4">
            <h3 className="text-lg font-bold text-gray-800">Order Details</h3>
            <span className="px-4 py-1.5 bg-amber-50 text-amber-600 rounded-full text-xs font-bold uppercase tracking-widest">
              {placedOrder.status || 'Pending'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Order ID</p>
              <p className="font-bold text-gray-800 font-mono">#{(placedOrder.id || '').slice(0, 8)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Order Date</p>
              <p className="font-bold text-gray-800">{new Date(placedOrder.orderDate).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Payment</p>
              <p className="font-bold text-gray-800 capitalize">{paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Est. Delivery</p>
              <p className="font-bold text-gray-800">{placedOrder.estimatedDelivery ? new Date(placedOrder.estimatedDelivery).toLocaleDateString('en-BD', { day: 'numeric', month: 'short' }) : '3-5 days'}</p>
            </div>
          </div>

          <div className="border-t border-gray-50 pt-4 space-y-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Items</p>
            {(placedOrder.items || items).map((item: any, i: number) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-700">{item.name} × {item.quantity}</span>
                <span className="font-bold text-gray-800">৳{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-50 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-bold">৳{placedOrder.subtotal || subtotal}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Delivery Fee</span>
              <span className="font-bold">৳{placedOrder.deliveryFee || deliveryFee}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-50">
              <span className="font-bold text-gray-800">Total</span>
              <span className="text-2xl font-bold text-teal-600">৳{placedOrder.total || total}</span>
            </div>
          </div>

          <div className="border-t border-gray-50 pt-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Delivery Address</p>
            <p className="text-sm text-gray-700">
              {address.fullName} • {address.phone}<br />
              {address.streetAddress}, {address.area}<br />
              {address.district}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/pharmacy/orders')}
            className="flex-1 py-4 bg-teal-600 text-white rounded-2xl font-bold hover:bg-teal-700 transition-all flex items-center justify-center gap-2"
          >
            <Package size={18} /> View My Orders
          </button>
          <button
            onClick={() => navigate('/pharmacy')}
            className="flex-1 py-4 bg-[#F7F5EF] text-gray-700 rounded-2xl font-bold hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // PLACING ORDER LOADING
  if (step === 'placing') {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center space-y-8 animate-in fade-in duration-500 py-20">
        <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mx-auto">
          <Loader2 size={48} className="text-teal-600 animate-spin" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Placing Your Order...</h1>
          <p className="text-gray-500">Please wait while we process your order.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => step === 'address' ? navigate('/pharmacy/cart') : setStep(step === 'review' ? 'payment' : 'address')}
          className="p-3 bg-white rounded-2xl border border-gray-100 text-gray-400 hover:text-teal-600 transition-all shadow-sm"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-500">Complete your order</p>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-center gap-2">
        {steps.map((s, i) => (
          <React.Fragment key={s.key}>
            <div className="flex items-center gap-2">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                currentStepNum > s.num ? 'bg-teal-600 text-white' :
                currentStepNum === s.num ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/30' :
                'bg-gray-100 text-gray-400'
              }`}>
                {currentStepNum > s.num ? <CheckCircle2 size={18}/> : s.num}
              </div>
              <span className={`text-sm font-bold hidden sm:block ${currentStepNum >= s.num ? 'text-gray-800' : 'text-gray-400'}`}>{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-12 h-0.5 rounded-full ${currentStepNum > s.num ? 'bg-teal-600' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {orderError && (
        <div className="flex items-center gap-3 px-6 py-4 bg-red-50 border border-red-100 rounded-2xl">
          <AlertCircle size={20} className="text-red-500 flex-shrink-0"/>
          <p className="text-sm text-red-700 font-medium">{orderError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8">
          {/* STEP 1: ADDRESS */}
          {step === 'address' && (
            <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 space-y-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                <MapPin size={22} className="text-red-500" /> Delivery Address
              </h2>

              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Full Name *</label>
                    <div className="relative">
                      <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"/>
                      <input
                        className={`w-full pl-11 pr-4 py-4 bg-[#F7F5EF] rounded-2xl outline-none font-medium text-gray-700 ${errors.fullName ? 'ring-2 ring-red-300' : ''}`}
                        placeholder="Enter your full name"
                        value={address.fullName}
                        onChange={e => { setAddress({ ...address, fullName: e.target.value }); setErrors({ ...errors, fullName: '' }); }}
                      />
                    </div>
                    {errors.fullName && <p className="text-xs text-red-500 ml-4">{errors.fullName}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Phone Number *</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"/>
                      <input
                        className={`w-full pl-11 pr-4 py-4 bg-[#F7F5EF] rounded-2xl outline-none font-medium text-gray-700 ${errors.phone ? 'ring-2 ring-red-300' : ''}`}
                        placeholder="+880 1XXX-XXXXXX"
                        value={address.phone}
                        onChange={e => { setAddress({ ...address, phone: e.target.value }); setErrors({ ...errors, phone: '' }); }}
                      />
                    </div>
                    {errors.phone && <p className="text-xs text-red-500 ml-4">{errors.phone}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">District *</label>
                    <select
                      className={`w-full p-4 bg-[#F7F5EF] rounded-2xl outline-none font-medium text-gray-700 ${errors.district ? 'ring-2 ring-red-300' : ''}`}
                      value={address.district}
                      onChange={e => { setAddress({ ...address, district: e.target.value }); setErrors({ ...errors, district: '' }); }}
                    >
                      <option value="">Select district...</option>
                      {ALL_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    {errors.district && <p className="text-xs text-red-500 ml-4">{errors.district}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Area / Upazila *</label>
                    <input
                      className={`w-full p-4 bg-[#F7F5EF] rounded-2xl outline-none font-medium text-gray-700 ${errors.area ? 'ring-2 ring-red-300' : ''}`}
                      placeholder="e.g., Mirpur-10, Dhanmondi"
                      value={address.area}
                      onChange={e => { setAddress({ ...address, area: e.target.value }); setErrors({ ...errors, area: '' }); }}
                    />
                    {errors.area && <p className="text-xs text-red-500 ml-4">{errors.area}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Street Address *</label>
                  <input
                    className={`w-full p-4 bg-[#F7F5EF] rounded-2xl outline-none font-medium text-gray-700 ${errors.streetAddress ? 'ring-2 ring-red-300' : ''}`}
                    placeholder="House/Flat No., Road, Block"
                    value={address.streetAddress}
                    onChange={e => { setAddress({ ...address, streetAddress: e.target.value }); setErrors({ ...errors, streetAddress: '' }); }}
                  />
                  {errors.streetAddress && <p className="text-xs text-red-500 ml-4">{errors.streetAddress}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Delivery Notes (Optional)</label>
                  <textarea
                    className="w-full p-4 bg-[#F7F5EF] rounded-2xl outline-none h-20 resize-none font-medium text-gray-700 text-sm"
                    placeholder="Special instructions for delivery..."
                    value={address.notes}
                    onChange={e => setAddress({ ...address, notes: e.target.value })}
                  />
                </div>
              </div>

              <button
                onClick={handleNextToPayment}
                className="w-full py-5 bg-teal-600 text-white rounded-3xl font-bold shadow-xl hover:bg-teal-700 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
              >
                Continue to Payment <ArrowLeft size={16} className="rotate-180" />
              </button>
            </div>
          )}

          {/* STEP 2: PAYMENT */}
          {step === 'payment' && (
            <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 space-y-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                <CreditCard size={22} className="text-[#E6C77A]" /> Payment Method
              </h2>

              <div className="space-y-3">
                {PAYMENT_METHODS.map(method => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`w-full flex items-center gap-5 p-5 rounded-3xl border-2 transition-all text-left ${
                        paymentMethod === method.id
                          ? 'border-teal-500 bg-teal-50 shadow-lg shadow-teal-600/10'
                          : 'border-gray-100 bg-[#F7F5EF] hover:border-gray-200'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        paymentMethod === method.id ? 'bg-teal-600 text-white' : 'bg-white text-gray-400'
                      }`}>
                        <Icon size={22} />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-800">{method.label}</p>
                        <p className="text-xs text-gray-400">{method.desc}</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === method.id ? 'border-teal-600 bg-teal-600' : 'border-gray-300'
                      }`}>
                        {paymentMethod === method.id && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {(paymentMethod === 'bkash' || paymentMethod === 'nagad') && (
                <div className="p-5 bg-amber-50 rounded-3xl border border-amber-100 space-y-2">
                  <p className="text-sm font-bold text-amber-800">Mobile Payment Instructions</p>
                  <p className="text-xs text-amber-700">
                    After placing the order, send ৳{total} to <span className="font-bold">01XXXXXXXXX</span> ({paymentMethod === 'bkash' ? 'bKash' : 'Nagad'}).
                    Use your Order ID as reference. Your order will be confirmed after payment verification.
                  </p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => setStep('address')}
                  className="flex-1 py-5 bg-[#F7F5EF] text-gray-700 rounded-3xl font-bold hover:bg-gray-100 transition-all uppercase tracking-widest text-xs"
                >
                  Back
                </button>
                <button
                  onClick={handleNextToReview}
                  className="flex-[2] py-5 bg-teal-600 text-white rounded-3xl font-bold shadow-xl hover:bg-teal-700 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                >
                  Review Order <ArrowLeft size={16} className="rotate-180" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW */}
          {step === 'review' && (
            <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 space-y-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                <FileText size={22} className="text-teal-600" /> Review Your Order
              </h2>

              {/* Items */}
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Items ({items.length})</p>
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-4 p-4 bg-[#F7F5EF] rounded-2xl">
                    <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover" />
                    <div className="flex-1">
                      <p className="font-bold text-gray-800 text-sm">{item.name}</p>
                      <p className="text-xs text-gray-400">{item.category} • Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-gray-800">৳{item.price * item.quantity}</p>
                  </div>
                ))}
              </div>

              {/* Delivery Address */}
              <div className="p-5 bg-[#F7F5EF] rounded-3xl space-y-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Truck size={12} /> Delivery Address
                </p>
                <p className="font-bold text-gray-800">{address.fullName}</p>
                <p className="text-sm text-gray-600">{address.phone}</p>
                <p className="text-sm text-gray-600">{address.streetAddress}, {address.area}, {address.district}</p>
                {address.notes && <p className="text-xs text-gray-400 italic">Note: {address.notes}</p>}
              </div>

              {/* Payment */}
              <div className="p-5 bg-[#F7F5EF] rounded-3xl space-y-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <CreditCard size={12} /> Payment Method
                </p>
                <p className="font-bold text-gray-800 capitalize">
                  {PAYMENT_METHODS.find(m => m.id === paymentMethod)?.label || paymentMethod}
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep('payment')}
                  className="flex-1 py-5 bg-[#F7F5EF] text-gray-700 rounded-3xl font-bold hover:bg-gray-100 transition-all uppercase tracking-widest text-xs"
                >
                  Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  className="flex-[2] py-5 bg-[#E6C77A] text-white rounded-3xl font-bold shadow-xl shadow-[#E6C77A]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                >
                  <ShieldCheck size={18} /> Place Order — ৳{total}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4">
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 space-y-6 sticky top-24">
            <h3 className="text-xl font-bold text-gray-800 border-b border-gray-50 pb-4">Order Summary</h3>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-500 truncate mr-2">{item.name} × {item.quantity}</span>
                  <span className="font-bold text-gray-800 shrink-0">৳{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-50">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-bold text-gray-800">৳{subtotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Delivery Fee</span>
                <span className="font-bold text-gray-800">৳{deliveryFee}</span>
              </div>
              <div className="pt-3 border-t border-gray-50 flex justify-between items-center">
                <span className="font-bold text-gray-800">Total</span>
                <span className="text-2xl font-bold text-teal-600">৳{total}</span>
              </div>
            </div>

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

export default Checkout;
