import { useCallback, useRef, useEffect } from "react";
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
import { usEastNodes, usEastEdges } from "./usEastData";
import CustomConnectionLine from "./CustomConnectionLine";
import ServerPoolNode from "./nodes/ServerPoolNode";
import ServerNode from "./nodes/ServerNode";
import RootNode from "./nodes/RootNode";

import "@xyflow/react/dist/style.css";

const nodeTypes = {
  root: RootNode,
  serverPool: ServerPoolNode,
  server: ServerNode,
};

let id = 100;
const getId = () => `us-east-${id++}`;
const nodeOrigin: [number, number] = [0.5, 0];

interface TopologyUsEastProps {
  selectedId?: string | null;
  onNodeClick?: (nodeId: string) => void;
}

const TopologyUsEast = ({ selectedId, onNodeClick }: TopologyUsEastProps) => {
  const reactFlowWrapper = useRef(null);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(usEastNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(usEastEdges);
  const { screenToFlowPosition } = useReactFlow();

  const idMapping: Record<string, string> = {
    "us-east": "us-east-root",
    "us-east-pool-1": "us-east-pool-1",
    "us-east-pool-2": "us-east-pool-2",
    "us-east-pool-3": "us-east-pool-3",
    "us-east-pool-1-w1": "us-east-server-1",
    "us-east-pool-1-w2": "us-east-server-2",
    "us-east-pool-1-w3": "us-east-server-3",
    "us-east-pool-2-w1": "us-east-server-4",
    "us-east-pool-2-w2": "us-east-server-5",
    "us-east-pool-3-w1": "us-east-server-6",
    "us-east-pool-3-w2": "us-east-server-7",
    "us-east-pool-3-w3": "us-east-server-8",
  };

  // Reverse mapping for clicks from topology to tree
  const reverseIdMapping: Record<string, string> = Object.entries(
    idMapping
  ).reduce((acc, [key, value]) => {
    acc[value] = key;
    return acc;
  }, {} as Record<string, string>);

  // Update node selection when selectedId changes
  useEffect(() => {
    const topologyNodeId = selectedId ? idMapping[selectedId] : null;
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        selected: node.id === topologyNodeId,
      }))
    );
  }, [selectedId, setNodes]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onConnectEnd: OnConnectEnd = useCallback(
    (event, connectionState) => {
      if (!connectionState.isValid) {
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

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const treeId = reverseIdMapping[node.id];
      if (treeId && onNodeClick) {
        onNodeClick(treeId);
      }
    },
    [reverseIdMapping, onNodeClick]
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
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        connectionLineComponent={CustomConnectionLine}
        fitView
        fitViewOptions={{ padding: 2 }}
        nodeOrigin={nodeOrigin}
      >
        <Background />
      </ReactFlow>
    </div>
  );
};

const TopologyUsEastWithProvider = ({
  selectedId,
  onNodeClick,
}: TopologyUsEastProps) => (
  <ReactFlowProvider>
    <TopologyUsEast selectedId={selectedId} onNodeClick={onNodeClick} />
  </ReactFlowProvider>
);

export default TopologyUsEastWithProvider;
