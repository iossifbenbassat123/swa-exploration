import { useState, useMemo } from "react";
import TopologyUsEast from "../../topologies/ReactFlow/TopologyUsEast";
import TopologyEuWest from "../../topologies/ReactFlow/TopologyEuWest";
import { DetailsPanel } from "../../shared/DetailsPanel";
import { findNode, findTopLevelEnv } from "../../shared/TreeUtils";
import { ReactArboristTreePanel } from "../../trees/react-arborist/ReactArboristTreePanel";
import { INFRASTRUCTURE } from "../../constants";

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

const CombinedView = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

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

  return (
    <div style={{ display: "flex", width: "100%", height: "100vh" }}>
      {/* Left Panel - React Arborist Tree */}
      <ReactArboristTreePanel
        selectedId={selectedId}
        onSelectedIdChange={setSelectedId}
      />

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
