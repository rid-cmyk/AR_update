import { test, expect } from '@playwright/test';

test.describe('Guru Dashboard', () => {
  test('Bisa membuka dashboard hafalan', async ({ page }) => {
    // Karena kita memakai storageState dari auth.setup.ts, agen akan otomatis dalam keadaan login
    await page.goto('/guru/hafalan');

    // 1. Verifikasi halaman dimuat
    await expect(page.getByText(/Data Hafalan Santri/i)).toBeVisible();

    // 2. Verifikasi tombol filter ada
    await expect(page.getByPlaceholder(/Cari santri/i)).toBeVisible();
  });
});
