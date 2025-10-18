"use client";

import { Card, Form, Input, Button, message, Select, Upload, Space } from "antd";
import { UploadOutlined, SaveOutlined } from "@ant-design/icons";
import LayoutApp from "../../../components/LayoutApp";

const { TextArea } = Input;
const { Option } = Select;

export default function RaportSettings() {
  const [form] = Form.useForm();

  const handleSave = async (values: any) => {
    try {
      // Here you would save to database or API
      console.log("Saving raport settings:", values);
      message.success("Raport settings saved successfully");
    } catch (error) {
      message.error("Failed to save settings");
    }
  };

  const uploadProps = {
    name: "file",
    action: "/api/upload", // Replace with your upload endpoint
    onChange(info: any) {
      if (info.file.status === "done") {
        message.success(`${info.file.name} uploaded successfully`);
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} upload failed.`);
      }
    },
  };

  return (
    <LayoutApp>
      <div style={{ padding: "24px 0" }}>
        <h1>Raport Settings</h1>
        <Card title="Raport Configuration" style={{ marginTop: 16 }}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
            initialValues={{
              templateType: "standard",
              headerText: "Laporan Hasil Belajar",
              footerText: "Approved by: ________________",
            }}
          >
            <Form.Item
              label="Raport Template Type"
              name="templateType"
              rules={[{ required: true, message: "Please select template type" }]}
            >
              <Select placeholder="Select template type">
                <Option value="standard">Standard Template</Option>
                <Option value="custom">Custom Template</Option>
                <Option value="minimal">Minimal Template</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Header Text"
              name="headerText"
              rules={[{ required: true, message: "Please enter header text" }]}
            >
              <Input placeholder="Enter raport header text" />
            </Form.Item>

            <Form.Item
              label="Footer Text"
              name="footerText"
            >
              <Input placeholder="Enter raport footer text" />
            </Form.Item>

            <Form.Item
              label="School Logo"
              name="logo"
            >
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />}>Upload Logo</Button>
              </Upload>
            </Form.Item>

            <Form.Item
              label="Additional Notes"
              name="notes"
            >
              <TextArea
                rows={4}
                placeholder="Enter any additional notes for raport generation"
              />
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