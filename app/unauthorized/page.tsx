"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Button, 
  Typography, 
  Progress, 
  Card, 
  Space,
  Row,
  Col,
  Alert,
  Statistic,
  Divider
} from "antd";
import { 
  ExclamationCircleOutlined, 
  LoginOutlined, 
  ArrowLeftOutlined,
  SecurityScanOutlined,
  LockOutlined,
  ClockCircleOutlined,
  RocketOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;

export default function UnauthorizedPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const countdownTimer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push('/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownTimer);
  }, [router]);

  const progressPercent = ((5 - countdown) / 5) * 100;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px"
      }}
    >
      {/* Animated Background Elements */}
      <div style={{
        position: "absolute",
        top: "10%",
        right: "10%",
        width: "300px",
        height: "300px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
        animation: "pulse 4s ease-in-out infinite alternate",
      }} />
      
      <div style={{
        position: "absolute",
        bottom: "15%",
        left: "5%",
        width: "200px",
        height: "200px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)",
        animation: "pulse 3s ease-in-out infinite alternate-reverse",
      }} />

      {/* Floating Particles */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: `${Math.random() * 60 + 20}px`,
            height: `${Math.random() * 60 + 20}px`,
            background: `rgba(255, 255, 255, ${Math.random() * 0.1 + 0.05})`,
            borderRadius: "50%",
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`
          }}
        />
      ))}

      <Row justify="center" style={{ width: "100%", maxWidth: "1200px" }}>
        <Col xs={24} lg={12}>
          <Card
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "24px",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)",
              overflow: "hidden",
              position: "relative"
            }}
            bodyStyle={{ padding: "40px" }}
          >
            {/* Header Section */}
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <div
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #ff6b6b, #ffa726)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 24px auto",
                  boxShadow: "0 8px 32px rgba(255, 107, 107, 0.3)"
                }}
              >
                <LockOutlined
                  style={{
                    fontSize: "42px",
                    color: "#fff",
                  }}
                />
              </div>

              <Title level={1} style={{ 
                marginBottom: "12px",
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontSize: "36px",
                fontWeight: "800"
              }}>
                Akses Dibatasi
              </Title>

              <Text style={{ 
                fontSize: "18px",
                color: "#666",
                display: "block",
                marginBottom: "8px"
              }}>
                Oops! Anda tidak memiliki izin untuk mengakses halaman ini
              </Text>

              <Text type="secondary" style={{ fontSize: "16px" }}>
                Silakan gunakan akun dengan hak akses yang sesuai
              </Text>
            </div>

            {/* Statistics Row */}
            <Row gutter={[16, 16]} style={{ marginBottom: "32px" }}>
              <Col xs={8}>
                <Statistic
                  title="Level Akses"
                  value="Terbatas"
                  prefix={<SecurityScanOutlined />}
                  valueStyle={{ color: "#ff4d4f", fontSize: "16px" }}
                />
              </Col>
              <Col xs={8}>
                <Statistic
                  title="Redirect Dalam"
                  value={countdown}
                  suffix="detik"
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: "#1890ff", fontSize: "16px" }}
                />
              </Col>
              <Col xs={8}>
                <Statistic
                  title="Status Sistem"
                  value="Aman"
                  prefix={<RocketOutlined />}
                  valueStyle={{ color: "#52c41a", fontSize: "16px" }}
                />
              </Col>
            </Row>

            {/* Progress Section */}
            <Card
              size="small"
              style={{
                background: "linear-gradient(135deg, #f8f9ff, #f0f2ff)",
                border: "1px solid #e6f7ff",
                marginBottom: "24px"
              }}
            >
              <Space direction="vertical" style={{ width: "100%" }} size="small">
                <Text strong style={{ fontSize: "14px" }}>
                  ⏱️ Redirect otomatis menuju halaman login...
                </Text>
                <Progress 
                  percent={progressPercent} 
                  showInfo={false}
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                  trailColor="#f0f0f0"
                />
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  {countdown} detik tersisa sebelum redirect otomatis
                </Text>
              </Space>
            </Card>

            {/* Alert Information */}
            <Alert
              message="Informasi Keamanan"
              description="Halaman ini memerlukan hak akses khusus. Pastikan Anda login dengan akun yang memiliki wewenang untuk melanjutkan."
              type="warning"
              showIcon
              icon={<ExclamationCircleOutlined />}
              style={{ marginBottom: "24px" }}
            />

            <Divider />

            {/* Action Buttons */}
            <Space 
              direction="vertical" 
              style={{ width: "100%" }} 
              size="large"
            >
              <Button
                type="primary"
                size="large"
                icon={<LoginOutlined />}
                onClick={() => router.push('/login')}
                style={{
                  height: "50px",
                  fontSize: "16px",
                  fontWeight: "600",
                  background: "linear-gradient(135deg, #667eea, #764ba2)",
                  border: "none",
                  borderRadius: "12px",
                  boxShadow: "0 4px 16px rgba(102, 126, 234, 0.3)",
                  width: "100%"
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                🚀 Login dengan Akun Berwenang
              </Button>

              <Button
                size="large"
                icon={<ArrowLeftOutlined />}
                onClick={() => router.back()}
                style={{
                  height: "50px",
                  fontSize: "16px",
                  fontWeight: "500",
                  borderColor: "#d9d9d9",
                  borderRadius: "12px",
                  width: "100%"
                }}
              >
                ↩️ Kembali ke Halaman Sebelumnya
              </Button>
            </Space>

            {/* Footer */}
            <div style={{ 
              textAlign: "center", 
              marginTop: "32px",
              padding: "16px",
              background: "linear-gradient(135deg, #f8f9ff, #f0f2ff)",
              borderRadius: "12px",
              border: "1px solid #f0f0f0"
            }}>
              <Space direction="vertical" size="small">
                <Text strong style={{ fontSize: "14px", color: "#1890ff" }}>
                  🔐 Sistem AR-Hafalan v2.0
                </Text>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  Platform Manajemen Hafalan Quran Digital
                </Text>
                <Text type="secondary" style={{ fontSize: "11px" }}>
                  Hak akses terbatas untuk menjaga keamanan data
                </Text>
              </Space>
            </div>
          </Card>
        </Col>

        {/* Right Side - Information Panel */}
        <Col xs={24} lg={8} style={{ paddingLeft: "24px" }}>
          <Space direction="vertical" style={{ width: "100%" }} size="large">
            {/* Security Tips Card */}
            <Card
              title={
                <Space>
                  <SecurityScanOutlined />
                  <span>Tips Keamanan</span>
                </Space>
              }
              style={{
                background: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(10px)",
                borderRadius: "16px"
              }}
            >
              <Space direction="vertical" size="middle">
                <div>
                  <Text strong>🔒 Gunakan Akun Resmi</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    Pastikan menggunakan akun yang telah terdaftar dan diverifikasi
                  </Text>
                </div>
                <div>
                  <Text strong>👥 Hubungi Admin</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    Jika membutuhkan akses tambahan, hubungi administrator sistem
                  </Text>
                </div>
                <div>
                  <Text strong>📧 Lapor Masalah</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    Laporkan masalah akses ke tim technical support
                  </Text>
                </div>
              </Space>
            </Card>

            {/* Quick Actions Card */}
            <Card
              title={
                <Space>
                  <RocketOutlined />
                  <span>Quick Actions</span>
                </Space>
              }
              style={{
                background: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(10px)",
                borderRadius: "16px"
              }}
            >
              <Space direction="vertical" style={{ width: "100%" }} size="small">
                <Button 
                  type="link" 
                  style={{ padding: "0", justifyContent: "start" }}
                  onClick={() => router.push('/forgot-password')}
                >
                  🔑 Lupa Password?
                </Button>
                <Button 
                  type="link" 
                  style={{ padding: "0", justifyContent: "start" }}
                  onClick={() => router.push('/support')}
                >
                  💬 Bantuan Teknis
                </Button>
                <Button 
                  type="link" 
                  style={{ padding: "0", justifyContent: "start" }}
                  onClick={() => router.push('/documentation')}
                >
                  📚 Dokumentasi Sistem
                </Button>
              </Space>
            </Card>

            {/* System Status Card */}
            <Card
              title="Status Sistem"
              style={{
                background: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(10px)",
                borderRadius: "16px"
              }}
            >
              <Space direction="vertical" style={{ width: "100%" }} size="small">
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Text>Authentication</Text>
                  <Text type="success" strong>Aktif</Text>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Text>Security</Text>
                  <Text type="success" strong>Optimal</Text>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Text>Server</Text>
                  <Text type="success" strong>Online</Text>
                </div>
              </Space>
            </Card>
          </Space>
        </Col>
      </Row>

      {/* Global Styles */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
          }
          50% { 
            transform: translateY(-20px) rotate(180deg); 
          }
        }
        
        @keyframes pulse {
          0% { 
            opacity: 0.6; 
            transform: scale(1);
          }
          100% { 
            opacity: 0.8; 
            transform: scale(1.1);
          }
        }

        body {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }
      `}</style>
    </div>
  );
}