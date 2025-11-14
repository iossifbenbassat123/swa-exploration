import { useState, useMemo } from "react";
import { Tree } from "primereact/tree";
import type { TreeNode } from "primereact/treenode";
import {
  infrastructure1,
  infrastructureToTree,
  type InfrastructureNode,
} from "./infrastructureData";
import TopologyUsEast from "./TopologyUsEast";
import TopologyEuWest from "./TopologyEuWest";

import "@xyflow/react/dist/style.css";

// Map environment IDs to their topology components
const topologyMap: Record<
  string,
  React.ComponentType<{
    selectedId?: string | null;
    onNodeClick?: (nodeId: string) => void;
  }>
> = {
  "us-east": TopologyUsEast,
  "eu-west": TopologyEuWest,
};

const IntegratedView = () => {
  const [selectedKey, setSelectedKey] = useState<string | null>("us-east");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Create tree from infrastructure
  const allTreeNodes: TreeNode[] = useMemo(() => {
    return infrastructureToTree(infrastructure1);
  }, []);

  // Determine which topology to show based on selected environment
  const activeTopology = useMemo(() => {
    // Find the top-level environment node
    const findTopLevelEnv = (key: string | null): string | null => {
      if (!key) return null;

      // Check if the key itself is a top-level environment
      const isTopLevel = infrastructure1.nodes.some((node) => node.id === key);
      if (isTopLevel) return key;

      // Find which top-level environment contains this key
      for (const env of infrastructure1.nodes) {
        const checkNode = (nodes: typeof infrastructure1.nodes): boolean => {
          for (const node of nodes) {
            if (node.id === key) return true;
            if (node.children && checkNode(node.children)) return true;
          }
          return false;
        };

        if (env.children && checkNode(env.children)) {
          return env.id;
        }
      }

      return null;
    };

    const envId = findTopLevelEnv(selectedKey);
    return envId && topologyMap[envId] ? topologyMap[envId] : TopologyUsEast;
  }, [selectedKey]);

  // Determine active environment ID for key
  const activeEnvId = useMemo(() => {
    if (!selectedKey) return null;

    // Check if the key itself is a top-level environment
    const isTopLevel = infrastructure1.nodes.some(
      (node) => node.id === selectedKey
    );
    if (isTopLevel) return selectedKey;

    // Find which top-level environment contains this key
    for (const env of infrastructure1.nodes) {
      const checkNode = (nodes: typeof infrastructure1.nodes): boolean => {
        for (const node of nodes) {
          if (node.id === selectedKey) return true;
          if (node.children && checkNode(node.children)) return true;
        }
        return false;
      };

      if (env.children && checkNode(env.children)) {
        return env.id;
      }
    }

    return null;
  }, [selectedKey]);

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

  // Get the component to render
  const TopologyComponent = activeTopology;

  // Get selected node details from infrastructure
  const selectedNodeDetails = useMemo(() => {
    if (!selectedKey) return null;

    const findNode = (
      nodes: InfrastructureNode[]
    ): InfrastructureNode | null => {
      for (const node of nodes) {
        if (node.id === selectedKey) return node;
        if (node.children) {
          const found = findNode(node.children);
          if (found) return found;
        }
      }
      return null;
    };

    return findNode(infrastructure1.nodes);
  }, [selectedKey]);

  const handleNodeClick = (nodeId: string) => {
    setSelectedKey(nodeId);
  };

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
      <div style={{ width: "100%", height: "100%" }}>
        <TopologyComponent
          key={activeEnvId}
          selectedId={selectedKey}
          onNodeClick={handleNodeClick}
        />
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
        {selectedKey && selectedNodeDetails ? (
          <div>
            <div
              style={{
                padding: "0.75rem",
                background: "#fff",
                borderRadius: "4px",
                marginBottom: "1rem",
                border: "1px solid #e5e7eb",
              }}
            >
              <p
                style={{
                  color: "#111827",
                  fontSize: "1rem",
                  fontWeight: 600,
                  marginBottom: "0.5rem",
                }}
              >
                {selectedNodeDetails.label}
              </p>
              <p
                style={{
                  color: "#6b7280",
                  fontSize: "0.85rem",
                  marginBottom: "0.25rem",
                }}
              >
                <strong>ID:</strong> {selectedNodeDetails.id}
              </p>
              <p
                style={{
                  color: "#6b7280",
                  fontSize: "0.85rem",
                  marginBottom: "0.25rem",
                }}
              >
                <strong>Type:</strong>{" "}
                <span
                  style={{
                    padding: "0.125rem 0.5rem",
                    background:
                      selectedNodeDetails.type === "environment"
                        ? "#dbeafe"
                        : selectedNodeDetails.type === "serverPool"
                        ? "#fef3c7"
                        : "#ddd6fe",
                    color:
                      selectedNodeDetails.type === "environment"
                        ? "#1e40af"
                        : selectedNodeDetails.type === "serverPool"
                        ? "#92400e"
                        : "#5b21b6",
                    borderRadius: "4px",
                    fontSize: "0.8rem",
                    fontWeight: 500,
                  }}
                >
                  {selectedNodeDetails.type}
                </span>
              </p>
            </div>
            <p
              style={{
                color: "#6b7280",
                fontSize: "0.85rem",
                marginBottom: "0.5rem",
              }}
            >
              <strong>Active Environment:</strong> {activeEnvId || "None"}
            </p>
            {selectedNodeDetails.children && (
              <p style={{ color: "#6b7280", fontSize: "0.85rem" }}>
                <strong>Children:</strong> {selectedNodeDetails.children.length}
              </p>
            )}
          </div>
        ) : (
          <p style={{ color: "#999", fontSize: "0.9rem" }}>
            Select an item from the tree or topology to view details
          </p>
        )}
      </div>
    </div>
  );
};

export default IntegratedView;
