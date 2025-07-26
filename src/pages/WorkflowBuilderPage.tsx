import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Button, 
  Space, 
  Typography, 
  Card, 
  message, 
  Modal, 
  Form, 
  Input, 
  Collapse,
  Tag,
  Select,
  Breadcrumb
} from 'antd';
import { 
  SaveOutlined, 
  PlayCircleOutlined, 
  AppstoreOutlined,
  NodeIndexOutlined,
  BranchesOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
  ApiOutlined,
  EditOutlined,
  MessageOutlined,
  ToolOutlined,
  ControlOutlined,
  HomeOutlined,
  UserOutlined,
  PartitionOutlined
} from '@ant-design/icons';
import ReactFlow, {
  Node,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  ReactFlowProvider,
  Panel,
  Handle,
  Position,
  MarkerType,
  ConnectionLineType,
  ConnectionMode,
  useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';
import { workflowAPI } from '../services/api';
import { WorkflowComponent } from '../types';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Panel: CollapsePanel } = Collapse;

// Component node types for the workflow
const componentTypes = [
  {
    id: 'llm',
    name: 'LLM Model',
    category: 'AI Models',
    icon: <ThunderboltOutlined />,
    color: '#1890ff',
    description: 'Large Language Model processing node'
  },
  {
    id: 'knowledgebase_retriever',
    name: 'Knowledgebase Retriever',
    category: 'AI Models',
    icon: <DatabaseOutlined />,
    color: '#52c41a',
    description: 'Knowledge retrieval with search type options'
  },
  {
    id: 'prompt_rewriter',
    name: 'Prompt Rewriter',
    category: 'Processing',
    icon: <EditOutlined />,
    color: '#ff7a45',
    description: 'Rewrites and optimizes prompts for better results'
  },
  {
    id: 'inject_context',
    name: 'Inject Conversation Context',
    category: 'Processing',
    icon: <MessageOutlined />,
    color: '#40a9ff',
    description: 'Injects conversation history and context'
  },
  {
    id: 'mcp_tool_selector',
    name: 'MCP Tool Selector',
    category: 'Tools',
    icon: <ToolOutlined />,
    color: '#722ed1',
    description: 'Selects appropriate MCP tools based on context'
  },
  {
    id: 'mcp_tool_orchestrator',
    name: 'MCP Tool Orchestrator',
    category: 'Tools',
    icon: <ControlOutlined />,
    color: '#9254de',
    description: 'Orchestrates multiple MCP tool executions'
  },
  {
    id: 'mcp_tool',
    name: 'MCP Tool',
    category: 'Tools',
    icon: <ApiOutlined />,
    color: '#531dab',
    description: 'Model Context Protocol tool integration'
  },
  {
    id: 'condition',
    name: 'Condition',
    category: 'Logic',
    icon: <BranchesOutlined />,
    color: '#fa8c16',
    description: 'Conditional branching logic'
  },
  {
    id: 'transform',
    name: 'Transform',
    category: 'Processing',
    icon: <NodeIndexOutlined />,
    color: '#eb2f96',
    description: 'Data transformation and processing'
  },
  {
    id: 'input',
    name: 'Input',
    category: 'IO',
    icon: <AppstoreOutlined />,
    color: '#13c2c2',
    description: 'User input collection'
  },
  {
    id: 'output',
    name: 'Output',
    category: 'IO',
    icon: <AppstoreOutlined />,
    color: '#f5222d',
    description: 'Response output formatting'
  }
];

