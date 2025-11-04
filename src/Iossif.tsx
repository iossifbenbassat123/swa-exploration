import { useCallback, useRef } from "react";
import {
  Background,
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  ReactFlowProvider,
  Handle,
  Position,
  type Connection,
  type Edge,
  type Node,
  type OnConnectEnd,
  type NodeProps,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

const PRIMARY_COLOR = "#2E6BFF";
const BACKGROUND_COLOR = "#E3EBFF";
const TEXT_COLOR = "#363840";
const HEALTHY_COLOR = "#689F38";
const ERROR_COLOR = "#EF5350";
const UNKNOWN_COLOR = "#F57F17";

// Icon Components
const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
    />
  </svg>
);

const ExclamationIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
    />
  </svg>
);

const ExclamationTriangleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
    />
  </svg>
);

const ServerIcon = () => (
  <div
    style={{
      width: "40px",
      height: "40px",
      background: "#E3F9FF",
      borderRadius: "6px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="#58B2CC"
      style={{ width: "24px", height: "24px" }}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5.25 14.25h13.5m-13.5 0a3 3 0 0 1-3-3m3 3a3 3 0 1 0 0 6h13.5a3 3 0 1 0 0-6m-16.5-3a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3m-19.5 0a4.5 4.5 0 0 1 .9-2.7L5.737 5.1a3.375 3.375 0 0 1 2.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 0 1 .9 2.7m0 0a3 3 0 0 1-3 3m0 3h.008v.008h-.008v-.008Zm0-6h.008v.008h-.008v-.008Zm-3 6h.008v.008h-.008v-.008Zm0-6h.008v.008h-.008v-.008Z"
      />
    </svg>
  </div>
);

type ServerPoolData = {
  label: string;
  status: "healthy" | "errors" | "unknown";
  count?: number;
};

// Custom Server Pool Node Component
const ServerPoolNode = ({ data }: NodeProps<Node<ServerPoolData>>) => {
  const statusColor =
    data.status === "healthy"
      ? HEALTHY_COLOR
      : data.status === "errors"
      ? ERROR_COLOR
      : UNKNOWN_COLOR;

  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div
        style={{
          background: "#fff",
          border: "2px solid #999",
          borderRadius: "8px",
          padding: "12px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          minWidth: "200px",
        }}
      >
        {/* Server Icon */}
        <ServerIcon />

        {/* Text Content */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontWeight: 600,
              fontSize: "14px",
              color: TEXT_COLOR,
              marginBottom: "4px",
            }}
          >
            {data.label}
          </div>
          <div
            style={{
              fontSize: "12px",
              color: statusColor,
              fontWeight: 500,
            }}
          >
            {data.count ? `${data.count} ${data.status}` : data.status}
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
};

const nodeTypes = {
  serverPool: ServerPoolNode,
};

const initialNodes: Node[] = [
  {
    id: "0",
    type: "input",
    data: { label: "dev.example.com" },
    position: { x: 300, y: 50 },
    style: {
      background: BACKGROUND_COLOR,
      color: PRIMARY_COLOR,
      border: `1px solid ${PRIMARY_COLOR}`,
    },
  },
  {
    id: "1",
    type: "serverPool",
    data: { label: "server pool 001", status: "healthy" },
    position: { x: 0, y: 200 },
  },
  {
    id: "2",
    type: "serverPool",
    data: { label: "server pool 002", status: "errors", count: 25 },
    position: { x: 250, y: 200 },
  },
  {
    id: "3",
    type: "serverPool",
    data: { label: "server pool 003", status: "errors", count: 50 },
    position: { x: 500, y: 200 },
  },
  {
    id: "4",
    type: "serverPool",
    data: { label: "server pool 004", status: "unknown", count: 37 },
    position: { x: 750, y: 200 },
  },
];

const initialEdges: Edge[] = [
  {
    id: "e0-1",
    source: "0",
    target: "1",
    type: "smoothstep",
    style: { stroke: PRIMARY_COLOR },
  },
  {
    id: "e0-2",
    source: "0",
    target: "2",
    type: "smoothstep",
    style: { stroke: PRIMARY_COLOR },
  },
  {
    id: "e0-3",
    source: "0",
    target: "3",
    type: "smoothstep",
    style: { stroke: PRIMARY_COLOR },
  },
  {
    id: "e0-4",
    source: "0",
    target: "4",
    type: "smoothstep",
    style: { stroke: PRIMARY_COLOR },
  },
];

let id = 5;
const getId = () => `${id++}`;
const nodeOrigin: [number, number] = [0.5, 0];

const AddNodeOnEdgeDrop = () => {
  const reactFlowWrapper = useRef(null);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);
  const { screenToFlowPosition } = useReactFlow();

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onConnectEnd: OnConnectEnd = useCallback(
    (event, connectionState) => {
      // when a connection is dropped on the pane it's not valid
      if (!connectionState.isValid) {
        // we need to remove the wrapper bounds, in order to get the correct position
        const id = getId();
        const { clientX, clientY } =
          "changedTouches" in event ? event.changedTouches[0] : event;
        const newNode: Node = {
          id,
          position: screenToFlowPosition({
            x: clientX,
            y: clientY,
          }),
          data: { label: `Node ${id}` },
          origin: [0.5, 0.0],
        };

        setNodes((nds) => nds.concat(newNode));
        if (connectionState.fromNode) {
          setEdges((eds) =>
            eds.concat({ id, source: connectionState.fromNode!.id, target: id })
          );
        }
      }
    },
    [screenToFlowPosition, setNodes, setEdges]
  );

  return (
    <div
      className="wrapper"
      ref={reactFlowWrapper}
      style={{ width: "100%", height: "100%" }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectEnd={onConnectEnd}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 2 }}
        nodeOrigin={nodeOrigin}
      >
        <Background />
      </ReactFlow>
    </div>
  );
};

const AddNodeOnEdgeDropWithProvider = () => (
  <ReactFlowProvider>
    <AddNodeOnEdgeDrop />
  </ReactFlowProvider>
);

export default AddNodeOnEdgeDropWithProvider;
