import { Button, Popconfirm, Space, Tag } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { Hafalan } from "@/lib/utils/hafalanUtils";

interface GetHafalanColumnsOptions {
  onEdit: (hafalan: Hafalan) => void;
  onDelete: (id: number) => void;
}

export const getHafalanColumns = ({ onEdit, onDelete }: GetHafalanColumnsOptions) => [
  {
    title: "Nama Santri",
    key: "santri",
    render: (record: Hafalan) => {
      // Handle missing santri data
      if (!record.santri || !record.santri.namaLengkap) {
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold">
              ?
            </div>
            <div>
              <div className="font-semibold text-gray-800">Data Santri Tidak Ditemukan</div>
              <div className="text-sm text-red-500">ID: {record.santriId || 'Unknown'}</div>
            </div>
          </div>
        );
      }

      return (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
            {record.santri.namaLengkap[0]}
          </div>
          <div>
            <div className="font-semibold text-gray-800">{record.santri.namaLengkap}</div>
            <div className="text-sm text-gray-500">@{record.santri.username || 'No username'}</div>
          </div>
        </div>
      );
    },
  },
  {
    title: "Surat & Ayat",
    key: "surat",
    render: (record: Hafalan) => (
      <div>
        <div className="font-medium text-gray-800">{record.surat}</div>
        <div className="text-sm text-gray-500">Ayat {record.ayatMulai}–{record.ayatSelesai}</div>
      </div>
    ),
  },
  {
    title: "Jenis Hafalan",
    dataIndex: "status",
    key: "status",
    render: (status: string) => (
      <Tag
        color={status === 'ziyadah' ? 'green' : 'blue'}
        className="px-3 py-1 rounded-full font-medium"
      >
        {status === 'ziyadah' ? '📚 Ziyadah' : '🔄 Murojaah'}
      </Tag>
    ),
  },
  {
    title: "Tanggal Input",
    dataIndex: "tanggal",
    key: "tanggal",
    render: (tanggal: string) => (
      <div className="text-sm">
        <div className="font-medium">{dayjs(tanggal).format('DD MMM YYYY')}</div>
        <div className="text-gray-500">{dayjs(tanggal).format('HH:mm')}</div>
      </div>
    ),
  },
  {
    title: "Aksi",
    key: "actions",
    render: (record: Hafalan) => (
      <Space>
        <Button
          type="text"
          icon={<EditOutlined className="text-emerald-500" />}
          onClick={() => onEdit(record)}
          className="text-blue-600 hover:bg-blue-50"
        />
        <Popconfirm
          title="Hapus data hafalan?"
          onConfirm={() => onDelete(record.id)}
          okText="Ya"
          cancelText="Batal"
        >
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            className="text-red-600 hover:bg-red-50"
          />
        </Popconfirm>
      </Space>
    ),
  },
];
