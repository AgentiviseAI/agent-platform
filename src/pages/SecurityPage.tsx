import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Typography, 
  Card, 
  App,
  Modal, 
  Form, 
  Input, 
  Select,
  Tabs,
  Row,
  Col,
  Tag,
  Checkbox,
  Badge,
  Statistic,
  Alert,
  Switch
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  UserOutlined,
  SafetyOutlined,
  KeyOutlined,
  TeamOutlined,
  LockOutlined,
  UnlockOutlined,
  EyeOutlined,
  SecurityScanOutlined,
  CrownOutlined
} from '@ant-design/icons';
import { securityAPI } from '../services/api';
import { Role } from '../types';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const SecurityPage: React.FC = () => {
  const { message } = App.useApp();
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [permissionsModalVisible, setPermissionsModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [form] = Form.useForm();
  const [userForm] = Form.useForm();
  const [permissionsForm] = Form.useForm();

  // Mock permissions structure
  const allPermissions = {
    agents: ['create', 'read', 'update', 'delete', 'execute'],
    llms: ['create', 'read', 'update', 'delete', 'configure'],
    tools: ['create', 'read', 'update', 'delete', 'configure'],
    rag: ['create', 'read', 'update', 'delete', 'configure'],
    workflows: ['create', 'read', 'update', 'delete', 'deploy'],
    metrics: ['read', 'configure'],
    security: ['read', 'configure', 'manage_users', 'manage_roles']
  };

  const resourceLabels = {
    agents: 'AI Agents',
    llms: 'LLM Models',
    tools: 'MCP Tools',
    rag: 'Knowledgebase',
    workflows: 'Workflows',
    metrics: 'Metrics',
    security: 'Security & RBAC'
  };

  useEffect(() => {
    fetchRoles();
    fetchUsers();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await securityAPI.getRoles();
      setRoles(response.items);
    } catch (error) {
      message.error('Failed to load roles');
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await securityAPI.getUsers();
      setUsers(response.items);
    } catch (error) {
      message.error('Failed to load users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = () => {
    setEditingRole(null);
    form.resetFields();
    form.setFieldsValue({
      permissions: {}
    });
    setModalVisible(true);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    form.setFieldsValue(role);
    setModalVisible(true);
  };

  const handleDeleteRole = async (id: string) => {
    try {
      await securityAPI.deleteRole(id);
      message.success('Role deleted successfully');
      fetchRoles();
    } catch (error) {
      message.error('Failed to delete role');
      console.error('Error deleting role:', error);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingRole) {
        await securityAPI.updateRole(editingRole.id, values);
        message.success('Role updated successfully');
      } else {
        await securityAPI.createRole(values);
        message.success('Role created successfully');
      }
      setModalVisible(false);
      fetchRoles();
    } catch (error) {
      message.error(editingRole ? 'Failed to update role' : 'Failed to create role');
      console.error('Error saving role:', error);
    }
  };

  const handleConfigurePermissions = (role: Role) => {
    setSelectedRole(role);
    permissionsForm.setFieldsValue(role.permissions || {});
    setPermissionsModalVisible(true);
  };

  const handlePermissionsSubmit = async (values: any) => {
    try {
      if (selectedRole) {
        await securityAPI.updateRolePermissions(selectedRole.id, values);
        message.success('Permissions updated successfully');
        setPermissionsModalVisible(false);
        fetchRoles();
      }
    } catch (error) {
      message.error('Failed to update permissions');
      console.error('Error updating permissions:', error);
    }
  };

  // User Management Functions
  const handleCreateUser = () => {
    setEditingUser(null);
    userForm.resetFields();
    setUserModalVisible(true);
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    
    // Transform backend user data to match form fields
    const selectedRole = roles.find(role => role.name === user.role);
    const formValues = {
      name: user.name,
      email: user.email,
      role_id: selectedRole?.id || '',
      is_active: user.status === 'active'
    };
    
    userForm.setFieldsValue(formValues);
    setUserModalVisible(true);
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await securityAPI.deleteUser(id);
      message.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      message.error('Failed to delete user');
      console.error('Error deleting user:', error);
    }
  };

  const handleUserSubmit = async (values: any) => {
    try {
      // Transform the form values to match backend expectations
      const selectedRole = roles.find(role => role.id === values.role_id);
      const payload = {
        name: values.name,
        email: values.email,
        role: selectedRole?.name || '',
        status: values.is_active ? 'active' : 'inactive'
      };

      if (editingUser) {
        await securityAPI.updateUser(editingUser.id, payload);
        message.success('User updated successfully');
      } else {
        await securityAPI.createUser(payload);
        message.success('User created successfully');
      }
      setUserModalVisible(false);
      setEditingUser(null);
      userForm.resetFields();
      fetchUsers();
    } catch (error) {
      message.error(editingUser ? 'Failed to update user' : 'Failed to create user');
      console.error('Error saving user:', error);
    }
  };

  const getRoleIcon = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'admin': return <CrownOutlined style={{ color: '#f5222d' }} />;
      case 'developer': return <KeyOutlined style={{ color: '#1890ff' }} />;
      case 'user': return <UserOutlined style={{ color: '#52c41a' }} />;
      default: return <TeamOutlined />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { status: 'success' as const, text: 'Active' },
      inactive: { status: 'default' as const, text: 'Inactive' },
      suspended: { status: 'error' as const, text: 'Suspended' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    return <Badge status={config.status} text={config.text} />;
  };

  const roleColumns = [
    {
      title: 'Role',
      key: 'role',
      render: (record: Role) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {getRoleIcon(record.name)}
          <div>
            <strong>{record.name}</strong>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.description}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Users',
      dataIndex: 'user_count',
      key: 'user_count',
      render: (count: number) => <Badge count={count} style={{ backgroundColor: '#52c41a' }} />,
    },
    {
      title: 'Permissions Summary',
      key: 'permissions_summary',
      render: (record: Role) => (
        <div>
          {record.summary_permissions?.map((perm, index) => (
            <Tag key={index} style={{ marginBottom: 4 }}>
              {perm}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusBadge(status),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (record: Role) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleEditRole(record)}
            title="View Details"
          />
          <Button
            type="text"
            icon={<SecurityScanOutlined />}
            size="small"
            onClick={() => handleConfigurePermissions(record)}
            title="Configure Permissions"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEditRole(record)}
            title="Edit Role"
          />
          <Button
            type="text"
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => handleDeleteRole(record.id)}
            title="Delete Role"
          />
        </Space>
      ),
    },
  ];

  const userColumns = [
    {
      title: 'User',
      key: 'user',
      render: (record: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <UserOutlined style={{ fontSize: '16px', color: '#1890ff' }} />
          <div>
            <strong>{record.name}</strong>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.email}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color="blue">{role}</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusBadge(status),
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (record: any) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEditUser(record)}
            title="Edit User"
          />
          <Button
            type="text"
            icon={record.status === 'active' ? <LockOutlined /> : <UnlockOutlined />}
            size="small"
            title={record.status === 'active' ? 'Suspend User' : 'Activate User'}
          />
          <Button
            type="text"
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDeleteUser(record.id)}
            danger
            title="Delete User"
          />
        </Space>
      ),
    },
  ];

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const totalRoles = roles.length;

  return (
    <div>
      <div className="page-header">
        <Title level={2} style={{ margin: 0 }}>Security & RBAC</Title>
        <Text type="secondary">
          Role-based Access Control Management
        </Text>
      </div>

      <Tabs 
        defaultActiveKey="overview" 
        items={[
          {
            key: 'overview',
            label: 'Security Overview',
            children: (
              <>
                {/* Security Statistics */}
                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                  <Col xs={24} sm={6}>
                    <Card>
                      <Statistic
                        title="Total Users"
                        value={totalUsers}
                        prefix={<UserOutlined />}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={6}>
                    <Card>
                      <Statistic
                        title="Active Users"
                        value={activeUsers}
                        prefix={<UserOutlined />}
                        valueStyle={{ color: '#3f8600' }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={6}>
                    <Card>
                      <Statistic
                        title="Total Roles"
                        value={totalRoles}
                        prefix={<SafetyOutlined />}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={6}>
                    <Card>
                      <Statistic
                        title="Security Score"
                        value={85}
                        suffix="/100"
                        prefix={<SecurityScanOutlined />}
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Card>
                  </Col>
                </Row>

                <Alert
                  message="Security Recommendations"
                  description="Consider enabling two-factor authentication for admin users and reviewing role permissions quarterly."
                  type="info"
                  showIcon
                  style={{ marginBottom: 24 }}
                />
              </>
            )
          },
          {
            key: 'roles',
            label: 'Role Management',
            children: (
              <Card>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <Text strong>System Roles</Text>
                  </div>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreateRole}
                  >
                    Create Role
                  </Button>
                </div>

                <Table
                  columns={roleColumns}
                  dataSource={roles}
                  rowKey="id"
                  loading={loading}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total: number, range: [number, number]) =>
                      `${range[0]}-${range[1]} of ${total} roles`,
                  }}
                />
              </Card>
            )
          },
          {
            key: 'users',
            label: 'User Management',
            children: (
              <Card>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <Text strong>System Users</Text>
                  </div>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreateUser}
                  >
                    Add User
                  </Button>
                </div>

                <Table
                  columns={userColumns}
                  dataSource={users}
                  rowKey="id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total: number, range: [number, number]) =>
                      `${range[0]}-${range[1]} of ${total} users`,
                  }}
                />
              </Card>
            )
          }
        ]}
      />

      {/* Create/Edit Role Modal */}
      <Modal
        title={editingRole ? 'Edit Role' : 'Create Role'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: 16 }}
          initialValues={{
            status: 'active'
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Role Name"
                rules={[{ required: true, message: 'Please enter role name' }]}
              >
                <Input placeholder="Enter role name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: 'Please select status' }]}
              >
                <Select placeholder="Select status">
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <TextArea
              rows={3}
              placeholder="Describe the role and its responsibilities"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editingRole ? 'Update' : 'Create'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Permissions Configuration Modal */}
      <Modal
        title={`Configure Permissions - ${selectedRole?.name}`}
        open={permissionsModalVisible}
        onCancel={() => setPermissionsModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={permissionsForm}
          layout="vertical"
          onFinish={handlePermissionsSubmit}
          style={{ marginTop: 16 }}
        >
          <Alert
            message="Permission Configuration"
            description="Select the specific permissions for this role. Users with this role will only be able to perform the selected actions."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          {Object.entries(allPermissions).map(([resource, permissions]) => (
            <Card key={resource} size="small" style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8 }}>
                <Text strong>{resourceLabels[resource as keyof typeof resourceLabels]}</Text>
              </div>
              <Form.Item name={[resource]} style={{ marginBottom: 0 }}>
                <Checkbox.Group>
                  <Row>
                    {permissions.map(permission => (
                      <Col span={8} key={permission}>
                        <Checkbox value={permission}>
                          {permission.charAt(0).toUpperCase() + permission.slice(1)}
                        </Checkbox>
                      </Col>
                    ))}
                  </Row>
                </Checkbox.Group>
              </Form.Item>
            </Card>
          ))}

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setPermissionsModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Update Permissions
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* User Management Modal */}
      <Modal
        title={editingUser ? 'Edit User' : 'Create User'}
        open={userModalVisible}
        onCancel={() => {
          setUserModalVisible(false);
          setEditingUser(null);
          userForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={userForm}
          layout="vertical"
          onFinish={handleUserSubmit}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please input the user name!' }]}
          >
            <Input placeholder="Enter user name" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input the user email!' },
              { type: 'email', message: 'Please enter a valid email address!' }
            ]}
          >
            <Input placeholder="Enter user email" />
          </Form.Item>

          <Form.Item
            name="role_id"
            label="Role"
            rules={[{ required: true, message: 'Please select a role!' }]}
          >
            <Select placeholder="Select a role">
              {roles.map(role => (
                <Option key={role.id} value={role.id}>
                  {role.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="is_active"
            label="Status"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch 
              checkedChildren="Active" 
              unCheckedChildren="Inactive" 
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setUserModalVisible(false);
                setEditingUser(null);
                userForm.resetFields();
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editingUser ? 'Update' : 'Create'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SecurityPage;
