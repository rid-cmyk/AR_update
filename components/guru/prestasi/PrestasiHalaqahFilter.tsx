"use client";

import { Select } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PrestasiHalaqahFilter({ options, defaultValue }: { options: any[], defaultValue?: number }) {
  const router = useRouter();
  
  return (
    <Select 
      value={defaultValue} 
      onChange={(val) => {
        router.push(`?halaqahId=${val}`);
      }}
      className="w-48"
      placeholder="Pilih Halaqah"
    >
      {options.map(opt => (
        <Select.Option key={opt.id} value={opt.id}>{opt.namaHalaqah}</Select.Option>
      ))}
    </Select>
  );
}
