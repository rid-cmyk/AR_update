"use client";

import { useEffect, useState } from "react";
import {
  Card,
  Button,
  Select,
  DatePicker,
  Space,
  message,
  Row,
  Col,
  Avatar,
  Typography,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import LayoutApp from "../../components/LayoutApp";
import dayjs from "dayjs";

const { Option } = Select;
const { Title } = Typography;

interface Halaqah {
  id: number;
  namaHalaqah: string;
  jumlahSantri: number;
  santri: Array<{
    id: number;
    namaLengkap: string;
    username: string;
    foto?: string;
  }>;
}

interface Santri {
  id: number;
  namaLengkap: string;
  username: string;
  foto?: string;
}

interface Absensi {
  id?: number;
  santriId: number;
  status: "masuk" | "izin" | "tidak";
  tanggal: string;
}

export default function AbsensiPage() {
  const [halaqahList, setHalaqahList] = useState<Halaqah[]>([]);
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [absensiData, setAbsensiData] = useState<Record<number, string>>({});
  const [selectedDate, setSelectedDate] = useState(dayjs());

  // Fetch halaqah milik guru dari dashboard API guru
  const fetchHalaqah = async () => {
    try {
      const res = await fetch("/api/(guru)/dashboard");
      if (res.ok) {
        const data = await res.json();
        setHalaqahList(data.halaqah || []);
        // Combine all santri from all halaqah
        const allSantri: Santri[] = [];
        (data.halaqah || []).forEach((halaqah: Halaqah) => {
          if (halaqah.santri) {
            halaqah.santri.forEach(santri => {
              if (!allSantri.find(s => s.id === santri.id)) {
                allSantri.push(santri);
              }
            });
          }
        });
        setSantriList(allSantri);
      }
    } catch (error) {
      console.error("Error fetching halaqah:", error);
    }
  };

  // Fetch existing absensi for the date - for all santri
  const fetchAbsensi = async () => {
    try {
      const dateStr = selectedDate.format('YYYY-MM-DD');
      // Since no halaqahId, need to fetch for each santri or modify API
      // For now, assume API can handle without halaqahId
      const res = await fetch(`/api/absensi?tanggal=${dateStr}`);
      if (res.ok) {
        const data = await res.json();
        const absensiMap: Record<number, string> = {};
        data.forEach((absensi: Absensi) => {
          absensiMap[absensi.santriId] = absensi.status;
        });
        setAbsensiData(absensiMap);
      }
    } catch (error) {
      console.error("Error fetching absensi:", error);
    }
  };

  useEffect(() => {
    fetchHalaqah();
  }, []);

  useEffect(() => {
    fetchAbsensi();
  }, [selectedDate]);

  const handleStatusChange = async (santriId: number, status: string) => {
    try {
      const dateStr = selectedDate.format('YYYY-MM-DD');
      // Find halaqah for the santri
      let halaqahId = null;
      for (const halaqah of halaqahList) {
        if (halaqah.santri && halaqah.santri.find(s => s.id === santriId)) {
          halaqahId = halaqah.id;
          break;
        }
      }

      const payload = {
        santriId,
        status,
        tanggal: dateStr,
        halaqahId,
      };

      const res = await fetch("/api/absensi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setAbsensiData(prev => ({
          ...prev,
          [santriId]: status
        }));
        message.success("Absensi berhasil disimpan");
      } else {
        message.error("Gagal menyimpan absensi");
      }
    } catch (error) {
      console.error("Error saving absensi:", error);
      message.error("Error menyimpan absensi");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "masuk":
        return <CheckCircleOutlined style={{ color: "#52c41a", fontSize: 24 }} />;
      case "izin":
        return <ClockCircleOutlined style={{ color: "#faad14", fontSize: 24 }} />;
      case "tidak":
        return <CloseCircleOutlined style={{ color: "#ff4d4f", fontSize: 24 }} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "masuk":
        return "#52c41a";
      case "izin":
        return "#faad14";
      case "tidak":
        return "#ff4d4f";
      default:
        return "#d9d9d9";
    }
  };

  return (
    <LayoutApp>
      <div style={{ padding: "24px 0" }}>
        <Title level={2}>Absensi Santri</Title>

        {/* Date Picker */}
        <Space style={{ marginBottom: 24 }}>
          <DatePicker
            value={selectedDate}
            onChange={(date) => setSelectedDate(date || dayjs())}
          />
        </Space>

        {/* Santri Grid */}
        <Row gutter={[16, 16]}>
          {santriList.map((santri) => {
            const currentStatus = absensiData[santri.id] || "";
            return (
              <Col xs={24} sm={12} md={8} lg={6} key={santri.id}>
                <Card
                  style={{
                    textAlign: "center",
                    border: `2px solid ${getStatusColor(currentStatus)}`,
                  }}
                  bodyStyle={{ padding: 16 }}
                >
                  <Avatar
                    size={64}
                    src={santri.foto}
                    style={{ marginBottom: 12 }}
                  >
                    {santri.namaLengkap.charAt(0)}
                  </Avatar>
                  <Title level={5} style={{ marginBottom: 16 }}>
                    {santri.namaLengkap}
                  </Title>

                  <Space direction="vertical" style={{ width: "100%" }}>
                    <Button
                      type={currentStatus === "masuk" ? "primary" : "default"}
                      icon={<CheckCircleOutlined />}
                      onClick={() => handleStatusChange(santri.id, "masuk")}
                      block
                      style={{
                        backgroundColor: currentStatus === "masuk" ? "#52c41a" : undefined,
                        borderColor: "#52c41a",
                      }}
                    >
                      Hadir
                    </Button>
                    <Button
                      type={currentStatus === "izin" ? "primary" : "default"}
                      icon={<ClockCircleOutlined />}
                      onClick={() => handleStatusChange(santri.id, "izin")}
                      block
                      style={{
                        backgroundColor: currentStatus === "izin" ? "#faad14" : undefined,
                        borderColor: "#faad14",
                      }}
                    >
                      Izin
                    </Button>
                    <Button
                      type={currentStatus === "tidak" ? "primary" : "default"}
                      icon={<CloseCircleOutlined />}
                      onClick={() => handleStatusChange(santri.id, "tidak")}
                      block
                      style={{
                        backgroundColor: currentStatus === "tidak" ? "#ff4d4f" : undefined,
                        borderColor: "#ff4d4f",
                      }}
                    >
                      Tidak Hadir
                    </Button>
                  </Space>

                  {currentStatus && (
                    <div style={{ marginTop: 12 }}>
                      Status: {getStatusIcon(currentStatus)}
                    </div>
                  )}
                </Card>
              </Col>
            );
          })}
        </Row>
      </div>
    </LayoutApp>
  );
}