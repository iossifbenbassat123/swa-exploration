import { useState, useMemo, useEffect } from "react";
import { Tree, type NodeRendererProps } from "react-arborist";
import type { InfrastructureNode } from "../../infrastructureData";
import { INFRASTRUCTURE } from "../../constants";
import TopologyUsEast from "../../topologies/ReactFlow/TopologyUsEast";
import TopologyEuWest from "../../topologies/ReactFlow/TopologyEuWest";
import { SearchInput } from "../../shared/SearchInput";
import { DetailsPanel } from "../../shared/DetailsPanel";
import { getTypeColor, getStatusColor, findNode, findTopLevelEnv } from "../../shared/TreeUtils";

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

// Convert infrastructure data to react-arborist format
interface TreeData {
  id: string;
  name: string;
  type: "environment" | "serverPool" | "workload";
  status?: "healthy" | "warning" | "error";
  children?: TreeData[];
  isLoadMore?: boolean;
  isLoadAll?: boolean;
  poolId?: string;
  totalCount?: number;
}

function convertToTreeData(
  nodes: InfrastructureNode[],
  workloadLimits: Record<string, number> = {}
): TreeData[] {
  return nodes.map((node) => {
    let children: TreeData[] | undefined;

    if (node.children) {
      // If this is a serverPool with many workloads, limit them
      if (node.type === "serverPool" && node.children.length > 10) {
        const limit = workloadLimits[node.id] || 10;
        const displayedChildren = node.children.slice(0, limit);
        const hasMore = limit < node.children.length;

        children = displayedChildren.map((child) => ({
          id: child.id,
          name: child.label,
          type: child.type,
          status: child.status,
          children: child.children
            ? convertToTreeData(child.children, workloadLimits)
            : undefined,
        }));

        // Add "Load More" and "Load All" nodes if there are more items
        if (hasMore) {
          children.push({
            id: `${node.id}-load-more`,
            name: `Load More (${node.children.length - limit} remaining)`,
            type: "workload",
            isLoadMore: true,
            poolId: node.id,
            totalCount: node.children.length,
          });
          children.push({
            id: `${node.id}-load-all`,
            name: `Load All (${node.children.length} total)`,
            type: "workload",
            isLoadMore: true,
            isLoadAll: true,
            poolId: node.id,
            totalCount: node.children.length,
          });
        }
      } else {
        children = convertToTreeData(node.children, workloadLimits);
      }
    }

    return {
      id: node.id,
      name: node.label,
      type: node.type,
      status: node.status,
      children,
    };
  });
}

