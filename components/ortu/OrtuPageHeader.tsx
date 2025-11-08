"use client";

import React from 'react';

interface OrtuPageHeaderProps {
  title: string;
  subtitle: string;
  icon?: string;
  badge?: {
    text: string;
    show: boolean;
  };
}

export default function OrtuPageHeader({ 
  title, 
  subtitle, 
  icon = "📊",
  badge 
}: OrtuPageHeaderProps) {
  return (
    <div style={{ 
      marginBottom: 32,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '20px',
      padding: '40px 32px',
      color: 'white',
      textAlign: 'center',
      boxShadow: '0 20px 60px rgba(102, 126, 234, 0.4)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative circles */}
      <div style={{
        position: 'absolute',
        top: '-50px',
        right: '-50px',
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.1)',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-30px',
        left: '-30px',
        width: '150px',
        height: '150px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.1)',
      }} />
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ 
          fontSize: '48px', 
          marginBottom: '12px',
        }}>
          {icon}
        </div>
        <div style={{ 
          fontSize: '36px', 
          fontWeight: 'bold', 
          marginBottom: '12px',
          textShadow: '0 4px 8px rgba(0,0,0,0.2)',
          letterSpacing: '1px'
        }}>
          {title}
        </div>
        <div style={{ 
          fontSize: '16px', 
          opacity: 0.95,
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          {subtitle}
        </div>
        {badge && badge.show && (
          <div style={{
            marginTop: '20px',
            padding: '10px 24px',
            backgroundColor: 'rgba(255,255,255,0.25)',
            backdropFilter: 'blur(10px)',
            borderRadius: '30px',
            display: 'inline-block',
            fontSize: '15px',
            fontWeight: '600',
            border: '2px solid rgba(255,255,255,0.3)'
          }}>
            {badge.text}
          </div>
        )}
      </div>
    </div>
  );
}
