'use client'

import { ReactNode } from 'react'
import { Row, Col, Typography, Space, Tag } from 'antd'
import { SettingOutlined, ClockCircleOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

interface AdminHeaderCardProps {
  title: string
  subtitle: string
  tags?: Array<{ label: string; icon?: ReactNode; color?: string }>
  actions?: ReactNode
}

export default function AdminHeaderCard({ title, subtitle, tags, actions }: AdminHeaderCardProps) {
  const defaultTags = tags || [
    { label: 'Admin Panel', icon: <SettingOutlined /> },
    { label: 'Online', icon: <ClockCircleOutlined /> }
  ]

  return (
    <div style={{
      marginBottom: 32,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: 20,
      padding: '32px 40px',
      color: 'white',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: -50,
        right: -50,
        width: 200,
        height: 200,
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '50%',
        filter: 'blur(40px)'
      }} />
      <div style={{
        position: 'absolute',
        bottom: -30,
        left: -30,
        width: 150,
        height: 150,
        background: 'rgba(255, 255, 255, 0.08)',
        borderRadius: '50%',
        filter: 'blur(30px)'
      }} />

      <Row align="middle" justify="space-between">
        <Col>
          <Space direction="vertical" size={4}>
            <Title level={2} style={{
              color: 'white',
              margin: 0,
              fontSize: 28,
              fontWeight: 700
            }}>
              {title}
            </Title>
            <Text style={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: 16,
              fontWeight: 400
            }}>
              {subtitle}
            </Text>
            <Space style={{ marginTop: 8 }}>
              {defaultTags.map((tag, index) => (
                <Tag
                  key={index}
                  icon={tag.icon}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: 'white',
                    borderRadius: 20,
                    padding: '4px 12px'
                  }}
                >
                  {tag.label}
                </Tag>
              ))}
            </Space>
          </Space>
        </Col>
        {actions && (
          <Col>
            <Space size="middle">
              {actions}
            </Space>
          </Col>
        )}
      </Row>
    </div>
  )
}
