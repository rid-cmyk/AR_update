// Permission management utilities

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface UserPermissions {
  canEditPasscode: boolean;
  canManageUsers: boolean;
  canManageRoles: boolean;
  canViewReports: boolean;
  canExportData: boolean;
  canManageSystem: boolean;
}

// Default permissions untuk setiap role
export const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  'super_admin': [
    'dashboard_view', 'profile_view', 'profile_edit', 'pengumuman_view',
    'absensi_view', 'absensi_input', 'hafalan_view', 'hafalan_input',
    'laporan_view', 'laporan_export', 'user_management', 'role_management',
    'system_settings', 'backup_restore', 'passcode_edit_others', 'passcode_edit_self'
  ],
  'admin': [
    'dashboard_view', 'profile_view', 'profile_edit', 'pengumuman_view',
    'absensi_view', 'absensi_input', 'hafalan_view', 'hafalan_input',
    'laporan_view', 'laporan_export', 'passcode_edit_self'
  ],
  'yayasan': [
    'dashboard_view', 'profile_view', 'profile_edit', 'pengumuman_view',
    'absensi_view', 'hafalan_view', 'laporan_view', 'laporan_export'
  ],
  'guru': [
    'dashboard_view', 'profile_view', 'profile_edit', 'pengumuman_view',
    'absensi_view', 'absensi_input', 'hafalan_view', 'hafalan_input'
  ],
  'santri': [
    'dashboard_view', 'profile_view', 'profile_edit', 'pengumuman_view',
    'absensi_view', 'hafalan_view'
  ],
  'ortu': [
    'dashboard_view', 'profile_view', 'profile_edit', 'pengumuman_view',
    'absensi_view', 'hafalan_view', 'laporan_view'
  ]
};

// Available permissions
export const AVAILABLE_PERMISSIONS: Permission[] = [
  // Dashboard & Profile
  { id: 'dashboard_view', name: 'Lihat Dashboard', description: 'Akses ke halaman dashboard', category: 'Dashboard' },
  { id: 'profile_view', name: 'Lihat Profil', description: 'Melihat profil sendiri', category: 'Profil' },
  { id: 'profile_edit', name: 'Edit Profil', description: 'Mengedit profil sendiri', category: 'Profil' },
  
  // Pengumuman
  { id: 'pengumuman_view', name: 'Lihat Pengumuman', description: 'Melihat pengumuman', category: 'Pengumuman' },
  { id: 'pengumuman_create', name: 'Buat Pengumuman', description: 'Membuat pengumuman baru', category: 'Pengumuman' },
  { id: 'pengumuman_edit', name: 'Edit Pengumuman', description: 'Mengedit pengumuman', category: 'Pengumuman' },
  
  // Absensi
  { id: 'absensi_view', name: 'Lihat Absensi', description: 'Melihat data absensi', category: 'Absensi' },
  { id: 'absensi_input', name: 'Input Absensi', description: 'Menginput data absensi', category: 'Absensi' },
  
  // Hafalan
  { id: 'hafalan_view', name: 'Lihat Hafalan', description: 'Melihat data hafalan', category: 'Hafalan' },
  { id: 'hafalan_input', name: 'Input Hafalan', description: 'Menginput data hafalan', category: 'Hafalan' },
  
  // Laporan
  { id: 'laporan_view', name: 'Lihat Laporan', description: 'Melihat laporan', category: 'Laporan' },
  { id: 'laporan_export', name: 'Export Laporan', description: 'Mengexport laporan', category: 'Laporan' },
  
  // User Management
  { id: 'user_management', name: 'Manajemen User', description: 'Kelola data pengguna (Super Admin only)', category: 'Manajemen' },
  { id: 'role_management', name: 'Manajemen Role', description: 'Kelola role dan hak akses (Super Admin only)', category: 'Manajemen' },
  { id: 'passcode_edit_others', name: 'Edit Passcode User Lain', description: 'Mengedit passcode pengguna lain (Super Admin only)', category: 'Manajemen' },
  { id: 'passcode_edit_self', name: 'Edit Passcode Sendiri', description: 'Mengedit passcode sendiri di profil', category: 'Profil' },
  
  // System
  { id: 'system_settings', name: 'Pengaturan Sistem', description: 'Mengatur konfigurasi sistem', category: 'Sistem' },
  { id: 'backup_restore', name: 'Backup & Restore', description: 'Kelola backup dan restore data', category: 'Sistem' },
];

// Helper functions
export const canEditOthersPasscode = (userRole: string): boolean => {
  const permissions = DEFAULT_ROLE_PERMISSIONS[userRole.toLowerCase()] || [];
  return permissions.includes('passcode_edit_others');
};

export const canEditSelfPasscode = (userRole: string): boolean => {
  const permissions = DEFAULT_ROLE_PERMISSIONS[userRole.toLowerCase()] || [];
  return permissions.includes('passcode_edit_self');
};

export const canManageUsers = (userRole: string): boolean => {
  const permissions = DEFAULT_ROLE_PERMISSIONS[userRole.toLowerCase()] || [];
  return permissions.includes('user_management');
};

export const canManageRoles = (userRole: string): boolean => {
  const permissions = DEFAULT_ROLE_PERMISSIONS[userRole.toLowerCase()] || [];
  return permissions.includes('role_management');
};

export const hasPermission = (userRole: string, permissionId: string): boolean => {
  const permissions = DEFAULT_ROLE_PERMISSIONS[userRole.toLowerCase()] || [];
  return permissions.includes(permissionId);
};

export const getUserPermissions = (userRole: string): UserPermissions => {
  return {
    canEditPasscode: canEditOthersPasscode(userRole), // Only for others' passcode
    canManageUsers: canManageUsers(userRole),
    canManageRoles: canManageRoles(userRole),
    canViewReports: hasPermission(userRole, 'laporan_view'),
    canExportData: hasPermission(userRole, 'laporan_export'),
    canManageSystem: hasPermission(userRole, 'system_settings'),
  };
};

// Auto-assign permissions when new role is created
export const getDefaultPermissionsForNewRole = (): string[] => {
  return [
    'dashboard_view',
    'profile_view', 
    'profile_edit',
    'pengumuman_view'
  ];
};

// Sync permissions with role changes
export const syncRolePermissions = async (roleName: string, permissions: string[]) => {
  // This function would be called when role permissions are updated
  // to ensure all users with this role get the updated permissions
  console.log(`Syncing permissions for role: ${roleName}`, permissions);
  
  // In a real implementation, this might:
  // 1. Update a RolePermissions table
  // 2. Invalidate user sessions to force re-authentication
  // 3. Send notifications to affected users
  // 4. Log the permission changes for audit
};

export default {
  canEditOthersPasscode,
  canEditSelfPasscode,
  canManageUsers,
  canManageRoles,
  hasPermission,
  getUserPermissions,
  getDefaultPermissionsForNewRole,
  syncRolePermissions,
  DEFAULT_ROLE_PERMISSIONS,
  AVAILABLE_PERMISSIONS
};