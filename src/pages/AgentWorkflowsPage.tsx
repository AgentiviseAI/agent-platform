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
  Popconfirm,
  Tag,
  Empty,
  Breadcrumb,
  Divider
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SettingOutlined,
  ApartmentOutlined,
  ThunderboltOutlined,
  HomeOutlined,
  UserOutlined,
  PartitionOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { workflowAPI, agentsAPI } from '../services/api';
import { Workflow, AIAgent } from '../types';

const { Title, Text } = Typography;
const { TextArea } = Input;

const AgentWorkflowsPage: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [agent, setAgent] = useState<AIAgent | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { agentId } = useParams<{ agentId: string }>();

  useEffect(() => {
    if (agentId) {
      fetchAgent();
      fetchWorkflows();
    }
  }, [agentId]);

  const fetchAgent = async () => {
    try {
      if (!agentId) return;
      const agentData = await agentsAPI.get(agentId);
      setAgent(agentData);
    } catch (error) {
      message.error('Failed to load agent details');
      console.error('Error fetching agent:', error);
    }
  };

  const fetchWorkflows = async () => {
    try {
      if (!agentId) return;
      setLoading(true);
      const response = await workflowAPI.listByAgent(agentId);
      setWorkflows(response.items);
    } catch (error) {
      message.error('Failed to load workflows');
      console.error('Error fetching workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingWorkflow(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (workflow: Workflow) => {
    setEditingWorkflow(workflow);
    form.setFieldsValue({
      name: workflow.name,
      description: workflow.description
    });
    setModalVisible(true);
  };

  const handleDelete = async (workflowId: string) => {
    try {
      await workflowAPI.deleteWorkflow(workflowId);
      message.success('Workflow deleted successfully');
      fetchWorkflows();
    } catch (error) {
      message.error('Failed to delete workflow');
      console.error('Error deleting workflow:', error);
    }
  };

  const handleSubmit = async (values: { name: string; description: string }) => {
    try {
      if (!agentId) return;
      
      if (editingWorkflow) {
        await workflowAPI.updateWorkflow(editingWorkflow.id!, values);
        message.success('Workflow updated successfully');
      } else {
        await workflowAPI.createForAgent(agentId, values);
        message.success('Workflow created successfully');
      }
      setModalVisible(false);
      fetchWorkflows();
    } catch (error) {
      message.error(editingWorkflow ? 'Failed to update workflow' : 'Failed to create workflow');
      console.error('Error saving workflow:', error);
    }
  };

  const handleCreateSimpleWorkflow = async () => {
    try {
      if (!agentId) return;
      
      const workflow = await workflowAPI.createSimpleWorkflow(agentId);
      message.success('Simple workflow created successfully');
      
      // Navigate to workflow builder with the new workflow
      navigate(`/workflow-builder?workflowId=${workflow.id}`);
    } catch (error) {
      message.error('Failed to create simple workflow');
      console.error('Error creating simple workflow:', error);
    }
  };

  const handleManageBuilder = (workflowId: string) => {
    navigate(`/workflow-builder?workflowId=${workflowId}`);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Workflow) => (
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
      title: 'Components',
      key: 'components',
      render: (record: Workflow) => (
        <Tag color="blue">{record.nodes?.length || 0} nodes</Tag>
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
      render: (record: Workflow) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
            title="Edit Workflow Details"
          />
          <Button
            type="text"
            icon={<SettingOutlined />}
            size="small"
            onClick={() => handleManageBuilder(record.id!)}
            title="Workflow Builder"
          />
          <Popconfirm
            title="Are you sure you want to delete this workflow?"
            onConfirm={() => handleDelete(record.id!)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              icon={<DeleteOutlined />}
              size="small"
              danger
              title="Delete Workflow"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const renderEmptyState = () => (
    <Empty
      image={<ApartmentOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
      description={
        <div>
          <Text type="secondary">No workflows created yet</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Create your first workflow to get started
          </Text>
        </div>
      }
    >
      <Button
        type="primary"
        icon={<ThunderboltOutlined />}
        onClick={handleCreateSimpleWorkflow}
        size="large"
      >
        Create a Simple Workflow
      </Button>
    </Empty>
  );

  return (
    <div>
      <div className="page-header">
        <Breadcrumb style={{ marginBottom: 16 }}>
          <Breadcrumb.Item>
            <Button 
              type="link" 
              icon={<HomeOutlined />} 
              onClick={() => navigate('/')}
              style={{ padding: 0 }}
            >
              Home
            </Button>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Button 
              type="link" 
              icon={<UserOutlined />} 
              onClick={() => navigate('/agents')}
              style={{ padding: 0 }}
            >
              Agents
            </Button>
          </Breadcrumb.Item>
          <Breadcrumb.Item>{agent?.name || 'Agent'}</Breadcrumb.Item>
          <Breadcrumb.Item>
            <PartitionOutlined style={{ marginRight: 8 }} />
            Workflows
          </Breadcrumb.Item>
        </Breadcrumb>
        
        <Title level={2} style={{ margin: 0 }}>
          Manage Workflows - {agent?.name}
        </Title>
        <Typography.Text type="secondary">
          Create and manage workflows for this agent
        </Typography.Text>
      </div>

      <Card className="content-card">
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <Typography.Text strong>Total Workflows: {workflows.length}</Typography.Text>
          </div>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              Create Workflow
            </Button>
          </Space>
        </div>

        <Divider />

        {workflows.length === 0 ? (
          renderEmptyState()
        ) : (
          <Table
            columns={columns}
            dataSource={workflows}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} workflows`,
            }}
          />
        )}
      </Card>

      <Modal
        title={editingWorkflow ? 'Edit Workflow' : 'Create Workflow'}
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
        >
          <Form.Item
            name="name"
            label="Workflow Name"
            rules={[
              { required: true, message: 'Please enter workflow name' },
              { max: 100, message: 'Name must be less than 100 characters' }
            ]}
          >
            <Input placeholder="Enter workflow name" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[
              { required: true, message: 'Please enter workflow description' },
              { max: 500, message: 'Description must be less than 500 characters' }
            ]}
          >
            <TextArea
              rows={3}
              placeholder="Describe what this workflow does"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editingWorkflow ? 'Update' : 'Create'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AgentWorkflowsPage;
