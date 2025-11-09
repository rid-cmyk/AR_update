# 🔧 Role Format Fix - Dash vs Underscore

**Date:** November 7, 2025  
**Status:** ✅ **FIXED**

---

## 🐛 PROBLEM

### **Error Message:**
```
❌ Invalid or missing role detected: super-admin
🔍 Middleware Check - Path: /login Token: Present
👤 User authenticated - Role: super-admin ID: 1 Name: super-admin ridho
❌ Invalid or missing role detected: super-admin
```

### **Root Cause:**
- JWT token menggunakan format: `super-admin` (dengan **dash**)
- Middleware menggunakan format: `super_admin` (dengan **underscore**)
- Mismatch format menyebabkan role tidak dikenali

---

## ✅ SOLUTION

### **Role Normalization:**
Middleware sekarang otomatis mengkonversi format role:
```typescript
// Normalize role format: convert dash to underscore
if (userRole) {
  userRole = userRole.replace(/-/g, '_');
  console.log('🔄 Normalized role:', userRole);
}
```

### **Supported Formats:**
Kedua format sekarang **DITERIMA**:

| JWT Format | Normalized Format | Status |
|------------|-------------------|--------|
| `super-admin` | `super_admin` | ✅ Valid |
| `super_admin` | `super_admin` | ✅ Valid |
| `admin` | `admin` | ✅ Valid |
| `guru` | `guru` | ✅ Valid |
| `santri` | `santri` | ✅ Valid |
| `ortu` | `ortu` | ✅ Valid |
| `yayasan` | `yayasan` | ✅ Valid |

---

## 🔄 CONVERSION LOGIC

### **Before:**
```typescript
const userRole = decoded.role?.toLowerCase();
// super-admin ❌ Not found in DEFAULT_ROLE_PERMISSIONS
```

### **After:**
```typescript
let userRole = decoded.role?.toLowerCase();
userRole = userRole.replace(/-/g, '_');
// super-admin → super_admin ✅ Found!
```

---

## 🧪 TESTING

### **Test Case 1: JWT with dash format**
```json
{
  "id": 1,
  "role": "super-admin",
  "namaLengkap": "Super Admin"
}
```
**Result:** ✅ Converted to `super_admin` and accepted

### **Test Case 2: JWT with underscore format**
```json
{
  "id": 1,
  "role": "super_admin",
  "namaLengkap": "Super Admin"
}
```
**Result:** ✅ Already in correct format, accepted

### **Test Case 3: Regular roles**
```json
{
  "id": 2,
  "role": "admin",
  "namaLengkap": "Admin User"
}
```
**Result:** ✅ No conversion needed, accepted

---

## 📊 ROLE MAPPING

### **Complete Role List:**
```typescript
DEFAULT_ROLE_PERMISSIONS = {
  'super_admin': { ... },  // Accepts: super-admin, super_admin
  'admin': { ... },        // Accepts: admin
  'guru': { ... },         // Accepts: guru
  'santri': { ... },       // Accepts: santri
  'ortu': { ... },         // Accepts: ortu
  'yayasan': { ... }       // Accepts: yayasan
}
```

---

## 🔍 DEBUG LOGS

### **Enhanced Logging:**
```typescript
console.log('👤 User authenticated - Role:', userRole);
console.log('🔄 Normalized role:', userRole);
console.log('📋 Available roles:', Object.keys(DEFAULT_ROLE_PERMISSIONS));
```

### **Example Output:**
```
👤 User authenticated - Role: super-admin ID: 1 Name: Super Admin
🔄 Normalized role: super_admin
✅ Role validation passed
```

---

## 🎯 BENEFITS

### **1. Backward Compatibility**
- ✅ Old tokens with dash format still work
- ✅ New tokens with underscore format work
- ✅ No need to regenerate all tokens

### **2. Flexibility**
- ✅ Database can use either format
- ✅ API can return either format
- ✅ Middleware handles both automatically

### **3. User Experience**
- ✅ No more "Invalid role" errors
- ✅ Seamless authentication
- ✅ Proper dashboard access

---

## 🚀 DEPLOYMENT

### **No Action Required:**
- ✅ Fix is automatic
- ✅ Works with existing tokens
- ✅ No database migration needed
- ✅ No user impact

---

## 📝 RELATED FILES

### **Modified:**
- `middleware.ts` - Role normalization logic

### **Affected:**
- All authentication flows
- All role-based access control
- All dashboard redirects

---

## 🎉 CONCLUSION

### **Status: ✅ FULLY FIXED**

Masalah role format sudah diperbaiki dengan:
1. ✅ **Auto-normalization** - Dash → Underscore
2. ✅ **Backward compatible** - Kedua format diterima
3. ✅ **Enhanced logging** - Debug lebih mudah
4. ✅ **Zero downtime** - Tidak perlu restart atau migration

**🔧 Role format mismatch RESOLVED! 🔧**

---

**Fixed By:** Kiro AI  
**Date:** November 7, 2025  
**Impact:** All users with super-admin role  
**Status:** Production Ready
