import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { VirtualScroller } from 'primereact/virtualscroller';
import type { InfrastructureNode } from '../../infrastructureData';
import { INFRASTRUCTURE } from '../../constants';
import TopologyD3 from '../../topologies/D3/TopologyD3';
import { SearchInput } from '../../shared/SearchInput';
import { DetailsPanel } from '../../shared/DetailsPanel';
import { getTypeColor, getStatusColor, findNode, findTopLevelEnv } from '../../shared/TreeUtils';

import '@xyflow/react/dist/style.css';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';

// Use unified TopologyD3 component for all environments

// Flattened tree item interface
interface FlattenedItem {
  id: string;
  label: string;
  type: 'environment' | 'serverPool' | 'workload';
  status?: 'healthy' | 'warning' | 'error';
  level: number;
  hasChildren: boolean;
  isExpanded: boolean;
  isLoadMore?: boolean;
  isLoadAll?: boolean;
  poolId?: string;
  totalCount?: number;
}

// Flatten tree structure into a list
function flattenTree(
  nodes: InfrastructureNode[],
  expandedKeys: Record<string, boolean>,
  workloadLimits: Record<string, number> = {},
  level: number = 0,
  searchTerm: string = ''
): FlattenedItem[] {
  const result: FlattenedItem[] = [];
  const term = searchTerm.toLowerCase();

  for (const node of nodes) {
    const isExpanded = expandedKeys[node.id] ?? true;
    const matchesSearch = !searchTerm || node.label.toLowerCase().includes(term);

    // Add current node if it matches search or has matching children
    if (matchesSearch || !searchTerm) {
      let hasChildren = false;
      let childrenToProcess: InfrastructureNode[] = [];

      if (node.children) {
        // If this is a serverPool with many workloads, limit them
        if (node.type === 'serverPool' && node.children.length > 10) {
          const limit = workloadLimits[node.id] || 10;
          const displayedChildren = node.children.slice(0, limit);

          childrenToProcess = displayedChildren;
          hasChildren = true;
        } else {
          childrenToProcess = node.children;
          hasChildren = node.children.length > 0;
        }
      }

      result.push({
        id: node.id,
        label: node.label,
        type: node.type,
        status: node.status,
        level,
        hasChildren,
        isExpanded,
      });

      // Add children if expanded
      if (isExpanded && childrenToProcess.length > 0) {
        const children = flattenTree(
          childrenToProcess,
          expandedKeys,
          workloadLimits,
          level + 1,
          searchTerm
        );
        result.push(...children);

        // Add "Load More" and "Load All" buttons AFTER children if this is a serverPool with more items
        if (node.type === 'serverPool' && node.children && node.children.length > 10) {
          const limit = workloadLimits[node.id] || 10;
          const hasMore = limit < node.children.length;
          if (hasMore) {
            result.push({
              id: `${node.id}-load-more`,
              label: `Load More (${node.children.length - limit} remaining)`,
              type: 'workload',
              level: level + 1,
              hasChildren: false,
              isExpanded: false,
              isLoadMore: true,
              poolId: node.id,
              totalCount: node.children.length,
            });
            result.push({
              id: `${node.id}-load-all`,
              label: `Load All (${node.children.length} total)`,
              type: 'workload',
              level: level + 1,
              hasChildren: false,
              isExpanded: false,
              isLoadMore: true,
              isLoadAll: true,
              poolId: node.id,
              totalCount: node.children.length,
            });
          }
        }
      }
    } else if (searchTerm) {
      // If node doesn't match but might have matching children, still process children
      if (node.children) {
        const children = flattenTree(
          node.children,
          expandedKeys,
          workloadLimits,
          level + 1,
          searchTerm
        );
        if (children.length > 0) {
          // Add parent node if children match
          result.push({
            id: node.id,
            label: node.label,
            type: node.type,
            status: node.status,
            level,
            hasChildren: true,
            isExpanded: expandedKeys[node.id] ?? true,
          });
          result.push(...children);
        }
      }
    }
  }

  return result;
}

const ROW_HEIGHT = 36;

