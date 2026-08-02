import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { GradeBadge } from '@/components/ui/grade-badge';
import { EmptyState } from '@/components/ui/empty-state';

describe('Frontend UI Engineering Components (WCAG 2.1 AA)', () => {
  describe('GradeBadge', () => {
    it('renders correct grade letter and WCAG accessible aria-label for score 92', () => {
      const html = renderToStaticMarkup(React.createElement(GradeBadge, { nilai: 92 }));
      expect(html).toContain('role="status"');
      expect(html).toContain('aria-label="Nilai 92, Huruf Mutu A"');
      expect(html).toContain('A');
    });

    it('renders predikat in both visible copy and aria-label when showPredikat is true', () => {
      const html = renderToStaticMarkup(
        React.createElement(GradeBadge, { nilai: 95, showPredikat: true })
      );
      expect(html).toContain('Mumtaz (Istimewa)');
      expect(html).toContain('aria-label="Nilai 95, Huruf Mutu A, Predikat Mumtaz (Istimewa)"');
    });

    it('renders dash and "Belum Ada Nilai" aria-label when score is null', () => {
      const html = renderToStaticMarkup(React.createElement(GradeBadge, { nilai: null }));
      expect(html).toContain('aria-label="Belum Ada Nilai"');
      expect(html).toContain('-');
    });
  });

  describe('EmptyState', () => {
    it('renders default Indonesian empty state message with accessible role status', () => {
      const html = renderToStaticMarkup(React.createElement(EmptyState, {}));
      expect(html).toContain('role="status"');
      expect(html).toContain('aria-live="polite"');
      expect(html).toContain('Tidak Ada Data');
      expect(html).toContain('Belum ada data yang tersedia saat ini.');
    });

    it('renders custom title, description, and CTA button label when specified', () => {
      const html = renderToStaticMarkup(
        React.createElement(EmptyState, {
          title: 'Belum Ada Santri',
          description: 'Silakan tambahkan santri baru ke halaqah Anda.',
          actionLabel: 'Tambah Santri',
          onAction: () => {},
        })
      );
      expect(html).toContain('Belum Ada Santri');
      expect(html).toContain('Silakan tambahkan santri baru ke halaqah Anda.');
      expect(html).toContain('Tambah Santri');
    });
  });
});
