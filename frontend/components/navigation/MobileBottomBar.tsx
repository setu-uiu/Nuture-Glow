import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { MenuItem } from './types';

interface MobileBottomBarProps {
  items: MenuItem[];
  usesRoleWorkspace: boolean;
  activeDashboardTab: string;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
  items,
  usesRoleWorkspace,
  activeDashboardTab,
}) => {
  const location = useLocation();

  const isActive = (item: MenuItem) =>
    usesRoleWorkspace ? activeDashboardTab === item.tab : location.pathname === item.path;

  return (
    <div className="lg:hidden flex items-center justify-around h-20 bg-white/90 backdrop-blur-md border-t border-gray-100 fixed bottom-0 left-0 right-0 z-40">
      {items.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-200 ${
            isActive(item) ? 'text-teal-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div
            className={`p-2 rounded-xl transition-all ${
              isActive(item) ? 'bg-teal-100' : 'hover:bg-gray-100'
            }`}
          >
            {item.icon}
          </div>
          <span className="text-[10px] font-semibold text-center line-clamp-1">{item.label}</span>
          {isActive(item) && <div className="w-1.5 h-1.5 bg-teal-500 rounded-full" />}
        </Link>
      ))}
    </div>
  );
};
