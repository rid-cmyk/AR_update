"use client";

import { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Form,
  Input,
  Space,
  message,
  Divider,
  Typography,
  Switch,
} from "antd";
import {
  SettingOutlined,
  SaveOutlined,
  DatabaseOutlined,
  LockOutlined,
} from "@ant-design/icons";
import LayoutApp from "@/components/layout/LayoutApp";

interface Settings {
  appName: string;
  appDescription: string;
  contactEmail: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    appName: "Ar-Hapalan",
    appDescription: "Islamic Education Management System",
    contactEmail: "admin@arhapalan.com",
    maintenanceMode: false,
    allowRegistration: true,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  // Fetch settings
  const fetchSettings = async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch from an API
      // For now, we'll use local state
      form.setFieldsValue(settings);
    } catch (error: any) {
      console.error("Error fetching settings:", error);
      message.error("Error fetching settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Save settings
  const handleSave = async () => {
    try {
      setSaving(true);
      const values = await form.validateFields();

      // In a real app, this would save to an API
      setSettings(values);
      message.success("Settings saved successfully");

      console.log("Settings saved:", values);
    } catch (error: any) {
      console.error("Error saving settings:", error);
      message.error("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <LayoutApp>
      <div style={{ padding: "24px 0" }}>
        <div style={{ marginBottom: 24 }}>
          <h1>System Settings</h1>
          <p style={{ margin: 0, color: "#666" }}>
            Configure system-wide settings and preferences
          </p>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <SettingOutlined style={{ fontSize: '24px', color: '#1890ff', marginRight: 12 }} />
                <div>
                  <div style={{ fontSize: '14px', color: '#666' }}>System Status</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: "#52c41a" }}>
                    Online
                  </div>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <DatabaseOutlined style={{ fontSize: '24px', color: '#52c41a', marginRight: 12 }} />
                <div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Database</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: "#52c41a" }}>
                    Healthy
                  </div>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <LockOutlined style={{ fontSize: '24px', color: '#722ed1', marginRight: 12 }} />
                <div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Security</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: "#52c41a" }}>
                    Active
                  </div>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <SettingOutlined style={{ fontSize: '24px', color: '#fa8c16', marginRight: 12 }} />
                <div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Last Backup</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: "#52c41a" }}>
                    Today
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Settings Form */}
        <Card
          title="General Settings"
          extra={
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={saving}
            >
              Save Settings
            </Button>
          }
        >
          <Form
            form={form}
            layout="vertical"
            size="large"
            initialValues={settings}
          >
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Application Name"
                  name="appName"
                  rules={[{ required: true, message: "Please enter application name" }]}
                >
                  <Input placeholder="Enter application name" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Contact Email"
                  name="contactEmail"
                  rules={[
                    { required: true, message: "Please enter contact email" },
                    { type: 'email', message: "Please enter a valid email" }
                  ]}
                >
                  <Input placeholder="Enter contact email" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Application Description"
              name="appDescription"
              rules={[{ required: true, message: "Please enter application description" }]}
            >
              <Input.TextArea
                placeholder="Enter application description"
                rows={3}
              />
            </Form.Item>

            <Divider />

            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Maintenance Mode"
                  name="maintenanceMode"
                  valuePropName="checked"
                >
                  <div>
                    <Switch />
                    <Typography.Text style={{ marginLeft: 8, color: '#666' }}>
                      Enable maintenance mode (users cannot access the system)
                    </Typography.Text>
                  </div>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Allow Registration"
                  name="allowRegistration"
                  valuePropName="checked"
                >
                  <div>
                    <Switch defaultChecked />
                    <Typography.Text style={{ marginLeft: 8, color: '#666' }}>
                      Allow new user registrations
                    </Typography.Text>
                  </div>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>

        {/* System Information */}
        <Card title="System Information" style={{ marginTop: 24 }}>
          <Row gutter={24}>
            <Col xs={24} md={8}>
              <div style={{ marginBottom: 16 }}>
                <Typography.Text strong>Version:</Typography.Text>
                <br />
                <Typography.Text type="secondary">1.0.0</Typography.Text>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div style={{ marginBottom: 16 }}>
                <Typography.Text strong>Environment:</Typography.Text>
                <br />
                <Typography.Text type="secondary">Production</Typography.Text>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div style={{ marginBottom: 16 }}>
                <Typography.Text strong>Last Updated:</Typography.Text>
                <br />
                <Typography.Text type="secondary">{new Date().toLocaleDateString()}</Typography.Text>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </LayoutApp>
  );
}