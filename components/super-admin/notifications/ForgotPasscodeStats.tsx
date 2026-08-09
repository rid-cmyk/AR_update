import React from "react";
import { Row, Col, Card, Statistic } from "antd";
import { BellOutlined, EyeOutlined, UserOutlined, QuestionCircleOutlined } from "@ant-design/icons";

interface ForgotPasscodeStatsProps {
    stats: {
        total: number;
        unread: number;
        registered: number;
        unregistered: number;
    };
}

export default function ForgotPasscodeStats({ stats }: ForgotPasscodeStatsProps) {
    return (
        <Row gutter={[16, 16]}>
            <Col xs={24} sm={6}>
                <Card>
                    <Statistic
                        title="Total Permintaan"
                        value={stats.total}
                        prefix={<BellOutlined />}
                        valueStyle={{ color: '#219ebc' }}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={6}>
                <Card>
                    <Statistic
                        title="Belum Dibaca"
                        value={stats.unread}
                        prefix={<EyeOutlined />}
                        valueStyle={{ color: '#ffb703' }}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={6}>
                <Card>
                    <Statistic
                        title="User Terdaftar"
                        value={stats.registered}
                        prefix={<UserOutlined />}
                        valueStyle={{ color: '#219ebc' }}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={6}>
                <Card>
                    <Statistic
                        title="Tidak Dikenali"
                        value={stats.unregistered}
                        prefix={<QuestionCircleOutlined />}
                        valueStyle={{ color: '#fb8500' }}
                    />
                </Card>
            </Col>
        </Row>
    );
}
