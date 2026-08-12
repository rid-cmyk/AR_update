import { describe, it, expect, beforeAll } from "vitest";
import jwt from "jsonwebtoken";
import { verifyJWT } from "../../middleware";

/**
 * Middleware JWT Verification Suite
 * Verifikasi bahwa verifyJWT:
 *  - memvalidasi tanda tangan (signature) HS256
 *  - menolak token kedaluwarsa (cek exp) — perbaikan keamanan
 *  - menolak token dengan payload rusak
 */

const TEST_SECRET = "test-jwt-secret-middleware";

describe("Middleware verifyJWT (signature + exp)", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = TEST_SECRET;
  });

  function signToken(payload: Record<string, unknown>, options?: jwt.SignOptions): string {
    return jwt.sign(payload, TEST_SECRET, { algorithm: "HS256", ...options });
  }

  it("menolak token malformed (bukan 3 bagian)", async () => {
    await expect(verifyJWT("not-a-jwt")).resolves.toBeNull();
    await expect(verifyJWT("a.b")).resolves.toBeNull();
  });

  it("menolak token dengan signature rusak", async () => {
    const token = signToken({ id: 1, role: "admin" }, { expiresIn: "1h" });
    const tampered = token.slice(0, -4) + (token.endsWith("abcd") ? "wxyz" : "zzzz");
    await expect(verifyJWT(tampered)).resolves.toBeNull();
  });

  it("menolak token dengan secret salah", async () => {
    const token = jwt.sign({ id: 1 }, "wrong-secret", { algorithm: "HS256", expiresIn: "1h" });
    await expect(verifyJWT(token)).resolves.toBeNull();
  });

  it("menolak token kedaluwarsa (exp di masa lalu)", async () => {
    const token = signToken({ id: 7, role: "guru", exp: Math.floor(Date.now() / 1000) - 3600 });
    await expect(verifyJWT(token)).resolves.toBeNull();
  });

  it("mengembalikan payload untuk token valid yang belum kedaluwarsa", async () => {
    const token = signToken({ id: 7, username: "guru_a", role: "guru" }, { expiresIn: "1h" });
    const decoded = await verifyJWT(token);
    expect(decoded).not.toBeNull();
    expect((decoded as any).id).toBe(7);
    expect((decoded as any).role).toBe("guru");
  });

  it("mengembalikan null untuk payload yang bukan JSON", async () => {
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
    const payloadB64 = Buffer.from("{{{{bukan json}}").toString("base64url");
    const sig = jwt.sign({}, TEST_SECRET, { algorithm: "HS256" }).split(".")[2];
    await expect(verifyJWT(`${header}.${payloadB64}.${sig}`)).resolves.toBeNull();
  });
});
