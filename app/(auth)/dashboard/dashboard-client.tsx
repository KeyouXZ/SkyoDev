'use client';

import { useState, useSyncExternalStore } from 'react';
import {
  Box,
  ShoppingBag,
  ScanLine,
  ShoppingCart,
  Search,
  Bell,
  HelpCircle,
  User as UserIcon,
  ChevronDown,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  LineChart as LineChartIcon,
  Check,
  X,
  Menu,
  LogOut,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Navigation } from '@/components/Navigation';
import { signOut } from '@/auth/action';
import type { CurrentUser } from '@/auth/currentUser';
import { useUser } from '@/context/UserContext';

const emptySubscribe = () => () => {};

function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

const salesData = [
  { day: 'Sat', revenue: 0, label: '0' },
  { day: 'Sun', revenue: 60, label: '60' },
  { day: 'Mon', revenue: 120, label: '120' },
  { day: 'Tue', revenue: 180, label: '180' },
  { day: 'Wed', revenue: 240, label: '240' },
  { day: 'Thu', revenue: 13.4, label: '13.4' },
  { day: 'Today', revenue: 84.6, label: '84.6' },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomPointLabel = (props: any) => {
  const { x, y, value } = props;
  if (value === undefined || value === null) return null;
  return (
    <text x={x} y={y - 10} fill="#64748b" fontSize={10.5} fontWeight={500} textAnchor="middle" className="select-none">
      {value}
    </text>
  );
};

interface Props {
  user?: CurrentUser;
}

export default function NiragaDashboard({ user: propUser }: Props = {}) {
  const contextUser = useUser();
  const user = propUser ?? contextUser;
  const mounted = useMounted();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotificationToast, setShowNotificationToast] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const displayName = user.name ?? user.email.split('@')[0];

  const quickActions = [
    { title: 'View AI Forecast', subtitle: 'See reorder suggestions', icon: TrendingUp, iconBg: 'bg-[#cfe9f8] text-[#0284c7]' },
    { title: 'View Sales Forecast', subtitle: 'Project the next 30 days', icon: LineChartIcon, iconBg: 'bg-[#c7f0f6] text-[#0891b2]' },
    { title: 'Sell Products', subtitle: 'Record a sell', icon: ShoppingBag, iconBg: 'bg-[#d1fae5] text-[#10b981]' },
    { title: 'Barcode Scanner', subtitle: 'Scan to receive or sell', icon: ScanLine, iconBg: 'bg-[#ffedd5] text-[#f97316]' },
  ];

  return (
    <div className="min-h-screen bg-[#ddf1f7] text-gray-800 p-3 sm:p-5 flex flex-col font-sans select-none antialiased">
      <div className="flex flex-1 gap-5 w-full">
        <Navigation sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Main Content Area */}
        <main className="flex min-w-0 flex-1 flex-col">
          {/* Top Bar */}
          <header className="flex items-center justify-between gap-3 rounded-2xl border border-white/60 bg-white/85 px-4 py-2.5 shadow-sm backdrop-blur-md">
            <div className="flex flex-1 items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded-full p-2 text-gray-700 hover:bg-slate-100 lg:hidden"
                aria-label="Toggle menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="relative max-w-md flex-1">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pencarian"
                  className="w-full rounded-full border-none bg-[#edf6fa] py-2 pl-10 pr-4 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-[#00a2be]/30"
                />
              </div>
            </div>

            <div className="relative flex shrink-0 items-center gap-2.5">
              {/* Notification Bell */}
              <button
                onClick={() => setShowNotificationToast(!showNotificationToast)}
                className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-gray-100 bg-white text-gray-600 shadow-xs transition-all hover:text-gray-900 hover:shadow-sm sm:h-10 sm:w-10"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              </button>

              {/* Help Button */}
              <button
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-gray-100 bg-white text-gray-600 shadow-xs transition-all hover:text-gray-900 hover:shadow-sm sm:h-10 sm:w-10"
                aria-label="Help"
              >
                <HelpCircle className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              </button>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex cursor-pointer items-center gap-2 rounded-full border border-gray-100 bg-white px-3 py-1.5 text-xs font-medium text-gray-800 shadow-xs transition-all hover:shadow-sm sm:px-3.5 sm:text-sm"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#00a2be]/15 text-[#00a2be]">
                    <UserIcon className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-semibold text-gray-700 max-w-25 truncate">{displayName}</span>
                  <ChevronDown className={`h-3.5 w-3.5 text-gray-500 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 z-50 mt-2 w-52 animate-in fade-in zoom-in-95 rounded-2xl border border-gray-100 bg-white py-1.5 text-sm shadow-lg duration-100">
                    <div className="border-b border-gray-100 px-4 py-2.5">
                      <p className="text-xs font-semibold text-gray-900 truncate">{displayName}</p>
                      <p className="truncate text-xs text-gray-500">{user.email}</p>
                    </div>
                    <button
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex w-full items-center justify-between px-4 py-2 text-left text-xs text-gray-700 hover:bg-slate-50"
                    >
                      Account Settings
                    </button>
                    <form action={signOut}>
                      <button
                        type="submit"
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs text-red-600 hover:bg-slate-50"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        Sign Out
                      </button>
                    </form>
                  </div>
                )}
              </div>

              {/* Notification Toast */}
              {showNotificationToast && (
                <div className="absolute right-0 top-12 z-50 w-72 animate-in fade-in slide-in-from-top-2 rounded-2xl border border-gray-100 bg-white p-3.5 text-xs shadow-xl duration-150">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 font-semibold text-emerald-600">
                      <Check className="h-4 w-4" />
                      <span>Web Push Active</span>
                    </div>
                    <button onClick={() => setShowNotificationToast(false)} className="text-gray-400 hover:text-gray-600">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="mt-1 text-gray-500">
                    3 Low stock alerts recorded today. Restock suggestions are ready for review.
                  </p>
                </div>
              )}
            </div>
          </header>

          {/* Dashboard Title */}
          <div className="mb-4 mt-5">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard</h2>
          </div>

          {/* 4 Stat Cards */}
          <div className="mb-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
            <div className="flex flex-col justify-between rounded-2xl border border-white/60 bg-[#e4f3fa] p-4 shadow-xs transition-all hover:shadow-sm sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800">Total Products</span>
                <Box className="h-5 w-5 text-[#2563eb]" />
              </div>
              <div className="my-2.5"><span className="text-3xl font-bold tracking-tight text-gray-900">15</span></div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-semibold text-emerald-500">+ 12%</span>
                <span className="text-gray-500">vs last month</span>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-2xl border border-white/60 bg-[#e4f3fa] p-4 shadow-xs transition-all hover:shadow-sm sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800">Low Stock Alerts</span>
                <AlertTriangle className="h-5 w-5 text-[#ef4444]" />
              </div>
              <div className="my-2.5"><span className="text-3xl font-bold tracking-tight text-gray-900">3</span></div>
              <div className="flex items-baseline gap-1.5 text-xs">
                <span className="font-semibold leading-tight text-red-500">Requires attention</span>
                <span className="text-gray-500">vs last month</span>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-2xl border border-white/60 bg-[#e4f3fa] p-4 shadow-xs transition-all hover:shadow-sm sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800">Pending Orders</span>
                <ShoppingCart className="h-5 w-5 text-gray-800" />
              </div>
              <div className="my-2.5"><span className="text-3xl font-bold tracking-tight text-gray-900">2</span></div>
              <div className="select-none text-xs text-transparent">placeholder</div>
            </div>

            <div className="flex flex-col justify-between rounded-2xl border border-white/60 bg-[#e4f3fa] p-4 shadow-xs transition-all hover:shadow-sm sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800">Inventory Value</span>
                <DollarSign className="h-5 w-5 text-[#10b981]" />
              </div>
              <div className="my-2.5"><span className="text-3xl font-bold tracking-tight text-gray-900">$ 1,628.80</span></div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-semibold text-emerald-500">+ 5.2%</span>
                <span className="text-gray-500">vs last month</span>
              </div>
            </div>
          </div>

          {/* Bottom Grid */}
          <div className="grid flex-1 grid-cols-1 items-start gap-5 lg:grid-cols-12">
            {/* Sales Chart */}
            <div className="flex flex-col rounded-3xl border border-white/60 bg-[#d8eff9] p-5 shadow-xs lg:col-span-8 sm:p-6">
              <div className="mb-4">
                <h3 className="text-xl font-bold tracking-tight text-gray-900">Sales Overview</h3>
                <p className="mt-0.5 text-xs text-gray-500">Last 7 days revenue</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
                <div className="h-64 w-full sm:h-72">
                  {mounted ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={salesData} margin={{ top: 22, right: 24, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={true} horizontal={true} />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11.5 }} dy={6} />
                        <YAxis domain={[0, 300]} ticks={[0, 100, 200, 300]} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                        <Tooltip
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          formatter={(val: any) => [`$${Number(val ?? 0).toFixed(1)}`, 'Revenue']}
                          contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9', fontSize: '12px' }}
                        />
                        <Line
                          type="monotone" dataKey="revenue" stroke="#5f5bf6" strokeWidth={2.2}
                          dot={{ r: 4, fill: '#ffffff', stroke: '#5f5bf6', strokeWidth: 2 }}
                          activeDot={{ r: 6, fill: '#5f5bf6', stroke: '#ffffff', strokeWidth: 2 }}
                          label={<CustomPointLabel />}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">Loading chart...</div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col justify-between lg:col-span-4">
              <div className="mb-3 px-1">
                <h3 className="text-xl font-bold tracking-tight text-gray-900">Quick Actions</h3>
                <p className="mt-0.5 text-xs text-gray-500">Common tasks</p>
              </div>
              <div className="space-y-3">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.title}
                      className="group flex w-full cursor-pointer items-center gap-3.5 rounded-2xl border border-white/70 bg-linear-to-r from-[#d8eef9] to-[#cae7f7] p-3 px-4 text-left shadow-xs transition-all duration-150 hover:translate-x-0.5 hover:shadow-md"
                    >
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-xs transition-transform group-hover:scale-105 ${action.iconBg}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-sm font-semibold text-gray-900">{action.title}</h4>
                        <p className="mt-0.5 truncate text-xs text-gray-500">{action.subtitle}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
