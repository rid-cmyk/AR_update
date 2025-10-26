"use client";

import React from 'react';
import { Slider as AntSlider } from 'antd';

interface SliderProps {
  value?: number[];
  onValueChange?: (value: number[]) => void;
  max?: number;
  min?: number;
  step?: number;
  className?: string;
}

export function Slider({ 
  value = [0], 
  onValueChange, 
  max = 100, 
  min = 0, 
  step = 1,
  className 
}: SliderProps) {
  const handleChange = (val: number | number[]) => {
    const newValue = Array.isArray(val) ? val : [val];
    onValueChange?.(newValue);
  };

  return (
    <AntSlider
      value={value[0]}
      onChange={handleChange}
      max={max}
      min={min}
      step={step}
      className={className}
      style={{ width: '100%' }}
    />
  );
}