// Custom node component
const CustomNode = ({ data, id, selected }: { data: any; id: string; selected?: boolean }) => {
  const componentType = componentTypes.find(ct => ct.id === data.type);
  
  return (
    <div 
      style={{
        padding: '12px',
        borderRadius: '8px',
        border: `3px solid ${selected ? '#1890ff' : (componentType?.color || '#d9d9d9')}`,
        backgroundColor: selected ? '#f0f8ff' : 'white',
        minWidth: '160px',
        boxShadow: selected ? '0 4px 12px rgba(24,144,255,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
        position: 'relative',
        transform: selected ? 'scale(1.02)' : 'scale(1)',
        transition: 'all 0.2s ease'
      }}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        id={`${id}-input`}
        isConnectable={true}
        style={{
          background: '#555',
          width: '12px',
          height: '12px',
          border: '2px solid #fff',
          left: '-8px',
          top: '50%',
          transform: 'translateY(-50%)',
          cursor: 'crosshair'
        }}
      />
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ color: componentType?.color }}>
          {componentType?.icon}
        </span>
        <Text strong style={{ fontSize: '13px' }}>{data.label}</Text>
      </div>
      <div>
        <Tag color={componentType?.color} style={{ fontSize: '11px' }}>
          {componentType?.name}
        </Tag>
      </div>
      
      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id={`${id}-output`}
        isConnectable={true}
        style={{
          background: '#555',
          width: '12px',
          height: '12px',
          border: '2px solid #fff',
          right: '-8px',
          top: '50%',
          transform: 'translateY(-50%)',
          cursor: 'crosshair'
        }}
      />
    </div>
  );
};

// Start Node component - only output handle
const StartNode = ({ selected }: { data: any; selected?: boolean }) => {
  return (
    <div 
      style={{
        padding: '16px',
        borderRadius: '50%',
        border: `3px solid ${selected ? '#1890ff' : '#52c41a'}`,
        backgroundColor: selected ? '#f0f8ff' : '#f6ffed',
        minWidth: '80px',
        minHeight: '80px',
        boxShadow: selected ? '0 6px 16px rgba(24,144,255,0.3)' : '0 4px 12px rgba(0,0,0,0.15)',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        transform: selected ? 'scale(1.05)' : 'scale(1)',
        transition: 'all 0.2s ease'
      }}
    >
      <div style={{ fontSize: '24px', color: selected ? '#1890ff' : '#52c41a', marginBottom: '4px' }}>
        ▶️
      </div>
      <Text strong style={{ fontSize: '12px', color: selected ? '#1890ff' : '#52c41a', textAlign: 'center' }}>
        Start Here
      </Text>
      
      {/* Output Handle only */}
      <Handle
        type="source"
        position={Position.Right}
        id="start-output"
        isConnectable={true}
        style={{
          background: selected ? '#1890ff' : '#52c41a',
          width: '14px',
          height: '14px',
          border: '3px solid #fff',
          right: '-10px',
          top: '50%',
          transform: 'translateY(-50%)',
          cursor: 'crosshair'
        }}
      />
    </div>
  );
};

// End Node component - only input handle
const EndNode = ({ selected }: { data: any; selected?: boolean }) => {
  return (
    <div 
      style={{
        padding: '16px',
        borderRadius: '50%',
        border: `3px solid ${selected ? '#1890ff' : '#f5222d'}`,
        backgroundColor: selected ? '#f0f8ff' : '#fff2f0',
        minWidth: '80px',
        minHeight: '80px',
        boxShadow: selected ? '0 6px 16px rgba(24,144,255,0.3)' : '0 4px 12px rgba(0,0,0,0.15)',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        transform: selected ? 'scale(1.05)' : 'scale(1)',
        transition: 'all 0.2s ease'
      }}
    >
      <div style={{ fontSize: '24px', color: selected ? '#1890ff' : '#f5222d', marginBottom: '4px' }}>
        🏁
      </div>
      <Text strong style={{ fontSize: '12px', color: selected ? '#1890ff' : '#f5222d', textAlign: 'center' }}>
        End Here
      </Text>
      
      {/* Input Handle only */}
      <Handle
        type="target"
        position={Position.Left}
        id="end-input"
        isConnectable={true}
        style={{
          background: '#f5222d',
          width: '14px',
          height: '14px',
          border: '3px solid #fff',
          left: '-10px',
          top: '50%',
          transform: 'translateY(-50%)',
          cursor: 'crosshair'
        }}
      />
    </div>
  );
};

const nodeTypes = {
  customNode: CustomNode,
  startNode: StartNode,
  endNode: EndNode,
};

