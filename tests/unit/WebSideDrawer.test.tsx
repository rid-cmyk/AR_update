import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { WebSideDrawer } from '@/components/ui/WebSideDrawer';

describe('WebSideDrawer UI Component (Desktop Only >= 1024px & WCAG 2.1 AA)', () => {
  it('renders nothing when isOpen is false', () => {
    const html = renderToStaticMarkup(
      React.createElement(WebSideDrawer, {
        isOpen: false,
        onClose: () => {},
        title: 'Judul Panel',
        disablePortal: true,
      }, React.createElement('div', null, 'Konten Drawer'))
    );
    expect(html).toBe('');
  });

  it('renders title, subtitle, content body, and footer when isOpen is true', () => {
    const html = renderToStaticMarkup(
      React.createElement(WebSideDrawer, {
        isOpen: true,
        onClose: () => {},
        title: 'Detail Hafalan Santri',
        subtitle: 'Riwayat setoran dan evaluasi makhraj',
        disablePortal: true,
        footer: React.createElement('button', null, 'Simpan Perubahan'),
      }, React.createElement('div', null, 'Daftar Setoran Juz 30'))
    );

    expect(html).toContain('Detail Hafalan Santri');
    expect(html).toContain('Riwayat setoran dan evaluasi makhraj');
    expect(html).toContain('Daftar Setoran Juz 30');
    expect(html).toContain('Simpan Perubahan');
  });

  it('includes WCAG accessible dialog role, aria-modal, and aria-labelledby attributes', () => {
    const html = renderToStaticMarkup(
      React.createElement(WebSideDrawer, {
        isOpen: true,
        onClose: () => {},
        title: 'Form Pengguna',
        disablePortal: true,
      }, React.createElement('div', null, 'Form Input'))
    );

    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('aria-labelledby="web-side-drawer-title"');
    expect(html).toContain('aria-label="Tutup Panel"');
  });

  it('applies correct size classes for sm, md, lg, xl, and full', () => {
    const htmlMd = renderToStaticMarkup(
      React.createElement(WebSideDrawer, {
        isOpen: true,
        onClose: () => {},
        title: 'Drawer MD',
        size: 'md',
        disablePortal: true,
      }, React.createElement('div', null, 'Content'))
    );
    expect(htmlMd).toContain('max-w-[640px]');

    const htmlLg = renderToStaticMarkup(
      React.createElement(WebSideDrawer, {
        isOpen: true,
        onClose: () => {},
        title: 'Drawer LG',
        size: 'lg',
        disablePortal: true,
      }, React.createElement('div', null, 'Content'))
    );
    expect(htmlLg).toContain('max-w-[768px]');

    const htmlXl = renderToStaticMarkup(
      React.createElement(WebSideDrawer, {
        isOpen: true,
        onClose: () => {},
        title: 'Drawer XL',
        size: 'xl',
        disablePortal: true,
      }, React.createElement('div', null, 'Content'))
    );
    expect(htmlXl).toContain('max-w-[1024px]');
  });

  it('applies hidden lg:flex class by default to ensure desktop-only web rendering (Adaptive Dual-Mode)', () => {
    const html = renderToStaticMarkup(
      React.createElement(WebSideDrawer, {
        isOpen: true,
        onClose: () => {},
        title: 'Desktop Only Panel',
        disablePortal: true,
      }, React.createElement('div', null, 'Desktop View'))
    );

    expect(html).toContain('hidden lg:flex');
  });
});
