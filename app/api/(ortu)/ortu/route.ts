import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.id;

    // Get user with orang tua relations
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        sebagaiOrangTua: {
          include: {
            santri: {
              include: {
                Hafalan: {
                  orderBy: { tanggal: 'desc' }
                },
                TargetHafalan: true,
                Absensi: {
                  include: {
                    jadwal: {
                      include: {
                        halaqah: true
                      }
                    }
                  },
                  orderBy: { tanggal: 'desc' }
                },
                Prestasi: {
                  where: { validated: true },
                  orderBy: { tahun: 'desc' }
                },
                Ujian: {
                  orderBy: { tanggal: 'desc' }
                },
                HalaqahSantri: {
                  include: {
                    halaqah: {
                      include: {
                        guru: {
                          select: { namaLengkap: true }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user?.sebagaiOrangTua || user.sebagaiOrangTua.length === 0) {
      return NextResponse.json({
        anakList: [],
        pengumuman: []
      });
    }

    // Get pengumuman for santri
    const pengumuman = await prisma.pengumuman.findMany({
      where: {
        OR: [
          { targetAudience: 'semua' },
          { targetAudience: 'santri' }
        ]
      },
      include: {
        dibacaOleh: true
      },
      orderBy: { tanggal: 'desc' },
      take: 10
    });

    const anakList = user.sebagaiOrangTua.map((relation: any) => relation.santri);

    return NextResponse.json({
      anakList,
      pengumuman
    });

  } catch (error) {
    console.error("Dashboard ortu error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}