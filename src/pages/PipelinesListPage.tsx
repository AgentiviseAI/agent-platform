import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Typography, 
  Card, 
  message, 
  Tag, 
  Badge,
  Tooltip
} from 'antd';
import { 
  EyeOutlined,
  EditOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  SettingOutlined,
  NodeIndexOutlined,
  RobotOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { agentsAPI } from '../services/api';

const { Title, Text } = Typography;

interface PipelineListItem {
  id: string;
  agentId: string;
  agentName: string;
  name: string;
  status: 'active' | 'inactive' | 'draft';
  componentsCount: number;
  lastModified: string;
  description?: string;
}

const PipelinesListPage: React.FC = () => {
  const [pipelines, setPipelines] = useState<PipelineListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch agents
      const agentsResponse = await agentsAPI.list();
      
      // Create mock pipeline data based on agents
      const mockPipelines: PipelineListItem[] = agentsResponse.items.map(agent => ({
        id: `pipeline-${agent.id}`,
        agentId: agent.id,
        agentName: agent.name,
        name: `${agent.name} Pipeline`,
        status: agent.enabled ? 'active' : 'inactive',
        componentsCount: Math.floor(Math.random() * 10) + 3, // Mock component count
        lastModified: agent.created_at || new Date().toISOString(),
        description: `Pipeline configuration for ${agent.name}`
      }));
      
      setPipelines(mockPipelines);
    } catch (error) {
      message.error('Failed to load pipelines');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPipeline = (agentId: string) => {
    navigate(`/agents/${agentId}/pipeline`);
  };

  const handleEditAgent = () => {
    navigate(`/agents`);
  };

  const getStatusTag = (status: string) => {
    const statusConfig = {
      active: { color: 'green', text: 'Active' },
      inactive: { color: 'red', text: 'Inactive' },
      draft: { color: 'orange', text: 'Draft' }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns = [
    {
      title: 'Pipeline',
      key: 'pipeline',
      render: (record: PipelineListItem) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <NodeIndexOutlined style={{ fontSize: '16px', color: '#1890ff' }} />
          <div>
            <strong>{record.name}</strong>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.description || 'No description'}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Agent',
      key: 'agent',
      render: (record: PipelineListItem) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <RobotOutlined style={{ fontSize: '14px', color: '#52c41a' }} />
          <div>
            <Text strong>{record.agentName}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              ID: {record.agentId}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Components',
      dataIndex: 'componentsCount',
      key: 'components',
      render: (count: number) => (
        <div style={{ textAlign: 'center' }}>
          <Badge count={count} style={{ backgroundColor: '#1890ff' }} />
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Components
          </Text>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Last Modified',
      dataIndex: 'lastModified',
      key: 'lastModified',
      render: (date: string) => {
        const formattedDate = new Date(date).toLocaleDateString();
        const timeAgo = new Date(date).toLocaleTimeString();
        return (
          <div>
            <div>{formattedDate}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {timeAgo}
            </Text>
          </div>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (record: PipelineListItem) => (
        <Space>
          <Tooltip title="View Pipeline">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleViewPipeline(record.agentId)}
            />
          </Tooltip>
          <Tooltip title="Edit Pipeline">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleViewPipeline(record.agentId)}
            />
          </Tooltip>
          <Tooltip title="Edit Agent">
            <Button
              type="text"
              icon={<SettingOutlined />}
              size="small"
              onClick={() => handleEditAgent()}
            />
          </Tooltip>
          <Tooltip title={record.status === 'active' ? 'Deactivate' : 'Activate'}>
            <Button
              type="text"
              icon={record.status === 'active' ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              size="small"
              style={{ 
                color: record.status === 'active' ? '#faad14' : '#52c41a' 
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const activePipelines = pipelines.filter(p => p.status === 'active').length;
  const totalComponents = pipelines.reduce((sum, p) => sum + p.componentsCount, 0);

  return (
    <div>
      <div className="page-header">
        <Title level={2} style={{ margin: 0 }}>Agent Pipelines</Title>
        <Typography.Text type="secondary">
          Overview and management of all agent pipeline configurations
        </Typography.Text>
      </div>

      {/* Statistics Cards */}
      <div style={{ marginBottom: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <Card size="small">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
              {pipelines.length}
            </div>
            <div style={{ color: '#8c8c8c', fontSize: '14px' }}>Total Pipelines</div>
          </div>
        </Card>
        <Card size="small">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
              {activePipelines}
            </div>
            <div style={{ color: '#8c8c8c', fontSize: '14px' }}>Active Pipelines</div>
          </div>
        </Card>
        <Card size="small">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#722ed1' }}>
              {totalComponents}
            </div>
            <div style={{ color: '#8c8c8c', fontSize: '14px' }}>Total Components</div>
          </div>
        </Card>
        <Card size="small">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fa8c16' }}>
              {Math.round((activePipelines / pipelines.length) * 100) || 0}%
            </div>
            <div style={{ color: '#8c8c8c', fontSize: '14px' }}>Active Rate</div>
          </div>
        </Card>
      </div>

      <Card className="content-card">
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <Typography.Text strong>Pipeline Overview</Typography.Text>
            <br />
            <Typography.Text type="secondary">
              Manage and monitor all agent pipeline configurations
            </Typography.Text>
          </div>
          <Button
            type="primary"
            icon={<RobotOutlined />}
            onClick={() => navigate('/agents')}
          >
            Manage Agents
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={pipelines}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} pipelines`,
          }}
        />
      </Card>
    </div>
  );
};

export default PipelinesListPage;
