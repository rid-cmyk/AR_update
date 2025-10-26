"use client";

import React from "react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

interface LoadingSpinnerProps {
  size?: "small" | "default" | "large";
  tip?: string;
  spinning?: boolean;
  children?: React.ReactNode;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = "default", 
  tip = "Loading...", 
  spinning = true,
  children 
}) => {
  const antIcon = (
    <LoadingOutlined 
      style={{ 
        fontSize: size === "small" ? 16 : size === "large" ? 32 : 24,
        color: "#1890ff"
      }} 
      spin 
    />
  );

  if (children) {
    return (
      <Spin 
        indicator={antIcon} 
        spinning={spinning} 
        tip={tip}
        style={{
          background: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(10px)",
          borderRadius: 12
        }}
      >
        {children}
      </Spin>
    );
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "200px",
      background: "rgba(255, 255, 255, 0.7)",
      backdropFilter: "blur(20px)",
      borderRadius: 16,
      border: "1px solid rgba(255, 255, 255, 0.3)",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.06)"
    }}>
      <Spin 
        indicator={antIcon} 
        size={size}
      />
      {tip && (
        <div style={{
          marginTop: 16,
          color: "#666",
          fontSize: 14,
          fontWeight: 500
        }}>
          {tip}
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;