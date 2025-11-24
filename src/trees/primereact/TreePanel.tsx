import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { VirtualScroller } from 'primereact/virtualscroller';
import type { InfrastructureNode } from '../../infrastructureData';
import { INFRASTRUCTURE } from '../../constants';
import { flattenTree } from '../../shared/TreeUtils';
import { TreeItemTemplate, ROW_HEIGHT, type FlattenedItem } from './TreeItemTemplate';
import { SearchInput } from '../../shared/SearchInput';

import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';

interface TreePanelProps {
  title: string;
  selectedId: string | null;
  onSelectedIdChange: (id: string | null) => void;
}

export const TreePanel = ({ title, selectedId, onSelectedIdChange }: TreePanelProps) => {
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
  const itemTemplate = (item: FlattenedItem) => (
    <TreeItemTemplate
      item={item}
      selectedId={selectedId}
      onToggle={handleToggle}
      onLoadMore={handleLoadMore}
      onSelect={onSelectedIdChange}
    />
  );

  return (
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
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>{title}</h3>

        {/* Search input */}
        <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search nodes..." />
      </div>

      {/* Tree container with virtualization */}
      <div ref={containerRef} style={{ flex: 1, padding: '0.5rem', overflow: 'hidden', position: 'relative' }}>
        {flattenedData.length === 0 && searchTerm ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#6b7280',
              fontSize: '0.875rem',
            }}
          >
            No items found matching "{searchTerm}"
          </div>
        ) : (
          <VirtualScroller
            items={flattenedData}
            itemSize={ROW_HEIGHT}
            itemTemplate={itemTemplate}
            style={{ width: '100%', height: `${containerHeight - 16}px` }}
            className="border-1 surface-border border-round"
          />
        )}
      </div>
    </div>
  );
};

