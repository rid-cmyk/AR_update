import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '.auth/user.json');

setup('authenticate', async ({ page }) => {
  // Menggunakan passcode dari user
  const passcode = '1111111111'; 
  
  await page.goto('/login');
  
  // Mengisi passcode (menggunakan aria-label dari komponen PasscodeInput)
  await page.getByLabel('Masukkan passcode 10 digit untuk login').fill(passcode);
  
  // Klik tombol masuk
  await page.getByRole('button', { name: /masuk/i }).click();

  // Tunggu proses login selesai dan diarahkan ke dashboard
  await page.waitForURL(/super-admin|guru/);

  // Simpan state autentikasi (cookie & localStorage)
  await page.context().storageState({ path: authFile });
});
