"use client";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, Eye } from 'lucide-react';
import { DetailUjianDialog } from './DetailUjianDialog';

export function UjianFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [search, setSearch] = useState(searchParams.get('search') || '');
  
  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleFilterChange('search', search);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <form onSubmit={handleSearchSubmit} className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Cari nama santri, halaqah..." 
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </form>
      <div className="flex gap-4">
        <Select 
          value={searchParams.get('jenis') || 'all'} 
          onValueChange={(val) => handleFilterChange('jenis', val)}
        >
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Jenis Ujian" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Jenis</SelectItem>
            <SelectItem value="tasmi">Tasmi'</SelectItem>
            <SelectItem value="mhq">MHQ</SelectItem>
            <SelectItem value="kenaikan_juz">Kenaikan Juz</SelectItem>
            <SelectItem value="uas">UAS</SelectItem>
            <SelectItem value="tahfidz">Tahfidz</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          value={searchParams.get('status') || 'all'} 
          onValueChange={(val) => handleFilterChange('status', val)}
        >
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status Ujian" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="selesai">Selesai</SelectItem>
            <SelectItem value="diverifikasi">Menunggu Verifikasi</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="ditolak">Ditolak</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export function UjianCardActions({ ujian }: { ujian: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button variant="outline" size="sm" className="rounded-full" onClick={() => setIsOpen(true)}>
        <Eye className="w-4 h-4 mr-1.5" />
        Detail
      </Button>
      <DetailUjianDialog 
        open={isOpen}
        onOpenChange={(open) => setIsOpen(open)}
        ujian={ujian}
      />
    </>
  );
}
