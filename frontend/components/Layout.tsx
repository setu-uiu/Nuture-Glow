import React, { useState, Suspense, useMemo } from 'react';
import { Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Mic, Menu } from 'lucide-react';
import { useTranslations } from '../i18n/I18nContext';
import { useAuth } from '../contexts/AuthContext';
import { useVoiceCommands } from './voice/useVoiceCommands';
import { NotificationBell } from './notifications/NotificationBell';
import { GlobalSearch } from './search/GlobalSearch';
import {
  SidebarNav,
  MobileBottomBar,
  buildPatientMenu,
  buildDoctorMenu,
  buildPharmacistMenu,
  buildMerchandiserMenu,
  buildNutritionistMenu,
  buildCategorizedMenu,
  buildRoleSidebarSections,
  buildQuickAccessItems,
} from './navigation';

// ─── Lazy-loaded pages (code splitting) ─────────────────────────────
// Each page is loaded on demand, significantly reducing the initial bundle size.
const Landing = React.lazy(() => import('../pages/Landing'));
const Login = React.lazy(() => import('../pages/Login'));
const Register = React.lazy(() => import('../pages/Register'));
const ResetPassword = React.lazy(() => import('../pages/ResetPassword'));
const About = React.lazy(() => import('../pages/About'));
const FeaturesPage = React.lazy(() => import('../pages/FeaturesPage'));
const Products = React.lazy(() => import('../pages/Products'));
const Contact = React.lazy(() => import('../pages/Contact'));
const PlaceholderPage = React.lazy(() => import('../pages/PlaceholderPage'));
const Dashboard = React.lazy(() => import('../pages/Dashboard'));
const Appointments = React.lazy(() => import('../pages/Appointments'));
const Vaccines = React.lazy(() => import('../pages/VaccineTracker'));
const Community = React.lazy(() => import('../pages/Community').then(m => ({ default: m.Community })));
const Journal = React.lazy(() => import('../pages/Journal'));
const Profile = React.lazy(() => import('../pages/Profile'));
const Nutrition = React.lazy(() => import('../pages/Nutrition'));
const Pregnancy = React.lazy(() => import('../pages/Pregnancy'));
const Hospitals = React.lazy(() => import('../pages/Hospitals'));
const Pharmacy = React.lazy(() => import('../pages/Pharmacy'));
const Myths = React.lazy(() => import('../pages/Myths'));
const Translator = React.lazy(() => import('../pages/Translator'));
const BloodDonors = React.lazy(() => import('../pages/BloodDonors'));
const Health = React.lazy(() => import('../pages/Health'));
const Cart = React.lazy(() => import('../pages/Cart'));
const Checkout = React.lazy(() => import('../pages/Checkout'));
const MyOrders = React.lazy(() => import('../pages/MyOrders'));
const Assistant = React.lazy(() => import('../pages/Assistant').then(m => ({ default: m.Assistant })));
const AppointmentVideo = React.lazy(() => import('../pages/appointments/AppointmentVideo'));
const LanguageSettings = React.lazy(() => import('../pages/SettingsPages').then(m => ({ default: m.LanguageSettings })));
const NotificationSettings = React.lazy(() => import('../pages/SettingsPages').then(m => ({ default: m.NotificationSettings })));
const DoctorDashboard = React.lazy(() => import('../pages/dashboards/DoctorDashboard'));
const PharmacistDashboard = React.lazy(() => import('../pages/dashboards/PharmacistDashboard'));
const MerchandiserDashboard = React.lazy(() => import('../pages/dashboards/MerchandiserDashboard'));
const NutritionistDashboard = React.lazy(() => import('../pages/dashboards/NutritionistDashboard'));
const AdminLogin = React.lazy(() => import('../pages/admin/AdminLogin'));
const AdminRegister = React.lazy(() => import('../pages/admin/AdminRegister'));
const AdminLayout = React.lazy(() => import('./AdminLayout'));

// Loading fallback for Suspense boundaries
const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#E6C77A]"></div>
  </div>
);

// Protected Route Component for role-based access
interface ProtectedRouteProps {
  children: React.ReactElement;
  requiredRole?: string;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole, allowedRoles }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role || '')) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