const WorkflowBuilderContent: React.FC = () => {
  const { agentId: urlAgentId } = useParams<{ agentId: string }>();
  const reactFlowInstance = useReactFlow();
  // Start with empty nodes - they will be loaded from the backend
  const initialNodes: Node[] = [];
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdges, setSelectedEdges] = useState<string[]>([]);
  // const [drawerVisible, setDrawerVisible] = useState(false);
  const [componentLibraryVisible, setComponentLibraryVisible] = useState(true);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [nodeConfigModalVisible, setNodeConfigModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [nodeConfigForm] = Form.useForm();
  const [agentId] = useState<string>('');
  const [agent, setAgent] = useState<any>(null);
  const [workflowId, setWorkflowId] = useState<string>('');
  const [nodeOptions, setNodeOptions] = useState<{
    llms: Array<{ id: string; name: string; model_name: string; provider: string; enabled: boolean }>;
    mcp_tools: Array<{ id: string; name: string; description: string; endpoint_url: string; enabled: boolean }>;
    rag_connectors: Array<{ id: string; name: string; type: string; configured: boolean; enabled: boolean }>;
  }>({ llms: [], mcp_tools: [], rag_connectors: [] });

  useEffect(() => {
    const urlWorkflowId = new URLSearchParams(window.location.search).get('workflowId') || urlAgentId || 'default';
    setWorkflowId(urlWorkflowId);
    loadWorkflow(urlWorkflowId);
    loadNodeOptions();
    
    // Load agent details if agentId is present
    if (urlAgentId) {
      loadAgent(urlAgentId);
    }
  }, [urlAgentId]);

  const loadAgent = async (agentId: string) => {
    try {
      const agentResponse = await fetch(`/api/v1/agents/${agentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (agentResponse.ok) {
        const agentData = await agentResponse.json();
        setAgent(agentData);
      }
    } catch (error) {
      console.error('Error loading agent:', error);
    }
  };

  const loadNodeOptions = async () => {
    try {
      const options = await workflowAPI.getNodeOptions();
      setNodeOptions(options);
    } catch (error) {
      console.error('Error loading node options:', error);
      // Don't show error to user as this is not critical
    }
  };

  const loadWorkflow = async (id: string) => {
    try {
      const workflow = await workflowAPI.get(id);
      
      // Add null/undefined checks for nodes and edges
      if (!workflow) {
        throw new Error('Workflow not found');
      }
      
      const workflowNodes = workflow.nodes || [];
      const workflowEdges = workflow.edges || [];
      
      const flowNodes = workflowNodes.map((comp: WorkflowComponent) => {
        // Handle special node types (start and end)
        if (comp.type === 'start') {
          return {
            id: comp.id,
            type: 'startNode',
            position: comp.position,
            data: { 
              label: comp.label || 'Start Here',
              type: 'start'
            },
            deletable: false,
            draggable: true
          };
        } else if (comp.type === 'end') {
          return {
            id: comp.id,
            type: 'endNode',
            position: comp.position,
            data: { 
              label: comp.label || 'End Here',
              type: 'end'
            },
            deletable: false,
            draggable: true
          };
        } else {
          // Handle regular component nodes with new schema
          return {
            id: comp.id,
            type: 'customNode',
            position: comp.position,
            data: { 
              label: comp.label || comp.type,
              type: comp.type,
              link: comp.link,
              ...comp.config 
            },
          };
        }
      });

      const flowEdges = workflowEdges.map((edge, index) => ({
        id: `edge-${index}`,
        source: edge.source,
        target: edge.target,
        type: 'smoothstep',
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: '#666',
        },
        style: {
          strokeWidth: 2,
          stroke: '#666',
        },
      }));

      setNodes(flowNodes);
      setEdges(flowEdges);
    } catch (error) {
      console.error('Error loading workflow:', error);
      console.error('Workflow ID:', id);
      
      // Log more details about the error
      if (error instanceof Error) {
        message.error(`Error loading workflow: ${error.message}`);
      } else {
        message.error('Failed to load workflow');
      }
      
      // If loading fails, create default start -> llm -> end structure
      const defaultNodes = [
        {
          id: 'start-node',
          type: 'startNode',
          position: { x: 100, y: 300 },
          data: { label: 'Start Here', type: 'start' },
          deletable: false,
          draggable: true
        },
        {
          id: 'llm-node',
          type: 'customNode',
          position: { x: 400, y: 300 },
          data: { 
            label: 'LLM Model',
            type: 'llm',
            model: 'gpt-4',
            temperature: 0.7,
            max_tokens: 1000
          },
        },
        {
          id: 'end-node',
          type: 'endNode',
          position: { x: 700, y: 300 },
          data: { label: 'End Here', type: 'end' },
          deletable: false,
          draggable: true
        }
      ];
      
      const defaultEdges = [
        {
          id: 'edge-start-llm',
          source: 'start-node',
          target: 'llm-node',
          type: 'smoothstep',
          animated: true,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: '#666',
          },
          style: {
            strokeWidth: 2,
            stroke: '#666',
          },
        },
        {
          id: 'edge-llm-end',
          source: 'llm-node',
          target: 'end-node',
          type: 'smoothstep',
          animated: true,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: '#666',
          },
          style: {
            strokeWidth: 2,
            stroke: '#666',
          },
        }
      ];
      
      setNodes(defaultNodes);
      setEdges(defaultEdges);
    }
  };

  const onConnect = useCallback(
    (params: Connection) => {
      console.log('Connection attempt:', params);
      
      // Validate connection
      if (!params.source || !params.target) {
        message.error('Invalid connection: missing source or target');
        return;
      }
      
      // Prevent self-connections
      if (params.source === params.target) {
        message.error('Cannot connect a node to itself');
        return;
      }
      
      // Check if connection already exists
      const existingConnection = edges.find(
        edge => edge.source === params.source && edge.target === params.target
      );
      
      if (existingConnection) {
        message.warning('Connection already exists between these nodes');
        return;
      }
      
      // Enhanced edge with styling and animation
      const newEdge = {
        ...params,
        id: `edge-${Date.now()}`, // Use timestamp for unique ID
        type: 'smoothstep',
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: '#666',
        },
        style: {
          strokeWidth: 2,
          stroke: '#666',
        },
      };
      
      console.log('Creating edge:', newEdge);
      setEdges((eds) => addEdge(newEdge, eds));
      message.success('Components connected successfully');
    },
    [setEdges, edges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const componentData = JSON.parse(event.dataTransfer.getData('application/component'));

      if (typeof type === 'undefined' || !type) {
        return;
      }

      // Convert screen coordinates to flow coordinates
      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode = {
        id: `node-${nodes.length + 1}`,
        type: 'customNode',
        position,
        data: { 
          label: componentData.name,
          type: componentData.id,
          category: componentData.category
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [nodes, setNodes, reactFlowInstance]
  );

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setSelectedEdges([]); // Clear edge selection when node is clicked
  }, []);

  const onNodeDoubleClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setSelectedEdges([]);
    
    // Extract configuration data using new schema
    const { label, type, link, ...configProperties } = node.data;
    
    nodeConfigForm.setFieldsValue({
      name: label,
      type: type,
      link: link,
      properties: Object.keys(configProperties).length > 0 ? JSON.stringify(configProperties, null, 2) : ''
    });
    setNodeConfigModalVisible(true);
  }, [nodeConfigForm]);

  const onEdgeClick = useCallback((_event: React.MouseEvent, edge: any) => {
    setSelectedEdges([edge.id]);
    setSelectedNode(null); // Clear node selection when edge is clicked
  }, []);

  // Handle keyboard events for deleting selected nodes and edges
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        // Delete selected edges
        if (selectedEdges.length > 0) {
          setEdges((eds) => eds.filter((edge) => !selectedEdges.includes(edge.id)));
          setSelectedEdges([]);
          message.success(`Deleted ${selectedEdges.length} connection(s)`);
          return;
        }
        
        // Delete selected nodes (except Start and End nodes)
        if (selectedNode) {
          if (selectedNode.type === 'start' || selectedNode.type === 'end') {
            message.warning('Start and End nodes cannot be deleted');
            return;
          }
          
          setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
          // Also remove any connected edges
          setEdges((eds) => eds.filter((edge) => 
            edge.source !== selectedNode.id && edge.target !== selectedNode.id
          ));
          setSelectedNode(null);
          message.success('Node deleted');
        }
      }
      
      // Clear selection with Escape key
      if (event.key === 'Escape') {
        setSelectedNode(null);
        setSelectedEdges([]);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedEdges, selectedNode, setEdges, setNodes]);

  const handleSaveWorkflow = async (values: any) => {
    try {
      // Helper function to generate UUID
      const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      };

      // Create a mapping of old IDs to new UUIDs
      const idMapping: Record<string, string> = {};
      
      const workflowNodes = nodes.map(node => {
        // Generate UUID if node doesn't have one or has simple ID
        const nodeId = node.id.includes('-') && node.id.length > 10 ? node.id : generateUUID();
        
        // Store the mapping from old ID to new UUID
        idMapping[node.id] = nodeId;
        
        // Handle special node types
        if (node.type === 'startNode') {
          return {
            id: nodeId,
            label: node.data.label,
            type: 'start',
            link: null,
            position: node.position,
            config: {}
          };
        } else if (node.type === 'endNode') {
          return {
            id: nodeId,
            label: node.data.label,
            type: 'end',
            link: null,
            position: node.position,
            config: {}
          };
        } else {
          // Handle regular component nodes with new schema
          const { label, type, link, ...configProperties } = node.data;
          return {
            id: nodeId,
            label: label || `${type} node`,
            type: type,
            link: link || null,
            position: node.position,
            config: configProperties
          };
        }
      });

      // Update edges to use the new UUIDs from the mapping
      const workflowEdges = edges.map(edge => ({
        source: idMapping[edge.source!] || edge.source!,
        target: idMapping[edge.target!] || edge.target!
      }));

      const workflowData = {
        name: values.name || 'Untitled Workflow',
        description: values.description || '',
        nodes: workflowNodes,
        edges: workflowEdges
      };

      await workflowAPI.save(workflowId, workflowData);
      message.success('Workflow saved successfully');
      setSaveModalVisible(false);
    } catch (error) {
      message.error('Failed to save workflow');
      console.error('Error saving workflow:', error);
    }
  };

  const handleNodeConfigSave = (values: any) => {
    if (!selectedNode) return;

    // Build the updated data with new schema structure
    const { properties, link } = values;
    const parsedProperties = properties ? JSON.parse(properties) : {};

    const updatedData = {
      label: values.name,
      type: selectedNode.data.type,
      link: link || null,
      ...parsedProperties
    };

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode.id) {
          return {
            ...node,
            data: updatedData
          };
        }
        return node;
      })
    );

    setNodeConfigModalVisible(false);
    message.success('Node configuration updated');
  };

  const handleTestWorkflow = async () => {
    try {
      await workflowAPI.test(agentId);
      message.success('Workflow test completed successfully');
    } catch (error) {
      message.error('Workflow test failed');
      console.error('Error testing workflow:', error);
    }
  };

  // Update nodes with selection state
  const styledNodes = nodes.map(node => ({
    ...node,
    selected: selectedNode?.id === node.id
  }));

  // Update edge styles based on selection
  const styledEdges = edges.map(edge => ({
    ...edge,
    style: {
      ...(edge.style || {}),
      strokeWidth: selectedEdges.includes(edge.id) ? 3 : 2,
      stroke: selectedEdges.includes(edge.id) ? '#1890ff' : '#666',
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: selectedEdges.includes(edge.id) ? '#1890ff' : '#666',
    }
  }));

  const onDragStart = (event: React.DragEvent, nodeType: string, componentData: any) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/component', JSON.stringify(componentData));
    event.dataTransfer.effectAllowed = 'move';
  };

  const navigate = useNavigate();

  const groupedComponents = componentTypes.reduce((acc, comp) => {
    if (!acc[comp.category]) {
      acc[comp.category] = [];
    }
    acc[comp.category].push(comp);
    return acc;
  }, {} as Record<string, typeof componentTypes>);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Breadcrumb Navigation */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f0f0', backgroundColor: '#fff' }}>
        <Breadcrumb
          items={[
            {
              href: '/',
              title: (
                <>
                  <HomeOutlined />
                  <span>Home</span>
                </>
              ),
              onClick: (e) => {
                e.preventDefault();
                navigate('/');
              },
            },
            {
              href: '/agents',
              title: (
                <>
                  <UserOutlined />
                  <span>Agents</span>
                </>
              ),
              onClick: (e) => {
                e.preventDefault();
                navigate('/agents');
              },
            },
            ...(urlAgentId ? [{
              href: `/agents/${urlAgentId}/workflows`,
              title: agent?.name || 'Agent',
              onClick: (e: any) => {
                e.preventDefault();
                navigate(`/agents/${urlAgentId}/workflows`);
              },
            }] : []),
            {
              href: urlAgentId ? `/agents/${urlAgentId}/workflows` : '/workflows',
              title: (
                <>
                  <PartitionOutlined />
                  <span>Workflows</span>
                </>
              ),
              onClick: (e) => {
                e.preventDefault();
                navigate(urlAgentId ? `/agents/${urlAgentId}/workflows` : '/workflows');
              },
            },
            {
              title: 'Workflow Builder',
            },
          ]}
        />
      </div>
      
      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex' }}>
        {/* Component Library Sidebar */}
        {componentLibraryVisible && (
          <div style={{ width: '300px', borderRight: '1px solid #f0f0f0', backgroundColor: '#fafafa' }}>
            <div style={{ padding: '16px' }}>
              <Title level={4} style={{ margin: 0, marginBottom: 16 }}>
                Component Library
              </Title>
            
            <Collapse ghost>
              {Object.entries(groupedComponents).map(([category, components]) => (
                <CollapsePanel
                  key={category}
                  header={<Text strong>{category}</Text>}
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {components.map((comp) => (
                      <Card
                        key={comp.id}
                        size="small"
                        draggable
                        onDragStart={(e) => onDragStart(e, 'customNode', comp)}
                        style={{ 
                          cursor: 'grab',
                          borderColor: comp.color
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ color: comp.color }}>{comp.icon}</span>
                          <div>
                            <Text strong style={{ fontSize: '12px' }}>{comp.name}</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: '10px' }}>
                              {comp.description}
                            </Text>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </Space>
                </CollapsePanel>
              ))}
            </Collapse>
          </div>
        </div>
      )}

      {/* Main Workflow Canvas */}
      <div style={{ flex: 1 }}>
        <ReactFlow
          nodes={styledNodes}
          edges={styledEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={onNodeClick}
          onNodeDoubleClick={onNodeDoubleClick}
          onEdgeClick={onEdgeClick}
          nodeTypes={nodeTypes}
          connectionLineType={ConnectionLineType.SmoothStep}
          connectionLineStyle={{ strokeWidth: 3, stroke: '#1890ff' }}
          connectionMode={ConnectionMode.Loose}
          connectOnClick={true}
          selectNodesOnDrag={false}
          multiSelectionKeyCode="Control"
          deleteKeyCode="Delete"
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: true,
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
              color: '#666',
            },
            style: {
              strokeWidth: 2,
              stroke: '#666',
            },
          }}
          fitView
          snapToGrid={true}
          snapGrid={[15, 15]}
          minZoom={0.2}
          maxZoom={2}
        >
            <Controls />
            <Background />
            
            {/* Top Panel with Actions */}
            <Panel position="top-right">
              <Space>
                <Button
                  icon={<AppstoreOutlined />}
                  onClick={() => setComponentLibraryVisible(!componentLibraryVisible)}
                  title="Toggle Component Library"
                />
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={handleTestWorkflow}
                  title="Test Workflow"
                >
                  Test
                </Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={() => setSaveModalVisible(true)}
                  title="Save Workflow"
                >
                  Save
                </Button>
              </Space>
            </Panel>

            {/* Workflow Info Panel */}
            <Panel position="top-left">
              <Card size="small" style={{ minWidth: '200px' }}>
                <Text strong>Workflow Builder</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Agent ID: {agentId}
                </Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Nodes: {nodes.length} | Edges: {edges.length}
                </Text>
              </Card>
            </Panel>

            {/* Connection Instructions Panel */}
            <Panel position="bottom-left">
              <Card size="small" style={{ maxWidth: '300px', backgroundColor: '#f6ffed', borderColor: '#b7eb8f' }}>
                <Text strong style={{ color: '#52c41a', fontSize: '12px' }}>
                  💡 Workflow Builder Controls:
                </Text>
                <br />
                <Text style={{ fontSize: '11px' }}>
                  <strong>Connect:</strong> Drag from right handle (●) to left handle (●)
                  <br />
                  <strong>Configure:</strong> Click nodes to open settings
                  <br />
                  <strong>Delete Edges:</strong> Click edge → Press Delete/Backspace
                  <br />
                  <strong>Delete Nodes:</strong> Click node → Press Delete/Backspace
                  <br />
                  <strong>Add Nodes:</strong> Drag from component library
                  <br />
                  <strong>Clear Selection:</strong> Press Escape
                </Text>
                <br />
                <Text type="secondary" style={{ fontSize: '10px' }}>
                  Nodes: {nodes.length} | Edges: {edges.length}
                </Text>
              </Card>
            </Panel>
          </ReactFlow>
      </div>

      {/* Save Workflow Modal */}
      <Modal
        title="Save Workflow"
        open={saveModalVisible}
        onCancel={() => setSaveModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveWorkflow}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="name"
            label="Workflow Name"
            rules={[{ required: true, message: 'Please enter workflow name' }]}
          >
            <Input placeholder="Enter workflow name" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={3} placeholder="Describe this workflow" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setSaveModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Save Workflow
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Node Configuration Modal */}
      <Modal
        title={`Configure ${selectedNode?.data.label || 'Node'}`}
        open={nodeConfigModalVisible}
        onCancel={() => setNodeConfigModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={nodeConfigForm}
          layout="vertical"
          onFinish={handleNodeConfigSave}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="name"
            label="Node Name"
            rules={[{ required: true, message: 'Please enter node name' }]}
          >
            <Input placeholder="Enter node name" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Component Type"
          >
            <Input disabled />
          </Form.Item>

          {/* LLM Selection */}
          {selectedNode?.data.type === 'llm' && (
            <Form.Item
              name="link"
              label="Select LLM"
              rules={[{ required: true, message: 'Please select an LLM' }]}
            >
              <Select 
                placeholder="Select an LLM"
                optionLabelProp="label"
              >
                {(nodeOptions.llms || []).map(llm => (
                  <Select.Option 
                    key={llm.id} 
                    value={llm.id}
                    label={`${llm.name} (${llm.model_name})`}
                  >
                    <div>
                      <strong>{llm.name}</strong>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {llm.model_name}
                      </div>
                    </div>
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}

          {/* MCP Tool Selection */}
          {selectedNode?.data.type === 'mcp_tool' && (
            <Form.Item
              name="link"
              label="Select MCP Tool"
              rules={[{ required: true, message: 'Please select an MCP tool' }]}
            >
              <Select placeholder="Select an MCP tool">
                {(nodeOptions.mcp_tools || []).map(tool => (
                  <Select.Option key={tool.id} value={tool.id}>
                    <div>
                      <strong>{tool.name}</strong>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {tool.description}
                      </div>
                    </div>
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}

          {/* RAG Connector Selection */}
          {selectedNode?.data.type === 'knowledgebase_retriever' && (
            <Form.Item
              name="link"
              label="Select Knowledge Base"
              rules={[{ required: true, message: 'Please select a knowledge base' }]}
            >
              <Select placeholder="Select a knowledge base">
                {(nodeOptions.rag_connectors || []).map(connector => (
                  <Select.Option key={connector.id} value={connector.id}>
                    <div>
                      <strong>{connector.name}</strong>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        Type: {connector.type}
                      </div>
                    </div>
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item
            name="properties"
            label="Additional Configuration (JSON)"
            help="Optional additional configuration parameters"
          >
            <TextArea
              rows={6}
              placeholder={selectedNode?.data.type === 'llm' ? 
                `{
  "temperature": 0.7,
  "max_tokens": 1000,
  "top_p": 1.0
}` :
                selectedNode?.data.type === 'knowledgebase_retriever' ? 
                `{
  "max_results": 10,
  "similarity_threshold": 0.8,
  "filters": {}
}` :
                selectedNode?.data.type === 'mcp_tool' ?
                `{
  "timeout": 30,
  "retry_count": 3
}` :
                `{
  "custom_parameter": "value"
}`}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setNodeConfigModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Update Node
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      </div>
    </div>
  );
};

// Wrapper component that provides ReactFlowProvider context
const WorkflowBuilderPage: React.FC = () => {
  return (
    <ReactFlowProvider>
      <WorkflowBuilderContent />
    </ReactFlowProvider>
  );
};

export default WorkflowBuilderPage;
