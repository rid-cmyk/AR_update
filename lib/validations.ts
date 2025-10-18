import { z } from 'zod';

// User validation schemas
export const loginSchema = z.object({
  passCode: z.string().min(1, 'Passcode is required'),
});

export const userCreateSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  namaLengkap: z.string().min(1, 'Full name is required'),
  roleId: z.number().int().positive('Role is required'),
  alamat: z.string().optional(),
  noTlp: z.string().optional(),
});

export const userUpdateSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  namaLengkap: z.string().min(1, 'Full name is required'),
  alamat: z.string().optional(),
  noTlp: z.string().optional(),
});

// Hafalan validation schemas
export const hafalanCreateSchema = z.object({
  surat: z.string().min(1, 'Surah is required'),
  ayatMulai: z.number().int().positive('Start verse must be positive'),
  ayatSelesai: z.number().int().positive('End verse must be positive'),
  status: z.enum(['ziyadah', 'murojaah']),
  keterangan: z.string().optional(),
}).refine(data => data.ayatMulai <= data.ayatSelesai, {
  message: 'Start verse must be less than or equal to end verse',
  path: ['ayatMulai'],
});

export const targetCreateSchema = z.object({
  surat: z.string().min(1, 'Surah is required'),
  ayatTarget: z.number().int().positive('Target verses must be positive'),
  deadline: z.string().refine(date => !isNaN(Date.parse(date)), {
    message: 'Invalid deadline date',
  }),
});

// Announcement validation schemas
export const announcementCreateSchema = z.object({
  judul: z.string().min(1, 'Title is required'),
  isi: z.string().min(1, 'Content is required'),
  targetAudience: z.enum(['semua', 'guru', 'santri', 'admin']).default('semua'),
  tanggalKadaluarsa: z.string().optional().refine(date => !date || !isNaN(Date.parse(date)), {
    message: 'Invalid expiration date',
  }),
});

// Halaqah validation schemas
export const halaqahCreateSchema = z.object({
  namaHalaqah: z.string().min(1, 'Halaqah name is required'),
  guruId: z.number().int().positive('Teacher is required'),
});

// Schedule validation schemas
export const jadwalCreateSchema = z.object({
  hari: z.enum(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']),
  jamMulai: z.string().refine(time => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time), {
    message: 'Invalid start time format (HH:MM)',
  }),
  jamSelesai: z.string().refine(time => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time), {
    message: 'Invalid end time format (HH:MM)',
  }),
  halaqahId: z.number().int().positive('Halaqah is required'),
}).refine(data => {
  const start = new Date(`1970-01-01T${data.jamMulai}:00`);
  const end = new Date(`1970-01-01T${data.jamSelesai}:00`);
  return start < end;
}, {
  message: 'End time must be after start time',
  path: ['jamSelesai'],
});

// Attendance validation schemas
export const absensiCreateSchema = z.object({
  santriId: z.number().int().positive('Student is required'),
  jadwalId: z.number().int().positive('Schedule is required'),
  status: z.enum(['alpha', 'izin', 'masuk']),
});

// Exam validation schemas
export const ujianCreateSchema = z.object({
  santriId: z.number().int().positive('Student is required'),
  halaqahId: z.number().int().positive('Halaqah is required'),
  jenis: z.enum(['tahfidz', 'tasmi', 'lainnya']),
  nilai: z.number().min(0).max(100, 'Score must be between 0 and 100'),
  keterangan: z.string().optional(),
});

// Profile update validation
export const profileUpdateSchema = z.object({
  namaLengkap: z.string().min(1, 'Full name is required'),
  alamat: z.string().optional(),
  noTlp: z.string().optional(),
});

// Password change validation
export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Password confirmation is required'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});