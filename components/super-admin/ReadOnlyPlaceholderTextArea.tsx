"use client";

import { useState, useEffect } from "react";
import { Input, Tag, Space, Typography, Alert } from "antd";
import { LockOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const { Text } = Typography;

interface ReadOnlyPlaceholderTextAreaProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  rows?: number;
  readOnlyPlaceholders: string[]; // Placeholder yang readonly
  defaultText?: string;
}

export default function ReadOnlyPlaceholderTextArea({
  value = '',
  onChange,
  placeholder,
  rows = 4,
  readOnlyPlaceholders,
  defaultText = ''
}: ReadOnlyPlaceholderTextAreaProps) {
  const [localValue, setLocalValue] = useState(value || defaultText);
  const [cursorPosition, setCursorPosition] = useState(0);

  useEffect(() => {
    if (value !== undefined) {
      setLocalValue(value || defaultText);
    }
  }, [value, defaultText]);

  // Cek apakah user mencoba edit placeholder
  const isEditingPlaceholder = (text: string, selectionStart: number, selectionEnd: number): boolean => {
    for (const ph of readOnlyPlaceholders) {
      const index = text.indexOf(ph);
      if (index !== -1) {
        const phStart = index;
        const phEnd = index + ph.length;
        
        // Cek apakah cursor atau selection ada di dalam placeholder
        if (
          (selectionStart >= phStart && selectionStart <= phEnd) ||
          (selectionEnd >= phStart && selectionEnd <= phEnd) ||
          (selectionStart <= phStart && selectionEnd >= phEnd)
        ) {
          return true;
        }
      }
    }
    return false;
  };

  // Cek apakah placeholder hilang
  const hasAllPlaceholders = (text: string): boolean => {
    return readOnlyPlaceholders.every(ph => text.includes(ph));
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const target = e.target;
    
    // Cek apakah semua placeholder masih ada
    if (!hasAllPlaceholders(newValue)) {
      // Jangan izinkan perubahan jika placeholder hilang
      e.preventDefault();
      return;
    }
    
    // Cek apakah user mencoba edit di dalam placeholder
    if (isEditingPlaceholder(localValue, target.selectionStart, target.selectionEnd)) {
      // Jangan izinkan edit di dalam placeholder
      return;
    }
    
    setLocalValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    const { selectionStart, selectionEnd } = target;
    
    // Cek apakah cursor ada di dalam placeholder
    if (isEditingPlaceholder(localValue, selectionStart, selectionEnd)) {
      // Block delete, backspace, dan typing di dalam placeholder
      if (
        e.key === 'Backspace' || 
        e.key === 'Delete' || 
        (e.key.length === 1 && !e.ctrlKey && !e.metaKey)
      ) {
        e.preventDefault();
        return;
      }
    }
    
    // Block Ctrl+A jika akan menghapus placeholder
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      // Allow select all, tapi block delete setelahnya
      return;
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    const { selectionStart, selectionEnd } = target;
    
    // Cek apakah paste akan menimpa placeholder
    if (isEditingPlaceholder(localValue, selectionStart, selectionEnd)) {
      e.preventDefault();
      return;
    }
  };

  const handleCut = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    const { selectionStart, selectionEnd } = target;
    
    // Cek apakah cut akan menghapus placeholder
    if (isEditingPlaceholder(localValue, selectionStart, selectionEnd)) {
      e.preventDefault();
      return;
    }
  };

  return (
    <div>
      <TextArea
        value={localValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onCut={handleCut}
        placeholder={placeholder}
        rows={rows}
      />
      <Alert
        message={
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Space wrap size="small">
              <Text strong style={{ fontSize: 12 }}>
                <LockOutlined /> Placeholder yang tidak bisa diedit:
              </Text>
              {readOnlyPlaceholders.map((ph, index) => (
                <Tag key={index} color="red" style={{ fontSize: 11 }}>
                  {ph}
                </Tag>
              ))}
            </Space>
            <Text type="secondary" style={{ fontSize: 11 }}>
              ⚠️ Placeholder di atas tidak bisa dihapus atau diedit. Anda hanya bisa menambah teks di luar placeholder.
            </Text>
          </Space>
        }
        type="warning"
        showIcon
        style={{ marginTop: 8 }}
      />
    </div>
  );
}
