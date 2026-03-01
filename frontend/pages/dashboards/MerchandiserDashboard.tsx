import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertCircle,
  BarChart3,
  Package,
  RefreshCw,
  Store,
  Trash2
} from 'lucide-react';
import {
  AppNotification,
  MerchandiserDashboardData,
  MerchandiserDashboardService,
  MerchandiserProduct
} from '../../services/dashboardService';

type MerchandiserTab = 'overview' | 'products' | 'inventory' | 'analytics' | 'notifications';

const MerchandiserDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<MerchandiserTab>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dashboard, setDashboard] = useState<MerchandiserDashboardData | null>(null);
  const [products, setProducts] = useState<MerchandiserProduct[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [productFilter, setProductFilter] = useState<'all' | 'draft' | 'active' | 'inactive'>('all');
  const [savingProduct, setSavingProduct] = useState(false);
  const [updatingProductId, setUpdatingProductId] = useState<string | null>(null);

  const [productForm, setProductForm] = useState({
    name: '',
    category: '',
    price: '',
    stockQuantity: '',
    lowStockThreshold: '10',
    status: 'draft' as 'draft' | 'active' | 'inactive',
    image: '',
    description: ''
  });

  useEffect(() => {
    const tab = new URLSearchParams(location.search).get('tab');
    const validTabs: MerchandiserTab[] = ['overview', 'products', 'inventory', 'analytics', 'notifications'];
    if (tab && validTabs.includes(tab as MerchandiserTab)) {
      setActiveTab(tab as MerchandiserTab);
      return;
    }
    setActiveTab('overview');
  }, [location.search]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        await Promise.all([loadDashboard(), loadProducts(productFilter), loadNotifications()]);
      } catch (err) {
        setError('Failed to load merchandiser dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const setTab = (tab: MerchandiserTab) => {
    setActiveTab(tab);
    const params = new URLSearchParams(location.search);
    params.set('tab', tab);
    navigate({ pathname: '/dashboard', search: params.toString() }, { replace: true });
  };

  const loadDashboard = async () => {
    const data = await MerchandiserDashboardService.getDashboardData();
    setDashboard(data);
    setError(null);
  };

  const loadProducts = async (status: 'all' | 'draft' | 'active' | 'inactive') => {
    const items = await MerchandiserDashboardService.getProducts(status);
    setProducts(items);
  };

  const loadNotifications = async () => {
    const items = await MerchandiserDashboardService.getNotifications();
    setNotifications(items);
  };

  const refreshAll = async () => {
    try {
      setLoading(true);
      await Promise.all([loadDashboard(), loadProducts(productFilter), loadNotifications()]);
    } catch (err) {
      setError('Refresh failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const price = Number(productForm.price);
    const stockQuantity = Number(productForm.stockQuantity);
    const lowStockThreshold = Number(productForm.lowStockThreshold);

    if (!productForm.name.trim() || !Number.isFinite(price)) {
      setError('Product name and valid price are required.');
      return;
    }

    try {
      setSavingProduct(true);
      await MerchandiserDashboardService.createProduct({
        name: productForm.name.trim(),
        category: productForm.category.trim() || 'General',
        price,
        stockQuantity: Number.isFinite(stockQuantity) ? stockQuantity : 0,
        lowStockThreshold: Number.isFinite(lowStockThreshold) ? lowStockThreshold : 10,
        status: productForm.status,
        image: productForm.image.trim() || undefined,
        description: productForm.description.trim() || undefined
      });

      setProductForm({
        name: '',
        category: '',
        price: '',
        stockQuantity: '',
        lowStockThreshold: '10',
        status: 'draft',
        image: '',
        description: ''
      });
      await Promise.all([loadProducts(productFilter), loadDashboard()]);
      setTab('products');
    } catch (err: any) {
      setError(err?.message || 'Failed to create product');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleUpdateProduct = async (
    productId: string,
    payload: Partial<{
      status: 'draft' | 'active' | 'inactive';
      stockQuantity: number;
      lowStockThreshold: number;
    }>
  ) => {
    try {
      setUpdatingProductId(productId);
      await MerchandiserDashboardService.updateProduct(productId, payload);
      await Promise.all([loadProducts(productFilter), loadDashboard()]);
    } catch (err) {
      setError('Failed to update product');
    } finally {
      setUpdatingProductId(null);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      setUpdatingProductId(productId);
      await MerchandiserDashboardService.deleteProduct(productId);
      await Promise.all([loadProducts(productFilter), loadDashboard()]);
    } catch (err) {
      setError('Failed to delete product');
    } finally {
      setUpdatingProductId(null);
    }
  };

  const handleMarkNotificationRead = async (notificationId: string) => {
    try {
      await MerchandiserDashboardService.markNotificationRead(notificationId);
      setNotifications((current) =>
        current.map((item) => (item.id === notificationId ? { ...item, isRead: true } : item))
      );
    } catch (err) {
      setError('Failed to update notification');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await MerchandiserDashboardService.markAllNotificationsRead();
      setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
    } catch (err) {
      setError('Failed to mark all notifications');
    }
  };

  const analytics = useMemo(() => {
    const byCategory = new Map<string, number>();
    products.forEach((item) => {
      byCategory.set(item.category || 'General', (byCategory.get(item.category || 'General') || 0) + 1);
    });
    const categories = Array.from(byCategory.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    const inventoryValue = products.reduce(
      (sum, item) => sum + (Number(item.price) || 0) * (Number(item.stockQuantity) || 0),
      0
    );

    return {
      categories,
      inventoryValue,
      active: products.filter((item) => item.status === 'active').length,
      draft: products.filter((item) => item.status === 'draft').length,
      inactive: products.filter((item) => item.status === 'inactive').length
    };
  }, [products]);

  const lowStockItems = useMemo(
    () =>
      products.filter(
        (item) => item.stockQuantity > 0 && item.stockQuantity <= (item.lowStockThreshold || 10)
      ),
    [products]
  );

  const outOfStockItems = useMemo(
    () => products.filter((item) => item.stockQuantity === 0),
    [products]
  );

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications]
  );

  const formatCurrency = (value?: number) =>
    Number.isFinite(Number(value)) ? `BDT ${Number(value).toLocaleString()}` : '--';

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
          <p className="text-gray-700">{error || 'Merchandiser dashboard is unavailable.'}</p>
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
      <div className="bg-gradient-to-r from-emerald-700 via-teal-600 to-emerald-500 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/70">Merchandiser Workspace</p>
            <h1 className="text-2xl md:text-3xl font-bold mt-1">{dashboard.profile.name || 'Store'}</h1>
            <p className="text-sm text-white/85 mt-1">Manage your catalog and stock from one place.</p>
          </div>
          <button
            onClick={refreshAll}
            className="px-4 py-2 rounded-xl bg-white text-teal-700 text-sm font-bold inline-flex items-center gap-2"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white/80 rounded-2xl border border-gray-200 p-2 inline-flex gap-2">
        {(['overview', 'products', 'inventory', 'analytics', 'notifications'] as MerchandiserTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab ? 'bg-teal-600 text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {tab === 'notifications' ? `Notifications (${unreadCount})` : tab.charAt(0).toUpperCase() + tab.slice(1)}
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
            <MetricCard label="Total Products" value={dashboard.stats.totalProducts} icon={<Package size={20} />} />
            <MetricCard label="Active" value={dashboard.stats.activeProducts} icon={<Store size={20} />} />
            <MetricCard label="Low Stock" value={dashboard.stats.lowStockProducts} icon={<AlertCircle size={20} />} />
            <MetricCard label="Out of Stock" value={dashboard.stats.outOfStockProducts} icon={<Trash2 size={20} />} />
            <MetricCard label="Inventory Value" value={formatCurrency(dashboard.stats.inventoryValue)} icon={<BarChart3 size={20} />} />
          </div>

          <div className="bg-white/85 rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Products</h2>
            {dashboard.recentProducts.length === 0 ? (
              <p className="text-sm text-gray-500">No products added yet.</p>
            ) : (
              <div className="space-y-3">
                {dashboard.recentProducts.map((item) => (
                  <div key={item.id} className="p-4 rounded-xl border border-gray-200 bg-white flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.category} | {item.stockQuantity} in stock</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(item.price)}</p>
                      <span className="text-xs text-gray-500 uppercase">{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-1 bg-white/85 rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Add Product</h2>
            <form onSubmit={handleCreateProduct} className="space-y-3">
              <Field label="Name" value={productForm.name} onChange={(value) => setProductForm((c) => ({ ...c, name: value }))} required />
              <Field label="Category" value={productForm.category} onChange={(value) => setProductForm((c) => ({ ...c, category: value }))} />
              <Field label="Price" value={productForm.price} onChange={(value) => setProductForm((c) => ({ ...c, price: value }))} required />
              <Field label="Stock Quantity" value={productForm.stockQuantity} onChange={(value) => setProductForm((c) => ({ ...c, stockQuantity: value }))} />
              <Field
                label="Low Stock Threshold"
                value={productForm.lowStockThreshold}
                onChange={(value) => setProductForm((c) => ({ ...c, lowStockThreshold: value }))}
              />
              <Field label="Image URL" value={productForm.image} onChange={(value) => setProductForm((c) => ({ ...c, image: value }))} />
              <label className="block">
                <span className="block text-sm font-semibold text-gray-700 mb-1">Status</span>
                <select
                  value={productForm.status}
                  onChange={(event) =>
                    setProductForm((c) => ({ ...c, status: event.target.value as 'draft' | 'active' | 'inactive' }))
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>
              <label className="block">
                <span className="block text-sm font-semibold text-gray-700 mb-1">Description</span>
                <textarea
                  value={productForm.description}
                  onChange={(event) => setProductForm((c) => ({ ...c, description: event.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </label>
              <button
                type="submit"
                disabled={savingProduct}
                className="w-full px-4 py-2.5 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 disabled:opacity-50"
              >
                {savingProduct ? 'Saving...' : 'Create Product'}
              </button>
            </form>
          </div>

          <div className="xl:col-span-2 bg-white/85 rounded-2xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Your Products</h2>
              <div className="inline-flex gap-2 bg-gray-100 rounded-xl p-1">
                {(['all', 'draft', 'active', 'inactive'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={async () => {
                      setProductFilter(status);
                      await loadProducts(status);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase ${
                      productFilter === status ? 'bg-white shadow text-teal-700' : 'text-gray-600'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {products.length === 0 ? (
              <p className="text-sm text-gray-500">No products for this filter.</p>
            ) : (
              products.map((item) => (
                <div key={item.id} className="p-4 rounded-xl border border-gray-200 bg-white space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        {item.category} | {formatCurrency(item.price)} | Stock: {item.stockQuantity}
                      </p>
                    </div>
                    <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold uppercase">
                      {item.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(['draft', 'active', 'inactive'] as const)
                      .filter((status) => status !== item.status)
                      .map((status) => (
                        <button
                          key={status}
                          disabled={updatingProductId === item.id}
                          onClick={() => handleUpdateProduct(item.id, { status })}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                          Set {status}
                        </button>
                      ))}
                    <button
                      disabled={updatingProductId === item.id}
                      onClick={() =>
                        handleUpdateProduct(item.id, {
                          stockQuantity: Math.max(0, Number(item.stockQuantity || 0) + 10)
                        })
                      }
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      +10 stock
                    </button>
                    <button
                      disabled={updatingProductId === item.id}
                      onClick={() => handleDeleteProduct(item.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white/85 rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Low Stock</h2>
            {lowStockItems.length === 0 ? (
              <p className="text-sm text-gray-500">No low-stock items.</p>
            ) : (
              <div className="space-y-3">
                {lowStockItems.map((item) => (
                  <div key={item.id} className="p-4 rounded-xl border border-amber-200 bg-amber-50">
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-xs text-amber-700">
                      Stock: {item.stockQuantity} | Threshold: {item.lowStockThreshold}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white/85 rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Out Of Stock</h2>
            {outOfStockItems.length === 0 ? (
              <p className="text-sm text-gray-500">No out-of-stock items.</p>
            ) : (
              <div className="space-y-3">
                {outOfStockItems.map((item) => (
                  <div key={item.id} className="p-4 rounded-xl border border-red-200 bg-red-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{item.name}</p>
                        <p className="text-xs text-red-700">Stock: 0</p>
                      </div>
                      <button
                        disabled={updatingProductId === item.id}
                        onClick={() => handleUpdateProduct(item.id, { stockQuantity: item.lowStockThreshold || 10 })}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        Restock
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard label="Active" value={analytics.active} icon={<Store size={18} />} />
            <MetricCard label="Draft" value={analytics.draft} icon={<Package size={18} />} />
            <MetricCard label="Inactive" value={analytics.inactive} icon={<Trash2 size={18} />} />
            <MetricCard label="Inventory Value" value={formatCurrency(analytics.inventoryValue)} icon={<BarChart3 size={18} />} />
          </div>

          <div className="bg-white/85 rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Category Distribution</h2>
            {analytics.categories.length === 0 ? (
              <p className="text-sm text-gray-500">No category data available.</p>
            ) : (
              <div className="space-y-3">
                {analytics.categories.map((item) => (
                  <div key={item.category}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{item.category}</span>
                      <span className="font-semibold text-gray-900">{item.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full bg-teal-600"
                        style={{
                          width: `${products.length ? Math.round((item.count / products.length) * 100) : 0}%`
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
                    </div>
                    {!item.isRead && (
                      <button
                        onClick={() => handleMarkNotificationRead(item.id)}
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

const MetricCard: React.FC<{ label: string; value: number | string; icon: React.ReactNode }> = ({
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

const Field: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}> = ({ label, value, onChange, required }) => (
  <label className="block">
    <span className="block text-sm font-semibold text-gray-700 mb-1">{label}</span>
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      required={required}
      className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
    />
  </label>
);

export default MerchandiserDashboard;
