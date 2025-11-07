'use client'

import { useState } from 'react'
import { Modal, Form, Select, DatePicker, Button, Space, Radio, Checkbox, message } from 'antd'
import { DownloadOutlined, FileExcelOutlined, FilePdfOutlined, FileTextOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

const { Option } = Select
const { RangePicker } = DatePicker

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  data: {
    hafalanProgress: any[];
    recentHafalan: any[];
    targets: any[];
    stats: any;
  };
}

export function ExportModal({ open, onClose, data }: Expor