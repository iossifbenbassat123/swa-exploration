import { useState, useMemo } from 'react';
import { INFRASTRUCTURE } from '../../constants';
import TopologyUsEast from '../../topologies/ReactFlow/TopologyUsEast';
import TopologyEuWest from '../../topologies/ReactFlow/TopologyEuWest';
import { TreePanel } from '../../trees/primereact/TreePanel';
import { DetailsPanel } from '../../shared/DetailsPanel';
import { findNode, findTopLevelEnv } from '../../shared/TreeUtils';

import '@xyflow/react/dist/style.css';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';

// Map environment IDs to their topology components
const topologyMap: Record<
  string,
  React.ComponentType<{
    selectedId?: string | null;
    onNodeClick?: (nodeId: string) => void;
  }>
> = {
  'us-east': TopologyUsEast,
  'eu-west': TopologyEuWest,
};


const CombinedViewPrimeReactSticky = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Find selected node details
  const selectedNode = selectedId ? findNode(INFRASTRUCTURE.nodes, selectedId) : null;

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
    <div style={{ display: 'flex', width: '100%', height: '100vh' }}>
      {/* Left Panel - Virtualized Tree */}
      <TreePanel
        title="PrimeReact Tree (Virtualized Sticky)"
        selectedId={selectedId}
        onSelectedIdChange={setSelectedId}
      />

      {/* Center Panel - Topology */}
      <div style={{ flex: 1, height: '100%' }}>
        <TopologyComponent
          key={activeEnvId}
          selectedId={selectedId}
          onNodeClick={handleNodeClick}
        />
      </div>

      {/* Right Panel - Details */}
      <DetailsPanel selectedId={selectedId} selectedNode={selectedNode} activeEnvId={activeEnvId} />
    </div>
  );
};

export default CombinedViewPrimeReactSticky;
