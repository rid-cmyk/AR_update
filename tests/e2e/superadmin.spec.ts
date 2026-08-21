import { test, expect } from '@playwright/test';

test.describe('Super Admin Dashboard', () => {
  test('Bisa mengakses halaman pengumuman dan membuka form tambah', async ({ page }) => {
    // Karena kita memakai storageState dari auth.setup.ts, agen akan otomatis dalam keadaan login
    await page.goto('/super-admin/pengumuman');

    // 1. Verifikasi halaman dimuat
    await expect(page.getByRole('heading', { name: /pengumuman/i })).toBeVisible();

    // 2. Klik tombol tambah
    await page.getByRole('button', { name: /tambah pengumuman/i }).click();

    // 3. Verifikasi Modal/Drawer terbuka
    // Form rendering tidak akan hang di Playwright karena menggunakan real DOM
    await expect(page.getByLabel(/judul pengumuman/i)).toBeVisible();
    await expect(page.getByLabel(/isi pengumuman/i)).toBeVisible();
  });
});
