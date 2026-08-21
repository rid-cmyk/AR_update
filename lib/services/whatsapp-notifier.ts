import { prisma } from "@/lib/database/prisma";
import { sendWhatsAppMessage } from "./whatsapp";

function getDayName(day: string): string {
  const days: Record<string, string> = {
    Senin: "Senin", Selasa: "Selasa", Rabu: "Rabu",
    Kamis: "Kamis", Jumat: "Jumat", Sabtu: "Sabtu", Minggu: "Minggu",
  };
  return days[day] || day;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

async function getParentPhones(santriId: number): Promise<string[]> {
  const relations = await prisma.orangTuaSantri.findMany({
    where: { santriId },
    include: { orangTua: { select: { noTlp: true } } },
  });
  return relations
    .map((r) => r.orangTua.noTlp)
    .filter((phone): phone is string => !!phone && phone.length >= 10);
}

async function getGuruPhone(guruId: number): Promise<string | null> {
  const guru = await prisma.user.findUnique({ where: { id: guruId }, select: { noTlp: true } });
  return guru?.noTlp && guru.noTlp.length >= 10 ? guru.noTlp : null;
}

async function getAdminPhones(): Promise<string[]> {
  return getRecipientsByRole("super_admin");
}

async function getRecipientsByRole(roleName: string): Promise<string[]> {
  const role = await prisma.role.findFirst({ where: { name: roleName } });
  if (!role) return [];
  const users = await prisma.user.findMany({
    where: { roleId: role.id },
    select: { noTlp: true },
  });
  return users.map((u) => u.noTlp).filter((p): p is string => !!p && p.length >= 10);
}

function sendToMany(phones: string[], message: string): Promise<void> {
  return Promise.allSettled(phones.map((phone) => sendWhatsAppMessage(phone, message))).then(() => {});
}


export async function notifyHafalan(
  santriId: number,
  type: "ziyadah" | "murojaah",
  detail: { namaSurat: string; ayatAwal: number; ayatAkhir: number; namaGuru: string }
) {
  const santri = await prisma.user.findUnique({ where: { id: santriId }, select: { namaLengkap: true } });
  if (!santri) return;

  const parentPhones = await getParentPhones(santriId);
  if (parentPhones.length === 0) return;

  const icon = type === "ziyadah" ? "🕌" : "📖";
  const label = type === "ziyadah" ? "menyelesaikan hafalan baru" : "melakukan muroja'ah";

  const message = [
    `${icon} *AR-Hafalan*`,
    "",
    `Anak Anda *${santri.namaLengkap}* telah ${label}:`,
    "",
    `📖 Surat: ${detail.namaSurat} Ayat ${detail.ayatAwal}-${detail.ayatAkhir}`,
    `👨‍🏫 Guru: ${detail.namaGuru}`,
    `📅 Tanggal: ${formatDate(new Date())}`,
    "",
    type === "ziyadah" ? "Semangat terus! 💪" : "Alhamdulillah 🤲",
  ].join("\n");

  await sendToMany(parentPhones, message);
}


export async function notifyTarget(
  santriId: number,
  action: "created" | "completed" | "deleted",
  detail: { namaSurat: string; namaGuru: string }
) {
  const santri = await prisma.user.findUnique({ where: { id: santriId }, select: { namaLengkap: true } });
  if (!santri) return;

  const parentPhones = await getParentPhones(santriId);
  if (parentPhones.length === 0) return;

  let message: string;
  if (action === "created") {
    message = [
      "🎯 *Target Hafalan Baru*",
      "",
      `Anak Anda *${santri.namaLengkap}* mendapat target:`,
      `📖 Surat: ${detail.namaSurat}`,
      `👨‍🏫 Guru: ${detail.namaGuru}`,
      "",
      "Capai targetmu! 💪",
    ].join("\n");
  } else if (action === "completed") {
    message = [
      "🎉 *Target Tercapai!*",
      "",
      `Anak Anda *${santri.namaLengkap}* telah menyelesaikan target:`,
      `📖 Surat: ${detail.namaSurat}`,
      `👨‍🏫 Guru: ${detail.namaGuru}`,
      "",
      "Alhamdulillah! 🤲🌟",
    ].join("\n");
  } else {
    message = [
      "❌ *Target Dihapus*",
      "",
      `Target hafalan *${detail.namaSurat}* anak Anda *${santri.namaLengkap}* telah dihapus.`,
      `👨‍🏫 Guru: ${detail.namaGuru}`,
    ].join("\n");
  }

  await sendToMany(parentPhones, message);
}


export async function notifyUjianSubmit(
  santriId: number,
  detail: { jenisUjian: string; namaGuru: string }
) {
  const santri = await prisma.user.findUnique({ where: { id: santriId }, select: { namaLengkap: true } });
  if (!santri) return;

  const adminPhones = await getAdminPhones();
  if (adminPhones.length === 0) return;

  const message = [
    "📝 *Ujian Menunggu Verifikasi*",
    "",
    `${santri.namaLengkap} — ${detail.jenisUjian}`,
    `👨‍🏫 Guru: ${detail.namaGuru}`,
    `📅 Tanggal: ${formatDate(new Date())}`,
    "",
    "Menunggu verifikasi admin.",
  ].join("\n");

  await sendToMany(adminPhones, message);
}

export async function notifyUjianVerified(
  santriId: number,
  action: "verified" | "rejected",
  detail: { jenisUjian: string; guruId: number; nilai?: number; keterangan?: string }
) {
  const [santri, guru] = await Promise.all([
    prisma.user.findUnique({ where: { id: santriId }, select: { namaLengkap: true } }),
    prisma.user.findUnique({ where: { id: detail.guruId }, select: { noTlp: true } }),
  ]);

  if (!santri || !guru?.noTlp || guru.noTlp.length < 10) return;
  const guruPhone = guru.noTlp;

  const statusLabel = action === "verified" ? "✅ Diverifikasi" : "❌ Ditolak";
  const message = [
    `📝 *Ujian ${statusLabel}*`,
    "",
    `${santri.namaLengkap} — ${detail.jenisUjian}`,
    detail.nilai !== undefined ? `📊 Nilai: ${detail.nilai}` : "",
    detail.keterangan ? `💬 ${detail.keterangan}` : "",
    "",
    `📅 ${formatDate(new Date())}`,
  ]
    .filter(Boolean)
    .join("\n");

  await sendWhatsAppMessage(guruPhone, message);
}


export async function notifyPrestasi(
  santriId: number,
  detail: { namaPrestasi: string; namaGuru: string }
) {
  const santri = await prisma.user.findUnique({ where: { id: santriId }, select: { namaLengkap: true } });
  if (!santri) return;

  const parentPhones = await getParentPhones(santriId);
  if (parentPhones.length === 0) return;

  const message = [
    "🏆 *Prestasi Baru!*",
    "",
    `Anak Anda *${santri.namaLengkap}* mendapat prestasi:`,
    `🏅 ${detail.namaPrestasi}`,
    `👨‍🏫 Guru: ${detail.namaGuru}`,
    `📅 ${formatDate(new Date())}`,
    "",
    "Keren! Terus berprestasi! 🌟",
  ].join("\n");

  await sendToMany(parentPhones, message);
}


export async function notifyPengumuman(
  pengumumanId: number,
  judul: string,
  isi: string,
  targetAudience: string
) {
  const admin = await prisma.user.findFirst({
    where: { role: { name: "super_admin" } },
    select: { namaLengkap: true },
  });
  const namaAdmin = admin?.namaLengkap || "Admin";

  const isiPendek = isi.length > 100 ? isi.substring(0, 100) + "..." : isi;

  const message = [
    "📢 *Pengumuman Baru*",
    "",
    `Judul: ${judul}`,
    `Dari: ${namaAdmin}`,
    "",
    isiPendek,
    "",
    "Buka aplikasi untuk membaca selengkapnya.",
  ].join("\n");

  let phones: string[] = [];
  if (targetAudience === "semua") {
    const [guru, santri, ortu, yayasan] = await Promise.all([
      getRecipientsByRole("guru"),
      getRecipientsByRole("santri"),
      getRecipientsByRole("ortu"),
      getRecipientsByRole("yayasan"),
    ]);

    const allOrtuRelations = await prisma.orangTuaSantri.findMany({
      where: { orangTua: { noTlp: { not: null } } },
      select: { orangTua: { select: { noTlp: true } } },
      distinct: ['orangTuaId'],
    });
    const ortuPhones = allOrtuRelations
      .map((r) => r.orangTua.noTlp)
      .filter((p): p is string => !!p && p.length >= 10);

    phones = [...new Set([...guru, ...ortuPhones, ...yayasan])];
  } else {
    phones = await getRecipientsByRole(targetAudience);

    if (targetAudience === "santri") {
      const santriIds = (await prisma.user.findMany({
        where: { role: { name: "santri" } },
        select: { id: true },
      })).map((s) => s.id);
      for (const sid of santriIds) {
        phones.push(...await getParentPhones(sid));
      }
    }
  }

  phones = [...new Set(phones)];
  if (phones.length === 0) return;

  await sendToMany(phones, message);
}


export async function notifyForgotPasscode(userId: number, newPasscode: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { namaLengkap: true, noTlp: true } });
  if (!user?.noTlp || user.noTlp.length < 10) return false;

  const defaultTemplate = [
    "🔑 *Passcode Baru Anda*",
    "",
    "Halo *{nama}*,",
    "",
    "Passcode baru Anda: *{passcode}*",
    "",
    "Gunakan passcode ini untuk login.",
    "Jangan bagikan ke orang lain.",
  ].join("\n");

  let template = defaultTemplate;
  try {
    const setting = await prisma.systemSetting.findUnique({ where: { id: "global" } });
    const data = (setting?.data as Record<string, unknown> | undefined) ?? {};
    if (typeof data.whatsappMessageForgotPasscode === "string" && data.whatsappMessageForgotPasscode.trim()) {
      template = data.whatsappMessageForgotPasscode;
    }
  } catch (error) {
    console.error("[WhatsApp] Gagal membaca template forgot passcode:", error);
  }

  const message = template
    .replace(/\{nama\}/g, user.namaLengkap)
    .replace(/\{passcode\}/g, newPasscode);

  return await sendWhatsAppMessage(user.noTlp, message);
}


