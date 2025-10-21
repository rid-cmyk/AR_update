"use client";

import { Card, Form, Input, Button, DatePicker, message, Space, Select } from "antd";
import { SaveOutlined, CalendarOutlined } from "@ant-design/icons";
import LayoutApp from "@/components/layout/LayoutApp";
import dayjs from "dayjs";

const { Option } = Select;
const { RangePicker } = DatePicker;

export default function TahunAjaranSettings() {
  const [form] = Form.useForm();

  const handleSave = async (values: any) => {
    try {
      // Here you would save to database or API
      console.log("Saving tahun ajaran settings:", values);
      message.success("Tahun Ajaran settings saved successfully");
    } catch (error) {
      message.error("Failed to save settings");
    }
  };

  return (
    <LayoutApp>
      <div style={{ padding: "24px 0" }}>
        <h1>Tahun Ajaran Settings</h1>
        <Card title="Academic Year Configuration" style={{ marginTop: 16 }}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
            initialValues={{
              currentYear: "2024/2025",
              semester: "S1",
              startDate: dayjs(),
              endDate: dayjs().add(1, 'year'),
            }}
          >
            <Form.Item
              label="Current Academic Year"
              name="currentYear"
              rules={[{ required: true, message: "Please enter academic year" }]}
            >
              <Input placeholder="e.g., 2024/2025" />
            </Form.Item>

            <Form.Item
              label="Current Semester"
              name="semester"
              rules={[{ required: true, message: "Please select semester" }]}
            >
              <Select placeholder="Select semester">
                <Option value="S1">Semester 1</Option>
                <Option value="S2">Semester 2</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Academic Year Period"
              name="period"
              rules={[{ required: true, message: "Please select the academic year period" }]}
            >
              <RangePicker
                style={{ width: '100%' }}
                placeholder={['Start Date', 'End Date']}
              />
            </Form.Item>

            <Form.Item
              label="School Year Description"
              name="description"
            >
              <Input.TextArea
                rows={3}
                placeholder="Enter description for this academic year"
              />
            </Form.Item>

            <Form.Item
              label="Maximum Students per Class"
              name="maxStudents"
            >
              <Input type="number" placeholder="Enter maximum students per class" />
            </Form.Item>

            <Form.Item
              label="Hafalan Target (Pages)"
              name="hafalanTarget"
            >
              <Input type="number" placeholder="Enter hafalan target in pages" />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                  Save Settings
                </Button>
                <Button>Reset to Default</Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </LayoutApp>
  );
}