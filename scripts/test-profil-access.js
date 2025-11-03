// Test middleware logic for profil access
const ROLE_PERMISSIONS = {
  'super_admin': {
    level: 6,
    allowedRoutes: ['super-admin', 'admin', 'guru', 'santri', 'ortu', 'yayasan', 'users', 'settings', 'super-admin/profil'],
    dashboard: '/super-admin/dashboard'
  }
};

function testProfilAccess() {
  console.log('🧪 Testing profil access logic...');
  
  const userRole = 'super_admin';
  const testPaths = [
    '/super-admin/profil',
    '/super-admin/dashboard',
    '/super-admin/users',
    '/admin/profil',
    '/guru/profil'
  ];
  
  const userPermissions = ROLE_PERMISSIONS[userRole];
  
  testPaths.forEach(path => {
    console.log(`\n🔍 Testing path: ${path}`);
    console.log(`👤 User role: ${userRole}`);
    console.log(`📋 Allowed routes:`, userPermissions.allowedRoutes);
    
    const hasAccess = userPermissions.allowedRoutes.some((route) => {
      console.log(`  🔎 Checking route: ${route}`);
      
      // Check exact match first
      if (path === `/${route}`) {
        console.log(`    ✅ Exact match: ${path} === /${route}`);
        return true;
      }
      
      // Check if path starts with route (for nested routes)
      if (path.startsWith(`/${route}/`)) {
        console.log(`    ✅ Starts with: ${path} starts with /${route}/`);
        return true;
      }
      
      // Check if route contains a slash (for specific sub-routes like 'super-admin/profil')
      if (route.includes('/') && path === `/${route}`) {
        console.log(`    ✅ Slash route match: ${path} === /${route}`);
        return true;
      }
      
      console.log(`    ❌ No match for route: ${route}`);
      return false;
    });
    
    console.log(`🎯 Result for ${path}: ${hasAccess ? '✅ ALLOWED' : '❌ DENIED'}`);
  });
}

testProfilAccess();