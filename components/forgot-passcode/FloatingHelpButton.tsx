import React from 'react';
import { QuestionCircleOutlined } from '@ant-design/icons';

interface FloatingHelpButtonProps {
  onClick: () => void;
}

export function FloatingHelpButton({ onClick }: FloatingHelpButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'fixed',
        bottom: 24,
        left: 24,
        width: 60,
        height: 60,
        borderRadius: '50%',
        background: '#219ebc',
        border: 'none',
        boxShadow: '0 4px 16px rgba(33, 158, 188, 0.4)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 28,
        color: '#fff',
        transition: 'all 0.3s ease',
        zIndex: 1000
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(33, 158, 188, 0.5)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(33, 158, 188, 0.4)';
      }}
    >
      <QuestionCircleOutlined />
    </button>
  );
}
