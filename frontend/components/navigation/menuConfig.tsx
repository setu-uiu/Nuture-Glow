import {
  LayoutDashboard,
  Calendar,
  Syringe,
  Apple,
  Baby,
  BookOpen,
  Users,
  Droplet,
  Zap,
  Hospital,
  Package,
  ShoppingBag,
  User,
  Languages,
  BrainCircuit,
  ClipboardList,
  DollarSign,
  Video,
  Stethoscope,
  FileText,
  BarChart3,
  ShieldCheck,
  Smartphone,
  Bell,
} from 'lucide-react';
import type { MenuItem, WorkspaceMenuSection, CategorizedMenu } from './types';

// ─── Menu Item Factories ─────────────────────────────────────────────
// Accept a translation function so labels stay reactive to locale changes.

export function buildPatientMenu(t: (key: string) => string): MenuItem[] {
  return [
    { icon: <LayoutDashboard size={20} />, label: t('nav.dashboard'), path: '/dashboard' },
    { icon: <BrainCircuit size={20} />, label: t('nav.assistant'), path: '/assistant' },
    { icon: <User size={20} />, label: t('nav.profile'), path: '/profile' },
    { icon: <Calendar size={20} />, label: t('nav.appointments'), path: '/appointments' },
    { icon: <Syringe size={20} />, label: t('nav.vaccines'), path: '/vaccines' },
    { icon: <BookOpen size={20} />, label: t('nav.journal'), path: '/journal' },
    { icon: <Users size={20} />, label: t('nav.community'), path: '/community' },
    { icon: <Apple size={20} />, label: t('nav.nutrition'), path: '/nutrition' },
    { icon: <Baby size={20} />, label: t('nav.pregnancy'), path: '/pregnancy' },
    { icon: <Hospital size={20} />, label: t('nav.hospitals'), path: '/hospitals' },
    { icon: <Droplet size={20} />, label: t('nav.donors'), path: '/donors' },
    { icon: <Languages size={20} />, label: t('nav.translator'), path: '/translator' },
    { icon: <Zap size={20} />, label: t('nav.myths'), path: '/myths' },
    { icon: <ShoppingBag size={20} />, label: t('nav.pharmacy'), path: '/pharmacy' },
  ];
}

export function buildDoctorMenu(): MenuItem[] {
  return [
    { icon: <LayoutDashboard size={20} />, label: 'Overview', path: '/dashboard?tab=overview', tab: 'overview' },
    { icon: <ClipboardList size={20} />, label: 'Consultations', path: '/dashboard?tab=consultations', tab: 'consultations' },
    { icon: <Calendar size={20} />, label: 'Schedule', path: '/dashboard?tab=schedule', tab: 'schedule' },
    { icon: <DollarSign size={20} />, label: 'Earnings', path: '/dashboard?tab=earnings', tab: 'earnings' },
    { icon: <Video size={20} />, label: 'Telemedicine', path: '/dashboard?tab=telemedicine', tab: 'telemedicine' },
    { icon: <Users size={20} />, label: 'Patient Care', path: '/dashboard?tab=patients', tab: 'patients' },
    { icon: <Stethoscope size={20} />, label: 'Clinical Tools', path: '/dashboard?tab=clinical', tab: 'clinical' },
    { icon: <FileText size={20} />, label: 'Practice', path: '/dashboard?tab=practice', tab: 'practice' },
    { icon: <BarChart3 size={20} />, label: 'Analytics', path: '/dashboard?tab=analytics', tab: 'analytics' },
    { icon: <ShieldCheck size={20} />, label: 'Compliance', path: '/dashboard?tab=compliance', tab: 'compliance' },
    { icon: <Smartphone size={20} />, label: 'Mobile', path: '/dashboard?tab=mobile', tab: 'mobile' },
  ];
}

export function buildPharmacistMenu(): MenuItem[] {
  return [
    { icon: <LayoutDashboard size={20} />, label: 'Overview', path: '/dashboard?tab=overview', tab: 'overview' },
    { icon: <ClipboardList size={20} />, label: 'Orders', path: '/dashboard?tab=orders', tab: 'orders' },
    { icon: <ShoppingBag size={20} />, label: 'Products', path: '/dashboard?tab=products', tab: 'products' },
    { icon: <ShieldCheck size={20} />, label: 'Verification', path: '/dashboard?tab=verification', tab: 'verification' },
    { icon: <Bell size={20} />, label: 'Notifications', path: '/dashboard?tab=notifications', tab: 'notifications' },
  ];
}

