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
  Switch,
  Popconfirm,
  Tag
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  SettingOutlined,
  ApartmentOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { agentsAPI } from '../services/api';
import { AIAgent, CreateAgentRequest } from '../types';

const { Title } = Typography;
const { TextArea } = Input;

const AgentsPage: React.FC = () => {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAgent, setEditingAgent] = useState<AIAgent | null>(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await agentsAPI.list();
      setAgents(response.items);
    } catch (error) {
      message.error('Failed to load agents');
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingAgent(null);
    form.resetFields();
    form.setFieldsValue({
      enabled: true,
      preview_enabled: true,
    });
    setModalVisible(true);
  };

  const handleEdit = (agent: AIAgent) => {
    setEditingAgent(agent);
    form.setFieldsValue(agent);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await agentsAPI.delete(id);
      message.success('Agent deleted successfully');
      fetchAgents();
    } catch (error) {
      message.error('Failed to delete agent');
      console.error('Error deleting agent:', error);
    }
  };

  const handleSubmit = async (values: CreateAgentRequest) => {
    try {
      if (editingAgent) {
        await agentsAPI.update(editingAgent.id, values);
        message.success('Agent updated successfully');
      } else {
        await agentsAPI.create(values);
        message.success('Agent created successfully');
      }
      setModalVisible(false);
      fetchAgents();
    } catch (error) {
      message.error(editingAgent ? 'Failed to update agent' : 'Failed to create agent');
      console.error('Error saving agent:', error);
    }
  };

  const handleManageWorkflows = (agentId: string) => {
    navigate(`/agents/${agentId}/workflows`);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: AIAgent) => (
        <div>
          <strong>{text}</strong>
          <br />
          <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
            ID: {record.id}
          </Typography.Text>
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
      title: 'Status',
      key: 'status',
      render: (record: AIAgent) => (
        <Space direction="vertical" size="small">
          <Tag color={record.enabled ? 'green' : 'red'}>
            {record.enabled ? 'Enabled' : 'Disabled'}
          </Tag>
          {record.preview_enabled && (
            <Tag color="blue">Preview</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (record: AIAgent) => (
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
            title="Edit Agent"
          />
          <Button
            type="text"
            icon={<ApartmentOutlined />}
            size="small"
            onClick={() => handleManageWorkflows(record.id)}
            title="Manage Workflows"
          />
          <Popconfirm
            title="Are you sure you want to delete this agent?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              icon={<DeleteOutlined />}
              size="small"
              danger
              title="Delete Agent"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <Title level={2} style={{ margin: 0 }}>AI Agents</Title>
        <Typography.Text type="secondary">
          Create and manage AI agents for your platform
        </Typography.Text>
      </div>

      <Card className="content-card">
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <Typography.Text strong>Total Agents: {agents.length}</Typography.Text>
          </div>
          <Space>
            <Button
              icon={<SettingOutlined />}
              onClick={() => navigate('/workflows')}
            >
              View All Workflows
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              Create Agent
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={agents}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} agents`,
          }}
        />
      </Card>

      <Modal
        title={editingAgent ? 'Edit AI Agent' : 'Create AI Agent'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        {editingAgent && (
          <div style={{ 
            background: '#f6f8fa', 
            padding: '12px', 
            borderRadius: '6px', 
            marginBottom: '16px',
            border: '1px solid #e1e4e8'
          }}>
            <Typography.Text strong>Agent ID: </Typography.Text>
            <Typography.Text code copyable>{editingAgent.id}</Typography.Text>
          </div>
        )}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="name"
            label="Agent Name"
            rules={[
              { required: true, message: 'Please enter agent name' },
              { max: 100, message: 'Name must be less than 100 characters' }
            ]}
          >
            <Input placeholder="Enter agent name" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[
              { required: true, message: 'Please enter agent description' },
              { max: 500, message: 'Description must be less than 500 characters' }
            ]}
          >
            <TextArea
              rows={3}
              placeholder="Describe what this agent does"
            />
          </Form.Item>

          <Form.Item
            name="enabled"
            label="Enabled"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="preview_enabled"
            label="Preview Mode"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editingAgent ? 'Update' : 'Create'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AgentsPage;
