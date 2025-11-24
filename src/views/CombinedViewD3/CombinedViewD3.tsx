import { useState, useMemo } from 'react';
import { INFRASTRUCTURE } from '../../constants';
import TopologyD3 from '../../topologies/D3/TopologyD3';
import { TreePanel } from '../../shared/TreePanel';
import { DetailsPanel } from '../../shared/DetailsPanel';
import { findNode, findTopLevelEnv } from '../../shared/TreeUtils';

import '@xyflow/react/dist/style.css';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';

// Use unified TopologyD3 component for all environments

const CombinedViewD3 = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Find selected node details
  const selectedNode = selectedId ? findNode(INFRASTRUCTURE.nodes, selectedId) : null;

  // Determine active environment ID
  const activeEnvId = useMemo(() => {
    return findTopLevelEnv(INFRASTRUCTURE.nodes, selectedId);
  }, [selectedId]);

  const handleNodeClick = (nodeId: string) => {
    setSelectedId(nodeId);
  };

  return (
    <div style={{ display: 'flex', width: '100%', height: '100vh' }}>
      {/* Left Panel - Virtualized Tree */}
      <TreePanel
        title="D3 Tree (Virtualized)"
        selectedId={selectedId}
        onSelectedIdChange={setSelectedId}
      />

      {/* Center Panel - Topology */}
      <div style={{ flex: 1, height: '100%' }}>
        <TopologyD3
          key={activeEnvId}
          selectedId={selectedId}
          onNodeClick={handleNodeClick}
          environmentId={activeEnvId || 'us-east'}
        />
      </div>

      {/* Right Panel - Details */}
      <DetailsPanel selectedId={selectedId} selectedNode={selectedNode} activeEnvId={activeEnvId} />
    </div>
  );
};

export default CombinedViewD3;

