'use client';

import { useState } from 'react';
import {
  LayoutDashboard,
  Box,
  Layers,
  ShoppingBag,
  ScanLine,
  Lightbulb,
  ShoppingCart,
  X,
} from 'lucide-react';
import { version } from '@/package.json';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard },
  { name: 'Inventory', icon: Box },
  { name: 'Product Composition', icon: Layers },
  { name: 'Sell Products', icon: ShoppingBag },
  { name: 'Barcode Scanner', icon: ScanLine },
  { name: 'AI Suggestions', icon: Lightbulb },
  { name: 'Purchase Orders', icon: ShoppingCart },
];

interface NavigationProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export function Navigation({ sidebarOpen, setSidebarOpen }: NavigationProps) {
  const [activeNav, setActiveNav] = useState('Dashboard');

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside
        className={`
      fixed top-3 bottom-3 left-3 z-50
      lg:static lg:top-auto lg:bottom-auto lg:left-auto
      w-60 sm:w-64 bg-[#00a2be] text-white
      rounded-3xl shadow-lg flex flex-col justify-between py-6 px-4
      transition-transform duration-300 ease-in-out
      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}
      >
        <div>
          {/* Logo / Brand Name */}
          <div className="flex items-center justify-between px-2 pb-8 pt-2">
            <h1 className="text-2xl font-black tracking-widest text-white select-none">
              NIRAGA
            </h1>
            <button
              className="p-1 text-white/80 hover:text-white lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation List */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.name;

              return (
                <button
                  key={item.name}
                  onClick={() => {
                    setActiveNav(item.name);
                    setSidebarOpen(false);
                  }}
                  className={`
                w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl font-medium text-sm
                transition-all duration-150 text-left cursor-pointer
                ${isActive
                      ? 'bg-white font-semibold text-gray-800 shadow-sm'
                      : 'text-white/95 hover:bg-white/10 hover:text-white'
                    }
              `}
                >
                  <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-gray-800' : 'text-white'}`} />
                  <span className="truncate">{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="border-t border-white/15 px-2 pt-6 text-xs text-white/70">
          <p className="font-semibold text-white/90">Stock &amp; Inventory AI</p>
          <p className="mt-0.5 text-xs text-white/60">v{version} • NIRAGA</p>
        </div>
      </aside>
    </>
  );
}
