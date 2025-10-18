"use client";

import { useEffect, useState } from "react";
import {
  Card,
  Select,
  Tabs,
  Row,
  Col,
  Empty,
  Space,
} from "antd";
import LayoutApp from "../../components/LayoutApp";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const { Option } = Select;
const { TabPane } = Tabs;

interface Halaqah {
  id: number;
  namaHalaqah: string;
  jumlahSantri: number;
  santri: Array<{
    id: number;
    namaLengkap: string;
    username: string;
  }>;
}

interface Santri {
  id: number;
  namaLengkap: string;
}

interface HafalanData {
  tanggal: string;
  ziyadah: number;
  murojaah: number;
}

interface AbsensiData {
  minggu: string;
  hadir: number;
  izin: number;
  tidakHadir: number;
}

export default function GrafikPage() {
  const [halaqahList, setHalaqahList] = useState<Halaqah[]>([]);
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [selectedHalaqah, setSelectedHalaqah] = useState<number | null>(null);
  const [selectedSantri, setSelectedSantri] = useState<number | null>(null);
  const [hafalanData, setHafalanData] = useState<HafalanData[]>([]);
  const [absensiData, setAbsensiData] = useState<AbsensiData[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch halaqah milik guru dari dashboard API guru
  const fetchHalaqah = async () => {
    try {
      const res = await fetch("/api/(guru)/dashboard");
      if (res.ok) {
        const data = await res.json();
        setHalaqahList(data.halaqah || []);
        // Auto-select first halaqah if available
        if (data.halaqah && data.halaqah.length > 0 && !selectedHalaqah) {
          setSelectedHalaqah(data.halaqah[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching halaqah:", error);
    }
  };

  // Fetch santri berdasarkan halaqah yang dipilih
  const fetchSantri = async (halaqahId: number) => {
    try {
      // Find santri from halaqah data that was already fetched
      const selectedHalaqahData = halaqahList.find(h => h.id === halaqahId);
      if (selectedHalaqahData && selectedHalaqahData.santri) {
        setSantriList(selectedHalaqahData.santri);
      } else {
        setSantriList([]);
      }
    } catch (error) {
      console.error("Error fetching santri:", error);
      setSantriList([]);
    }
  };

  // Fetch data hafalan untuk grafik
  const fetchHafalanData = async (santriId: number) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/grafik/hafalan?santriId=${santriId}`);
      if (res.ok) {
        const data = await res.json();
        setHafalanData(data);
      }
    } catch (error) {
      console.error("Error fetching hafalan data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data absensi untuk grafik
  const fetchAbsensiData = async (santriId: number) => {
    try {
      const res = await fetch(`/api/grafik/absensi?santriId=${santriId}`);
      if (res.ok) {
        const data = await res.json();
        setAbsensiData(data);
      }
    } catch (error) {
      console.error("Error fetching absensi data:", error);
    }
  };

  useEffect(() => {
    fetchHalaqah();
  }, []);

  useEffect(() => {
    if (selectedHalaqah) {
      fetchSantri(selectedHalaqah);
    }
  }, [selectedHalaqah]);

  useEffect(() => {
    if (selectedSantri) {
      fetchHafalanData(selectedSantri);
      fetchAbsensiData(selectedSantri);
    }
  }, [selectedSantri]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: '#fff',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '4px'
        }}>
          <p>{`Tanggal: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value} ayat`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <LayoutApp>
      <div style={{ padding: "24px 0" }}>
        <h1>Grafik Perkembangan</h1>

        {/* Filter */}
        <Card style={{ marginBottom: 24 }}>
          <Space>
            <Select
              placeholder="Pilih Halaqah"
              style={{ width: 200 }}
              value={selectedHalaqah}
              onChange={(value) => setSelectedHalaqah(value)}
            >
              {halaqahList.map((halaqah) => (
                <Option key={halaqah.id} value={halaqah.id}>
                  {halaqah.namaHalaqah}
                </Option>
              ))}
            </Select>
            <Select
              placeholder="Pilih Santri"
              style={{ width: 300 }}
              value={selectedSantri}
              onChange={(value) => setSelectedSantri(value)}
              disabled={!selectedHalaqah}
            >
              {santriList.map((santri) => (
                <Option key={santri.id} value={santri.id}>
                  {santri.namaLengkap}
                </Option>
              ))}
            </Select>
          </Space>
        </Card>

        {selectedSantri ? (
          <Tabs defaultActiveKey="hafalan" type="card">
            <TabPane tab="Grafik Hafalan" key="hafalan">
              <Card title="Perkembangan Hafalan 7 Hari Terakhir">
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={hafalanData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="tanggal"
                      tickFormatter={(value) => new Date(value).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short'
                      })}
                    />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="ziyadah"
                      stroke="#52c41a"
                      strokeWidth={3}
                      name="Ziyadah"
                      dot={{ fill: '#52c41a', strokeWidth: 2, r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="murojaah"
                      stroke="#1890ff"
                      strokeWidth={3}
                      name="Murojaah"
                      dot={{ fill: '#1890ff', strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </TabPane>

            <TabPane tab="Grafik Absensi" key="absensi">
              <Card title="Absensi 4 Minggu Terakhir">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={absensiData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="minggu" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="hadir" stackId="a" fill="#52c41a" name="Hadir" />
                    <Bar dataKey="izin" stackId="a" fill="#faad14" name="Izin" />
                    <Bar dataKey="tidakHadir" stackId="a" fill="#ff4d4f" name="Tidak Hadir" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </TabPane>
          </Tabs>
        ) : (
          <Card>
            <Empty
              description="Pilih santri untuk melihat grafik perkembangan"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </Card>
        )}
      </div>
    </LayoutApp>
  );
}