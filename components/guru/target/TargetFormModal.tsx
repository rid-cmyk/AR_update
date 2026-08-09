import React from "react";
import { Modal, Form, Select, Input, DatePicker, Row, Col, Divider, Button } from "antd";
import { UserOutlined, BookOutlined } from "@ant-design/icons";
import WebSideDrawer from "@/components/ui/WebSideDrawer";
import type { FormInstance } from "antd";

const { Option } = Select;

interface Santri {
  id: number;
  namaLengkap: string;
  username: string;
}

interface TargetFormModalProps {
  isModalOpen: boolean;
  closeModal: () => void;
  form: FormInstance;
  santriList: Santri[];
  suratList: any[];
  editingTarget: any;
  handleSaveTarget: () => void;
}

export default function TargetFormModal({
  isModalOpen,
  closeModal,
  form,
  santriList,
  suratList,
  editingTarget,
  handleSaveTarget,
}: TargetFormModalProps) {
  const renderTargetFormContent = () => (
    <>
      <Divider />
      <Form form={form} layout="vertical" className="space-y-4">
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label={
                <span className="flex items-center gap-2 font-medium text-gray-700">
                  <UserOutlined className="text-blue-500" />
                  Pilih Santri
                </span>
              }
              name="santriId"
              rules={[{ required: true, message: "Pilih santri terlebih dahulu" }]}
            >
              <Select 
                placeholder="🔍 Cari dan pilih santri dari halaqah Anda"
                size="large"
                showSearch
                filterOption={(input, option) =>
                  (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {santriList.map((santri) => (
                  <Option key={santri.id} value={santri.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {santri.namaLengkap[0]}
                      </div>
                      <span>{santri.namaLengkap}</span>
                      <span className="text-gray-400 text-sm">@{santri.username}</span>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={16}>
            <Form.Item
              label={
                <span className="flex items-center gap-2 font-medium text-gray-700">
                  <BookOutlined className="text-green-500" />
                  Surat Target
                </span>
              }
              name="surat"
              rules={[{ required: true, message: "Pilih surat target" }]}
            >
              <Select
                placeholder="📖 Pilih surat yang akan dihafal"
                size="large"
                showSearch
                filterOption={(input, option) =>
                  (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {suratList.map((surat) => (
                  <Option key={surat.nomor} value={surat.namaLatin}>
                    <div className="flex justify-between items-center">
                      <span>{surat.nomor}. {surat.namaLatin}</span>
                      <span className="text-gray-400 text-sm">({surat.jumlahAyat} ayat)</span>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={
                <span className="flex items-center gap-2 font-medium text-gray-700">
                  📊 Jumlah Ayat
                </span>
              }
              name="ayatTarget"
              rules={[{ required: true, message: "Masukkan jumlah ayat" }]}
            >
              <Input 
                type="number" 
                min={1} 
                size="large"
                placeholder="Contoh: 10"
                suffix="ayat"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={
                <span className="flex items-center gap-2 font-medium text-gray-700">
                  📅 Deadline Target
                </span>
              }
              name="deadline"
              rules={[{ required: true, message: "Pilih deadline target" }]}
            >
              <DatePicker 
                size="large"
                style={{ width: '100%' }}
                placeholder="Pilih tanggal deadline"
                format="DD MMMM YYYY"
              />
            </Form.Item>
          </Col>
          {editingTarget && (
            <Col span={12}>
              <Form.Item
                label={
                  <span className="flex items-center gap-2 font-medium text-gray-700">
                    🏷️ Status Target
                  </span>
                }
                name="status"
              >
                <Select placeholder="Pilih status target" size="large">
                  <Option value="belum">
                    <span className="flex items-center gap-2">
                      ⏳ <span>Belum Dimulai</span>
                    </span>
                  </Option>
                  <Option value="proses">
                    <span className="flex items-center gap-2">
                      🔄 <span>Sedang Proses</span>
                    </span>
                  </Option>
                  <Option value="selesai">
                    <span className="flex items-center gap-2">
                      ✅ <span>Selesai</span>
                    </span>
                  </Option>
                </Select>
              </Form.Item>
            </Col>
          )}
        </Row>

        {!editingTarget && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <div className="flex items-start gap-3">
              <div className="text-blue-500 text-lg">💡</div>
              <div>
                <div className="font-medium text-blue-800 mb-1">Tips Membuat Target:</div>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Pilih target yang realistis sesuai kemampuan santri</li>
                  <li>• Berikan deadline yang cukup untuk menghafal dengan baik</li>
                  <li>• Monitor progress secara berkala</li>
                </ul>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-end gap-2 mt-6">
          <Button onClick={closeModal}>❌ Batal</Button>
          <Button type="primary" onClick={handleSaveTarget}>💾 Simpan Target</Button>
        </div>
      </Form>
    </>
  );

  return (
    <>
      {/* Mobile Modal (< 1024px) */}
      <Modal
        title={
          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center">
              <span className="text-white text-lg">🎯</span>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-800">
                {editingTarget ? "Edit Target Hafalan" : "Tambah Target Hafalan"}
              </div>
              <div className="text-sm text-gray-500">
                {editingTarget ? "Perbarui target hafalan santri" : "Buat target hafalan baru untuk santri"}
              </div>
            </div>
          </div>
        }
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
        width={600}
        className="custom-modal lg:hidden"
      >
        {renderTargetFormContent()}
      </Modal>

      {/* Desktop WebSideDrawer (>= 1024px) */}
      <WebSideDrawer
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingTarget ? "Edit Target Hafalan" : "Buat Target Hafalan Baru"}
        subtitle="Atur capaian juz target, deadline selesai, dan catatan khusus penghafalan"
        size="md"
      >
        {renderTargetFormContent()}
      </WebSideDrawer>
    </>
  );
}
