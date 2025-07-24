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
  const [, setHostingEnvironment] = useState<string>('azure_ai_foundry');

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
    setHostingEnvironment('azure_ai_foundry');
    form.setFieldsValue({
      enabled: true,
      status: 'active',
      hosting_environment: 'azure_ai_foundry',
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
    setHostingEnvironment(llm.hosting_environment);
    form.setFieldsValue(llm);
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
      // Client-side validation for custom API compatibility
      if (values.custom_api_compatibility === 'custom') {
        message.error('Custom API compatibility is not supported yet. Please choose another option.');
        return;
      }

      const formData: CreateLLMRequest = values;

      if (editingLlm) {
        await llmsAPI.update(editingLlm.id, formData);
        message.success('LLM updated successfully');
      } else {
        await llmsAPI.create(formData);
        message.success('LLM created successfully');
      }
      setModalVisible(false);
      fetchLLMs();
    } catch (error: any) {
      // Handle specific error messages from the backend
      const errorMessage = error?.response?.data?.detail || 
                          error?.message || 
                          (editingLlm ? 'Failed to update LLM' : 'Failed to create LLM');
      
      message.error(errorMessage);
      console.error('Error saving LLM:', error);
    }
  };

  const getHostingEnvironmentIcon = (hostingEnv: string) => {
    switch (hostingEnv) {
      case 'azure_ai_foundry': return '☁️';
      case 'aws_bedrock': return '🟠';
      case 'aws_sagemaker': return '🟡';
      case 'gcp_vertex_ai': return '🔵';
      case 'custom_deployment': return '🔧';
      default: return '🤖';
    }
  };

  const getHostingEnvironmentName = (hostingEnv: string) => {
    switch (hostingEnv) {
      case 'azure_ai_foundry': return 'Azure AI Foundry';
      case 'aws_bedrock': return 'AWS Bedrock';
      case 'aws_sagemaker': return 'AWS SageMaker';
      case 'gcp_vertex_ai': return 'Google Cloud Vertex AI';
      case 'custom_deployment': return 'Custom Deployment';
      default: return 'Unknown';
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
            <span style={{ fontSize: '16px' }}>{getHostingEnvironmentIcon(record.hosting_environment)}</span>
            <div>
              <strong>{record.name || 'Unnamed Model'}</strong>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {record.model_name || 'Unknown'} • {getHostingEnvironmentName(record.hosting_environment)}
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
        width={900}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: 16 }}
        >
          <Tabs defaultActiveKey="1">
            <TabPane tab="Basic Configuration" key="1">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="name"
                    label="Model Name"
                    rules={[{ required: true, message: 'Please enter model name' }]}
                  >
                    <Input placeholder="GPT-4 Turbo, Claude 3 Sonnet, etc." />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="hosting_environment"
                    label="Hosting Environment"
                    rules={[{ required: true, message: 'Please select hosting environment' }]}
                  >
                    <Select 
                      placeholder="Select hosting environment"
                      onChange={(value) => setHostingEnvironment(value)}
                    >
                      <Option value="azure_ai_foundry">
                        <Space>
                          <span>☁️</span> Azure AI Foundry
                        </Space>
                      </Option>
                      <Option value="aws_bedrock">
                        <Space>
                          <span>🟠</span> AWS Bedrock
                        </Space>
                      </Option>
                      <Option value="aws_sagemaker">
                        <Space>
                          <span>🟡</span> AWS SageMaker
                        </Space>
                      </Option>
                      <Option value="gcp_vertex_ai">
                        <Space>
                          <span>🔵</span> Google Cloud Vertex AI
                        </Space>
                      </Option>
                      <Option value="custom_deployment">
                        <Space>
                          <span>🔧</span> Custom Deployment
                        </Space>
                      </Option>
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
                    <Input placeholder="gpt-4-turbo, claude-3-sonnet, etc." />
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
                <TextArea rows={2} placeholder="Model description and use case" />
              </Form.Item>

              <Form.Item
                name="enabled"
                label="Enabled"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </TabPane>

            <TabPane tab="Deployment Configuration" key="2">
              {/* Azure AI Foundry Configuration */}
              {form.getFieldValue('hosting_environment') === 'azure_ai_foundry' && (
                <div>
                  <Title level={5}>
                    <Space>
                      <span>☁️</span> Azure AI Foundry Configuration
                    </Space>
                  </Title>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="azure_endpoint_url"
                        label="Endpoint URL"
                        rules={[{ required: true, message: 'Please enter Azure endpoint URL' }]}
                      >
                        <Input placeholder="https://your-ai-studio.inference.ai.azure.com" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="azure_deployment_name"
                        label="Deployment Name"
                        rules={[{ required: true, message: 'Please enter deployment name' }]}
                      >
                        <Input placeholder="gpt-4-turbo-deployment" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item
                    name="azure_api_key"
                    label="API Key"
                    rules={[{ required: true, message: 'Please enter Azure API key' }]}
                  >
                    <Input.Password placeholder="Your Azure AI Studio API key" />
                  </Form.Item>
                </div>
              )}

              {/* AWS Bedrock Configuration */}
              {form.getFieldValue('hosting_environment') === 'aws_bedrock' && (
                <div>
                  <Title level={5}>
                    <Space>
                      <span>🟠</span> AWS Bedrock Configuration
                    </Space>
                  </Title>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item
                        name="aws_region"
                        label="AWS Region"
                        rules={[{ required: true, message: 'Please enter AWS region' }]}
                      >
                        <Select placeholder="Select region">
                          <Option value="us-east-1">US East (N. Virginia)</Option>
                          <Option value="us-west-2">US West (Oregon)</Option>
                          <Option value="eu-west-1">Europe (Ireland)</Option>
                          <Option value="ap-southeast-1">Asia Pacific (Singapore)</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={16}>
                      <Form.Item
                        name="aws_model_id"
                        label="Model ID"
                        rules={[{ required: true, message: 'Please enter AWS model ID' }]}
                      >
                        <Input placeholder="anthropic.claude-3-sonnet-20240229-v1:0" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="aws_access_key_id"
                        label="Access Key ID"
                        rules={[{ required: true, message: 'Please enter AWS access key ID' }]}
                      >
                        <Input placeholder="AKIA..." />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="aws_secret_access_key"
                        label="Secret Access Key"
                        rules={[{ required: true, message: 'Please enter AWS secret access key' }]}
                      >
                        <Input.Password placeholder="Your AWS secret access key" />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              )}

              {/* AWS SageMaker Configuration */}
              {form.getFieldValue('hosting_environment') === 'aws_sagemaker' && (
                <div>
                  <Title level={5}>
                    <Space>
                      <span>🟡</span> AWS SageMaker Configuration
                    </Space>
                  </Title>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item
                        name="aws_region"
                        label="AWS Region"
                        rules={[{ required: true, message: 'Please enter AWS region' }]}
                      >
                        <Select placeholder="Select region">
                          <Option value="us-east-1">US East (N. Virginia)</Option>
                          <Option value="us-west-2">US West (Oregon)</Option>
                          <Option value="eu-west-1">Europe (Ireland)</Option>
                          <Option value="ap-southeast-1">Asia Pacific (Singapore)</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={16}>
                      <Form.Item
                        name="aws_sagemaker_endpoint_name"
                        label="SageMaker Endpoint Name"
                        rules={[{ required: true, message: 'Please enter SageMaker endpoint name' }]}
                      >
                        <Input placeholder="my-custom-model-endpoint" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="aws_access_key_id"
                        label="Access Key ID"
                        rules={[{ required: true, message: 'Please enter AWS access key ID' }]}
                      >
                        <Input placeholder="AKIA..." />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="aws_secret_access_key"
                        label="Secret Access Key"
                        rules={[{ required: true, message: 'Please enter AWS secret access key' }]}
                      >
                        <Input.Password placeholder="Your AWS secret access key" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item
                    name="aws_content_handler_class"
                    label="Content Handler Class"
                    help="Python class path for custom content handling"
                  >
                    <Input placeholder="my_handlers.CustomLlamaHandler" />
                  </Form.Item>
                </div>
              )}

              {/* Google Cloud Vertex AI Configuration */}
              {form.getFieldValue('hosting_environment') === 'gcp_vertex_ai' && (
                <div>
                  <Title level={5}>
                    <Space>
                      <span>🔵</span> Google Cloud Vertex AI Configuration
                    </Space>
                  </Title>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item
                        name="gcp_project_id"
                        label="Project ID"
                        rules={[{ required: true, message: 'Please enter GCP project ID' }]}
                      >
                        <Input placeholder="my-gcp-project-123" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name="gcp_region"
                        label="Region"
                        rules={[{ required: true, message: 'Please enter GCP region' }]}
                      >
                        <Select placeholder="Select region">
                          <Option value="us-central1">us-central1</Option>
                          <Option value="us-east1">us-east1</Option>
                          <Option value="europe-west1">europe-west1</Option>
                          <Option value="asia-southeast1">asia-southeast1</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name="gcp_auth_method"
                        label="Authentication Method"
                        rules={[{ required: true, message: 'Please select auth method' }]}
                      >
                        <Select placeholder="Select auth method">
                          <Option value="adc">Application Default Credentials</Option>
                          <Option value="service_account">Service Account Key</Option>
                          <Option value="api_key">API Key</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  {form.getFieldValue('gcp_auth_method') === 'service_account' && (
                    <Form.Item
                      name="gcp_service_account_key"
                      label="Service Account Key (JSON)"
                      rules={[{ required: true, message: 'Please enter service account key' }]}
                    >
                      <TextArea
                        rows={4}
                        placeholder="Paste your service account JSON key here"
                      />
                    </Form.Item>
                  )}
                  
                  {form.getFieldValue('gcp_auth_method') === 'api_key' && (
                    <Form.Item
                      name="gcp_api_key"
                      label="API Key"
                      rules={[{ required: true, message: 'Please enter API key' }]}
                    >
                      <Input.Password placeholder="Your GCP API key" />
                    </Form.Item>
                  )}

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="gcp_model_type"
                        label="Model Type"
                        rules={[{ required: true, message: 'Please select model type' }]}
                      >
                        <Select placeholder="Select model type">
                          <Option value="foundation">Foundation Model</Option>
                          <Option value="fine_tuned">Fine-tuned Model</Option>
                          <Option value="custom">Custom Model</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="gcp_model_name"
                        label="GCP Model Name"
                        rules={[{ required: true, message: 'Please enter GCP model name' }]}
                      >
                        <Input placeholder="gemini-1.5-pro" />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              )}

              {/* Custom Deployment Configuration */}
              {form.getFieldValue('hosting_environment') === 'custom_deployment' && (
                <div>
                  <Title level={5}>
                    <Space>
                      <span>🔧</span> Custom Deployment Configuration
                    </Space>
                  </Title>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item
                        name="custom_deployment_location"
                        label="Deployment Location"
                        rules={[{ required: true, message: 'Please select deployment location' }]}
                      >
                        <Select placeholder="Select location">
                          <Option value="cloud">Cloud</Option>
                          <Option value="on_premise">On-Premise</Option>
                          <Option value="hybrid">Hybrid</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name="custom_llm_provider"
                        label="LLM Provider"
                      >
                        <Input placeholder="Meta (Llama), Hugging Face, etc." />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name="custom_api_compatibility"
                        label="API Compatibility"
                        rules={[
                          { required: true, message: 'Please select API compatibility' },
                          {
                            validator: (_, value) => {
                              if (value === 'custom') {
                                return Promise.reject(new Error('Custom API compatibility is not supported yet. Please choose another option.'));
                              }
                              return Promise.resolve();
                            }
                          }
                        ]}
                      >
                        <Select placeholder="Select compatibility">
                          <Option value="openai_compatible">OpenAI Compatible</Option>
                          <Option value="hf_tgi_compatible">Hugging Face Text Generation Inference (TGI) API</Option>
                          <Option value="ollama_compatible">Ollama API</Option>
                          <Option value="custom" disabled style={{ color: '#ccc', fontStyle: 'italic' }}>
                            Custom (Coming Soon - Not Yet Supported)
                          </Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="custom_api_endpoint_url"
                    label="API Endpoint URL"
                    rules={[{ required: true, message: 'Please enter API endpoint URL' }]}
                  >
                    <Input placeholder="http://192.168.1.100:8000/v1/chat/completions" />
                  </Form.Item>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="custom_auth_method"
                        label="Authentication Method"
                        rules={[{ required: true, message: 'Please select auth method' }]}
                      >
                        <Select placeholder="Select auth method">
                          <Option value="api_key_header">API Key Header</Option>
                          <Option value="bearer_token">Bearer Token</Option>
                          <Option value="basic_auth">Basic Authentication</Option>
                          <Option value="oauth2">OAuth 2.0</Option>
                          <Option value="none">No Authentication</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      {form.getFieldValue('custom_auth_method') === 'api_key_header' && (
                        <Form.Item
                          name="custom_auth_header_name"
                          label="Header Name"
                          rules={[{ required: true, message: 'Please enter header name' }]}
                        >
                          <Input placeholder="Authorization, X-API-Key, etc." />
                        </Form.Item>
                      )}
                    </Col>
                  </Row>

                  {(form.getFieldValue('custom_auth_method') === 'api_key_header' || 
                    form.getFieldValue('custom_auth_method') === 'bearer_token') && (
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="custom_auth_key_prefix"
                          label="Key Prefix"
                        >
                          <Input placeholder="Bearer , Api-Key , etc." />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="custom_auth_api_key"
                          label="API Key"
                          rules={[{ required: true, message: 'Please enter API key' }]}
                        >
                          <Input.Password placeholder="Your API key" />
                        </Form.Item>
                      </Col>
                    </Row>
                  )}

                  {form.getFieldValue('custom_auth_method') === 'basic_auth' && (
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="custom_auth_username"
                          label="Username"
                          rules={[{ required: true, message: 'Please enter username' }]}
                        >
                          <Input placeholder="Username" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="custom_auth_password"
                          label="Password"
                          rules={[{ required: true, message: 'Please enter password' }]}
                        >
                          <Input.Password placeholder="Password" />
                        </Form.Item>
                      </Col>
                    </Row>
                  )}

                  {form.getFieldValue('custom_auth_method') === 'oauth2' && (
                    <div>
                      <Row gutter={16}>
                        <Col span={8}>
                          <Form.Item
                            name="custom_oauth2_token_url"
                            label="Token URL"
                            rules={[{ required: true, message: 'Please enter token URL' }]}
                          >
                            <Input placeholder="https://oauth.provider.com/token" />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            name="custom_oauth2_client_id"
                            label="Client ID"
                            rules={[{ required: true, message: 'Please enter client ID' }]}
                          >
                            <Input placeholder="Your OAuth2 client ID" />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            name="custom_oauth2_client_secret"
                            label="Client Secret"
                            rules={[{ required: true, message: 'Please enter client secret' }]}
                          >
                            <Input.Password placeholder="Your OAuth2 client secret" />
                          </Form.Item>
                        </Col>
                      </Row>
                    </div>
                  )}
                </div>
              )}
            </TabPane>

            <TabPane tab="Model Parameters" key="3">
              <Title level={5}>Model Configuration Parameters</Title>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="temperature"
                    label="Temperature"
                    help="Controls randomness (0.0 - 2.0)"
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
                    help="Maximum tokens in response"
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
                    help="Nucleus sampling (0.0 - 1.0)"
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
                <Col span={8}>
                  <Form.Item
                    name="top_k"
                    label="Top K"
                    help="Top-k sampling"
                  >
                    <InputNumber
                      min={1}
                      max={100}
                      style={{ width: '100%' }}
                      placeholder="50"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="frequency_penalty"
                    label="Frequency Penalty"
                    help="Penalize frequent tokens (-2.0 to 2.0)"
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
                <Col span={8}>
                  <Form.Item
                    name="presence_penalty"
                    label="Presence Penalty"
                    help="Penalize new topics (-2.0 to 2.0)"
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
                name="stop_sequences"
                label="Stop Sequences"
                help="Comma-separated list of stop sequences"
              >
                <Input placeholder="<|im_end|>,<|endoftext|>,\n\n" />
              </Form.Item>
            </TabPane>
          </Tabs>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right', marginTop: 24 }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editingLlm ? 'Update Model' : 'Create Model'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LLMsPage;
