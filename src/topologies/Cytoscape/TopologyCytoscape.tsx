import { useEffect, useRef, useMemo } from 'react';
import cytoscape, { type Core, type NodeSingular } from 'cytoscape';
import { INFRASTRUCTURE } from '../../constants';
import type { InfrastructureNode } from '../../infrastructureData';

const PRIMARY_COLOR = '#2E6BFF';
const BACKGROUND_COLOR = '#E3EBFF';
const SELECTED_BORDER = '#1E40AF';
const SELECTED_BACKGROUND = '#DBEAFE';
const HEALTHY_COLOR = '#689F38';
const ERROR_COLOR = '#EF5350';
const WARNING_COLOR = '#F57F17';
const BORDER_COLOR = '#D4D5D8';
const TEXT_COLOR = '#363840';

interface TopologyCytoscapeProps {
  selectedId?: string | null;
  onNodeClick?: (nodeId: string) => void;
  environmentId?: string; // 'us-east' or 'eu-west'
}

interface CytoscapeNodeData {
  id: string;
  label: string;
  type: 'root' | 'serverPool' | 'server';
  status?: 'healthy' | 'warning' | 'error';
  count?: number;
  treeId: string; // Original tree ID for mapping
  x?: number;
  y?: number;
}

interface CytoscapeEdgeData {
  id: string;
  source: string;
  target: string;
}