const Layout: React.FC = () => {
  const { user, logout, isLoading } = useAuth();
  const { locale, setLocale, t } = useTranslations();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const {
    isSupported,
    isListening,
    transcript,
    lastIntent,
    error,
    toggleListening
  } = useVoiceCommands({
    lang: locale || 'en',
    onCommand: (path) => {
      navigate(path);
    }
  });

  const isDoctor = user?.role === 'doctor';
  const isPharmacist = user?.role === 'pharmacist';
  const isMerchandiser = user?.role === 'merchandiser';
  const isNutritionist = user?.role === 'nutritionist';
  const usesRoleWorkspace = isDoctor || isPharmacist || isMerchandiser || isNutritionist;

  // ─── Menu data (extracted to navigation/menuConfig) ────────────────
  const patientMenuItems = useMemo(() => buildPatientMenu(t), [t]);
  const doctorMenuItems = useMemo(() => buildDoctorMenu(), []);
  const pharmacistMenuItems = useMemo(() => buildPharmacistMenu(), []);
  const merchandiserMenuItems = useMemo(() => buildMerchandiserMenu(), []);
  const nutritionistMenuItems = useMemo(() => buildNutritionistMenu(), []);

  const categorizedMenu = useMemo(() => buildCategorizedMenu(patientMenuItems), [patientMenuItems]);
  const roleSidebarSections = useMemo(
    () => buildRoleSidebarSections(user?.role, doctorMenuItems, pharmacistMenuItems, merchandiserMenuItems, nutritionistMenuItems),
    [user?.role, doctorMenuItems, pharmacistMenuItems, merchandiserMenuItems, nutritionistMenuItems]
  );
  const quickAccessItems = useMemo(
    () => buildQuickAccessItems(user?.role, patientMenuItems, doctorMenuItems, pharmacistMenuItems, merchandiserMenuItems),
    [user?.role, patientMenuItems, doctorMenuItems, pharmacistMenuItems, merchandiserMenuItems]
  );

  // Get breadcrumb data
  const activeDashboardTab = new URLSearchParams(location.search).get('tab') || 'overview';
  const roleMenuItems = isDoctor
    ? doctorMenuItems
    : isPharmacist
    ? pharmacistMenuItems
    : isMerchandiser
    ? merchandiserMenuItems
    : isNutritionist
    ? nutritionistMenuItems
    : patientMenuItems;

  const getBreadcrumbs = () => {
    if (usesRoleWorkspace) {
      const matched = roleMenuItems.find((item) => item.tab === activeDashboardTab);
      const roleLabel = isDoctor
        ? 'Doctor Dashboard'
        : isPharmacist
        ? 'Pharmacy Dashboard'
        : 'Merchandiser Dashboard';
      const crumbs = [{ label: roleLabel, path: '/dashboard?tab=overview' }];
      if (matched && matched.tab !== 'overview') {
        crumbs.push({ label: matched.label, path: matched.path });
      }
      return crumbs;
    }
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ label: t('nav.dashboard'), path: '/dashboard' }];
    
    if (pathSegments.length > 1) {
      const matchedItem = patientMenuItems.find(item => item.path === '/' + pathSegments[0]);
      if (matchedItem) {
        breadcrumbs.push({ label: matchedItem.label, path: '/' + pathSegments[0] });
      }
    }
    return breadcrumbs;
  };

  const filteredMenu = roleMenuItems.filter(item => 
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#F7F5EF]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E6C77A]"></div>
      </div>
    );
  }

  // Define landing routes that don't need auth or sidebar
  const publicRoutes = [
    '/', '/about', '/features', '/pricing', '/contact', '/how-it-works', 
    '/mobile-app', '/help-center', '/privacy', '/terms', '/cookie-policy', '/sitemap'
  ];

  if (publicRoutes.includes(location.pathname)) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/pricing" element={<Products />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/how-it-works" element={<PlaceholderPage title="How It Works" />} />
          <Route path="/mobile-app" element={<PlaceholderPage title="Mobile App" />} />
          <Route path="/help-center" element={<PlaceholderPage title="Help Center" />} />
          <Route path="/privacy" element={<PlaceholderPage title="Privacy Policy" />} />
          <Route path="/terms" element={<PlaceholderPage title="Terms of Service" />} />
          <Route path="/cookie-policy" element={<PlaceholderPage title="Cookie Policy" />} />
          <Route path="/sitemap" element={<PlaceholderPage title="Sitemap" />} />
        </Routes>
      </Suspense>
    );
  }
  
  const authRoutes = ['/login', '/register', '/signup', '/reset-password'];
  if (authRoutes.includes(location.pathname)) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/signup" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </Suspense>
    );
  }

  // Admin routes (COMPLETELY SEPARATE from patient routes)
  if (location.pathname.startsWith('/admin')) {
    // Admin login and register are public
    if (location.pathname === '/admin/login' || location.pathname === '/admin/register') {
      return (
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/register" element={<AdminRegister />} />
            <Route path="*" element={<Navigate to="/admin/login" replace />} />
          </Routes>
        </Suspense>
      );
    }
    
    // All other admin routes require authentication AND admin role
    if (!user) {
      return <Navigate to="/admin/login" replace />;
    }
    
    // Verify user has admin role
    if (!['medical_admin', 'ops_admin', 'system_admin'].includes(user.role || '')) {
      return <Navigate to="/login" replace />;
    }
    
    // Use AdminLayout for all authenticated admin routes - wrap in Routes with wildcard
    return (
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/admin/*" element={<AdminLayout />} />
        </Routes>
      </Suspense>
    );
  }

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  return (
    <div className="flex h-screen overflow-hidden">
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/20 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <SidebarNav
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        usesRoleWorkspace={usesRoleWorkspace}
        activeDashboardTab={activeDashboardTab}
        roleSidebarSections={roleSidebarSections}
        categorizedMenu={categorizedMenu}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        locale={locale}
        setLocale={setLocale}
        logout={logout}
        t={t}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Breadcrumb Navigation */}
        {!usesRoleWorkspace && (
          <div className="hidden md:flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-white/50 to-white/30 backdrop-blur-sm border-b border-gray-100 text-sm">
            {getBreadcrumbs().map((crumb, idx, arr) => (
              <div key={crumb.path} className="flex items-center gap-2">
                <Link to={crumb.path} className="text-teal-600 hover:text-teal-700 font-medium transition-colors">
                  {crumb.label}
                </Link>
                {idx < arr.length - 1 && <span className="text-gray-300">/</span>}
              </div>
            ))}
          </div>
        )}

        <header className="h-16 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 border-b border-gray-100 sticky top-0 z-30">
          <div className="flex items-center gap-4 flex-1">
            <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <GlobalSearch />
          </div>
          <div className="flex items-center gap-4 ml-4">
            <button onClick={toggleListening} disabled={!isSupported} className={`p-3 rounded-full transition-all ${isListening ? 'bg-red-500 text-white shadow-lg shadow-red-200' : 'bg-[#E6C77A]/20 text-[#D4B56A]'}`}>
              <Mic size={20} />
            </button>
            <NotificationBell />
            <button
              onClick={() => navigate(usesRoleWorkspace ? '/dashboard?tab=overview' : '/profile')}
              className="flex items-center gap-3 pl-2 p-1.5 rounded-2xl hover:bg-gray-50 transition-all"
            >
              <img src={user?.avatar} loading="lazy" className="w-9 h-9 rounded-full object-cover ring-2 ring-[#BFE6DA]" />
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-gray-800 line-clamp-1">{user?.name}</p>
                <p className="text-[9px] text-teal-600 font-bold tracking-tighter uppercase">Premium Hub</p>
              </div>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-[#F7F5EF] custom-scrollbar">
          <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  {user?.role === 'doctor' ? (
                    <DoctorDashboard />
                  ) : user?.role === 'pharmacist' ? (
                    <PharmacistDashboard />
                  ) : user?.role === 'merchandiser' ? (
                    <MerchandiserDashboard />
                  ) : user?.role === 'nutritionist' ? (
                    <NutritionistDashboard />
                  ) : (
                    <Dashboard />
                  )}
                </ProtectedRoute>
              }
            />
            {!usesRoleWorkspace && (
              <>
                <Route path="/health" element={<ProtectedRoute><Health /></ProtectedRoute>} />
                <Route path="/health/:metric" element={<ProtectedRoute><Health /></ProtectedRoute>} />
                <Route path="/assistant" element={<ProtectedRoute><Assistant /></ProtectedRoute>} />
                <Route path="/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
                <Route path="/appointments/:id/video" element={<ProtectedRoute><AppointmentVideo /></ProtectedRoute>} />
                <Route path="/vaccines" element={<ProtectedRoute><Vaccines /></ProtectedRoute>} />
                <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
                <Route path="/journal" element={<ProtectedRoute><Journal /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/settings/language" element={<ProtectedRoute><LanguageSettings /></ProtectedRoute>} />
                <Route path="/settings/notifications" element={<ProtectedRoute><NotificationSettings /></ProtectedRoute>} />
                <Route path="/nutrition" element={<ProtectedRoute><Nutrition /></ProtectedRoute>} />
                <Route path="/pregnancy" element={<ProtectedRoute><Pregnancy /></ProtectedRoute>} />
                <Route path="/hospitals" element={<ProtectedRoute><Hospitals /></ProtectedRoute>} />
                <Route path="/pharmacy" element={<ProtectedRoute><Pharmacy /></ProtectedRoute>} />
                <Route path="/pharmacy/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                <Route path="/pharmacy/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                <Route path="/pharmacy/orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
                <Route path="/myths" element={<ProtectedRoute><Myths /></ProtectedRoute>} />
                <Route path="/translator" element={<ProtectedRoute><Translator /></ProtectedRoute>} />
                <Route path="/donors" element={<ProtectedRoute><BloodDonors /></ProtectedRoute>} />
              </>
            )}
            <Route
              path="*"
              element={<Navigate to={usesRoleWorkspace ? '/dashboard?tab=overview' : '/dashboard'} replace />}
            />
          </Routes>
          </Suspense>
        </div>

        {/* Mobile Bottom Action Bar */}
        <MobileBottomBar
          items={quickAccessItems}
          usesRoleWorkspace={usesRoleWorkspace}
          activeDashboardTab={activeDashboardTab}
        />
      </main>

      {/* Padding for mobile bottom bar */}
      <div className="lg:hidden h-20" />
    </div>
  );
};

export default Layout;
