import React from 'react';

export interface MenuItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  tab?: string;
}

export interface WorkspaceMenuSection {
  title: string;
  items: MenuItem[];
  activeClass: string;
  hoverClass: string;
  accentClass: string;
  activeIconClass: string;
}

export interface CategorizedMenu {
  core: MenuItem[];
  health: MenuItem[];
  lifestyle: MenuItem[];
  community: MenuItem[];
  shopping: MenuItem[];
}
