import React from 'react';
import { Card, Avatar, Typography, Tag, Button, Badge } from 'antd';
import {
  UserOutlined,
  EditOutlined,
  CalendarOutlined,
  KeyOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  CheckCircleOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { formatDateLong } from '@/lib/utils/dateLocale';
import { UserProfile } from './profileTypes';
import { RoleInfo, canEditSelfPasscode, canEditPhoto } from './roleInfo';

const { Title, Text, Paragraph } = Typography;

interface ProfileCardProps {
  profile: UserProfile;
  roleInfo: RoleInfo;
  passcodeVisible: boolean;
  onTogglePasscode: () => void;
  onEdit: () => void;
  onLogout: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  roleInfo,
  passcodeVisible,
  onTogglePasscode,
  onEdit,
  onLogout,
}) => {
  const canEditPasscodePermission = canEditSelfPasscode(profile.role);
  const canEditPhotoPermission = canEditPhoto(profile.role);

  return (
    <Card
      style={{
        textAlign: 'center',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}
    >
      <div style={{ position: 'relative', marginBottom: 24 }}>
        <Avatar
          size={120}
          src={profile.foto}
          icon={!profile.foto ? <UserOutlined /> : undefined}
          style={{
            border: `4px solid ${roleInfo.color}`,
            boxShadow: `0 4px 20px ${roleInfo.color}30`
          }}
        />
        <Badge
          count={<CheckCircleOutlined style={{ color: '#219ebc' }} />}
          style={{
            position: 'absolute',
            bottom: 10,
            right: 'calc(50% - 45px)'
          }}
        />
        {!canEditPhotoPermission && (
          <div style={{
            position: 'absolute',
            bottom: -10,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#fff2e8',
            border: '1px solid #ffbb96',
            borderRadius: 4,
            padding: '4px 8px',
            fontSize: 10,
            color: '#ffb703'
          }}>
            Foto dikelola Super Admin
          </div>
        )}
      </div>

      <Title level={3} style={{ marginBottom: 8, color: '#1f2937' }}>
        {profile.namaLengkap}
      </Title>

      <Tag
        color={roleInfo.color}
        icon={roleInfo.icon}
        style={{
          fontSize: 14,
          padding: '6px 16px',
          borderRadius: 20,
          marginBottom: 16
        }}
      >
        {roleInfo.title}
      </Tag>

      <Paragraph
        type="secondary"
        style={{
          fontSize: 14,
          marginBottom: 24,
          lineHeight: 1.6
        }}
      >
        {roleInfo.description}
      </Paragraph>

      {/* Passcode Section with Permission Control */}
      <Card
        size="small"
        style={{
          background: 'transparent',
          border: canEditPasscodePermission
            ? '1px solid #b7eb8f'
            : '1px solid #ffd591',
          marginBottom: 16
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <KeyOutlined style={{
              color: canEditPasscodePermission ? '#219ebc' : '#ffb703'
            }} />
            <Text strong>Passcode:</Text>
            {!canEditPasscodePermission && (
              <Tag color="orange" style={{ fontSize: "12px", padding: "0 8px" }}>View Only</Tag>
            )}
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <Text
              code
              style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: passcodeVisible ? '#1f2937' : 'transparent',
                textShadow: passcodeVisible ? 'none' : '0 0 8px #1f2937',
                userSelect: passcodeVisible ? 'text' : 'none'
              }}
            >
              {profile.username}
            </Text>
            <Button
              type="text"
              size="small"
              icon={passcodeVisible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              onClick={onTogglePasscode}
            />
          </div>
        </div>
        <Text
          type="secondary"
          style={{
            fontSize: 12,
            display: 'block',
            marginTop: 8,
            color: canEditPasscodePermission ? '#023047' : '#d46b08'
          }}
        >
          {canEditPasscodePermission
            ? "Gunakan passcode ini untuk login ke sistem (dapat diedit)"
            : "Gunakan passcode ini untuk login ke sistem (hanya dapat dilihat)"
          }
        </Text>
      </Card>

      {/* Join Date */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 12,
        borderRadius: 8,
        marginBottom: 16
      }}>
        <CalendarOutlined style={{ color: '#219ebc' }} />
        <Text type="secondary">
          Bergabung {formatDateLong(profile.createdAt)}
        </Text>
      </div>

      {/* Edit & Logout Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={onEdit}
          size="large"
          style={{ width: '100%' }}
        >
          Edit Profil
        </Button>
        <Button
          danger
          icon={<LogoutOutlined />}
          onClick={onLogout}
          size="large"
          style={{ width: '100%', borderRadius: 8 }}
        >
          Keluar (Logout)
        </Button>
      </div>
    </Card>
  );
};

export default ProfileCard;
