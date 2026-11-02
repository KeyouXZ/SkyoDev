'use client';

import { useState, useSyncExternalStore } from 'react';
import {
  Box,
  ShoppingBag,
  ScanLine,
  ShoppingCart,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  LineChart as LineChartIcon,
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
import { Header } from '@/components/Header';
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
          <Header title="Dashboard" setSidebarOpen={setSidebarOpen} user={user} />

          {/* 4 Stat Cards */}
          <div className="my-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
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
