import { useState, useCallback, useRef, useEffect, useMemo } from "react";
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
import { Tree } from "primereact/tree";
import type { TreeNode } from "primereact/treenode";
import {
  infrastructure1,
  infrastructureToTree,
  infrastructureToTopology,
  type InfrastructureNode,
} from "./infrastructureData";
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

let id = 13;
const getId = () => `${id++}`;
const nodeOrigin: [number, number] = [0.5, 0];

const IntegratedViewContent = () => {
  const reactFlowWrapper = useRef(null);

  const infrastructures = [infrastructure1];

  // Create a combined tree with all infrastructures' nodes at top level
  const [allTreeNodes] = useState<TreeNode[]>([
    ...infrastructureToTree(infrastructure1),
  ]);

  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Determine which infrastructure is selected based on the key
  const getInfraFromKey = (key: string | null): number => {
    if (!key) return -1;
    // Check all nodes to find which infrastructure this key belongs to
    for (let i = 0; i < infrastructures.length; i++) {
      const checkNode = (nodes: InfrastructureNode[]): boolean => {
        for (const node of nodes) {
          if (node.id === key) return true;
          if (node.children && checkNode(node.children)) return true;
        }
        return false;
      };
      if (checkNode(infrastructures[i].nodes)) return i;
    }
    return -1;
  };

  const selectedInfraIndex = getInfraFromKey(selectedKey);
  const currentInfra =
    selectedInfraIndex >= 0 ? infrastructures[selectedInfraIndex] : null;

  const { nodes: allNodes, edges: allEdges } = currentInfra
    ? infrastructureToTopology(currentInfra)
    : { nodes: [], edges: [] };

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(allNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(allEdges);
  const { screenToFlowPosition, fitView } = useReactFlow();

  // Update nodes and edges when infrastructure selection changes
  useEffect(() => {
    if (!currentInfra) {
      setNodes([]);
      setEdges([]);
      return;
    }
    const { nodes: newNodes, edges: newEdges } =
      infrastructureToTopology(currentInfra);
    setNodes(newNodes);
    setEdges(newEdges);
    setTimeout(() => fitView({ padding: 0.2 }), 100);
  }, [selectedInfraIndex, currentInfra, setNodes, setEdges, fitView]);

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

  // Filtered nodes and edges based on selection
  const [displayedNodes, setDisplayedNodes] = useState<Node[]>(nodes);
  const [displayedEdges, setDisplayedEdges] = useState<Edge[]>(edges);

  // Filter tree based on search query
  const filteredTreeNodes = useMemo(() => {
    if (!searchQuery.trim()) return allTreeNodes;

    const filterTree = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.reduce((acc: TreeNode[], node) => {
        const matchesSearch =
          node.label?.toLowerCase().includes(searchQuery.toLowerCase()) ??
          false;
        const filteredChildren = node.children ? filterTree(node.children) : [];

        if (matchesSearch || filteredChildren.length > 0) {
          acc.push({
            ...node,
            children:
              filteredChildren.length > 0 ? filteredChildren : node.children,
          });
        }
        return acc;
      }, []);
    };

    return filterTree(allTreeNodes);
  }, [searchQuery, allTreeNodes]);

  // Filter topology based on selected tree node, search query, and highlight selected nodes
  useEffect(() => {
    let nodesToDisplay = nodes;
    let edgesToDisplay = edges;

    // Apply search filter
    if (searchQuery.trim()) {
      const matchingNodeIds = nodes
        .filter((node) => {
          const label =
            typeof node.data?.label === "string" ? node.data.label : "";
          return label.toLowerCase().includes(searchQuery.toLowerCase());
        })
        .map((node) => node.id);

      nodesToDisplay = nodes.filter((node) =>
        matchingNodeIds.includes(node.id)
      );
      edgesToDisplay = edges.filter(
        (edge) =>
          matchingNodeIds.includes(edge.source) &&
          matchingNodeIds.includes(edge.target)
      );
    }

    // Apply selection highlighting
    if (!selectedKey || !currentInfra) {
      setDisplayedNodes(nodesToDisplay.map((n) => ({ ...n, selected: false })));
      setDisplayedEdges(edgesToDisplay);
      return;
    }

    // For top-level environment nodes, show the full infrastructure
    const isTopLevel = currentInfra.nodes.some(
      (node) => node.id === selectedKey
    );
    if (isTopLevel) {
      setDisplayedNodes(nodesToDisplay.map((n) => ({ ...n, selected: false })));
      setDisplayedEdges(edgesToDisplay);
      return;
    }

    // For non-top-level selections, highlight the selected node
    const updatedNodes = nodesToDisplay.map((node) => ({
      ...node,
      selected: node.id === selectedKey,
    }));

    setDisplayedNodes(updatedNodes);
    setDisplayedEdges(edgesToDisplay);
  }, [selectedKey, nodes, edges, currentInfra, searchQuery]);

  return (
    <div style={{ display: "flex", width: "100%", height: "100vh" }}>
      <style>{`
        .integrated-tree .p-tree-toggler {
          width: 14px !important;
          height: 14px !important;
          background: #2979FF !important;
          border-radius: 2px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          margin-right: 0.5rem !important;
          position: relative !important;
        }
        
        .integrated-tree .p-tree-toggler:hover {
          background: #1565C0 !important;
        }
        
        .integrated-tree .p-tree-toggler .p-tree-toggler-icon {
          display: none !important;
        }
        
        .integrated-tree .p-tree-toggler::after {
          content: '+';
          color: white;
          font-size: 12px;
          font-weight: bold;
          line-height: 1;
        }
        
        .integrated-tree .p-tree-node-content[aria-expanded="true"] .p-tree-toggler::after {
          content: '-';
        }
        
        .integrated-tree .p-tree-node-children {
          padding-left: 1rem;
          position: relative;
        }
        
        .integrated-tree .p-tree-node {
          position: relative;
        }
        
        .integrated-tree .p-tree-node-children::before {
          content: '';
          position: absolute;
          left: 7px;
          top: 0;
          bottom: 0;
          width: 1px;
          background: #d1d5db;
        }
        
        .integrated-tree .p-tree-node::before {
          content: '';
          position: absolute;
          left: -13px;
          top: 18px;
          width: 13px;
          height: 1px;
          background: #d1d5db;
        }
        
        .integrated-tree > .p-tree-container > .p-tree-node::before {
          display: none;
        }
        
        .integrated-tree .p-tree-node:last-child::after {
          content: '';
          position: absolute;
          left: -13px;
          top: 18px;
          bottom: 0;
          width: 1px;
          background: white;
        }
      `}</style>

      {/* Left Panel - Tree */}
      <div
        style={{
          width: "300px",
          minWidth: "300px",
          background: "#f9fafb",
          borderRight: "1px solid #e5e7eb",
          overflowY: "auto",
          padding: "1rem",
        }}
      >
        <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem" }}>
          Infrastructure
        </h3>

        {/* Search Bar */}
        <div style={{ marginBottom: "1rem" }}>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid #d1d5db",
              fontSize: "0.9rem",
              outline: "none",
            }}
          />
        </div>

        <Tree
          value={filteredTreeNodes}
          selectionMode="single"
          selectionKeys={selectedKey}
          onSelectionChange={(e) => setSelectedKey(e.value as string)}
          className="integrated-tree"
        />
      </div>

      {/* Center Panel - Topology */}
      <div
        ref={reactFlowWrapper}
        style={{
          flex: 1,
          background: "#fff",
          position: "relative",
        }}
      >
        <ReactFlow
          nodes={displayedNodes}
          edges={displayedEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onConnectEnd={onConnectEnd}
          nodeTypes={nodeTypes}
          connectionLineComponent={CustomConnectionLine}
          fitView
          fitViewOptions={{ padding: 2 }}
          nodeOrigin={nodeOrigin}
        >
          <Background />
        </ReactFlow>
      </div>

      {/* Right Panel - Details */}
      <div
        style={{
          width: "300px",
          minWidth: "300px",
          background: "#f9fafb",
          borderLeft: "1px solid #e5e7eb",
          padding: "1rem",
          overflowY: "auto",
        }}
      >
        <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem" }}>Details</h3>
        {selectedKey ? (
          <div>
            <p style={{ color: "#666", fontSize: "0.9rem" }}>
              Selected: <strong>{selectedKey}</strong>
            </p>
          </div>
        ) : (
          <p style={{ color: "#999", fontSize: "0.9rem" }}>
            Select an item from the tree to view details
          </p>
        )}
      </div>
    </div>
  );
};

const IntegratedView = () => (
  <ReactFlowProvider>
    <IntegratedViewContent />
  </ReactFlowProvider>
);

export default IntegratedView;