const CombinedView = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [workloadDisplayLimit, setWorkloadDisplayLimit] = useState<
    Record<string, number>
  >({});
  const [expandedPoolId, setExpandedPoolId] = useState<string | null>(null);

  // Debounce search term to prevent crashes with large datasets
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Convert infrastructure data to tree format with limits
  const treeData = useMemo(
    () => convertToTreeData(INFRASTRUCTURE.nodes, workloadDisplayLimit),
    [workloadDisplayLimit]
  );

  // Find selected node details
  const selectedNode = selectedId
    ? findNode(INFRASTRUCTURE.nodes, selectedId)
    : null;

  // Determine which topology to show based on selected environment
  const activeTopology = useMemo(() => {
    const envId = findTopLevelEnv(INFRASTRUCTURE.nodes, selectedId);
    return envId && topologyMap[envId] ? topologyMap[envId] : TopologyUsEast;
  }, [selectedId]);

  // Determine active environment ID for key
  const activeEnvId = useMemo(() => {
    return findTopLevelEnv(INFRASTRUCTURE.nodes, selectedId);
  }, [selectedId]);

  const handleNodeClick = (nodeId: string) => {
    setSelectedId(nodeId);
  };

  // Get the component to render
  const TopologyComponent = activeTopology;

  // Custom node renderer
  const Node = ({ node, style, dragHandle }: NodeRendererProps<TreeData>) => {
    const typeColors = getTypeColor(node.data.type);
    const isSelected = node.id === selectedId;
    const isLoadMore = node.data.isLoadMore;

    // Check if this node should be sticky (parent of expanded pool)
    const isParentOfExpandedPool =
      expandedPoolId &&
      (node.id === expandedPoolId ||
        (expandedPoolId &&
          INFRASTRUCTURE.nodes.find(
            (env: InfrastructureNode) =>
              env.id === node.id &&
              env.children?.some(
                (pool: InfrastructureNode) => pool.id === expandedPoolId
              )
          )));

    // Calculate sticky position based on node level
    const getStickyTop = () => {
      if (!isParentOfExpandedPool) return undefined;
      if (node.data.type === "environment") return 0;
      if (node.data.type === "serverPool") return 36; // height of one row
      return undefined;
    };

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "0.375rem 0.5rem",
          cursor: "pointer",
          background: isLoadMore
            ? "#f0f9ff"
            : isSelected
            ? "#e0f2fe"
            : isParentOfExpandedPool
            ? "#f9fafb"
            : "transparent",
          borderRadius: "4px",
          transition: "background 0.15s ease",
          position: isParentOfExpandedPool ? "sticky" : "relative",
          top: getStickyTop(),
          zIndex: isParentOfExpandedPool
            ? node.data.type === "environment"
              ? 12
              : 11
            : 1,
          ...style,
        }}
        ref={dragHandle}
        onClick={() => {
          if (isLoadMore && node.data.poolId) {
            if (node.data.isLoadAll) {
              // Load all workloads
              setWorkloadDisplayLimit((prev) => ({
                ...prev,
                [node.data.poolId!]: node.data.totalCount || Infinity,
              }));
              setExpandedPoolId(node.data.poolId);
            } else {
              // Load 20 more workloads
              setWorkloadDisplayLimit((prev) => ({
                ...prev,
                [node.data.poolId!]: (prev[node.data.poolId!] || 10) + 20,
              }));
              setExpandedPoolId(node.data.poolId);
            }
          } else {
            setSelectedId(node.id);
            // Track if we're in a workload view
            if (node.data.type === "workload" && !node.data.isLoadMore) {
              const poolMatch = node.id.match(/^(.+-pool-\d+)-w\d+$/);
              if (poolMatch) {
                setExpandedPoolId(poolMatch[1]);
              }
            } else if (node.data.type === "serverPool") {
              setExpandedPoolId(node.id);
            } else if (node.data.type === "environment") {
              setExpandedPoolId(null);
            }
          }
        }}
        onMouseEnter={(e) => {
          if (!isSelected) {
            e.currentTarget.style.background = "#f9fafb";
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            e.currentTarget.style.background = "transparent";
          }
        }}
      >
        {/* Toggle button */}
        {node.children && node.children.length > 0 && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              node.toggle();
            }}
            style={{
              width: "16px",
              height: "16px",
              background: "#2979FF",
              borderRadius: "2px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: "0.5rem",
              color: "white",
              fontSize: "12px",
              fontWeight: "bold",
              flexShrink: 0,
              cursor: "pointer",
            }}
          >
            {node.isOpen ? "-" : "+"}
          </span>
        )}

        {/* Status indicator for workloads */}
        {node.data.type === "workload" &&
          node.data.status &&
          !node.data.isLoadMore && (
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: getStatusColor(node.data.status),
                marginRight: "0.5rem",
                flexShrink: 0,
              }}
            />
          )}

        {/* Load More/Load All icon */}
        {node.data.isLoadMore && (
          <span
            style={{
              width: "16px",
              height: "16px",
              background: node.data.isLoadAll ? "#7c3aed" : "#2979FF",
              borderRadius: "2px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: "0.5rem",
              color: "white",
              fontSize: "12px",
              fontWeight: "bold",
              flexShrink: 0,
            }}
          >
            {node.data.isLoadAll ? "↓" : "+"}
          </span>
        )}

        {/* Node label */}
        <span
          style={{
            fontSize: "0.875rem",
            color: node.data.isLoadMore
              ? node.data.isLoadAll
                ? "#7c3aed"
                : "#2979FF"
              : "#111827",
            fontWeight: node.data.isLoadMore ? 600 : isSelected ? 600 : 400,
            marginRight: "0.5rem",
            flex: 1,
          }}
        >
          {node.data.name}
        </span>

        {/* Type badge */}
        {!node.data.isLoadMore && (
          <span
            style={{
              padding: "0.125rem 0.375rem",
              background: typeColors.bg,
              color: typeColors.color,
              borderRadius: "3px",
              fontSize: "0.7rem",
              fontWeight: 500,
              flexShrink: 0,
            }}
          >
            {node.data.type}
          </span>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: "flex", width: "100%", height: "100vh" }}>
      {/* Left Panel - React Arborist Tree */}
      <div
        style={{
          width: "400px",
          minWidth: "400px",
          background: "#f9fafb",
          borderRight: "1px solid #e5e7eb",
          display: "flex",
          flexDirection: "column",
          height: "100vh",
        }}
      >
        <div style={{ padding: "1rem", borderBottom: "1px solid #e5e7eb" }}>
          <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem" }}>
            React Arborist Tree
          </h3>

          {/* Search input */}
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search nodes..."
          />
        </div>

        {/* Tree container */}
        <div style={{ flex: 1, padding: "0.5rem", overflow: "hidden" }}>
          <Tree
            data={treeData}
            openByDefault={true}
            width="100%"
            height={window.innerHeight - 120}
            indent={24}
            rowHeight={36}
            searchTerm={debouncedSearchTerm}
            searchMatch={(node, term) =>
              node.data.name.toLowerCase().includes(term.toLowerCase())
            }
          >
            {Node}
          </Tree>
        </div>
      </div>

      {/* Center Panel - Topology */}
      <div style={{ flex: 1, height: "100%" }}>
        <TopologyComponent
          key={activeEnvId}
          selectedId={selectedId}
          onNodeClick={handleNodeClick}
        />
      </div>

      {/* Right Panel - Details */}
      <DetailsPanel
        selectedId={selectedId}
        selectedNode={selectedNode}
        activeEnvId={activeEnvId}
      />
    </div>
  );
};

export default CombinedView;
