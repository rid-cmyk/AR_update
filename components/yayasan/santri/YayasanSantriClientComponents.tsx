"use client";

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Modal, Input } from 'antd';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';

const { Search } = Input;

function useDebounce(callback: Function, delay: number) {
  const timeoutRef = useRef<any>(null);
  return useCallback((...args: any[]) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
}

function SearchBar({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();

  const handleSearch = useDebounce((term: string) => {
    if (term) {
      router.push(`?q=${term}`);
    } else {
      router.push('?');
    }
  }, 500);

  return (
    <div className="w-full md:w-64">
      <Input
        placeholder="Cari nama atau username..."
        defaultValue={initialQuery}
        onChange={(e) => handleSearch(e.target.value)}
        prefix={<SearchOutlined className="text-slate-400" />}
        className="rounded-lg"
      />
    </div>
  );
}

function InspeksiButton({ santriId }: { santriId: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded text-xs font-semibold transition-colors flex items-center gap-2 mx-auto"
      >
        <EyeOutlined /> Inspeksi
      </button>

      <Modal
        title="Inspeksi Santri"
        open={isOpen}
        onCancel={() => setIsOpen(false)}
        footer={null}
        width={800}
      >
        <div className="p-4 text-center text-slate-500">
          (Data detail untuk inspeksi santri ID {santriId} belum tersedia dalam mode Server Component)
        </div>
      </Modal>
    </>
  );
}

const YayasanSantriClientComponents = {
  SearchBar,
  InspeksiButton
};

export default YayasanSantriClientComponents;
