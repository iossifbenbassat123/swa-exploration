import { useCallback, useRef, useEffect, useMemo } from "react";
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
import { infrastructure1 } from "./infrastructureData";
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

  // Generate nodes and edges from infrastructure data
  const { initialNodes, initialEdges } = useMemo(() => {
    const usEastEnv = infrastructure1.nodes.find((n) => n.id === "us-east");
    if (!usEastEnv) return { initialNodes: [], initialEdges: [] };

    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Root node
    nodes.push({
      id: "us-east-root",
      type: "root",
      data: { label: usEastEnv.label },
      position: { x: 400, y: 50 },
    });

    // Server pools
    const pools = usEastEnv.children || [];
    pools.forEach((pool, poolIndex) => {
      const poolX = 100 + poolIndex * 300;
      nodes.push({
        id: pool.id,
        type: "serverPool",
        data: { label: pool.label, status: "healthy" },
        position: { x: poolX, y: 200 },
      });

      edges.push({
        id: `us-east-root-${pool.id}`,
        source: "us-east-root",
        target: pool.id,
      });

      // Group workloads by status
      const workloads = pool.children || [];
      const statusGroups: Record<string, typeof workloads> = {
        healthy: [],
        warning: [],
        error: [],
      };

      workloads.forEach((workload) => {
        const status = workload.status || "healthy";
        statusGroups[status].push(workload);
      });

      // Create stacked nodes for each status group
      let groupIndex = 0;
      Object.entries(statusGroups).forEach(([status, group]) => {
        if (group.length > 0) {
          const groupId = `${pool.id}-${status}-group`;
          const count = group.length;

          nodes.push({
            id: groupId,
            type: "server",
            data: {
              label: count > 1 ? `${count}x ${status}` : group[0].label,
              status: status as "healthy" | "warning" | "error",
              count: count > 1 ? count : undefined,
              workloads: group,
            },
            position: { x: poolX - 100 + groupIndex * 100, y: 350 },
          });

          edges.push({
            id: `${pool.id}-${groupId}`,
            source: pool.id,
            target: groupId,
          });

          groupIndex++;
        }
      });
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, []);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);
  const { screenToFlowPosition } = useReactFlow();

  // ID mapping includes workload-to-group mappings
  const idMapping: Record<string, string> = useMemo(() => {
    const mapping: Record<string, string> = { "us-east": "us-east-root" };
    const usEastEnv = infrastructure1.nodes.find((n) => n.id === "us-east");
    
    usEastEnv?.children?.forEach((pool) => {
      mapping[pool.id] = pool.id;
      
      // Group workloads by status
      const workloads = pool.children || [];
      const statusGroups: Record<string, typeof workloads> = {
        healthy: [],
        warning: [],
        error: [],
      };

      workloads.forEach((workload) => {
        const status = workload.status || "healthy";
        statusGroups[status].push(workload);
      });

      // Map each workload to its group
      Object.entries(statusGroups).forEach(([status, group]) => {
        if (group.length > 0) {
          const groupId = `${pool.id}-${status}-group`;
          group.forEach((workload) => {
            mapping[workload.id] = groupId;
          });
        }
      });
    });
    
    return mapping;
  }, []);

  // Reverse mapping for clicks from topology to tree
  const reverseIdMapping: Record<string, string> = useMemo(
    () =>
      Object.entries(idMapping).reduce((acc, [key, value]) => {
        acc[value] = key;
        return acc;
      }, {} as Record<string, string>),
    [idMapping]
  );

  // Update node selection when selectedId changes
  useEffect(() => {
    const topologyNodeId = selectedId ? idMapping[selectedId] : null;
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        selected: node.id === topologyNodeId,
      }))
    );
  }, [selectedId, setNodes, idMapping]);

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
        fitViewOptions={{ padding: 0.5, maxZoom: 1.2, minZoom: 0.5 }}
        defaultViewport={{ x: 0, y: 0, zoom: 1.2 }}
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
