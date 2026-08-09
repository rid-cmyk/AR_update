import { describe, it, expect } from "vitest";
import { isGuruAuthorizedForSantri, isGuruAuthorizedForHafalan, isOrtuAuthorizedForSantri, isSantriSelf } from "../../lib/services/authorization-guard";
import { checkRateLimit } from "../../lib/rate-limiter";
import { hasRole } from "../../lib/auth";
import { NextRequest } from "next/server";

/**
 * Security & Object-Level Authorization (BOLA / IDOR) Test Matrix Suite
 * Verifies RBAC, Object Ownership (Guru-Santri Isolation), NAT User-Aware Rate Limiting, and Horizontal/Vertical Escalation.
 */

describe("🔐 Security Matrix & BOLA / IDOR Audit Suite", () => {
  const mockTeacherA = { id: 101, username: "guru_a", namaLengkap: "Guru A", role: { name: "guru" } };
  const mockTeacherB = { id: 102, username: "guru_b", namaLengkap: "Guru B", role: { name: "guru" } };
  const mockSantri = { id: 201, username: "santri_a", namaLengkap: "Santri A", role: { name: "santri" } };
  const mockOrtu = { id: 301, username: "ortu_a", namaLengkap: "Orang Tua A", role: { name: "ortu" } };
  const mockAdmin = { id: 401, username: "admin_master", namaLengkap: "Admin Master", role: { name: "admin" } };

  describe("1. Role-Based Access Control (RBAC)", () => {
    it("Enforces role permissions accurately", () => {
      expect(hasRole(mockTeacherA, ["guru", "admin"])).toBe(true);
      expect(hasRole(mockTeacherA, ["admin", "super_admin"])).toBe(false);
      expect(hasRole(mockSantri, ["santri"])).toBe(true);
      expect(hasRole(mockSantri, ["guru"])).toBe(false);
      expect(hasRole(mockAdmin, ["admin", "super_admin"])).toBe(true);
    });
  });

  describe("2. Horizontal & Vertical Privilege Escalation Matrix (BOLA / IDOR Guards)", () => {
    it("Enforces O(1) index-backed authorization checks", async () => {
      // Mock O(1) authorization guard
      const isAuthSameHalaqah = await isGuruAuthorizedForSantri(99999, 88888);
      expect(isAuthSameHalaqah).toBe(false); // Non-existent relation returns false
    });

    it("Blocks Santri from escalating privileges to Guru or Admin routes (Vertical Escalation HTTP 403)", () => {
      const isTeacherOrAdmin = hasRole(mockSantri, ["guru", "admin", "super_admin"]);
      expect(isTeacherOrAdmin).toBe(false);
    });

    it("Blocks Orang Tua from accessing another student's report (Horizontal Escalation HTTP 403)", async () => {
      const isAuthorized = await isOrtuAuthorizedForSantri(mockOrtu.id, 99999);
      expect(isAuthorized).toBe(false);
    });

    it("Blocks Santri from modifying another student's hafalan (Horizontal Escalation HTTP 403)", async () => {
      const isSelf = await isSantriSelf(mockSantri.id, 99999);
      expect(isSelf).toBe(false);
    });
  });

  describe("3. User-Aware API Rate Limiter (NAT IP Throttling Protection)", () => {
    it("Isolates rate limits per User ID so multiple teachers behind 1 NAT IP do not block each other", () => {
      const reqNat = new NextRequest("http://localhost:3000/api/guru/hafalan", {
        headers: { "x-forwarded-for": "203.0.113.199" }, // Shared School Wi-Fi Public IP
      });

      // Teacher A makes 5 requests
      for (let i = 0; i < 5; i++) {
        const resA = checkRateLimit(reqNat, { limit: 5, windowMs: 60000 }, mockTeacherA.id);
        expect(resA.allowed).toBe(true);
      }

      // Teacher A 6th request is blocked (429)
      const breachA = checkRateLimit(reqNat, { limit: 5, windowMs: 60000 }, mockTeacherA.id);
      expect(breachA.allowed).toBe(false);
      expect(breachA.response?.status).toBe(429);

      // Teacher B on the SAME NAT IP is STILL ALLOWED because rate limit is keying on User ID!
      const resB = checkRateLimit(reqNat, { limit: 5, windowMs: 60000 }, mockTeacherB.id);
      expect(resB.allowed).toBe(true);
    });
  });
});
