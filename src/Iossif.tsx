import { useCallback, useRef } from "react";
import {
  Background,
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  ReactFlowProvider,
  type Connection,
  type Edge,
  type Node,
  type OnConnectEnd,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

const initialNodes: Node[] = [
  {
    id: "0",
    type: "input",
    data: { label: "dev.example.com" },
    position: { x: 300, y: 50 },
    style: {
      background: "#e3f2fd",
      color: "#1565c0",
      border: "1px solid #1565c0",
    },
  },
  {
    id: "1",
    data: { label: "server pool 001" },
    position: { x: 0, y: 200 },
  },
  {
    id: "2",
    data: { label: "server pool 002" },
    position: { x: 200, y: 200 },
  },
  {
    id: "3",
    data: { label: "server pool 003" },
    position: { x: 400, y: 200 },
  },
  {
    id: "4",
    data: { label: "server pool 004" },
    position: { x: 600, y: 200 },
  },
];

const initialEdges: Edge[] = [
  {
    id: "e0-1",
    source: "0",
    target: "1",
    type: "smoothstep",
  },
  {
    id: "e0-2",
    source: "0",
    target: "2",
    type: "smoothstep",
  },
  {
    id: "e0-3",
    source: "0",
    target: "3",
    type: "smoothstep",
  },
  {
    id: "e0-4",
    source: "0",
    target: "4",
    type: "smoothstep",
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
