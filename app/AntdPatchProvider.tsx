'use client';
import '@ant-design/v5-patch-for-react-19';

export default function AntdPatchProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}