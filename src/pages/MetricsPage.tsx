import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Typography, 
  Space,
  Tabs,
  Select,
  DatePicker,
  Table
} from 'antd';
import { 
  TrophyOutlined,
  ThunderboltOutlined,
  DatabaseOutlined
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
// import { metricsAPI } from '../services/api';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

// Mock data for charts
const performanceData = [
  { time: '00:00', agents: 12, tools: 8, llms: 5 },
  { time: '04:00', agents: 15, tools: 12, llms: 7 },
  { time: '08:00', agents: 25, tools: 18, llms: 12 },
  { time: '12:00', agents: 32, tools: 24, llms: 15 },
  { time: '16:00', agents: 28, tools: 22, llms: 14 },
  { time: '20:00', agents: 20, tools: 15, llms: 9 },
];

const usageData = [
  { name: 'GPT-4', value: 45, color: '#1890ff' },
  { name: 'Claude', value: 25, color: '#52c41a' },
  { name: 'Gemini', value: 20, color: '#722ed1' },
  { name: 'Other', value: 10, color: '#fa8c16' },
];

const MetricsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('24h');
  const [agentMetrics, setAgentMetrics] = useState<any[]>([]);
  const [platformHealth] = useState({
    uptime: 99.9,
    responseTime: 245,
    errorRate: 0.1,
    throughput: 1250
  });

  useEffect(() => {
    fetchMetrics();
  }, [timeRange]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch from the API
      // const response = await metricsAPI.getOverview(timeRange);
      
      // Mock data for demonstration
      setAgentMetrics([
        { id: '1', name: 'Customer Support Agent', interactions: 1250, success_rate: 94.5, avg_response_time: 1.2, sentiment: 'positive' },
        { id: '2', name: 'Data Analysis Agent', interactions: 890, success_rate: 97.8, avg_response_time: 2.1, sentiment: 'neutral' },
        { id: '3', name: 'Content Generator', interactions: 650, success_rate: 92.1, avg_response_time: 0.8, sentiment: 'positive' },
      ]);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const agentColumns = [
    {
      title: 'Agent Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Interactions',
      dataIndex: 'interactions',
      key: 'interactions',
      render: (value: number) => value.toLocaleString(),
    },
    {
      title: 'Success Rate',
      dataIndex: 'success_rate',
      key: 'success_rate',
      render: (value: number) => `${value}%`,
    },
    {
      title: 'Avg Response Time',
      dataIndex: 'avg_response_time',
      key: 'avg_response_time',
      render: (value: number) => `${value}s`,
    },
    {
      title: 'Sentiment',
      dataIndex: 'sentiment',
      key: 'sentiment',
      render: (value: string) => (
        <span style={{ 
          color: value === 'positive' ? '#52c41a' : value === 'negative' ? '#ff4d4f' : '#1890ff' 
        }}>
          {value}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <Title level={2} style={{ margin: 0 }}>Telemetry & Metrics</Title>
        <Text type="secondary">
          Platform Performance and Analytics Dashboard
        </Text>
      </div>

      {/* Controls */}
      <Card style={{ marginBottom: 24 }}>
        <Space>
          <Text>Time Range:</Text>
          <Select value={timeRange} onChange={setTimeRange} style={{ width: 120 }}>
            <Option value="1h">Last Hour</Option>
            <Option value="24h">Last 24 Hours</Option>
            <Option value="7d">Last 7 Days</Option>
            <Option value="30d">Last 30 Days</Option>
          </Select>
          <RangePicker />
        </Space>
      </Card>

      <Tabs defaultActiveKey="overview">
        <TabPane tab="Overview" key="overview">
          {/* Key Performance Indicators */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={6}>
              <Card loading={loading}>
                <Statistic
                  title="Platform Uptime"
                  value={platformHealth.uptime}
                  precision={1}
                  suffix="%"
                  prefix={<TrophyOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card loading={loading}>
                <Statistic
                  title="Avg Response Time"
                  value={platformHealth.responseTime}
                  suffix="ms"
                  prefix={<ThunderboltOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card loading={loading}>
                <Statistic
                  title="Error Rate"
                  value={platformHealth.errorRate}
                  precision={1}
                  suffix="%"
                  prefix={<DatabaseOutlined />}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card loading={loading}>
                <Statistic
                  title="Throughput"
                  value={platformHealth.throughput}
                  suffix="/min"
                  prefix={<DatabaseOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Charts */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} lg={16}>
              <Card title="Performance Over Time" loading={loading}>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="agents" stroke="#1890ff" name="Agents" />
                    <Line type="monotone" dataKey="tools" stroke="#52c41a" name="Tools" />
                    <Line type="monotone" dataKey="llms" stroke="#722ed1" name="LLMs" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="Model Usage Distribution" loading={loading}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={usageData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {usageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ marginTop: 16 }}>
                  {usageData.map((item, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                      <div 
                        style={{ 
                          width: 12, 
                          height: 12, 
                          backgroundColor: item.color, 
                          borderRadius: '50%',
                          marginRight: 8 
                        }}
                      />
                      <Text style={{ fontSize: '12px' }}>{item.name}: {item.value}%</Text>
                    </div>
                  ))}
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Agent Performance" key="agents">
          <Card title="Agent Analytics" loading={loading}>
            <Table
              columns={agentColumns}
              dataSource={agentMetrics}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total: number, range: [number, number]) =>
                  `${range[0]}-${range[1]} of ${total} agents`,
              }}
            />
          </Card>
        </TabPane>

        <TabPane tab="System Health" key="health">
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card title="Resource Utilization" loading={loading}>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="agents" fill="#1890ff" name="CPU Usage %" />
                    <Bar dataKey="tools" fill="#52c41a" name="Memory Usage %" />
                    <Bar dataKey="llms" fill="#722ed1" name="GPU Usage %" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="User Engagement" key="engagement">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="User Activity" loading={loading}>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="agents" stroke="#1890ff" name="Active Users" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Engagement Metrics" loading={loading}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Statistic title="Daily Active Users" value={1254} />
                  <Statistic title="Session Duration" value={12.4} suffix=" min" />
                  <Statistic title="Bounce Rate" value={23.1} suffix="%" />
                  <Statistic title="User Satisfaction" value={4.7} suffix="/5.0" />
                </Space>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default MetricsPage;
