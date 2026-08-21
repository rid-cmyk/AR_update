"use client";

import React, { useId, useMemo, useState } from "react";
import { CheckOutlined, DownOutlined, SearchOutlined } from "@ant-design/icons";
import { Input } from "antd";

export interface MobileSelectOption {
  value: string | number;
  label: string;
  searchText?: string;
}

interface MobileSelectSheetProps {
  value?: string | number | null;
  options: MobileSelectOption[];
  onChange: (value: string | number) => void;
  placeholder?: string;
  title?: string;
  searchable?: boolean;
  loading?: boolean;
  emptyText?: string;
}

export function MobileSelectSheet({
  value,
  options,
  onChange,
  placeholder = "Pilih...",
  title = "Pilih Opsi",
  searchable = true,
  loading = false,
  emptyText = "Tidak ada opsi yang cocok.",
}: MobileSelectSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const listboxId = useId();

  const selectedOption = options.find((o) => o.value === value);

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) =>
      `${o.searchText ?? o.label}`.toLowerCase().includes(q)
    );
  }, [options, query]);

  const handlePick = (opt: MobileSelectOption) => {
    onChange(opt.value);
    setIsOpen(false);
    setQuery("");
  };

  return (
    <>
      <button
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-label={title}
        disabled={loading || options.length === 0}
        onClick={() => {
          setQuery("");
          setIsOpen(true);
        }}
        className="w-full h-11 px-3 bg-white border border-slate-200 rounded-2xl shadow-sm text-left flex items-center justify-between gap-2 transition-colors hover:border-sky-blue/60 focus:outline-none focus:ring-2 focus:ring-sky-blue/40 disabled:opacity-60"
      >
        <span
          className={`truncate text-xs ${
            selectedOption ? "text-deep-space font-semibold" : "text-slate-400"
          }`}
        >
          {loading ? "Memuat..." : selectedOption?.label ?? placeholder}
        </span>
        <DownOutlined
          className={`text-[10px] text-slate-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div
            id={listboxId}
            role="listbox"
            aria-label={title}
            className="absolute inset-x-0 bottom-0 mx-auto max-w-lg bg-white rounded-t-3xl shadow-2xl shadow-black/20 flex flex-col max-h-[75vh]"
          >
            <div className="px-5 pt-3 pb-2 border-b border-slate-100 flex items-center justify-between gap-3">
              <h3 className="text-base font-bold text-deep-space truncate">
                {title}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-xs text-slate-500 hover:text-deep-space px-3 py-1.5 rounded-lg bg-slate-100 transition-colors min-h-[44px] flex items-center justify-center"
                aria-label="Tutup"
              >
                Tutup
              </button>
            </div>

            {searchable && (
              <div className="px-4 py-2.5 border-b border-slate-100">
                <Input
                  autoFocus
                  allowClear
                  prefix={<SearchOutlined className="text-slate-400 mr-1" />}
                  placeholder="Cari..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="bg-slate-50 border-slate-200 rounded-xl h-11 text-xs"
                />
              </div>
            )}

            <div
              className="flex-1 overflow-y-auto py-2 pb-safe"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {filteredOptions.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  {emptyText}
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = opt.value === value;
                  return (
                    <button
                      key={String(opt.value)}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handlePick(opt)}
                      className={`w-full px-5 py-3.5 text-left text-sm flex items-center justify-between gap-3 transition-colors min-h-[48px] ${
                        isSelected
                          ? "bg-sky-blue/15 text-blue-green font-bold"
                          : "text-deep-space hover:bg-slate-50"
                      }`}
                    >
                      <span className="truncate">{opt.label}</span>
                      {isSelected && (
                        <CheckOutlined className="text-blue-green flex-shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default MobileSelectSheet;
