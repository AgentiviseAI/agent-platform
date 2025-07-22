import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Typography, 
  Space,
  Progress,
  Badge,
  Table,
  Tag
} from 'antd';
import { 
  RobotOutlined,
  DatabaseOutlined,
  ThunderboltOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { agentsAPI, mcpToolsAPI, llmsAPI } from '../services/api';
import { AIAgent, MCPTool, LLM } from '../types';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalAgents: 0,
    activeAgents: 0,
    totalTools: 0,
    activeTools: 0,
    totalLLMs: 0,
    activeLLMs: 0
  });
  const [recentAgents, setRecentAgents] = useState<AIAgent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [agentsResponse, toolsResponse, llmsResponse] = await Promise.all([
        agentsAPI.list(),
        mcpToolsAPI.list(),
        llmsAPI.list()
      ]);

      const agents = agentsResponse.items;
      const tools = toolsResponse.items;
      const llms = llmsResponse.items;

      setStats({
        totalAgents: agents.length,
        activeAgents: agents.filter((a: AIAgent) => a.enabled).length,
        totalTools: tools.length,
        activeTools: tools.filter((t: MCPTool) => t.enabled).length,
        totalLLMs: llms.length,
        activeLLMs: llms.filter((l: LLM) => l.enabled).length
      });

      // Get recent agents (last 5)
      setRecentAgents(agents.slice(0, 5));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const agentColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: AIAgent) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.description}
          </Text>
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (record: AIAgent) => (
        <Space direction="vertical" size="small">
          <Badge 
            status={record.enabled ? 'success' : 'error'} 
            text={record.enabled ? 'Enabled' : 'Disabled'} 
          />
          {record.preview_enabled && (
                            <Tag color="blue">Active</Tag>
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
  ];

  return (
    <div>
      <div className="page-header">
        <Title level={2} style={{ margin: 0 }}>Dashboard</Title>
        <Text type="secondary">
          Overview of your AI platform
        </Text>
      </div>

      {/* Key Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="AI Agents"
              value={stats.totalAgents}
              prefix={<RobotOutlined />}
              suffix={
                <div style={{ fontSize: '14px', color: '#52c41a' }}>
                  {stats.activeAgents} active
                </div>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="MCP Tools"
              value={stats.totalTools}
              prefix={<DatabaseOutlined />}
              suffix={
                <div style={{ fontSize: '14px', color: '#52c41a' }}>
                  {stats.activeTools} active
                </div>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="LLM Models"
              value={stats.totalLLMs}
              prefix={<ThunderboltOutlined />}
              suffix={
                <div style={{ fontSize: '14px', color: '#52c41a' }}>
                  {stats.activeLLMs} active
                </div>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Success Rate"
              value={94.5}
              precision={1}
              prefix={<TrophyOutlined />}
              suffix="%"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      {/* System Health */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="System Health" loading={loading}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text>AI Agents</Text>
                  <Text>{((stats.activeAgents / Math.max(stats.totalAgents, 1)) * 100).toFixed(1)}%</Text>
                </div>
                <Progress 
                  percent={(stats.activeAgents / Math.max(stats.totalAgents, 1)) * 100} 
                  strokeColor="#52c41a"
                  size="small"
                />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text>MCP Tools</Text>
                  <Text>{((stats.activeTools / Math.max(stats.totalTools, 1)) * 100).toFixed(1)}%</Text>
                </div>
                <Progress 
                  percent={(stats.activeTools / Math.max(stats.totalTools, 1)) * 100} 
                  strokeColor="#1890ff"
                  size="small"
                />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text>LLM Models</Text>
                  <Text>{((stats.activeLLMs / Math.max(stats.totalLLMs, 1)) * 100).toFixed(1)}%</Text>
                </div>
                <Progress 
                  percent={(stats.activeLLMs / Math.max(stats.totalLLMs, 1)) * 100} 
                  strokeColor="#722ed1"
                  size="small"
                />
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Quick Actions" loading={loading}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Card size="small" style={{ cursor: 'pointer' }} onClick={() => window.location.href = '/agents'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <RobotOutlined style={{ color: '#1890ff' }} />
                  <div>
                    <Text strong>Create New Agent</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Set up a new AI agent
                    </Text>
                  </div>
                </div>
              </Card>
              <Card size="small" style={{ cursor: 'pointer' }} onClick={() => window.location.href = '/mcp-tools'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <DatabaseOutlined style={{ color: '#52c41a' }} />
                  <div>
                    <Text strong>Configure MCP Tool</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Add new tool integration
                    </Text>
                  </div>
                </div>
              </Card>
              <Card size="small" style={{ cursor: 'pointer' }} onClick={() => window.location.href = '/llms'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ThunderboltOutlined style={{ color: '#722ed1' }} />
                  <div>
                    <Text strong>Add LLM Model</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Configure language model
                    </Text>
                  </div>
                </div>
              </Card>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card 
            title="Recent AI Agents" 
            loading={loading}
            extra={
              <a href="/agents" style={{ color: '#1890ff' }}>
                View All
              </a>
            }
          >
            <Table
              columns={agentColumns}
              dataSource={recentAgents}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
