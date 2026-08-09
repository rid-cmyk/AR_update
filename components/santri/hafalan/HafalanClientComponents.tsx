"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { EyeOutlined } from '@ant-design/icons';
import { DetailHafalanModal } from './DetailHafalanModal';

// Recharts components must be loaded client-side
const AreaChart = dynamic(() => import("recharts").then(mod => mod.AreaChart), { ssr: false });
const Area = dynamic(() => import("recharts").then(mod => mod.Area), { ssr: false });
const XAxis = dynamic(() => import("recharts").then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then(mod => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then(mod => mod.ResponsiveContainer), { ssr: false });

export function HafalanProgressChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) return <div>Belum ada data</div>;

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorZiyadah" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="date" />
          <YAxis />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Area type="monotone" dataKey="ziyadah" stroke="#10b981" fillOpacity={1} fill="url(#colorZiyadah)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function HafalanDetailAction({ hafalan }: { hafalan: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
      >
        <EyeOutlined /> <span className="text-xs">Detail</span>
      </button>
      <DetailHafalanModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        hafalan={hafalan}
      />
    </>
  );
}

export function TabNavigation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'dashboard';

  return (
    <div className="flex border-b border-slate-200 mb-6">
      <button
        onClick={() => router.push('?tab=dashboard')}
        className={`px-4 py-3 font-medium text-sm transition-colors ${
          currentTab === 'dashboard' 
            ? 'border-b-2 border-emerald-500 text-emerald-600' 
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        Dashboard Hafalan
      </button>
      <button
        onClick={() => router.push('?tab=history')}
        className={`px-4 py-3 font-medium text-sm transition-colors ${
          currentTab === 'history' 
            ? 'border-b-2 border-emerald-500 text-emerald-600' 
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        Riwayat Setoran
      </button>
    </div>
  );
}
