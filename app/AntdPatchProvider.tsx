'use client';
import '@ant-design/v5-patch-for-react-19';
import { ConfigProvider } from 'antd';

export default function AntdPatchProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#219ebc',
          colorInfo: '#8ecae6',
          colorWarning: '#ffb703',
          colorError: '#fb8500',
          colorTextHeading: '#023047',
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}