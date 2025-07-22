import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  RobotOutlined,
  ApiOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
  SecurityScanOutlined,
  BarChartOutlined,
  SettingOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

const menuItems = [
  {
    key: '/',
    icon: <DashboardOutlined />,
    label: 'Dashboard',
  },
  {
    key: '/agents',
    icon: <RobotOutlined />,
    label: 'AI Agents',
  },
  {
    key: '/tools',
    icon: <ApiOutlined />,
    label: 'MCP Tools',
  },
  {
    key: '/llms',
    icon: <ThunderboltOutlined />,
    label: 'LLMs',
  },
  {
    key: '/rag',
    icon: <DatabaseOutlined />,
    label: 'RAG System',
  },
  {
    key: '/security',
    icon: <SecurityScanOutlined />,
    label: 'Security',
  },
  {
    key: '/metrics',
    icon: <BarChartOutlined />,
    label: 'Metrics',
  },
];

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  return (
    <Sider
      width={250}
      style={{
        background: '#fff',
        boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '1px solid #f0f0f0',
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#1890ff',
      }}>
        <SettingOutlined style={{ marginRight: '8px' }} />
        AI Platform
      </div>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
        style={{
          border: 'none',
          height: 'calc(100vh - 64px)',
        }}
      />
    </Sider>
  );
};

export default Sidebar;