export function buildMerchandiserMenu(): MenuItem[] {
  return [
    { icon: <LayoutDashboard size={20} />, label: 'Overview', path: '/dashboard?tab=overview', tab: 'overview' },
    { icon: <ShoppingBag size={20} />, label: 'Products', path: '/dashboard?tab=products', tab: 'products' },
    { icon: <Package size={20} />, label: 'Inventory', path: '/dashboard?tab=inventory', tab: 'inventory' },
    { icon: <BarChart3 size={20} />, label: 'Analytics', path: '/dashboard?tab=analytics', tab: 'analytics' },
    { icon: <Bell size={20} />, label: 'Notifications', path: '/dashboard?tab=notifications', tab: 'notifications' },
  ];
}

export function buildNutritionistMenu(): MenuItem[] {
  return [
    { icon: <LayoutDashboard size={20} />, label: 'Overview', path: '/dashboard?tab=overview', tab: 'overview' },
    { icon: <Users size={20} />, label: 'Patients', path: '/dashboard?tab=patients', tab: 'patients' },
    { icon: <Apple size={20} />, label: 'Nutrition Plans', path: '/dashboard?tab=plans', tab: 'plans' },
    { icon: <BarChart3 size={20} />, label: 'Analytics', path: '/dashboard?tab=analytics', tab: 'analytics' },
    { icon: <Bell size={20} />, label: 'Notifications', path: '/dashboard?tab=notifications', tab: 'notifications' },
  ];
}

// ─── Categorized Menu (patient sidebar grouping) ─────────────────────
export function buildCategorizedMenu(items: MenuItem[]): CategorizedMenu {
  return {
    core: [items[0], items[1], items[2]],
    health: [items[3], items[4], items[8], items[9], items[10]],
    lifestyle: [items[5], items[7], items[12]],
    community: [items[6], items[11]],
    shopping: [items[13]],
  };
}

// ─── Role Sidebar Sections ───────────────────────────────────────────