const CombinedViewD3 = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [workloadDisplayLimit, setWorkloadDisplayLimit] = useState<Record<string, number>>({});
  const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(600);

  // Initialize all nodes as expanded
  useEffect(() => {
    const initExpanded: Record<string, boolean> = {};
    const initExpandedRecursive = (nodes: InfrastructureNode[]) => {
      nodes.forEach((node) => {
        initExpanded[node.id] = true;
        if (node.children) {
          initExpandedRecursive(node.children);
        }
      });
    };
    initExpandedRecursive(INFRASTRUCTURE.nodes);
    setExpandedKeys(initExpanded);
  }, []);

  // Update container height on resize
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Flatten tree data
  const flattenedData = useMemo(
    () => flattenTree(INFRASTRUCTURE.nodes, expandedKeys, workloadDisplayLimit, 0, searchTerm),
    [expandedKeys, workloadDisplayLimit, searchTerm]
  );

  // Find selected node details
  const selectedNode = selectedId ? findNode(INFRASTRUCTURE.nodes, selectedId) : null;

  // Determine active environment ID
  const activeEnvId = useMemo(() => {
    return findTopLevelEnv(INFRASTRUCTURE.nodes, selectedId);
  }, [selectedId]);

  const handleNodeClick = (nodeId: string) => {
    setSelectedId(nodeId);
  };

  // Handle toggle expand/collapse
  const handleToggle = useCallback((itemId: string) => {
    setExpandedKeys((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  }, []);

  // Handle load more/load all clicks
  const handleLoadMore = useCallback((item: FlattenedItem) => {
    if (item.poolId) {
      if (item.isLoadAll) {
        // Load all workloads
        setWorkloadDisplayLimit((prev) => ({
          ...prev,
          [item.poolId!]: item.totalCount || Infinity,
        }));
      } else {
        // Load 20 more workloads
        setWorkloadDisplayLimit((prev) => ({
          ...prev,
          [item.poolId!]: (prev[item.poolId!] || 10) + 20,
        }));
      }
    }
  }, []);

  // Item template for VirtualScroller
  const itemTemplate = (item: FlattenedItem) => {
    const typeColors = getTypeColor(item.type);
    const isSelected = item.id === selectedId;
    const isLoadMore = item.isLoadMore || false;
    const isExpandedParent = item.hasChildren && item.isExpanded;

    // Determine background color with solid background for sticky parents
    let backgroundColor = 'transparent';
    if (isLoadMore) {
      backgroundColor = '#f0f9ff';
    } else if (isSelected) {
      backgroundColor = '#e0f2fe';
    } else if (isExpandedParent) {
      backgroundColor = '#ffffff';
    }

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0.375rem 0.5rem',
          paddingLeft: `${0.5 + item.level * 1.5}rem`,
          cursor: 'pointer',
          background: backgroundColor,
          borderRadius: '4px',
          transition: 'background 0.15s ease',
          height: ROW_HEIGHT,
          position: isExpandedParent ? 'sticky' : 'relative',
          top: isExpandedParent ? 0 : 'auto',
          zIndex: isExpandedParent ? 10 : 1,
          boxShadow: isExpandedParent ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (isLoadMore && item.poolId) {
            handleLoadMore(item);
          } else if (item.hasChildren) {
            handleToggle(item.id);
          } else {
            setSelectedId(item.id);
          }
        }}
        onMouseEnter={(e) => {
          if (!isSelected && !isLoadMore) {
            e.currentTarget.style.background = '#f9fafb';
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected && !isLoadMore) {
            e.currentTarget.style.background = 'transparent';
          }
        }}
      >
        {/* Toggle button */}
        {item.hasChildren && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              handleToggle(item.id);
            }}
            style={{
              width: '16px',
              height: '16px',
              background: '#2979FF',
              borderRadius: '2px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '0.5rem',
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold',
              flexShrink: 0,
              cursor: 'pointer',
            }}
          >
            {item.isExpanded ? '-' : '+'}
          </span>
        )}

        {/* Spacer for items without toggle */}
        {!item.hasChildren && <span style={{ width: '16px', marginRight: '0.5rem' }} />}

        {/* Status indicator for workloads */}
        {item.type === 'workload' && item.status && !isLoadMore && (
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: getStatusColor(item.status),
              marginRight: '0.5rem',
              flexShrink: 0,
            }}
          />
        )}

        {/* Load More/Load All icon */}
        {isLoadMore && (
          <span
            style={{
              width: '16px',
              height: '16px',
              background: item.isLoadAll ? '#7c3aed' : '#2979FF',
              borderRadius: '2px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '0.5rem',
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold',
              flexShrink: 0,
            }}
          >
            {item.isLoadAll ? '↓' : '+'}
          </span>
        )}

        {/* Node label */}
        <span
          style={{
            fontSize: '0.875rem',
            color: isLoadMore ? (item.isLoadAll ? '#7c3aed' : '#2979FF') : '#111827',
            fontWeight: isLoadMore ? 600 : isSelected ? 600 : 400,
            marginRight: '0.5rem',
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {item.label}
        </span>

        {/* Type badge */}
        {!isLoadMore && (
          <span
            style={{
              padding: '0.125rem 0.375rem',
              background: typeColors.bg,
              color: typeColors.color,
              borderRadius: '3px',
              fontSize: '0.7rem',
              fontWeight: 500,
              flexShrink: 0,
            }}
          >
            {item.type}
          </span>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', width: '100%', height: '100vh' }}>
      {/* Left Panel - Virtualized Tree */}
      <div
        style={{
          width: '400px',
          minWidth: '400px',
          background: '#f9fafb',
          borderRight: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
        }}
      >
        <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>
            D3 Tree (Virtualized)
          </h3>

          {/* Search input */}
          <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search nodes..." />
        </div>

        {/* Tree container with virtualization */}
        <div ref={containerRef} style={{ flex: 1, padding: '0.5rem', overflow: 'hidden' }}>
          <VirtualScroller
            items={flattenedData}
            itemSize={ROW_HEIGHT}
            itemTemplate={itemTemplate}
            style={{ width: '100%', height: `${containerHeight - 16}px` }}
            className="border-1 surface-border border-round"
          />
        </div>
      </div>

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