const TopologyCytoscape = ({ selectedId, onNodeClick, environmentId }: TopologyCytoscapeProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);

  // Determine which environment to render
  const envId = environmentId || 'us-east';

  // Generate nodes and edges from infrastructure data
  const { nodes, edges, idMapping } = useMemo(() => {
    const env = INFRASTRUCTURE.nodes.find(
      (node: InfrastructureNode) => node.id === envId
    );
    if (!env) return { nodes: [], edges: [], idMapping: {} };

    const cytoscapeNodes: CytoscapeNodeData[] = [];
    const cytoscapeEdges: CytoscapeEdgeData[] = [];
    const mapping: Record<string, string> = { [envId]: `${envId}-root` };

    // Root node
    const rootX = envId === 'us-east' ? 400 : 300;
    cytoscapeNodes.push({
      id: `${envId}-root`,
      label: env.label,
      type: 'root',
      treeId: envId,
      x: rootX,
      y: 50,
    });

    // Server pools
    const pools = env.children || [];
    pools.forEach((pool: InfrastructureNode, poolIndex: number) => {
      const poolX = envId === 'us-east' ? 100 + poolIndex * 300 : 250 + poolIndex * 300;

      cytoscapeNodes.push({
        id: pool.id,
        label: pool.label,
        type: 'serverPool',
        status: 'healthy',
        treeId: pool.id,
        x: poolX,
        y: 200,
      });

      mapping[pool.id] = pool.id;

      cytoscapeEdges.push({
        id: `${envId}-root-${pool.id}`,
        source: `${envId}-root`,
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
        const status = workload.status || 'healthy';
        statusGroups[status].push(workload);
      });

      // Create stacked nodes for each status group
      let groupIndex = 0;
      Object.entries(statusGroups).forEach(([status, group]) => {
        if (group.length > 0) {
          const groupId = `${pool.id}-${status}-group`;
          const count = group.length;

          const serverX = envId === 'us-east' ? poolX - 100 + groupIndex * 100 : poolX - 50 + groupIndex * 100;

          cytoscapeNodes.push({
            id: groupId,
            label: count > 1 ? `${count}x ${status}` : group[0].label,
            type: 'server',
            status: status as 'healthy' | 'warning' | 'error',
            count: count > 1 ? count : undefined,
            treeId: group[0].id, // Use first workload's ID for mapping
            x: serverX,
            y: 350,
          });

          cytoscapeEdges.push({
            id: `${pool.id}-${groupId}`,
            source: pool.id,
            target: groupId,
          });

          // Map each workload to its group
          group.forEach((workload: InfrastructureNode) => {
            mapping[workload.id] = groupId;
          });

          groupIndex++;
        }
      });
    });

    return { nodes: cytoscapeNodes, edges: cytoscapeEdges, idMapping: mapping };
  }, [envId]);

  useEffect(() => {
    if (!containerRef.current || nodes.length === 0) return;

    // Initialize Cytoscape
    const cy = cytoscape({
      container: containerRef.current,
      elements: [
        ...nodes.map((node) => ({
          data: {
            id: node.id,
            label: node.label,
            type: node.type,
            status: node.status,
            count: node.count,
            treeId: node.treeId,
          },
          position: { x: node.x || 0, y: node.y || 0 },
        })),
        ...edges.map((edge) => ({
          data: {
            id: edge.id,
            source: edge.source,
            target: edge.target,
          },
        })),
      ],
      style: [
        // Root node style
        {
          selector: 'node[type="root"]',
          style: {
            'width': '120',
            'height': '40',
            'shape': 'round-rectangle',
            'background-color': BACKGROUND_COLOR,
            'border-width': 1,
            'border-color': PRIMARY_COLOR,
            'label': 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            'color': PRIMARY_COLOR,
            'font-size': '14px',
            'font-weight': 600,
            'font-family': 'system-ui, -apple-system, sans-serif',
          },
        },
        // Selected root node
        {
          selector: 'node[type="root"]:selected',
          style: {
            'background-color': SELECTED_BACKGROUND,
            'border-width': 2,
            'border-color': SELECTED_BORDER,
          },
        },
        // Server pool node style
        {
          selector: 'node[type="serverPool"]',
          style: {
            'width': '200',
            'height': '60',
            'shape': 'round-rectangle',
            'background-color': '#fff',
            'border-width': 2,
            'border-color': BORDER_COLOR,
            'label': 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            'color': TEXT_COLOR,
            'font-size': '14px',
            'font-weight': 600,
            'font-family': 'system-ui, -apple-system, sans-serif',
          },
        },
        // Selected server pool
        {
          selector: 'node[type="serverPool"]:selected',
          style: {
            'border-width': 3,
            'border-color': SELECTED_BORDER,
          },
        },
        // Server/workload node style
        {
          selector: 'node[type="server"]',
          style: {
            'width': '40',
            'height': '40',
            'shape': 'round-rectangle',
            'background-color': '#E3F9FF',
            'border-width': 1,
            'border-color': BORDER_COLOR,
            'label': 'data(label)',
            'text-valign': 'bottom',
            'text-halign': 'center',
            'text-margin-y': 8,
            'color': TEXT_COLOR,
            'font-size': '12px',
            'font-weight': 500,
            'font-family': 'system-ui, -apple-system, sans-serif',
          },
        },
        // Server nodes by status
        {
          selector: 'node[type="server"][status="healthy"]',
          style: {
            'color': HEALTHY_COLOR,
          },
        },
        {
          selector: 'node[type="server"][status="warning"]',
          style: {
            'color': WARNING_COLOR,
          },
        },
        {
          selector: 'node[type="server"][status="error"]',
          style: {
            'color': ERROR_COLOR,
          },
        },
        // Selected server
        {
          selector: 'node[type="server"]:selected',
          style: {
            'border-width': 2,
            'border-color': SELECTED_BORDER,
            'background-color': 'rgba(30, 64, 175, 0.05)',
          },
        },
        // Edge style
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': PRIMARY_COLOR,
            'target-arrow-color': PRIMARY_COLOR,
            'target-arrow-shape': 'triangle',
            'curve-style': 'straight',
            'opacity': 0.6,
          },
        },
      ],
      layout: {
        name: 'preset',
        fit: false,
        padding: 50,
      },
      userPanningEnabled: true,
      userZoomingEnabled: true,
      boxSelectionEnabled: false,
      autounselectify: true,
    });

    cyRef.current = cy;

    // Handle node clicks
    cy.on('tap', 'node', (evt) => {
      const node = evt.target as NodeSingular;
      const treeId = node.data('treeId');
      if (onNodeClick && treeId) {
        onNodeClick(treeId);
      }
    });

    // Set initial viewport
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const initialX = envId === 'us-east' ? width / 2 - 400 : width / 2 - 300;
    cy.fit(undefined, 50);
    cy.zoom(1.2);
    cy.pan({ x: initialX, y: height / 2 - 200 });

    // Update selection based on selectedId
    const updateSelection = () => {
      cy.nodes().removeClass('selected');
      if (selectedId && idMapping[selectedId]) {
        const cytoscapeNodeId = idMapping[selectedId];
        const node = cy.getElementById(cytoscapeNodeId);
        if (node.length > 0) {
          node.addClass('selected');
        }
      }
    };

    updateSelection();

    // Cleanup
    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, [nodes, edges, idMapping, selectedId, onNodeClick, envId]);

  // Update selection when selectedId changes
  useEffect(() => {
    if (!cyRef.current) return;

    cyRef.current.nodes().removeClass('selected');
    if (selectedId && idMapping[selectedId]) {
      const cytoscapeNodeId = idMapping[selectedId];
      const node = cyRef.current.getElementById(cytoscapeNodeId);
      if (node.length > 0) {
        node.addClass('selected');
      }
    }
  }, [selectedId, idMapping]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        background: '#fafafa',
      }}
    />
  );
};

export default TopologyCytoscape;

