import {
  Background,
  ReactFlow,
  MarkerType,
  Controls,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CustomCircleNode from './CustomCircleNode';
import CustomParallelEdge from './CustomParallelEdge'; // Import the custom edge

const nodeTypes = {
  circleNode: CustomCircleNode,
};

const edgeTypes = {
  parallel: CustomParallelEdge, // Register the custom edge type
};

const initialNodes = [
  {
    id: '1',
    type: 'circleNode',
    position: { x: 100, y: 200 },
    data: {
      label: 'dev.example.com',
      healthy: 1062,
      errors: 70,
      unknown: 60,
    },
  },
  {
    id: '2',
    type: 'circleNode',
    position: { x: 500, y: 100 },
    data: {
      label: 'staging.example.com',
      healthy: 800,
      errors: 30,
      unknown: 20,
    },
  },
];

const initialEdges = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    type: 'parallel',
    sourceHandle: 'right-source',
    targetHandle: 'left',
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#3b82f6',
    },
    style: { stroke: '#3b82f6', strokeWidth: 2 },
    data: { offset: 15 },
  },
  {
    id: 'e2-1',
    source: '2',
    target: '1',
    type: 'parallel',
    sourceHandle: 'left-source',
    targetHandle: 'right',
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#666',
    },
    style: {
      stroke: '#666',
      strokeWidth: 2,
      strokeDasharray: '5,5',
    },
    data: { offset: -15 },
  },
];

export default function Flow() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes} // Add this!
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
