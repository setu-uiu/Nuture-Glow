import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Package, Clock, CheckCircle2, Truck, XCircle,
  Loader2, AlertCircle, ChevronDown, ChevronUp, ShoppingBag
} from 'lucide-react';
import { OrderService, Order } from '../services/orderService';

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string; border: string }> = {
  pending: { icon: <Clock size={14} />, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  processing: { icon: <Package size={14} />, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  shipped: { icon: <Truck size={14} />, color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
  delivered: { icon: <CheckCircle2 size={14} />, color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
  cancelled: { icon: <XCircle size={14} />, color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
};

const MyOrders: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await OrderService.getMyOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      setCancellingId(orderId);
      await OrderService.cancelOrder(orderId);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
    } catch (err: any) {
      alert(err?.message || 'Failed to cancel order');
    } finally {
      setCancellingId(null);
    }
  };

  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter(o => o.status === statusFilter);

  const getStatusStyle = (status: string) => STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center py-20">
        <Loader2 size={48} className="text-teal-600 animate-spin mx-auto" />
        <p className="text-gray-500 mt-4">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/pharmacy')}
          className="p-3 bg-white rounded-2xl border border-gray-100 text-gray-400 hover:text-teal-600 transition-all shadow-sm"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-500">{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 px-6 py-4 bg-red-50 border border-red-100 rounded-2xl">
          <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700 font-medium">{error}</p>
          <button onClick={loadOrders} className="ml-auto text-xs font-bold text-red-600 hover:text-red-800">Retry</button>
        </div>
      )}

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2">
        {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all ${
              statusFilter === status
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20'
                : 'bg-white text-gray-500 border border-gray-100 hover:border-gray-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
            <ShoppingBag size={40} />
          </div>
          <p className="text-gray-500 font-medium">
            {statusFilter !== 'all' ? `No ${statusFilter} orders found` : 'You haven\'t placed any orders yet'}
          </p>
          <button
            onClick={() => navigate('/pharmacy')}
            className="px-8 py-3 bg-teal-600 text-white rounded-2xl font-bold hover:bg-teal-700 transition-all"
          >
            Browse Pharmacy
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => {
            const isExpanded = expandedOrder === order.id;
            const statusStyle = getStatusStyle(order.status);
            const orderDate = order.orderDate ? new Date(order.orderDate) : new Date();
            const itemCount = (order.items || []).reduce((sum, i) => sum + i.quantity, 0);

            return (
              <div
                key={order.id}
                className="bg-white rounded-[28px] shadow-sm border border-gray-100 overflow-hidden transition-all"
              >
                {/* Order Header */}
                <button
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  className="w-full p-6 flex items-center gap-4 text-left hover:bg-gray-50/50 transition-all"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${statusStyle.bg}`}>
                    <Package size={22} className={statusStyle.color} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-bold text-gray-800 font-mono text-sm">#{(order.id || '').slice(0, 8)}</span>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${statusStyle.bg} ${statusStyle.color} border ${statusStyle.border}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {orderDate.toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' })} • {itemCount} item{itemCount !== 1 ? 's' : ''}
                    </p>
                  </div>

                  <span className="text-lg font-bold text-teal-600">৳{order.total || 0}</span>

                  {isExpanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-gray-50 space-y-4 animate-in slide-in-from-top-2 duration-200">
                    {/* Items */}
                    <div className="space-y-3 pt-4">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order Items</p>
                      {(order.items || []).map((item, i) => (
                        <div key={i} className="flex items-center gap-4 p-3 bg-[#F7F5EF] rounded-xl">
                          {item.image && (
                            <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-gray-800 text-sm">{item.name}</p>
                            <p className="text-xs text-gray-400">Qty: {item.quantity} × ৳{item.price}</p>
                          </div>
                          <span className="font-bold text-gray-800 text-sm">৳{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* Delivery Address */}
                    {order.deliveryAddress && typeof order.deliveryAddress !== 'string' && (
                      <div className="p-4 bg-[#F7F5EF] rounded-xl space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Delivery Address</p>
                        <p className="text-sm font-medium text-gray-800">{order.deliveryAddress.fullName}</p>
                        <p className="text-xs text-gray-500">{order.deliveryAddress.phone}</p>
                        <p className="text-xs text-gray-500">
                          {order.deliveryAddress.streetAddress}, {order.deliveryAddress.area}, {order.deliveryAddress.district}
                        </p>
                      </div>
                    )}
                    {order.deliveryAddress && typeof order.deliveryAddress === 'string' && (
                      <div className="p-4 bg-[#F7F5EF] rounded-xl space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Delivery Address</p>
                        <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
                      </div>
                    )}

                    {/* Totals */}
                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Subtotal</span>
                        <span className="font-bold">৳{order.subtotal || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Delivery Fee</span>
                        <span className="font-bold">৳{order.deliveryFee || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
                        <span className="font-bold text-gray-800">Total</span>
                        <span className="text-lg font-bold text-teal-600">৳{order.total || 0}</span>
                      </div>
                    </div>

                    {/* Cancel Button */}
                    {order.status === 'pending' && (
                      <button
                        onClick={() => handleCancel(order.id)}
                        disabled={cancellingId === order.id}
                        className="w-full py-3 bg-red-50 text-red-600 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-red-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {cancellingId === order.id ? (
                          <><Loader2 size={14} className="animate-spin" /> Cancelling...</>
                        ) : (
                          <><XCircle size={14} /> Cancel Order</>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
