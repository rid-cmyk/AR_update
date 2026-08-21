"use client";

import React, { useState, useEffect } from "react";
import { Breadcrumb, Button, Typography } from "antd";
import { HomeOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

import { useMediaQuery } from "react-responsive";

const { Title, Text } = Typography;

interface BreadcrumbItem {
  title: string;
  href?: string;
  icon?: React.ReactNode;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  extra?: React.ReactNode;
  showBack?: boolean;
  backUrl?: string;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs = [],
  extra,
  showBack = false,
  backUrl,
  className
}) => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const isMobileQuery = useMediaQuery({ maxWidth: 768 });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isMobile = isMounted ? isMobileQuery : false;

  const handleBack = () => {
    if (backUrl) {
      router.push(backUrl);
    } else {
      router.back();
    }
  };

  const defaultBreadcrumbs = [
    {
      title: "Dashboard",
      href: "/super-admin/dashboard",
      icon: <HomeOutlined />
    },
    ...breadcrumbs
  ];

  return (
    <div 
      className={className}
      style={{
        background: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(20px)",
        borderRadius: 16,
        padding: isMobile ? "16px 16px" : "24px 32px",
        marginBottom: isMobile ? 16 : 24,
        border: "1px solid rgba(255, 255, 255, 0.3)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.06)"
      }}
    >
      {/* Breadcrumb */}
      {defaultBreadcrumbs.length > 0 && (
        <Breadcrumb
          style={{ marginBottom: 12 }}
          items={defaultBreadcrumbs.map((item, index) => ({
            title: item.href ? (
              <a 
                href={item.href}
                style={{
                  color: index === defaultBreadcrumbs.length - 1 ? "#219ebc" : "#666",
                  fontWeight: index === defaultBreadcrumbs.length - 1 ? 600 : 400,
                  textDecoration: "none"
                }}
              >
                {item.icon && <span style={{ marginRight: 4 }}>{item.icon}</span>}
                {item.title}
              </a>
            ) : (
              <span style={{
                color: "#219ebc",
                fontWeight: 600
              }}>
                {item.icon && <span style={{ marginRight: 4 }}>{item.icon}</span>}
                {item.title}
              </span>
            )
          }))}
        />
      )}

      {/* Header Content */}
      <div style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 16
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
            {showBack && (
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={handleBack}
                style={{
                  color: "#666",
                  padding: "4px 8px",
                  height: "auto",
                  borderRadius: 8
                }}
              />
            )}
            <Title 
              level={2} 
              style={{ 
                margin: 0,
                color: "#219ebc",
                fontSize: 28,
                fontWeight: 700,
                letterSpacing: "-0.5px"
              }}
            >
              {title}
            </Title>
          </div>
          
          {subtitle && (
            <Text 
              style={{ 
                color: "#666",
                fontSize: 16,
                lineHeight: 1.5
              }}
            >
              {subtitle}
            </Text>
          )}
        </div>

        {/* Extra Actions */}
        {extra && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 12
          }}>
            {extra}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;