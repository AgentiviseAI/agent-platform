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
  Switch,
  Tabs,
  Row,
  Col,
  Statistic,
  Progress,
  Badge,
  Tag,
  Descriptions
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  SettingOutlined,
  LinkOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { ragAPI } from '../services/api';
import { RAGConnector, RAGMetricsConfig } from '../types';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const RAGPage: React.FC = () => {
  const [connectors, setConnectors] = useState<RAGConnector[]>([]);
  const [metricsConfig, setMetricsConfig] = useState<RAGMetricsConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [metricsModalVisible, setMetricsModalVisible] = useState(false);
  const [editingConnector, setEditingConnector] = useState<RAGConnector | null>(null);
  const [form] = Form.useForm();
  const [metricsForm] = Form.useForm();

  useEffect(() => {
    fetchConnectors();
    fetchMetricsConfig();
  }, []);

  const fetchConnectors = async () => {
    try {
      setLoading(true);
      const response = await ragAPI.getConnectors();
      setConnectors(response.items);
    } catch (error) {
      message.error('Failed to load RAG connectors');
      console.error('Error fetching connectors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetricsConfig = async () => {
    try {
      const response = await ragAPI.getMetricsConfig();
      setMetricsConfig(response);
      if (response) {
        metricsForm.setFieldsValue(response);
      }
    } catch (error) {
      console.error('Error fetching metrics config:', error);
      // Set default values if fetch fails
      const defaultConfig = {
        precision: 85,
        recall: 80,
        chunking_strategy: 'semantic',
        reranking_enabled: true,
        colbert_settings: '{\n  "model_path": "colbert-ir/colbertv2.0",\n  "index_name": "knowledge_base",\n  "k": 10\n}'
      };
      setMetricsConfig(defaultConfig);
      metricsForm.setFieldsValue(defaultConfig);
    }
  };

  const handleCreate = () => {
    setEditingConnector(null);
    form.resetFields();
    form.setFieldsValue({
      enabled: true,
      configured: false,
      connection_details: {}
    });
    setModalVisible(true);
  };

  const handleEdit = (connector: RAGConnector) => {
    setEditingConnector(connector);
    form.setFieldsValue({
      ...connector,
      connection_details_json: JSON.stringify(connector.connection_details || {}, null, 2)
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await ragAPI.deleteConnector(id);
      message.success('RAG connector deleted successfully');
      fetchConnectors();
    } catch (error) {
      message.error('Failed to delete RAG connector');
      console.error('Error deleting connector:', error);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const formData = {
        ...values,
        connection_details: values.connection_details_json ? 
          JSON.parse(values.connection_details_json) : {}
      };
      delete formData.connection_details_json;

      if (editingConnector) {
        await ragAPI.updateConnector(editingConnector.id, formData);
        message.success('RAG connector updated successfully');
      } else {
        await ragAPI.createConnector(formData);
        message.success('RAG connector created successfully');
      }
      setModalVisible(false);
      fetchConnectors();
    } catch (error) {
      message.error(editingConnector ? 'Failed to update connector' : 'Failed to create connector');
      console.error('Error saving connector:', error);
    }
  };

  const handleMetricsSubmit = async (values: RAGMetricsConfig) => {
    try {
      await ragAPI.updateMetricsConfig(values);
      message.success('Metrics configuration updated successfully');
      setMetricsModalVisible(false);
      fetchMetricsConfig();
    } catch (error) {
      message.error('Failed to update metrics configuration');
      console.error('Error updating metrics config:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'wiki': return <FileTextOutlined style={{ color: '#1890ff' }} />;
      case 'confluence': return <FileTextOutlined style={{ color: '#0052cc' }} />;
      case 'database': return <DatabaseOutlined style={{ color: '#52c41a' }} />;
      case 'document': return <FileTextOutlined style={{ color: '#722ed1' }} />;
      case 'spreadsheet': return <FileTextOutlined style={{ color: '#fa8c16' }} />;
      default: return <LinkOutlined />;
    }
  };

  const getStatusBadge = (configured: boolean, enabled: boolean) => {
    if (!configured) return <Badge status="warning" text="Not Configured" />;
    if (!enabled) return <Badge status="error" text="Disabled" />;
    return <Badge status="success" text="Active" />;
  };

  const columns = [
    {
      title: 'Connector',
      key: 'connector',
      render: (record: RAGConnector) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {getTypeIcon(record.type)}
          <div>
            <strong>{record.name}</strong>
            <br />
            <Tag>{record.type.toUpperCase()}</Tag>
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (record: RAGConnector) => getStatusBadge(record.configured, record.enabled),
    },
    {
      title: 'Configuration',
      key: 'config',
      render: (record: RAGConnector) => (
        <div>
          {record.configured ? (
            <div>
              <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 4 }} />
              <Text type="success">Configured</Text>
            </div>
          ) : (
            <div>
              <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 4 }} />
              <Text type="warning">Needs Setup</Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Connection Details',
      key: 'details',
      render: (record: RAGConnector) => {
        const details = record.connection_details || {};
        return (
          <div>
            {Object.keys(details).length > 0 ? (
              <Text style={{ fontSize: '12px' }}>
                {Object.keys(details).slice(0, 2).join(', ')}
                {Object.keys(details).length > 2 && ` +${Object.keys(details).length - 2} more`}
              </Text>
            ) : (
              <Text type="secondary">No details</Text>
            )}
          </div>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (record: RAGConnector) => (
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
            title="Edit Connector"
          />
          <Button
            type="text"
            icon={<SettingOutlined />}
            size="small"
            title="Configure"
          />
          <Button
            type="text"
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => handleDelete(record.id)}
            title="Delete Connector"
          />
        </Space>
      ),
    },
  ];

  const activeConnectors = connectors.filter(c => c.configured && c.enabled).length;
  const configuredConnectors = connectors.filter(c => c.configured).length;

  return (
    <div>
      <div className="page-header">
        <Title level={2} style={{ margin: 0 }}>RAG System</Title>
        <Typography.Text type="secondary">
          Manage Retrieval-Augmented Generation connectors and configurations
        </Typography.Text>
      </div>

      <Tabs 
        defaultActiveKey="connectors" 
        style={{ marginBottom: 0 }}
        items={[
          {
            key: 'connectors',
            label: 'Data Connectors',
            children: (
              <>
                {/* Statistics */}
                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                  <Col xs={24} sm={8}>
                    <Card>
                      <Statistic
                        title="Total Connectors"
                        value={connectors.length}
                        prefix={<DatabaseOutlined />}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Card>
                      <Statistic
                        title="Active Connectors"
                        value={activeConnectors}
                        prefix={<CheckCircleOutlined />}
                        valueStyle={{ color: '#3f8600' }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Card>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '14px', color: '#8c8c8c' }}>Configuration Progress</div>
                          <div style={{ fontSize: '24px', fontWeight: 600 }}>
                            {connectors.length > 0 ? Math.round((configuredConnectors / connectors.length) * 100) : 0}%
                          </div>
                        </div>
                        <Progress
                          type="circle"
                          percent={connectors.length > 0 ? Math.round((configuredConnectors / connectors.length) * 100) : 0}
                          size={60}
                        />
                      </div>
                    </Card>
                  </Col>
                </Row>

                <Card className="content-card">
                  <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <Typography.Text strong>Data Source Connectors</Typography.Text>
                    </div>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleCreate}
                    >
                      Add Connector
                    </Button>
                  </div>

                  <Table
                    columns={columns}
                    dataSource={connectors}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showTotal: (total: number, range: [number, number]) =>
                        `${range[0]}-${range[1]} of ${total} connectors`,
                    }}
                  />
                </Card>
              </>
            )
          },
          {
            key: 'metrics',
            label: 'Metrics Configuration',
            children: (
              <Card className="content-card">
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <Typography.Text strong>RAG Performance Metrics</Typography.Text>
                    <br />
                    <Typography.Text type="secondary">
                      Configure how RAG system performance is measured and optimized
                    </Typography.Text>
                  </div>
                  <Button
                    type="primary"
                    icon={<SettingOutlined />}
                    onClick={() => setMetricsModalVisible(true)}
                  >
                    Configure Metrics
                  </Button>
                </div>

                {metricsConfig && (
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={6}>
                      <Card>
                        <Statistic
                          title="Precision"
                          value={metricsConfig.precision}
                          precision={2}
                          suffix="%"
                          valueStyle={{ color: metricsConfig.precision > 0.8 ? '#3f8600' : '#cf1322' }}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Card>
                        <Statistic
                          title="Recall"
                          value={metricsConfig.recall}
                          precision={2}
                          suffix="%"
                          valueStyle={{ color: metricsConfig.recall > 0.8 ? '#3f8600' : '#cf1322' }}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Card>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '14px', color: '#8c8c8c' }}>Re-ranking</div>
                          <div style={{ fontSize: '20px', fontWeight: 600 }}>
                            {metricsConfig.reranking_enabled ? (
                              <Badge status="success" text="Enabled" />
                            ) : (
                              <Badge status="error" text="Disabled" />
                            )}
                          </div>
                        </div>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Card>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '14px', color: '#8c8c8c' }}>Strategy</div>
                          <div style={{ fontSize: '16px', fontWeight: 600 }}>
                            <Tag>{metricsConfig.chunking_strategy}</Tag>
                          </div>
                        </div>
                      </Card>
                    </Col>
                  </Row>
                )}
              </Card>
            )
          }
        ]}
      />

      {/* Create/Edit Connector Modal */}
      <Modal
        title={editingConnector ? 'Edit RAG Connector' : 'Add RAG Connector'}
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
          initialValues={{
            enabled: true,
            configured: false,
            connection_details: {},
            connection_details_json: ''
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Connector Name"
                rules={[{ required: true, message: 'Please enter connector name' }]}
              >
                <Input placeholder="Enter connector name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="Data Source Type"
                rules={[{ required: true, message: 'Please select type' }]}
              >
                <Select placeholder="Select data source type">
                  <Option value="wiki">Wiki</Option>
                  <Option value="confluence">Confluence</Option>
                  <Option value="database">Database</Option>
                  <Option value="document">Document Store</Option>
                  <Option value="spreadsheet">Spreadsheet</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="connection_details_json"
            label="Connection Configuration (JSON)"
            help="Specify connection details specific to your data source type"
          >
            <TextArea
              rows={8}
              placeholder={`{
  "host": "localhost",
  "port": 5432,
  "database": "knowledge_base",
  "username": "user",
  "password": "password",
  "ssl": true
}`}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="configured"
                label="Mark as Configured"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="enabled"
                label="Enabled"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editingConnector ? 'Update' : 'Create'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Metrics Configuration Modal */}
      <Modal
        title="Configure RAG Metrics"
        open={metricsModalVisible}
        onCancel={() => setMetricsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={metricsForm}
          layout="vertical"
          onFinish={handleMetricsSubmit}
          style={{ marginTop: 16 }}
          initialValues={{
            precision: 85,
            recall: 80,
            chunking_strategy: 'semantic',
            reranking_enabled: true,
            colbert_settings: '{\n  "model_path": "colbert-ir/colbertv2.0",\n  "index_name": "knowledge_base",\n  "k": 10\n}'
          }}
        >
          <Descriptions bordered style={{ marginBottom: 16 }}>
            <Descriptions.Item label="Current System" span={3}>
              RAG Performance Optimization
            </Descriptions.Item>
          </Descriptions>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="precision"
                label="Target Precision (%)"
                help="Percentage of retrieved documents that are relevant"
                rules={[{ required: true, message: 'Please enter precision' }]}
              >
                <Input type="number" min="0" max="100" suffix="%" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="recall"
                label="Target Recall (%)"
                help="Percentage of relevant documents that are retrieved"
                rules={[{ required: true, message: 'Please enter recall' }]}
              >
                <Input type="number" min="0" max="100" suffix="%" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="chunking_strategy"
            label="Chunking Strategy"
            rules={[{ required: true, message: 'Please select chunking strategy' }]}
          >
            <Select placeholder="Select chunking strategy">
              <Option value="fixed">Fixed Size Chunks</Option>
              <Option value="semantic">Semantic Chunking</Option>
              <Option value="recursive">Recursive Character Splitting</Option>
              <Option value="sentence">Sentence-based Chunking</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="reranking_enabled"
            label="Enable Re-ranking"
            valuePropName="checked"
            help="Use ColBERT or similar models to re-rank retrieved documents"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="colbert_settings"
            label="ColBERT Configuration"
            help="JSON configuration for ColBERT re-ranking model"
          >
            <TextArea
              rows={4}
              placeholder={`{
  "model_path": "colbert-ir/colbertv2.0",
  "index_name": "knowledge_base",
  "k": 10
}`}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setMetricsModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Update Configuration
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RAGPage;
