import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Languages, LogOut } from 'lucide-react';
import { Logo } from '../../constants';
import type { WorkspaceMenuSection, CategorizedMenu } from './types';
import type { Language } from '../../types';

interface SidebarNavProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  usesRoleWorkspace: boolean;
  activeDashboardTab: string;
  roleSidebarSections: WorkspaceMenuSection[];
  categorizedMenu: CategorizedMenu;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  locale: string;
  setLocale: (lang: Language) => void;
  logout: () => void;
  t: (key: string) => string;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
  usesRoleWorkspace,
  activeDashboardTab,
  roleSidebarSections,
  categorizedMenu,
  searchQuery,
  setSearchQuery,
  locale,
  setLocale,
  logout,
  t,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transition-transform duration-300 lg:static lg:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div
          onClick={() => navigate('/dashboard')}
          className="cursor-pointer p-6 flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <Logo />
          <div>
            <h1 className="text-xl font-bold text-gray-800 leading-tight">Nurture</h1>
            <span className="text-xs text-[#E6C77A] font-semibold uppercase tracking-wider">Glow</span>
          </div>
        </div>

        {/* Filter input */}
        <div className="px-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
            <input
              type="text"
              placeholder="Filter menu..."
              className="w-full bg-gray-50 border-none rounded-xl pl-9 py-2 text-xs focus:ring-2 focus:ring-[#BFE6DA] outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-6 scrollbar-hide">
          {usesRoleWorkspace ? (
            <RoleWorkspaceNav
              sections={roleSidebarSections}
              activeDashboardTab={activeDashboardTab}
              setIsSidebarOpen={setIsSidebarOpen}
            />
          ) : (
            <PatientNav
              categorizedMenu={categorizedMenu}
              locale={locale}
              setIsSidebarOpen={setIsSidebarOpen}
            />
          )}
        </nav>

        {/* Footer buttons */}
        <div className="p-4 border-t border-gray-100 space-y-2">
          <button
            onClick={() => setLocale(locale === 'en' ? 'bn' : 'en')}
            className="flex items-center gap-3 w-full px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-2xl transition-all"
          >
            <Languages size={20} className="text-gray-400" />
            <span className="font-medium text-sm">{locale === 'en' ? 'বাংলা' : 'English'}</span>
          </button>
          <button
            onClick={() => logout()}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 rounded-2xl transition-all"
          >
            <LogOut size={20} className="text-red-400" />
            <span className="font-medium text-sm">{t('nav.logout')}</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

// ─── Workspace (Doctor/Pharmacist/etc.) nav ──────────────────────────
const RoleWorkspaceNav: React.FC<{
  sections: WorkspaceMenuSection[];
  activeDashboardTab: string;
  setIsSidebarOpen: (open: boolean) => void;
}> = ({ sections, activeDashboardTab, setIsSidebarOpen }) => (
  <>
    {sections.map((section, index) => (
      <React.Fragment key={section.title}>
        {index > 0 && (
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        )}
        <div>
          <h4 className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
            {section.title}
          </h4>
          <div className="space-y-1">
            {section.items.map((item) => {
              const isActive = activeDashboardTab === item.tab;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 relative ${
                    isActive ? section.activeClass : section.hoverClass
                  }`}
                >
                  {isActive && (
                    <div
                      className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 ${section.accentClass} rounded-r-full`}
                    />
                  )}
                  <span className={`transition-colors ${isActive ? section.activeIconClass : 'text-gray-400'}`}>
                    {item.icon}
                  </span>
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </React.Fragment>
    ))}
  </>
);

// ─── Patient nav (categorized sections) ──────────────────────────────
const PatientNav: React.FC<{
  categorizedMenu: CategorizedMenu;
  locale: string;
  setIsSidebarOpen: (open: boolean) => void;
}> = ({ categorizedMenu, locale, setIsSidebarOpen }) => {
  const location = useLocation();

  const sectionConfig: {
    key: keyof CategorizedMenu;
    label?: string;
    activeClass: string;
    hoverClass: string;
    accentClass: string;
    activeIconClass: string;
  }[] = [
    {
      key: 'core',
      activeClass: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-teal-800 font-bold',
      hoverClass: 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
      accentClass: 'bg-gradient-to-b from-emerald-500 to-teal-500',
      activeIconClass: 'text-teal-600',
    },
    {
      key: 'health',
      label: locale === 'bn' ? 'স্বাস্থ্য' : 'Health',
      activeClass: 'bg-emerald-500/15 text-emerald-700 font-semibold',
      hoverClass: 'text-gray-600 hover:bg-emerald-50/50 hover:text-gray-900',
      accentClass: 'bg-emerald-500',
      activeIconClass: 'text-emerald-600',
    },
    {
      key: 'lifestyle',
      label: locale === 'bn' ? 'জীবনধারা' : 'Lifestyle',
      activeClass: 'bg-amber-500/15 text-amber-700 font-semibold',
      hoverClass: 'text-gray-600 hover:bg-amber-50/50 hover:text-gray-900',
      accentClass: 'bg-amber-500',
      activeIconClass: 'text-amber-600',
    },
    {
      key: 'community',
      label: locale === 'bn' ? 'সম্প্রদায়' : 'Community',
      activeClass: 'bg-blue-500/15 text-blue-700 font-semibold',
      hoverClass: 'text-gray-600 hover:bg-blue-50/50 hover:text-gray-900',
      accentClass: 'bg-blue-500',
      activeIconClass: 'text-blue-600',
    },
    {
      key: 'shopping',
      label: locale === 'bn' ? 'কেনাকাটা' : 'Shopping',
      activeClass: 'bg-purple-500/15 text-purple-700 font-semibold',
      hoverClass: 'text-gray-600 hover:bg-purple-50/50 hover:text-gray-900',
      accentClass: 'bg-purple-500',
      activeIconClass: 'text-purple-600',
    },
  ];

  const isItemActive = (path: string) =>
    location.pathname === path || (path === '/pharmacy' && location.pathname === '/pharmacy/cart');

  return (
    <>
      {sectionConfig.map((section, idx) => (
        <React.Fragment key={section.key}>
          {idx === 1 && (
            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
          )}
          <div className={section.key === 'core' ? 'space-y-1' : ''}>
            {section.label && (
              <h4 className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                {section.label}
              </h4>
            )}
            <div className="space-y-1">
              {categorizedMenu[section.key].map((item) => {
                const active = isItemActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 ${
                      section.key === 'core' ? 'py-3 rounded-2xl' : 'py-2.5 rounded-xl'
                    } transition-all duration-200 relative ${active ? section.activeClass : section.hoverClass}`}
                  >
                    {active && (
                      <div
                        className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 ${
                          section.key === 'core' ? 'h-6' : 'h-5'
                        } ${section.accentClass} rounded-r-full`}
                      />
                    )}
                    <span className={`transition-colors ${active ? section.activeIconClass : 'text-gray-400'}`}>
                      {item.icon}
                    </span>
                    <span className="text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </React.Fragment>
      ))}
    </>
  );
};
