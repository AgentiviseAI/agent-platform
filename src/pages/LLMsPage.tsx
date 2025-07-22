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
  InputNumber,
  Switch,
  Popconfirm,
  Tag,
  Badge,
  Progress,
  Statistic,
  Row,
  Col,
  Tabs
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  ThunderboltOutlined,
  CloudOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { llmsAPI } from '../services/api';
import { LLM, CreateLLMRequest } from '../types';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const LLMsPage: React.FC = () => {
  const { message } = App.useApp();
  const [llms, setLlms] = useState<LLM[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLlm, setEditingLlm] = useState<LLM | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchLLMs();
  }, []);

  const fetchLLMs = async () => {
    try {
      setLoading(true);
      const response = await llmsAPI.list();
      setLlms(response.items);
    } catch (error) {
      message.error('Failed to load LLMs');
      console.error('Error fetching LLMs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingLlm(null);
    form.resetFields();
    form.setFieldsValue({
      enabled: true,
      temperature: 0.7,
      max_tokens: 4096,
      top_p: 1.0,
      frequency_penalty: 0,
      presence_penalty: 0
    });
    setModalVisible(true);
  };

  const handleEdit = (llm: LLM) => {
    setEditingLlm(llm);
    form.setFieldsValue({
      ...llm,
      config: llm.config ? JSON.stringify(llm.config, null, 2) : '{}'
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await llmsAPI.delete(id);
      message.success('LLM deleted successfully');
      fetchLLMs();
    } catch (error) {
      message.error('Failed to delete LLM');
      console.error('Error deleting LLM:', error);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const formData: CreateLLMRequest = {
        ...values,
        config: values.config ? JSON.parse(values.config) : {}
      };

      if (editingLlm) {
        await llmsAPI.update(editingLlm.id, formData);
        message.success('LLM updated successfully');
      } else {
        await llmsAPI.create(formData);
        message.success('LLM created successfully');
      }
      setModalVisible(false);
      fetchLLMs();
    } catch (error) {
      message.error(editingLlm ? 'Failed to update LLM' : 'Failed to create LLM');
      console.error('Error saving LLM:', error);
    }
  };

  const getProviderIcon = (provider: string) => {
    if (!provider) return '🤖';
    switch (provider.toLowerCase()) {
      case 'openai': return '🔥';
      case 'anthropic': return '🧠';
      case 'google': return '🟢';
      case 'azure': return '☁️';
      case 'huggingface': return '🤗';
      default: return '🤖';
    }
  };

  const getStatusColor = (status: string) => {
    if (!status) return 'default';
    switch (status.toLowerCase()) {
      case 'active': return 'green';
      case 'inactive': return 'red';
      case 'maintenance': return 'orange';
      default: return 'default';
    }
  };

  const getUsageProgress = (used: number, limit: number) => {
    if (!limit) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  const columns = [
    {
      title: 'Model',
      key: 'model',
      render: (record: LLM) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '16px' }}>{getProviderIcon(record.provider || '')}</span>
            <div>
              <strong>{record.name || 'Unnamed Model'}</strong>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {record.model_name || 'Unknown'} • {record.provider || 'Unknown Provider'}
              </Text>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (record: LLM) => (
        <Space direction="vertical" size="small">
          <Tag color={getStatusColor(record.status)}>
            {record.status?.toUpperCase()}
          </Tag>
          {record.enabled && (
            <Badge status="success" text="Enabled" />
          )}
        </Space>
      ),
    },
    {
      title: 'Configuration',
      key: 'config',
      render: (record: LLM) => (
        <Space direction="vertical" size="small">
          <Text style={{ fontSize: '12px' }}>
            Temp: {record.temperature || 0.7}
          </Text>
          <Text style={{ fontSize: '12px' }}>
            Max Tokens: {record.max_tokens || 'N/A'}
          </Text>
          <Text style={{ fontSize: '12px' }}>
            Top-P: {record.top_p || 1.0}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Usage',
      key: 'usage',
      render: (record: LLM) => {
        const usage = record.usage_stats || { requests_today: 0, tokens_used: 0, rate_limit: 1000 };
        const progressPercent = getUsageProgress(usage.requests_today, usage.rate_limit);
        
        return (
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <div>
              <Text style={{ fontSize: '12px' }}>
                {usage.requests_today}/{usage.rate_limit} requests
              </Text>
              <Progress 
                percent={progressPercent} 
                size="small" 
                strokeColor={progressPercent > 80 ? '#ff4d4f' : '#52c41a'}
                showInfo={false}
              />
            </div>
            <Text style={{ fontSize: '12px' }} type="secondary">
              {(usage.tokens_used || 0).toLocaleString()} tokens used
            </Text>
          </Space>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (record: LLM) => (
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
            title="Edit LLM"
          />
          <Button
            type="text"
            icon={<SettingOutlined />}
            size="small"
            title="Configuration"
          />
          <Popconfirm
            title="Are you sure you want to delete this LLM?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              icon={<DeleteOutlined />}
              size="small"
              danger
              title="Delete LLM"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const activeModels = llms.filter(llm => llm.status === 'active').length;
  const totalRequests = llms.reduce((sum, llm) => sum + (llm.usage_stats?.requests_today || 0), 0);
  const totalTokens = llms.reduce((sum, llm) => sum + (llm.usage_stats?.tokens_used || 0), 0);

  return (
    <div>
      <div className="page-header">
        <Title level={2} style={{ margin: 0 }}>LLM Models</Title>
        <Typography.Text type="secondary">
          Manage Large Language Models and their configurations
        </Typography.Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Models"
              value={llms.length}
              prefix={<ThunderboltOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Active Models"
              value={activeModels}
              prefix={<CloudOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Requests Today"
              value={totalRequests}
              prefix={<ThunderboltOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tokens Used"
              value={totalTokens}
              formatter={(value) => value?.toLocaleString()}
            />
          </Card>
        </Col>
      </Row>

      <Card className="content-card">
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <Typography.Text strong>Configured Models</Typography.Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            Add LLM Model
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={llms}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total: number, range: [number, number]) =>
              `${range[0]}-${range[1]} of ${total} models`,
          }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingLlm ? 'Edit LLM Model' : 'Add LLM Model'}
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
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="name"
                    label="Model Name"
                    rules={[{ required: true, message: 'Please enter model name' }]}
                  >
                    <Input placeholder="GPT-4, Claude, etc." />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="provider"
                    label="Provider"
                    rules={[{ required: true, message: 'Please select provider' }]}
                  >
                    <Select placeholder="Select provider">
                      <Option value="openai">OpenAI</Option>
                      <Option value="anthropic">Anthropic</Option>
                      <Option value="google">Google</Option>
                      <Option value="azure">Azure OpenAI</Option>
                      <Option value="huggingface">Hugging Face</Option>
                      <Option value="local">Local Model</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="model_name"
                    label="Model Identifier"
                    rules={[{ required: true, message: 'Please enter model identifier' }]}
                  >
                    <Input placeholder="gpt-4, claude-3-opus, etc." />
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
                      <Option value="maintenance">Maintenance</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="description"
                label="Description"
              >
                <TextArea rows={2} placeholder="Model description" />
              </Form.Item>

              <Form.Item
                name="endpoint_url"
                label="Endpoint URL"
                rules={[
                  { required: true, message: 'Please enter endpoint URL' },
                  { type: 'url', message: 'Please enter a valid URL' }
                ]}
              >
                <Input placeholder="https://api.openai.com/v1/chat/completions" />
              </Form.Item>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="temperature"
                    label="Temperature"
                    help="0.0 - 2.0"
                  >
                    <InputNumber
                      min={0}
                      max={2}
                      step={0.1}
                      style={{ width: '100%' }}
                      placeholder="0.7"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="max_tokens"
                    label="Max Tokens"
                  >
                    <InputNumber
                      min={1}
                      max={32000}
                      style={{ width: '100%' }}
                      placeholder="4096"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="top_p"
                    label="Top P"
                    help="0.0 - 1.0"
                  >
                    <InputNumber
                      min={0}
                      max={1}
                      step={0.1}
                      style={{ width: '100%' }}
                      placeholder="1.0"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="frequency_penalty"
                    label="Frequency Penalty"
                    help="-2.0 to 2.0"
                  >
                    <InputNumber
                      min={-2}
                      max={2}
                      step={0.1}
                      style={{ width: '100%' }}
                      placeholder="0"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="presence_penalty"
                    label="Presence Penalty"
                    help="-2.0 to 2.0"
                  >
                    <InputNumber
                      min={-2}
                      max={2}
                      step={0.1}
                      style={{ width: '100%' }}
                      placeholder="0"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="config"
                label="Additional Configuration (JSON)"
                help="Additional provider-specific configuration including API keys and security settings"
              >
                <TextArea
                  rows={6}
                  placeholder={`{
  "api_key": "your-api-key",
  "base_url": "https://api.provider.com",
  "timeout": 30,
  "max_retries": 3,
  "security_headers": {
    "X-API-Key": "your-key"
  }
}`}
                />
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
                help="Select the permissions required to use this LLM model"
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
                  <Option value="model_access">model_access</Option>
                  <Option value="api_access">api_access</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="authorization_header"
                label="Authorization Header"
                help="Authorization header value (e.g., Bearer token, API key)"
              >
                <Input.Password placeholder="Bearer your-api-key or sk-..." />
              </Form.Item>
            </TabPane>
          </Tabs>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right', marginTop: 16 }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editingLlm ? 'Update' : 'Create'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LLMsPage;
