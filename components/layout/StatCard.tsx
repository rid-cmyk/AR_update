"use client";

import React from "react";
import { Card, Typography, Space } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  color?: string;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  color = "#1890ff",
  loading = false,
  onClick,
  className
}) => {
  return (
    <Card
      loading={loading}
      className={className}
      style={{
        borderRadius: 16,
        border: "1px solid rgba(255, 255, 255, 0.3)",
        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.06)",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "hidden",
        position: "relative"
      }}
      styles={{ 
        body: {
          padding: 24,
          position: "relative",
          zIndex: 2
        }
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.boxShadow = "0 12px 40px rgba(0, 0, 0, 0.12)";
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.06)";
        }
      }}
    >
      {/* Background Pattern */}
      <div style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: 120,
        height: 120,
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        borderRadius: "50%",
        transform: "translate(40px, -40px)",
        zIndex: 1
      }} />

      <div style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: 16
      }}>
        <div style={{ flex: 1 }}>
          <Text style={{
            color: "#666",
            fontSize: 14,
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.5px"
          }}>
            {title}
          </Text>
        </div>
        
        {icon && (
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 20,
            boxShadow: `0 4px 15px ${color}40`
          }}>
            {icon}
          </div>
        )}
      </div>

      <div style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 16
      }}>
        <Title 
          level={2} 
          style={{
            margin: 0,
            fontSize: 32,
            fontWeight: 700,
            color: "#1a1a1a",
            lineHeight: 1
          }}
        >
          {value}
        </Title>
      </div>
    </Card>
  );
};

export default StatCard;