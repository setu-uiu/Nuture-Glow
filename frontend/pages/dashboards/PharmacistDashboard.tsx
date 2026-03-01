import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertCircle,
  ClipboardList,
  Clock3,
  FileCheck2,
  PackageCheck,
  Printer,
  RefreshCw,
  Search,
  ShieldCheck,
  Truck
} from 'lucide-react';
import {
  AppNotification,
  PharmacistDashboardService,
  PharmacyDashboardData,
  PharmacyOrder
} from '../../services/dashboardService';
import { Medicine } from '../../types';

type PharmacistTab = 'overview' | 'orders' | 'products' | 'verification' | 'notifications';

const PharmacistDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<PharmacistTab>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dashboard, setDashboard] = useState<PharmacyDashboardData | null>(null);
  const [orders, setOrders] = useState<PharmacyOrder[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [products, setProducts] = useState<Medicine[]>([]);
  const [productQuery, setProductQuery] = useState('');
  const [activeProductCategory, setActiveProductCategory] = useState('All');

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<PharmacyOrder | null>(null);

  const [verificationForm, setVerificationForm] = useState({
    pharmacyName: '',
    licenseNumber: '',
    ownerName: '',
    address: '',
    phone: '',
    documentsCsv: ''
  });
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
  const [submittingVerification, setSubmittingVerification] = useState(false);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications]
  );
  const productCategories = useMemo(() => {
    const base = new Set<string>(['All']);
    products.forEach((item) => {
      if (item.category) base.add(item.category);
    });
    return Array.from(base);
  }, [products]);
  const filteredProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase();
    return products.filter((item) => {
      const matchesQuery = !q || item.name.toLowerCase().includes(q);
      const matchesCategory =
        activeProductCategory === 'All' || item.category === activeProductCategory;
      return matchesQuery && matchesCategory;
    });
  }, [products, productQuery, activeProductCategory]);

  useEffect(() => {
    const tab = new URLSearchParams(location.search).get('tab');
    const validTabs: PharmacistTab[] = ['overview', 'orders', 'products', 'verification', 'notifications'];
    if (tab && validTabs.includes(tab as PharmacistTab)) {
      setActiveTab(tab as PharmacistTab);
      return;
    }
    setActiveTab('overview');
  }, [location.search]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        await Promise.all([
          loadDashboard(),
          loadOrders(statusFilter),
          loadNotifications(),
          loadProducts()
        ]);
      } catch (err) {
        setError('Failed to load pharmacist workspace');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const setTab = (tab: PharmacistTab) => {
    setActiveTab(tab);
    const params = new URLSearchParams(location.search);
    params.set('tab', tab);
    navigate({ pathname: '/dashboard', search: params.toString() }, { replace: true });
  };

  const loadDashboard = async () => {
    const data = await PharmacistDashboardService.getDashboardData();
    setDashboard(data);
    setError(null);
  };

  const loadOrders = async (status: string) => {
    const response = await PharmacistDashboardService.getOrders({
      status,
      page: 1,
      limit: 50
    });
    setOrders(response.items || []);
  };

  const loadNotifications = async () => {
    const items = await PharmacistDashboardService.getNotifications();
    setNotifications(items);
  };

  const loadProducts = async () => {
    const items = await PharmacistDashboardService.getCatalogProducts();
    setProducts(items || []);
  };

  const refreshAll = async () => {
    try {
      setLoading(true);
      await Promise.all([loadDashboard(), loadOrders(statusFilter), loadNotifications(), loadProducts()]);
    } catch (err) {
      setError('Refresh failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = async (nextFilter: string) => {
    setStatusFilter(nextFilter);
    try {
      await loadOrders(nextFilter);
    } catch (err) {
      setError('Failed to filter orders');
    }
  };

  const handleUpdateOrderStatus = async (
    orderId: string,
    nextStatus: PharmacyOrder['status']
  ) => {
    try {
      setUpdatingOrderId(orderId);
      await PharmacistDashboardService.updateOrderStatus(orderId, nextStatus);
      await Promise.all([loadOrders(statusFilter), loadDashboard(), loadNotifications()]);
    } catch (err) {
      setError('Failed to update order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleViewOrder = async (orderId: string) => {
    try {
      const order = await PharmacistDashboardService.getOrderById(orderId);
      setSelectedOrder(order);
    } catch (err) {
      setError('Failed to load order details');
    }
  };

  const handleMarkRead = async (notificationId: string) => {
    try {
      await PharmacistDashboardService.markNotificationRead(notificationId);
      setNotifications((current) =>
        current.map((item) => (item.id === notificationId ? { ...item, isRead: true } : item))
      );
    } catch (err) {
      setError('Failed to mark notification');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await PharmacistDashboardService.markAllNotificationsRead();
      setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
    } catch (err) {
      setError('Failed to mark all notifications');
    }
  };

  const handleSubmitVerification = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setVerificationMessage(null);

    const documents = verificationForm.documentsCsv
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .map((name) => ({ name }));

    try {
      setSubmittingVerification(true);
      await PharmacistDashboardService.submitVerification({
        pharmacyName: verificationForm.pharmacyName,
        licenseNumber: verificationForm.licenseNumber,
        ownerName: verificationForm.ownerName || undefined,
        address: verificationForm.address || undefined,
        phone: verificationForm.phone || undefined,
        documents
      });
      setVerificationMessage('Verification request submitted successfully.');
      setVerificationForm({
        pharmacyName: '',
        licenseNumber: '',
        ownerName: '',
        address: '',
        phone: '',
        documentsCsv: ''
      });
      await loadDashboard();
    } catch (err: any) {
      setVerificationMessage(err?.message || 'Failed to submit verification request.');
    } finally {
      setSubmittingVerification(false);
    }
  };

  const printReceipt = (order: PharmacyOrder) => {
    const itemsRows = (order.items || [])
      .map(
        (item) =>
          `<tr>
            <td style="padding:8px 12px;border-bottom:1px solid #eee;">${item.name}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">BDT ${item.price}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">BDT ${item.price * item.quantity}</td>
          </tr>`
      )
      .join('');

    const subtotal = (order.items || []).reduce((s, i) => s + i.price * i.quantity, 0);
    const deliveryFee = (order as any).deliveryFee || 0;
    const total = order.total || subtotal + deliveryFee;
    const orderDate = order.orderDate ? new Date(order.orderDate).toLocaleString() : '--';
    const address = (order as any).deliveryAddress;
    const addressText = address
      ? `${address.fullName || ''}<br/>${address.phone || ''}<br/>${address.streetAddress || ''}, ${address.area || ''}, ${address.district || ''}`
      : `${order.customerName || 'Customer'}<br/>${order.customerPhone || ''}`;

    const html = `<!DOCTYPE html>
<html><head><title>Receipt #${(order.id || '').slice(0, 8)}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:'Segoe UI',sans-serif;padding:30px;max-width:420px;margin:auto;color:#333;}
  .header{text-align:center;margin-bottom:24px;padding-bottom:16px;border-bottom:2px dashed #ccc;}
  .header h1{font-size:22px;font-weight:800;color:#0d9488;}
  .header p{font-size:11px;color:#999;margin-top:4px;}
  .meta{display:flex;justify-content:space-between;font-size:12px;color:#666;margin-bottom:16px;}
  table{width:100%;border-collapse:collapse;font-size:13px;margin-bottom:16px;}
  th{text-align:left;padding:8px 12px;border-bottom:2px solid #333;font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;}
  .totals{border-top:2px dashed #ccc;padding-top:12px;font-size:13px;}
  .totals .row{display:flex;justify-content:space-between;padding:4px 0;}
  .totals .total{font-size:18px;font-weight:800;color:#0d9488;border-top:2px solid #333;padding-top:8px;margin-top:8px;}
  .address{margin-top:16px;padding:12px;background:#f9f9f6;border-radius:8px;font-size:12px;line-height:1.6;}
  .address strong{display:block;margin-bottom:4px;font-size:11px;text-transform:uppercase;color:#999;letter-spacing:0.5px;}
  .footer{text-align:center;margin-top:24px;padding-top:16px;border-top:2px dashed #ccc;font-size:11px;color:#999;}
  @media print{body{padding:10px;}}
</style></head><body>
<div class="header">
  <h1>Nurture Glow Pharmacy</h1>
  <p>Order Receipt</p>
</div>
<div class="meta">
  <span><strong>Order:</strong> #${(order.id || '').slice(0, 8)}</span>
  <span><strong>Date:</strong> ${orderDate}</span>
</div>
<div class="meta">
  <span><strong>Status:</strong> ${order.status.toUpperCase()}</span>
  <span><strong>Payment:</strong> ${(order as any).paymentMethod || 'Cash on Delivery'}</span>
</div>
<table>
  <thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Total</th></tr></thead>
  <tbody>${itemsRows}</tbody>
</table>
<div class="totals">
  <div class="row"><span>Subtotal</span><span>BDT ${subtotal}</span></div>
  <div class="row"><span>Delivery Fee</span><span>BDT ${deliveryFee}</span></div>
  <div class="row total"><span>Total</span><span>BDT ${total}</span></div>
</div>
<div class="address"><strong>Delivery To</strong>${addressText}</div>
<div class="footer">
  <p>Thank you for ordering with Nurture Glow!</p>
  <p style="margin-top:4px">For support: support@nurtureglow.com</p>
</div>
</body></html>`;

    const printWindow = window.open('', '_blank', 'width=500,height=700');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 400);
    }
  };

  const statusActions: Record<PharmacyOrder['status'], PharmacyOrder['status'][]> = {
    pending: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [],
    cancelled: []
  };

  const statusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-700';
      case 'processing':
        return 'bg-blue-100 text-blue-700';
      case 'shipped':
        return 'bg-purple-100 text-purple-700';
      case 'delivered':
        return 'bg-emerald-100 text-emerald-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatCurrency = (value?: number | null) =>
    Number.isFinite(Number(value)) ? `BDT ${Number(value).toLocaleString()}` : '--';

  const formatDate = (value?: string) => {
    if (!value) return '--';
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? date.toLocaleString() : '--';
  };

  if (loading && !dashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Activity className="w-12 h-12 text-teal-600 animate-spin" />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-gray-700">{error || 'Pharmacist dashboard is unavailable.'}</p>
          <button
            onClick={refreshAll}
            className="mt-4 px-5 py-2 rounded-xl bg-teal-600 text-white font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f6f1] via-[#fafbf7] to-white p-4 md:p-6 space-y-6">
      <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-500 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/70">Pharmacist Workspace</p>
            <h1 className="text-2xl md:text-3xl font-bold mt-1">
              {dashboard.profile.shopName || dashboard.profile.name || 'Pharmacy'}
            </h1>
            <p className="text-sm text-white/85 mt-1">
              License: {dashboard.profile.license || 'Not submitted'}
            </p>
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold">
              <ShieldCheck size={14} />
              Verification: {dashboard.profile.verificationStatus || 'Pending'}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setTab('orders')}
              className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-sm font-semibold"
            >
              Manage Orders
            </button>
            <button
              onClick={refreshAll}
              className="px-4 py-2 rounded-xl bg-white text-teal-700 text-sm font-bold inline-flex items-center gap-2"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white/80 rounded-2xl border border-gray-200 p-2 inline-flex gap-2">
        {(['overview', 'orders', 'products', 'verification', 'notifications'] as PharmacistTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab ? 'bg-teal-600 text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {tab === 'overview'
              ? 'Overview'
              : tab === 'orders'
              ? 'Orders'
              : tab === 'products'
              ? 'Products'
              : tab === 'verification'
              ? 'Verification'
              : `Notifications (${unreadCount})`}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            <StatCard label="Today Orders" value={dashboard.stats.todayOrders} icon={<Clock3 size={20} />} />
            <StatCard label="Pending" value={dashboard.stats.pendingOrders} icon={<ClipboardList size={20} />} />
            <StatCard label="Processing" value={dashboard.stats.processingOrders} icon={<PackageCheck size={20} />} />
            <StatCard label="Total Orders" value={dashboard.stats.totalOrders} icon={<FileCheck2 size={20} />} />
            <StatCard label="Revenue" value={formatCurrency(dashboard.stats.totalRevenue)} icon={<Truck size={20} />} />
          </div>

          <div className="bg-white/80 rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Orders</h2>
            {orders.length === 0 ? (
              <p className="text-sm text-gray-500">No orders yet.</p>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 6).map((order) => (
                  <div key={order.id} className="p-4 rounded-xl border border-gray-200 bg-white flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900">#{order.id?.slice(0, 8)}</p>
                      <p className="text-xs text-gray-500">
                        {order.customerName || 'Customer'} | {formatDate(order.orderDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(order.total)}</p>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${statusBadgeClass(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="bg-white/80 rounded-2xl border border-gray-200 p-4 flex flex-wrap gap-2">
            {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => handleFilterChange(status)}
                className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wide ${
                  statusFilter === status ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="bg-white/80 rounded-2xl border border-gray-200 p-6 space-y-4">
            {orders.length === 0 ? (
              <p className="text-sm text-gray-500">No orders found for this filter.</p>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="p-4 rounded-xl border border-gray-200 bg-white space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <p className="font-bold text-gray-900">Order #{order.id?.slice(0, 8)}</p>
                      <p className="text-xs text-gray-500">
                        {order.customerName || 'Customer'} | {formatDate(order.orderDate)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusBadgeClass(order.status)}`}>
                        {order.status}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">{formatCurrency(order.total)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {statusActions[order.status].map((nextStatus) => (
                      <button
                        key={nextStatus}
                        disabled={updatingOrderId === order.id}
                        onClick={() => handleUpdateOrderStatus(order.id, nextStatus)}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-50"
                      >
                        {updatingOrderId === order.id ? 'Updating...' : `Mark ${nextStatus}`}
                      </button>
                    ))}
                    <button
                      onClick={() => handleViewOrder(order.id)}
                      className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 text-xs font-semibold"
                    >
                      View details
                    </button>
                    <button
                      onClick={() => printReceipt(order)}
                      className="px-3 py-1.5 rounded-lg border border-teal-300 text-teal-700 text-xs font-semibold hover:bg-teal-50 inline-flex items-center gap-1"
                    >
                      <Printer size={12} /> Print
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {selectedOrder && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Order Details</h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Close
                </button>
              </div>
              <p className="text-sm text-gray-600">
                Customer: {selectedOrder.customerName || 'Customer'} | Phone: {selectedOrder.customerPhone || 'N/A'}
              </p>
              <div className="space-y-2">
                {(selectedOrder.items || []).map((item) => (
                  <div key={`${selectedOrder.id}-${item.id}`} className="flex items-center justify-between text-sm">
                    <span>{item.name} x {item.quantity}</span>
                    <span className="font-semibold">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm font-semibold">Total: {formatCurrency(selectedOrder.total)}</p>
              <div className="pt-3 border-t border-gray-200">
                <button
                  onClick={() => printReceipt(selectedOrder)}
                  className="px-4 py-2 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 inline-flex items-center gap-2"
                >
                  <Printer size={14} /> Print Receipt
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="bg-white/80 rounded-2xl border border-gray-200 p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Product Catalog</h2>
                <p className="text-sm text-gray-500">
                  {products.length} items synced with the user pharmacy catalog.
                </p>
              </div>
              <div className="flex-1 md:max-w-md">
                <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-3 py-2">
                  <Search size={16} className="text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={productQuery}
                    onChange={(event) => setProductQuery(event.target.value)}
                    className="w-full text-sm text-gray-700 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {productCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveProductCategory(category)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    activeProductCategory === category
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredProducts.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl border border-gray-200 bg-white flex gap-4 items-center"
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                  <img src={item.image} alt={item.name} loading="lazy" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                    {item.category}
                  </p>
                  <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                  <p className="text-sm text-gray-700">{formatCurrency(item.price)}</p>
                </div>
              </div>
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full py-12 text-center text-sm text-gray-500">
                No products found for this filter.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'verification' && (
        <div className="bg-white/85 rounded-2xl border border-gray-200 p-6 max-w-3xl">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Submit Pharmacy Verification</h2>
          <p className="text-sm text-gray-600 mb-6">
            Submit your credentials for operations-admin review.
          </p>

          <form onSubmit={handleSubmitVerification} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Pharmacy Name"
                value={verificationForm.pharmacyName}
                onChange={(value) => setVerificationForm((current) => ({ ...current, pharmacyName: value }))}
                required
              />
              <InputField
                label="License Number"
                value={verificationForm.licenseNumber}
                onChange={(value) => setVerificationForm((current) => ({ ...current, licenseNumber: value }))}
                required
              />
              <InputField
                label="Owner Name"
                value={verificationForm.ownerName}
                onChange={(value) => setVerificationForm((current) => ({ ...current, ownerName: value }))}
              />
              <InputField
                label="Phone"
                value={verificationForm.phone}
                onChange={(value) => setVerificationForm((current) => ({ ...current, phone: value }))}
              />
            </div>
            <InputField
              label="Address"
              value={verificationForm.address}
              onChange={(value) => setVerificationForm((current) => ({ ...current, address: value }))}
            />
            <InputField
              label="Documents (comma separated)"
              value={verificationForm.documentsCsv}
              onChange={(value) => setVerificationForm((current) => ({ ...current, documentsCsv: value }))}
              placeholder="Trade license, pharmacist certificate, owner NID"
            />

            <button
              type="submit"
              disabled={submittingVerification}
              className="px-5 py-2.5 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 disabled:opacity-50"
            >
              {submittingVerification ? 'Submitting...' : 'Submit Verification'}
            </button>
          </form>

          {verificationMessage && (
            <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
              {verificationMessage}
            </div>
          )}
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="bg-white/85 rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
            <button
              onClick={handleMarkAllRead}
              className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold"
            >
              Mark all read
            </button>
          </div>
          {notifications.length === 0 ? (
            <p className="text-sm text-gray-500">No notifications yet.</p>
          ) : (
            <div className="space-y-3">
              {notifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border ${
                    item.isRead ? 'bg-white border-gray-200' : 'bg-teal-50 border-teal-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900">{item.title || 'Notification'}</p>
                      <p className="text-sm text-gray-600 mt-1">{item.message || ''}</p>
                      <p className="text-xs text-gray-500 mt-2">{formatDate(item.createdAt)}</p>
                    </div>
                    {!item.isRead && (
                      <button
                        onClick={() => handleMarkRead(item.id)}
                        className="text-xs font-semibold text-teal-700 bg-teal-100 px-2 py-1 rounded"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: number | string; icon: React.ReactNode }> = ({
  label,
  value,
  icon
}) => (
  <div className="bg-white/90 rounded-2xl p-4 border border-gray-200">
    <div className="flex items-center justify-between">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <span className="text-teal-600">{icon}</span>
    </div>
    <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
  </div>
);

const InputField: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
}> = ({ label, value, onChange, required, placeholder }) => (
  <label className="block">
    <span className="block text-sm font-semibold text-gray-700 mb-1">{label}</span>
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      required={required}
      placeholder={placeholder}
      className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
    />
  </label>
);

export default PharmacistDashboard;
