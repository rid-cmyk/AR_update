"use client";

import { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Statistic,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Popconfirm,
  message,
  notification,
  Select,
  Table,
  Tabs,
  Checkbox,
  Divider,
  Typography,
} from "antd";
import {
  UserOutlined,
  TeamOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useMediaQuery } from "react-responsive";
import LayoutApp from "@/components/layout/LayoutApp";
import PasscodeInput from "@/components/auth/PasscodeInput";

interface Role {
  id: number;
  name: string;
  userCount?: number;
}

interface User {
  id: number;
  username: string;
  namaLengkap: string;
  noTlp?: string;
  role: Role;
  assignedSantris?: User[];
}

interface Santri {
  id: number;
  username: string;
  namaLengkap: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchName, setSearchName] = useState<string>("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string | null>(null);

  // Fetch data
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      message.error("Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await fetch("/api/roles");
      if (!res.ok) throw new Error("Failed to fetch roles");
      const data = await res.json();
      setRoles(data);
    } catch (error: any) {
      console.error("Error fetching roles:", error);
      message.error("Error fetching roles");
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  // Get filtered users based on selected role filter and search name
  const getFilteredUsers = () => {
    let filteredUsers = users;
    
    // Filter by role if selected
    if (selectedRoleFilter) {
      filteredUsers = filteredUsers.filter((user) => 
        user.role.name.toLowerCase() === selectedRoleFilter.toLowerCase()
      );
    }
    
    // Filter by name if search term exists
    if (searchName.trim()) {
      filteredUsers = filteredUsers.filter((user) =>
        user.namaLengkap.toLowerCase().includes(searchName.toLowerCase()) ||
        user.username.toLowerCase().includes(searchName.toLowerCase())
      );
    }
    
    return filteredUsers;
  };

  const getUserCountByRole = (roleName: string) => {
    return users.filter((user) => user.role.name.toLowerCase() === roleName.toLowerCase()).length;
  };

  const totalUsers = users.length;

  const userColumns = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    { title: "Username", dataIndex: "username", key: "username" },
    { title: "Full Name", dataIndex: "namaLengkap", key: "namaLengkap" },
    { title: "Phone", dataIndex: "noTlp", key: "noTlp" },
    { title: "Role", dataIndex: ["role", "name"], key: "role" },
  ];

  return (
    <LayoutApp>
      <div style={{ padding: "24px 0" }}>
        <h1>Users Management</h1>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Users"
                value={totalUsers}
                prefix={<UserOutlined />}
                valueStyle={{ color: "#3f8600" }}
              />
            </Card>
          </Col>
          {roles.map((role, index) => {
            const colors = ["#1890ff", "#722ed1", "#eb2f96", "#52c41a", "#faad14", "#f5222d"];
            return (
              <Col xs={24} sm={12} md={6} key={role.id}>
                <Card>
                  <Statistic
                    title={role.name}
                    value={getUserCountByRole(role.name.toLowerCase())}
                    prefix={<TeamOutlined />}
                    valueStyle={{ color: colors[index % colors.length] }}
                  />
                </Card>
              </Col>
            );
          })}
        </Row>

        {/* Filters */}
        <Card style={{ marginBottom: 24 }}>
          <Space wrap>
            <span style={{ fontWeight: 'bold' }}>Filter by Role:</span>
            <Select
              placeholder="Select role to filter"
              allowClear
              style={{ minWidth: 200 }}
              value={selectedRoleFilter}
              onChange={(value) => setSelectedRoleFilter(value)}
            >
              {roles.map((role) => (
                <Select.Option key={role.id} value={role.name.toLowerCase()}>
                  {role.name} ({getUserCountByRole(role.name.toLowerCase())})
                </Select.Option>
              ))}
            </Select>
            {selectedRoleFilter && (
              <Button
                type="text"
                onClick={() => setSelectedRoleFilter(null)}
                size="small"
              >
                Clear Role Filter
              </Button>
            )}
            
            <Divider type="vertical" />
            
            <span style={{ fontWeight: 'bold' }}>Search by Name:</span>
            <Input
              placeholder="Search by name or username"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              style={{ width: 250 }}
              allowClear
            />
            {searchName && (
              <Button
                type="text"
                onClick={() => setSearchName('')}
                size="small"
              >
                Clear Search
              </Button>
            )}
          </Space>
        </Card>

        {/* Users Table */}
        <Card
          title={`All Users ${selectedRoleFilter || searchName ? `(Filtered: ${getFilteredUsers().length}/${totalUsers})` : `(${totalUsers})`}`}
        >
          <Table
            dataSource={getFilteredUsers()}
            columns={userColumns}
            rowKey="id"
            loading={loading}
            size="small"
            scroll={{ x: 600 }}
          />
        </Card>
      </div>
    </LayoutApp>
  );
}