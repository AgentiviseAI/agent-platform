import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Space,
  Typography, 
  Card, 
  message, 
  Modal, 
  Form, 
  Input, 
  Select,
  Popconfirm,
  Tag,
  Badge,
  Descriptions,
  Tabs,
  Switch
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  SecurityScanOutlined,
  ApiOutlined
} from '@ant-design/icons';
import { mcpToolsAPI } from '../services/api';
import { MCPTool, CreateMCPToolRequest } from '../types';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const MCPToolsPage: React.FC = () => {
  const [tools, setTools] = useState<MCPTool[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [rbacModalVisible, setRbacModalVisible] = useState(false);
  const [editingTool, setEditingTool] = useState<MCPTool | null>(null);
  const [selectedTool, setSelectedTool] = useState<MCPTool | null>(null);
  const [form] = Form.useForm();
  const [rbacForm] = Form.useForm();

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      setLoading(true);
      const response = await mcpToolsAPI.list();
      setTools(response.items);
    } catch (error) {
      message.error('Failed to load MCP tools');
      console.error('Error fetching tools:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingTool(null);
    form.resetFields();
    form.setFieldsValue({
      enabled: true,
      required_permissions: [],
      auth_headers: {}
    });
    setModalVisible(true);
  };

  const handleEdit = (tool: MCPTool) => {
    setEditingTool(tool);
    form.setFieldsValue({
      ...tool,
      auth_headers_json: JSON.stringify(tool.auth_headers || {}, null, 2)
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await mcpToolsAPI.delete(id);
      message.success('MCP tool deleted successfully');
      fetchTools();
    } catch (error) {
      message.error('Failed to delete MCP tool');
      console.error('Error deleting tool:', error);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const { auth_headers_json, ...rest } = values;
      const formData: CreateMCPToolRequest = {
        ...rest,
        auth_headers: auth_headers_json ? JSON.parse(auth_headers_json) : {}
      };

      if (editingTool) {
        await mcpToolsAPI.update(editingTool.id, formData);
        message.success('MCP tool updated successfully');
      } else {
        await mcpToolsAPI.create(formData);
        message.success('MCP tool created successfully');
      }
      setModalVisible(false);
      fetchTools();
    } catch (error) {
      message.error(editingTool ? 'Failed to update tool' : 'Failed to create tool');
      console.error('Error saving tool:', error);
    }
  };

  const handleRbacConfig = (tool: MCPTool) => {
    setSelectedTool(tool);
    rbacForm.setFieldsValue({
      required_permissions: tool.required_permissions || [],
      auth_headers: JSON.stringify(tool.auth_headers || {}, null, 2)
    });
    setRbacModalVisible(true);
  };

  const handleRbacSubmit = async (values: any) => {
    if (!selectedTool) return;

    try {
      const updateData = {
        required_permissions: values.required_permissions,
        auth_headers: values.auth_headers ? JSON.parse(values.auth_headers) : {}
      };

      await mcpToolsAPI.update(selectedTool.id, updateData);
      message.success('RBAC configuration updated successfully');
      setRbacModalVisible(false);
      fetchTools();
    } catch (error) {
      message.error('Failed to update RBAC configuration');
      console.error('Error updating RBAC:', error);
    }
  };

  const getTransportColor = (transport: string) => {
    switch (transport) {
      case 'Streamable HTTP': return 'blue';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'Tool Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: MCPTool) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ApiOutlined />
            <strong>{text}</strong>
          </div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.endpoint_url}
          </Text>
        </div>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Transport',
      key: 'transport',
      render: (record: MCPTool) => (
        <Space direction="vertical" size="small">
          <Tag color={getTransportColor(record.transport)}>
            {record.transport}
          </Tag>
          {record.enabled && (
            <Badge status="success" text="Enabled" />
          )}
        </Space>
      ),
    },
    {
      title: 'Permissions',
      key: 'permissions',
      render: (record: MCPTool) => (
        <div>
          {record.required_permissions && record.required_permissions.length > 0 ? (
            <div>
              {record.required_permissions.slice(0, 2).map((perm, index) => (
                <Tag key={index}>{perm}</Tag>
              ))}
              {record.required_permissions.length > 2 && (
                <Tag>+{record.required_permissions.length - 2} more</Tag>
              )}
            </div>
          ) : (
            <Text type="secondary">No permissions</Text>
          )}
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 250,
      render: (record: MCPTool) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
            title="View Details"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
            title="Edit Tool"
          />
          <Button
            type="text"
            icon={<SecurityScanOutlined />}
            size="small"
            onClick={() => handleRbacConfig(record)}
            title="RBAC Configuration"
          />
          <Popconfirm
            title="Are you sure you want to delete this tool?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              icon={<DeleteOutlined />}
              size="small"
              danger
              title="Delete Tool"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <Title level={2} style={{ margin: 0 }}>MCP Tools</Title>
        <Typography.Text type="secondary">
          Manage Model Context Protocol tools and their access permissions
        </Typography.Text>
      </div>

      <Card className="content-card">
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <Typography.Text strong>Total Tools: {tools.length}</Typography.Text>
            <span style={{ marginLeft: 16 }}>
              <Badge 
                status="success" 
                text={`Enabled: ${tools.filter(t => t.enabled).length}`} 
              />
            </span>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            Add MCP Tool
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={tools}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total: number, range: [number, number]) =>
              `${range[0]}-${range[1]} of ${total} tools`,
          }}
        />
      </Card>

      {/* Create/Edit Tool Modal */}
      <Modal
        title={editingTool ? 'Edit MCP Tool' : 'Add MCP Tool'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: 16 }}
        >
          <Tabs defaultActiveKey="1">
            <TabPane tab="Basic Info" key="1">
              <Form.Item
                name="name"
                label="Tool Name"
                rules={[{ required: true, message: 'Please enter tool name' }]}
              >
                <Input placeholder="Enter tool name" />
              </Form.Item>

              <Form.Item
                name="description"
                label="Description"
                rules={[{ required: true, message: 'Please enter description' }]}
              >
                <TextArea rows={3} placeholder="Describe what this tool does" />
              </Form.Item>

              <Form.Item
                name="endpoint_url"
                label="Endpoint URL"
                rules={[
                  { required: true, message: 'Please enter endpoint URL' },
                  { type: 'url', message: 'Please enter a valid URL' }
                ]}
              >
                <Input placeholder="https://api.example.com/mcp" />
              </Form.Item>

              <Form.Item
                name="transport"
                label="Transport"
                rules={[{ required: true, message: 'Please select transport' }]}
              >
                <Select placeholder="Select transport">
                  <Option value="Streamable HTTP">Streamable HTTP</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="enabled"
                label="Enabled"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </TabPane>

            <TabPane tab="Security" key="2">
              <Form.Item
                name="required_permissions"
                label="Required Permissions"
                help="Select the permissions required to use this tool"
              >
                <Select
                  mode="tags"
                  placeholder="Add permissions"
                  tokenSeparators={[',']}
                >
                  <Option value="read">read</Option>
                  <Option value="write">write</Option>
                  <Option value="execute">execute</Option>
                  <Option value="admin">admin</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="auth_headers_json"
                label="Authentication Headers (JSON)"
                help="JSON object containing authentication headers"
              >
                <TextArea
                  rows={6}
                  placeholder={`{
  "Authorization": "Bearer token",
  "X-API-Key": "your-api-key"
}`}
                />
              </Form.Item>
            </TabPane>
          </Tabs>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right', marginTop: 16 }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editingTool ? 'Update' : 'Create'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* RBAC Configuration Modal */}
      <Modal
        title={`RBAC Configuration - ${selectedTool?.name}`}
        open={rbacModalVisible}
        onCancel={() => setRbacModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={rbacForm}
          layout="vertical"
          onFinish={handleRbacSubmit}
          style={{ marginTop: 16 }}
        >
          <Descriptions bordered size="small" style={{ marginBottom: 16 }}>
            <Descriptions.Item label="Tool Name" span={3}>
              {selectedTool?.name}
            </Descriptions.Item>
            <Descriptions.Item label="Endpoint" span={3}>
              {selectedTool?.endpoint_url}
            </Descriptions.Item>
            <Descriptions.Item label="Transport" span={3}>
              <Tag color={getTransportColor(selectedTool?.transport || '')}>
                {selectedTool?.transport}
              </Tag>
            </Descriptions.Item>
          </Descriptions>

          <Form.Item
            name="required_permissions"
            label="Required Permissions"
            help="Define what permissions users need to access this tool"
          >
            <Select
              mode="tags"
              placeholder="Add permissions"
              tokenSeparators={[',']}
            >
              <Option value="read">read</Option>
              <Option value="write">write</Option>
              <Option value="execute">execute</Option>
              <Option value="admin">admin</Option>
              <Option value="mcp:use">mcp:use</Option>
              <Option value="mcp:configure">mcp:configure</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="auth_headers"
            label="Authentication Headers (JSON)"
            help="Headers that will be sent with requests to this tool"
          >
            <TextArea
              rows={8}
              placeholder={`{
  "Authorization": "Bearer ${selectedTool?.name?.toLowerCase()}-token",
  "X-API-Key": "your-api-key",
  "Content-Type": "application/json"
}`}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setRbacModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Update RBAC
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MCPToolsPage;
