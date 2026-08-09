 
"use client";

import { useState } from "react";
import {
    Row,
    Col,
    Card,
    Button,
    Modal,
    Form,
    Space,
    message,
    Table,
    TimePicker,
    Typography,
    Tag,
} from "antd";
import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";
import WebSideDrawer from "@/components/ui/WebSideDrawer";
import { useJadwal, getHariColor } from "@/hooks/useJadwal";
import {
    EditOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    TeamOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

interface Jadwal {
    id: number;
    hari: string;
    jamMulai: Date | string;
    jamSelesai: Date | string;
    halaqah: {
        id: number;
        namaHalaqah: string;
        jumlahSantri: number;
        santri: Array<{
            id: number;
            namaLengkap: string;
        }>;
    };
}

export default function GuruJadwalPage() {
    const { jadwal, loading, refetch } = useJadwal<Jadwal>({ endpoint: "/api/guru/jadwal" });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingJadwal, setEditingJadwal] = useState<Jadwal | null>(null);
    const [form] = Form.useForm();

    // Update jadwal (hanya jam)
    const openModal = (jadwal: Jadwal) => {
        setEditingJadwal(jadwal);
        form.setFieldsValue({
            jamMulai: dayjs(jadwal.jamMulai),
            jamSelesai: dayjs(jadwal.jamSelesai),
        });
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                jadwalId: editingJadwal?.id,
                jamMulai: values.jamMulai.format("HH:mm:ss"),
                jamSelesai: values.jamSelesai.format("HH:mm:ss"),
            };

            const res = await fetch("/api/guru/jadwal", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                let errorData;
                try {
                    errorData = await res.json();
                } catch {
                    errorData = { error: `Server error (${res.status})` };
                }
                throw new Error(errorData.error || `Failed to update jadwal (${res.status})`);
            }

            await res.json();
            message.success("Jadwal berhasil diperbarui");
            setIsModalOpen(false);
            form.resetFields();
            refetch();
        } catch (error: any) {
            console.error("Error updating jadwal:", error);
            message.error(error.message || "Error updating jadwal");
        }
    };

    const columns = [
        {
            title: "Halaqah",
            dataIndex: "halaqah",
            key: "halaqah",
            render: (halaqah: any) => (
                <div>
                    <div style={{ fontWeight: 'bold' }}>{halaqah.namaHalaqah}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                        {halaqah.jumlahSantri} santri
                    </div>
                </div>
            ),
        },
        {
            title: "Hari",
            dataIndex: "hari",
            key: "hari",
            render: (hari: string) => (
                <Tag color={getHariColor(hari)}>{hari}</Tag>
            ),
        },
        {
            title: "Waktu",
            key: "waktu",
            render: (_: unknown, record: Jadwal) => (
                <div>
                    <div style={{ fontWeight: 'bold' }}>
                        {dayjs(record.jamMulai).format("HH:mm")} - {dayjs(record.jamSelesai).format("HH:mm")}
                    </div>
                </div>
            ),
        },
        {
            title: "Actions",
            key: "actions",
            width: 120,
            render: (_: unknown, record: Jadwal) => (
                <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => openModal(record)}
                    size="small"
                >
                    Edit Waktu
                </Button>
            ),
        },
    ];

    const todaySchedule = jadwal.filter(j => j.hari === dayjs().format('dddd'));

    return (
        <>
            <div style={{ padding: "24px 0" }}>
                <AdminHeaderCard
                    title="Jadwal Mengajar"
                    subtitle="Kelola jadwal mengajar halaqah Anda"
                />

                {/* Statistics Cards */}
                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                    <Col xs={24} sm={12} md={8}>
                        <Card>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <CalendarOutlined style={{ fontSize: '24px', color: '#219ebc', marginRight: 12 }} />
                                <div>
                                    <div style={{ fontSize: '14px', color: '#666' }}>Total Jadwal</div>
                                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#219ebc' }}>
                                        {jadwal.length}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Card>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <ClockCircleOutlined style={{ fontSize: '24px', color: '#219ebc', marginRight: 12 }} />
                                <div>
                                    <div style={{ fontSize: '14px', color: '#666' }}>Hari Ini</div>
                                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#219ebc' }}>
                                        {todaySchedule.length}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Card>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <TeamOutlined style={{ fontSize: '24px', color: '#8ecae6', marginRight: 12 }} />
                                <div>
                                    <div style={{ fontSize: '14px', color: '#666' }}>Total Santri</div>
                                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8ecae6' }}>
                                        {jadwal.reduce((sum, j) => sum + j.halaqah.jumlahSantri, 0)}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>

                {/* Today's Schedule */}
                {todaySchedule.length > 0 && (
                    <Card title="Jadwal Hari Ini" style={{ marginBottom: 24 }}>
                        <Row gutter={[16, 16]}>
                            {todaySchedule.map((j) => (
                                <Col xs={24} sm={12} md={8} key={j.id}>
                                    <Card size="small" style={{ backgroundColor: '#f6ffed', border: '1px solid #b7eb8f' }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                                                {j.halaqah.namaHalaqah}
                                            </div>
                                            <div style={{ color: '#666', margin: '8px 0' }}>
                                                {dayjs(j.jamMulai).format("HH:mm")} - {dayjs(j.jamSelesai).format("HH:mm")}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#666' }}>
                                                {j.halaqah.jumlahSantri} santri
                                            </div>
                                        </div>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </Card>
                )}

                {/* Main Content */}
                <Card title="Semua Jadwal">
                    <Table
                        dataSource={jadwal}
                        columns={columns}
                        rowKey="id"
                        loading={loading}
                        size="small"
                        scroll={{ x: 600 }}
                        pagination={{ pageSize: 10 }}
                    />
                </Card>

                {/* Zero Code Duplication Helper for Jadwal Form */}
                {(() => {
                    const renderJadwalFormContent = () => (
                        <>
                            {editingJadwal && (
                                <div style={{ marginBottom: 16 }}>
                                    <Typography.Text strong>Halaqah: </Typography.Text>
                                    <Typography.Text>{editingJadwal.halaqah.namaHalaqah}</Typography.Text>
                                    <br />
                                    <Typography.Text strong>Hari: </Typography.Text>
                                    <Tag color={getHariColor(editingJadwal.hari)}>{editingJadwal.hari}</Tag>
                                </div>
                            )}

                            <Form form={form} layout="vertical" size="large">
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            label="Jam Mulai"
                                            name="jamMulai"
                                            rules={[{ required: true, message: "Please select start time" }]}
                                        >
                                            <TimePicker
                                                format="HH:mm"
                                                placeholder="Start time"
                                                style={{ width: '100%' }}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            label="Jam Selesai"
                                            name="jamSelesai"
                                            rules={[{ required: true, message: "Please select end time" }]}
                                        >
                                            <TimePicker
                                                format="HH:mm"
                                                placeholder="End time"
                                                style={{ width: '100%' }}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Form>
                        </>
                    );

                    return (
                        <>
                            {/* Mobile Modal (< 1024px) */}
                            <Modal
                                title={
                                    <Space>
                                        <ClockCircleOutlined />
                                        Edit Waktu Jadwal
                                    </Space>
                                }
                                open={isModalOpen}
                                onCancel={() => setIsModalOpen(false)}
                                onOk={handleSave}
                                okText="Simpan"
                                cancelText="Batal"
                                width={500}
                                className="lg:hidden"
                            >
                                {renderJadwalFormContent()}
                            </Modal>

                            {/* Desktop WebSideDrawer (>= 1024px) */}
                            <WebSideDrawer
                                isOpen={isModalOpen}
                                onClose={() => setIsModalOpen(false)}
                                title="Edit Waktu Jadwal"
                                subtitle="Atur jam mulai dan jam selesai halaqah untuk hari terpilih"
                                size="sm"
                                footer={
                                    <div className="flex justify-end gap-2">
                                        <Button onClick={() => setIsModalOpen(false)}>Batal</Button>
                                        <Button type="primary" onClick={handleSave}>Simpan</Button>
                                    </div>
                                }
                            >
                                {renderJadwalFormContent()}
                            </WebSideDrawer>
                        </>
                    );
                })()}
            </div>
        </>
    );
}