async function runWithConcurrencyLimit<T>(
  tasks: (() => Promise<T>)[],
  limit: number
): Promise<PromiseSettledResult<T>[]> {
  const results: PromiseSettledResult<T>[] = [];
  const executing: Promise<void>[] = [];

  for (const task of tasks) {
    const p = task().then(
      (value) => { results.push({ status: 'fulfilled', value }); return value; },
      (reason) => { results.push({ status: 'rejected', reason }); throw reason; }
    );
    const e = p.then(() => { executing.splice(executing.indexOf(e), 1); }).catch(() => { executing.splice(executing.indexOf(e), 1); });
    executing.push(e);
    if (executing.length >= limit) await Promise.race(executing);
  }

  await Promise.all(executing);
  return results;
}

export async function sendAbsensiRecap(): Promise<{ sent: number; failed: number }> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayKey = today.toISOString().slice(0, 10);

  const setting = await prisma.systemSetting.findUnique({ where: { id: "global" } });
  const settingData = (setting?.data as Record<string, unknown> | undefined) ?? {};
  if (settingData.absensi_wa_last_sent === todayKey) {
    console.log("[WhatsApp Absensi] Recap already sent today, skipping");
    return { sent: 0, failed: 0 };
  }

  const dayMap: Record<number, string> = {
    0: "Minggu", 1: "Senin", 2: "Selasa", 3: "Rabu",
    4: "Kamis", 5: "Jumat", 6: "Sabtu",
  };
  const hariIni = dayMap[now.getDay()];

  const jadwals = await prisma.jadwal.findMany({
    where: { hari: hariIni as any, isActive: true },
    include: { halaqah: { select: { namaHalaqah: true } } },
    orderBy: { jamSelesai: "desc" },
  });

  if (jadwals.length === 0) return { sent: 0, failed: 0 };

  const latestEnd = jadwals[0].jamSelesai;
  const latestEndTime = latestEnd.getHours() * 60 + latestEnd.getMinutes();
  const nowTime = now.getHours() * 60 + now.getMinutes();

  if (nowTime < latestEndTime) return { sent: 0, failed: 0 };

  const absensisWithParents = await prisma.absensi.findMany({
    where: {
      jadwalId: { in: jadwals.map((j) => j.id) },
      tanggal: { gte: today, lt: new Date(today.getTime() + 86400000) },
    },
    select: {
      id: true,
      jadwalId: true,
      status: true,
      santriId: true,
      santri: {
        select: {
          id: true,
          namaLengkap: true,
          anak: {
            select: {
              orangTua: { select: { noTlp: true } },
            },
          },
        },
      },
      jadwal: {
        select: {
          jamMulai: true,
          jamSelesai: true,
          halaqah: { select: { namaHalaqah: true } },
        },
      },
    },
  });

  if (absensisWithParents.length === 0) return { sent: 0, failed: 0 };

  const byJadwal = new Map<number, typeof absensisWithParents>();
  for (const a of absensisWithParents) {
    const group = byJadwal.get(a.jadwalId) ?? [];
    group.push(a);
    byJadwal.set(a.jadwalId, group);
  }

  const tasks: (() => Promise<void>)[] = [];

  for (const [, absensis] of byJadwal) {
    const sample = absensis[0];
    const alpha = absensis.filter((a) => a.status === "alpha");
    const baseMessage = [
      "📋 *Rekap Absensi Hafalan*",
      `📅 ${formatDate(today)}`,
      "",
      `🕌 Halaqah: ${sample.jadwal.halaqah.namaHalaqah}`,
      `🕐 Jam: ${formatTime(sample.jadwal.jamMulai)} - ${formatTime(sample.jadwal.jamSelesai)}`,
      "",
      `✅ Hadir: ${absensis.filter((a) => a.status === "masuk").length} santri`,
      `❌ Alpha: ${alpha.length} santri${alpha.length > 0 ? ` (${alpha.map((a) => a.santri.namaLengkap).join(", ")})` : ""}`,
      `⏸️ Izin: ${absensis.filter((a) => a.status === "izin").length} santri`,
    ].join("\n");

    for (const absensi of absensis) {
      const phones = absensi.santri.anak
        .map((r) => r.orangTua.noTlp)
        .filter((p): p is string => !!p && p.length >= 10);
      
      if (phones.length === 0) continue;

      const statusLabel =
        absensi.status === "masuk" ? "✅ Hadir"
        : absensi.status === "alpha" ? "❌ Alpha"
        : "⏸️ Izin";
        
      const personalMessage = `${baseMessage}\n\n👤 Status ${absensi.santri.namaLengkap}: ${statusLabel}`;

      for (const phone of phones) {
        tasks.push(async () => {
          await sendWhatsAppMessage(phone, personalMessage);
        });
      }
    }
  }

  const results = await runWithConcurrencyLimit(tasks, 5);
  const sent = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  if (sent > 0 || failed > 0) {
    await prisma.systemSetting.upsert({
      where: { id: "global" },
      create: { id: "global", data: { absensi_wa_last_sent: todayKey } as any },
      update: { data: { ...settingData, absensi_wa_last_sent: todayKey } as any },
    });
  }

  console.log(`[WhatsApp Absensi] Sent: ${sent}, Failed: ${failed}`);
  return { sent, failed };
}
