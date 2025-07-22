import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
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
  Select
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
  ControlOutlined
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
  ConnectionMode
} from 'reactflow';
import 'reactflow/dist/style.css';
import { pipelineAPI } from '../services/api';
import { PipelineComponent } from '../types';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Panel: CollapsePanel } = Collapse;

// Component node types for the pipeline
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

const PipelineBuilderPage: React.FC = () => {
  const { agentId: urlAgentId } = useParams<{ agentId: string }>();
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
  const [pipelineId, setPipelineId] = useState<string>('');

  useEffect(() => {
    const urlPipelineId = new URLSearchParams(window.location.search).get('pipelineId') || urlAgentId || 'default';
    setPipelineId(urlPipelineId);
    loadPipeline(urlPipelineId);
  }, [urlAgentId]);

  const loadPipeline = async (id: string) => {
    try {
      const pipeline = await pipelineAPI.get(id);
      
      const flowNodes = pipeline.nodes.map((comp: PipelineComponent) => {
        // Handle special node types (start and end)
        if (comp.type === 'start') {
          return {
            id: comp.id,
            type: 'startNode',
            position: comp.position,
            data: { 
              label: comp.config?.label || 'Start Here',
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
              label: comp.config?.label || 'End Here',
              type: 'end'
            },
            deletable: false,
            draggable: true
          };
        } else {
          // Handle regular component nodes
          return {
            id: comp.id,
            type: 'customNode',
            position: comp.position,
            data: { 
              label: comp.config?.label || comp.type,
              type: comp.type,
              ...comp.config 
            },
          };
        }
      });

      const flowEdges = pipeline.edges.map((edge, index) => ({
        id: `edge-${index}`,
        source: edge.source_component_id,
        target: edge.target_component_id,
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
      console.error('Error loading pipeline:', error);
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

      const position = {
        x: event.clientX - 200,
        y: event.clientY - 200,
      };

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
    [nodes, setNodes]
  );

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setSelectedEdges([]); // Clear edge selection when node is clicked
  }, []);

  const onNodeDoubleClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setSelectedEdges([]);
    nodeConfigForm.setFieldsValue({
      name: node.data.label,
      type: node.data.type,
      properties: JSON.stringify(node.data, null, 2)
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

  const handleSavePipeline = async (values: any) => {
    try {
      const pipelineData = {
        name: values.name || 'Untitled Pipeline',
        description: values.description || '',
        nodes: nodes.map(node => {
          // Handle special node types
          if (node.type === 'startNode') {
            return {
              id: node.id,
              type: 'start',
              position: node.position,
              config: {
                label: node.data.label,
                type: 'start'
              }
            };
          } else if (node.type === 'endNode') {
            return {
              id: node.id,
              type: 'end',
              position: node.position,
              config: {
                label: node.data.label,
                type: 'end'
              }
            };
          } else {
            // Handle regular component nodes
            return {
              id: node.id,
              type: node.data.type,
              position: node.position,
              config: node.data
            };
          }
        }),
        edges: edges.map(edge => ({
          source_component_id: edge.source!,
          target_component_id: edge.target!
        }))
      };

      await pipelineAPI.save(pipelineId, pipelineData);
      message.success('Pipeline saved successfully');
      setSaveModalVisible(false);
    } catch (error) {
      message.error('Failed to save pipeline');
      console.error('Error saving pipeline:', error);
    }
  };

  const handleNodeConfigSave = (values: any) => {
    if (!selectedNode) return;

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode.id) {
          return {
            ...node,
            data: {
              ...node.data,
              label: values.name,
              ...(values.properties ? JSON.parse(values.properties) : {})
            }
          };
        }
        return node;
      })
    );

    setNodeConfigModalVisible(false);
    message.success('Node configuration updated');
  };

  const handleTestPipeline = async () => {
    try {
      await pipelineAPI.test(agentId);
      message.success('Pipeline test completed successfully');
    } catch (error) {
      message.error('Pipeline test failed');
      console.error('Error testing pipeline:', error);
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

  const groupedComponents = componentTypes.reduce((acc, comp) => {
    if (!acc[comp.category]) {
      acc[comp.category] = [];
    }
    acc[comp.category].push(comp);
    return acc;
  }, {} as Record<string, typeof componentTypes>);

  return (
    <div style={{ height: '100vh', display: 'flex' }}>
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

      {/* Main Pipeline Canvas */}
      <div style={{ flex: 1 }}>
        <ReactFlowProvider>
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
                  onClick={handleTestPipeline}
                  title="Test Pipeline"
                >
                  Test
                </Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={() => setSaveModalVisible(true)}
                  title="Save Pipeline"
                >
                  Save
                </Button>
              </Space>
            </Panel>

            {/* Pipeline Info Panel */}
            <Panel position="top-left">
              <Card size="small" style={{ minWidth: '200px' }}>
                <Text strong>Pipeline Builder</Text>
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
                  💡 Pipeline Builder Controls:
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
        </ReactFlowProvider>
      </div>

      {/* Save Pipeline Modal */}
      <Modal
        title="Save Pipeline"
        open={saveModalVisible}
        onCancel={() => setSaveModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSavePipeline}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="name"
            label="Pipeline Name"
            rules={[{ required: true, message: 'Please enter pipeline name' }]}
          >
            <Input placeholder="Enter pipeline name" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={3} placeholder="Describe this pipeline" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setSaveModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Save Pipeline
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

          {/* Special configuration for Knowledgebase Retriever */}
          {selectedNode?.data.type === 'knowledgebase_retriever' && (
            <Form.Item
              name="search_type"
              label="Search Type"
              rules={[{ required: true, message: 'Please select search type' }]}
            >
              <Select placeholder="Select search type">
                <Select.Option value="keyword_only">Keyword Search Only</Select.Option>
                <Select.Option value="semantic_only">Semantic Search Only</Select.Option>
                <Select.Option value="comprehensive">Comprehensive Search</Select.Option>
              </Select>
            </Form.Item>
          )}

          <Form.Item
            name="properties"
            label="Node Configuration (JSON)"
            help="Configure node-specific properties and parameters"
          >
            <TextArea
              rows={8}
              placeholder={selectedNode?.data.type === 'knowledgebase_retriever' ? 
                `{
  "max_results": 10,
  "similarity_threshold": 0.8,
  "filters": {}
}` :
                `{
  "model": "gpt-4",
  "temperature": 0.7,
  "max_tokens": 1000
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
  );
};

export default PipelineBuilderPage;