function doctorSections(items: MenuItem[]): WorkspaceMenuSection[] {
  return [
    { title: 'Core', items: items.slice(0, 4), activeClass: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-teal-800 font-semibold', hoverClass: 'text-gray-600 hover:bg-gray-50 hover:text-gray-900', accentClass: 'bg-gradient-to-b from-emerald-500 to-teal-500', activeIconClass: 'text-teal-600' },
    { title: 'Care', items: items.slice(4, 7), activeClass: 'bg-emerald-500/15 text-emerald-700 font-semibold', hoverClass: 'text-gray-600 hover:bg-emerald-50/50 hover:text-gray-900', accentClass: 'bg-emerald-500', activeIconClass: 'text-emerald-600' },
    { title: 'Operations', items: items.slice(7, 9), activeClass: 'bg-blue-500/15 text-blue-700 font-semibold', hoverClass: 'text-gray-600 hover:bg-blue-50/50 hover:text-gray-900', accentClass: 'bg-blue-500', activeIconClass: 'text-blue-600' },
    { title: 'Compliance', items: items.slice(9, 11), activeClass: 'bg-purple-500/15 text-purple-700 font-semibold', hoverClass: 'text-gray-600 hover:bg-purple-50/50 hover:text-gray-900', accentClass: 'bg-purple-500', activeIconClass: 'text-purple-600' },
  ];
}

function pharmacistSections(items: MenuItem[]): WorkspaceMenuSection[] {
  return [
    { title: 'Core', items: items.slice(0, 3), activeClass: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-teal-800 font-semibold', hoverClass: 'text-gray-600 hover:bg-gray-50 hover:text-gray-900', accentClass: 'bg-gradient-to-b from-emerald-500 to-teal-500', activeIconClass: 'text-teal-600' },
    { title: 'Compliance', items: items.slice(3, 4), activeClass: 'bg-amber-500/15 text-amber-700 font-semibold', hoverClass: 'text-gray-600 hover:bg-amber-50/50 hover:text-gray-900', accentClass: 'bg-amber-500', activeIconClass: 'text-amber-600' },
    { title: 'Updates', items: items.slice(4, 5), activeClass: 'bg-blue-500/15 text-blue-700 font-semibold', hoverClass: 'text-gray-600 hover:bg-blue-50/50 hover:text-gray-900', accentClass: 'bg-blue-500', activeIconClass: 'text-blue-600' },
  ];
}

function merchandiserSections(items: MenuItem[]): WorkspaceMenuSection[] {
  return [
    { title: 'Core', items: items.slice(0, 2), activeClass: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-teal-800 font-semibold', hoverClass: 'text-gray-600 hover:bg-gray-50 hover:text-gray-900', accentClass: 'bg-gradient-to-b from-emerald-500 to-teal-500', activeIconClass: 'text-teal-600' },
    { title: 'Inventory', items: items.slice(2, 3), activeClass: 'bg-emerald-500/15 text-emerald-700 font-semibold', hoverClass: 'text-gray-600 hover:bg-emerald-50/50 hover:text-gray-900', accentClass: 'bg-emerald-500', activeIconClass: 'text-emerald-600' },
    { title: 'Analytics', items: items.slice(3, 4), activeClass: 'bg-indigo-500/15 text-indigo-700 font-semibold', hoverClass: 'text-gray-600 hover:bg-indigo-50/50 hover:text-gray-900', accentClass: 'bg-indigo-500', activeIconClass: 'text-indigo-600' },
    { title: 'Updates', items: items.slice(4, 5), activeClass: 'bg-blue-500/15 text-blue-700 font-semibold', hoverClass: 'text-gray-600 hover:bg-blue-50/50 hover:text-gray-900', accentClass: 'bg-blue-500', activeIconClass: 'text-blue-600' },
  ];
}

function nutritionistSections(items: MenuItem[]): WorkspaceMenuSection[] {
  return [
    { title: 'Core', items: items.slice(0, 2), activeClass: 'bg-gradient-to-r from-lime-500/20 to-green-500/20 text-lime-800 font-semibold', hoverClass: 'text-gray-600 hover:bg-gray-50 hover:text-gray-900', accentClass: 'bg-gradient-to-b from-lime-500 to-green-500', activeIconClass: 'text-lime-600' },
    { title: 'Patients', items: items.slice(2, 3), activeClass: 'bg-green-500/15 text-green-700 font-semibold', hoverClass: 'text-gray-600 hover:bg-green-50/50 hover:text-gray-900', accentClass: 'bg-green-500', activeIconClass: 'text-green-600' },
    { title: 'Analytics', items: items.slice(3, 4), activeClass: 'bg-emerald-500/15 text-emerald-700 font-semibold', hoverClass: 'text-gray-600 hover:bg-emerald-50/50 hover:text-gray-900', accentClass: 'bg-emerald-500', activeIconClass: 'text-emerald-600' },
    { title: 'Updates', items: items.slice(4, 5), activeClass: 'bg-blue-500/15 text-blue-700 font-semibold', hoverClass: 'text-gray-600 hover:bg-blue-50/50 hover:text-gray-900', accentClass: 'bg-blue-500', activeIconClass: 'text-blue-600' },
  ];
}

export function buildRoleSidebarSections(
  role: string | undefined,
  doctorItems: MenuItem[],
  pharmacistItems: MenuItem[],
  merchandiserItems: MenuItem[],
  nutritionistItems: MenuItem[]
): WorkspaceMenuSection[] {
  switch (role) {
    case 'doctor': return doctorSections(doctorItems);
    case 'pharmacist': return pharmacistSections(pharmacistItems);
    case 'merchandiser': return merchandiserSections(merchandiserItems);
    case 'nutritionist': return nutritionistSections(nutritionistItems);
    default: return [];
  }
}

// ─── Quick Access Items (mobile bottom bar) ──────────────────────────
export function buildQuickAccessItems(
  role: string | undefined,
  patientItems: MenuItem[],
  doctorItems: MenuItem[],
  pharmacistItems: MenuItem[],
  merchandiserItems: MenuItem[]
): MenuItem[] {
  switch (role) {
    case 'doctor':
      return [doctorItems[0], doctorItems[4], doctorItems[5], doctorItems[2], doctorItems[8]];
    case 'pharmacist':
      return [pharmacistItems[0], pharmacistItems[1], pharmacistItems[2], pharmacistItems[4]];
    case 'merchandiser':
      return [merchandiserItems[0], merchandiserItems[1], merchandiserItems[2], merchandiserItems[3]];
    default:
      return [patientItems[0], patientItems[1], patientItems[3], patientItems[6], patientItems[2]];
  }
}
