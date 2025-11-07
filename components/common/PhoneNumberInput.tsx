"use client";

import React, { useState, useEffect } from 'react';
import { Input, Typography } from 'antd';
import { PhoneOutlined } from '@ant-design/icons';
import { 
  formatPhoneNumber, 
  formatPhoneNumberDisplay, 
  validateIndonesianPhoneNumber,
  parseDisplayPhoneNumber
} from '@/lib/utils/phoneFormatter';

const { Text } = Typography;

interface PhoneNumberInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  size?: 'small' | 'middle' | 'large';
  status?: 'error' | 'warning';
  style?: React.CSSProperties;
  className?: string;
  required?: boolean;
  showValidation?: boolean;
}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  value = '',
  onChange,
  placeholder = 'Masukkan nomor telepon',
  disabled = false,
  size = 'middle',
  status,
  style,
  className,
  required = false,
  showValidation = true
}) => {
  const [displayValue, setDisplayValue] = useState('');
  const [isValid, setIsValid] = useState(true);

  // Update display value when prop value changes
  useEffect(() => {
    if (value) {
      setDisplayValue(formatPhoneNumberDisplay(value));
      setIsValid(validateIndonesianPhoneNumber(value));
    } else {
      setDisplayValue('');
      setIsValid(true);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Allow only numbers, spaces, +, and - for better UX
    const cleanInput = inputValue.replace(/[^\d\s\+\-]/g, '');
    
    // Format for display
    const formatted = formatPhoneNumberDisplay(cleanInput);
    setDisplayValue(formatted);
    
    // Validate
    const valid = cleanInput === '' || validateIndonesianPhoneNumber(cleanInput);
    setIsValid(valid);
    
    // Send back the storage format to parent
    if (onChange) {
      const storageFormat = parseDisplayPhoneNumber(cleanInput);
      onChange(storageFormat);
    }
  };

  const handleBlur = () => {
    // Final formatting on blur
    if (displayValue && displayValue.trim() !== '') {
      const formatted = formatPhoneNumberDisplay(displayValue);
      setDisplayValue(formatted);
      
      if (onChange) {
        const storageFormat = parseDisplayPhoneNumber(displayValue);
        onChange(storageFormat);
      }
    }
  };

  // Determine input status
  let inputStatus = status;
  if (showValidation && displayValue && !isValid) {
    inputStatus = 'error';
  }

  return (
    <div>
      <Input
        prefix={<PhoneOutlined style={{ color: '#1890ff' }} />}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        size={size}
        status={inputStatus}
        style={style}
        className={className}
        addonBefore="+62"
      />
      {showValidation && displayValue && !isValid && (
        <Text type="danger" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
          Format nomor telepon tidak valid. Contoh: 812 3456 7890
        </Text>
      )}
      {showValidation && displayValue && isValid && displayValue.startsWith('+62') && (
        <Text type="success" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
          ✓ Format nomor telepon valid
        </Text>
      )}
    </div>
  );
};

export default PhoneNumberInput;