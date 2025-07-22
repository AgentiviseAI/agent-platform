import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout, Spin, App as AntApp } from 'antd';
import { useAuth } from './contexts/AuthContext';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AgentsPage from './pages/AgentsPage';
import MCPToolsPage from './pages/MCPToolsPage';
import LLMsPage from './pages/LLMsPage';
import RAGPage from './pages/RAGPage';
import PipelineBuilderPage from './pages/PipelineBuilderPage';
import PipelinesListPage from './pages/PipelinesListPage';
import SecurityPage from './pages/SecurityPage';
import MetricsPage from './pages/MetricsPage';

const { Content } = Layout;

const App: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <AntApp>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}>
          <Spin size="large" />
        </div>
      </AntApp>
    );
  }

  if (!isAuthenticated) {
    return (
      <AntApp>
        <LoginPage />
      </AntApp>
    );
  }

  return (
    <AntApp>
      <Layout style={{ minHeight: '100vh' }}>
        <Sidebar />
        <Layout>
          <Header />
          <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
            <div style={{ 
              padding: 24, 
              minHeight: 360, 
              background: '#fff',
              borderRadius: 8 
            }}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/agents" element={<AgentsPage />} />
                <Route path="/agents/:agentId/pipeline" element={<PipelineBuilderPage />} />
                <Route path="/tools" element={<MCPToolsPage />} />
                <Route path="/llms" element={<LLMsPage />} />
                <Route path="/rag" element={<RAGPage />} />
                <Route path="/pipelines" element={<PipelinesListPage />} />
                <Route path="/pipeline-builder" element={<PipelineBuilderPage />} />
                <Route path="/security" element={<SecurityPage />} />
                <Route path="/metrics" element={<MetricsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </Content>
        </Layout>
      </Layout>
    </AntApp>
  );
};

export default App;
