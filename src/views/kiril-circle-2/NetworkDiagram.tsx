import { useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
} from '@xyflow/react';
import type { Node, Edge, Connection } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import CircleNode from './CirlceNode';
import type { CircleNodeData } from './CirlceNode';
import CustomParallelEdge from './CustomParallelEdge';
import { useTheme } from '../../contexts/ThemeContext';

// Define custom node types
const nodeTypes = {
  circle: CircleNode,
};

// Define custom edge types
const edgeTypes = {
  parallel: CustomParallelEdge,
};

// Initial nodes with different segment configurations
const initialNodes: Node<CircleNodeData>[] = [
  {
    id: '1',
    type: 'circle',
    position: { x: 100, y: 200 },
    width: 120,
    height: 120,
    data: {
      label: 'dev.example.com',
      segments: [
        { value: 1062, color: '#4caf50', label: 'Healthy' },
        { value: 70, color: '#f44336', label: 'Errors' },
        { value: 60, color: '#ff9800', label: 'Unknown' },
      ],
      size: 120,
      strokeWidth: 25,
      link: '/combined-primereact', // Example: redirect to topology-1 page
    },
  },
  {
    id: '2',
    type: 'circle',
    position: { x: 500, y: 100 },
    width: 120,
    height: 120,
    data: {
      label: 'staging.example.com',
      segments: [
        { value: 850, color: '#ff9800', label: 'Healthy' },
        { value: 150, color: '#4caf50', label: 'Unknown' },
      ],
      size: 120,
      strokeWidth: 25,
      link: '/combined-primereact', // Example: redirect to circle-scheme-1 page
    },
  },
  {
    id: '3',
    type: 'circle',
    position: { x: 500, y: 350 },
    width: 120,
    height: 120,
    data: {
      label: 'prod.example.com',
      segments: [
        { value: 950, color: '#4caf50', label: 'Healthy' },
        { value: 50, color: '#f44336', label: 'Errors' },
      ],
      size: 120,
      strokeWidth: 25,
      link: '/combined-primereact', // Example: redirect to combined page
    },
  },
  {
    id: '4',
    type: 'circle',
    position: { x: 850, y: 250 },
    width: 120,
    height: 120,
    data: {
      label: 'test.example.com',
      segments: [
        { value: 950, color: '#4caf50', label: 'Healthy' },
        { value: 50, color: '#f44336', label: 'Errors' },
      ],
      size: 120,
      strokeWidth: 25,
      link: '/combined-primereact', // Example: external link opens in new tab
    },
  },
  {
    id: '5',
    type: 'circle',
    position: { x: 1100, y: 350 },
    width: 120,
    height: 120,
    data: {
      label: 'api.example.com',
      segments: [
        { value: 800, color: '#4caf50', label: 'Healthy' },
        { value: 100, color: '#f44336', label: 'Errors' },
        { value: 50, color: '#ff9800', label: 'Warning' },
      ],
      size: 120,
      strokeWidth: 25,
      link: '/combined-primereact', // Example: redirect to tree-example page
    },
  },
];

// Initial edges with parallel edges for spacing
const initialEdges: Edge[] = [
  // Two edges between nodes 1 and 2 with spacing (no handles - React Flow calculates from node boundaries)
  {
    id: 'e1-2-1',
    source: '1',
    target: '2',
    type: 'parallel',
    style: { stroke: '#1a73e8', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#1a73e8' },
    data: { offset: -15 },
  },
  {
    id: 'e1-2-2',
    source: '1',
    target: '2',
    type: 'parallel',
    style: { stroke: '#1a73e8', strokeWidth: 2, strokeDasharray: '5,5' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#1a73e8' },
    data: { offset: 15 },
  },
  // Five edges between nodes 3 and 5 with spacing (no handles - React Flow calculates from node boundaries)
  {
    id: 'e3-5-1',
    source: '3',
    target: '5',
    type: 'parallel',
    style: { stroke: '#1a73e8', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#1a73e8' },
    data: { offset: -40 },
  },
  {
    id: 'e3-5-2',
    source: '3',
    target: '5',
    type: 'parallel',
    style: { stroke: '#4caf50', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#4caf50' },
    data: { offset: -20 },
  },
  {
    id: 'e3-5-3',
    source: '3',
    target: '5',
    type: 'parallel',
    style: { stroke: '#1a73e8', strokeWidth: 2, strokeDasharray: '5,5' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#1a73e8' },
    data: { offset: 0 },
  },
  {
    id: 'e3-5-4',
    source: '3',
    target: '5',
    type: 'parallel',
    style: { stroke: '#ff9800', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#ff9800' },
    data: { offset: 20 },
  },
  {
    id: 'e3-5-5',
    source: '3',
    target: '5',
    type: 'parallel',
    style: { stroke: '#f44336', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#f44336' },
    data: { offset: 40 },
  },
];

export default function NetworkDiagram() {
  const { colorMode } = useTheme();
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'smoothstep',
            style: { stroke: '#1a73e8', strokeWidth: 2, strokeDasharray: '5,5' },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#1a73e8' },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        attributionPosition="bottom-left"
        colorMode={colorMode}
      >
        <Controls />
        <MiniMap />
        <Background gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
