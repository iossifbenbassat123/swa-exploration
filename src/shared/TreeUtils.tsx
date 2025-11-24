import type { InfrastructureNode } from "../infrastructureData";
import type { FlattenedItem } from "../trees/primereact/TreeItemTemplate";

// Utility functions for tree operations
export const getTypeColor = (type: string) => {
  switch (type) {
    case "environment":
      return { bg: "#dbeafe", color: "#1e40af" };
    case "serverPool":
      return { bg: "#fef3c7", color: "#92400e" };
    case "workload":
      return { bg: "#ddd6fe", color: "#5b21b6" };
    default:
      return { bg: "#f3f4f6", color: "#374151" };
  }
};

export const getStatusColor = (status?: string) => {
  switch (status) {
    case "healthy":
      return "#22c55e"; // green
    case "warning":
      return "#f59e0b"; // orange
    case "error":
      return "#ef4444"; // red
    default:
      return "#9ca3af"; // gray
  }
};

export const findNode = (
  nodes: InfrastructureNode[],
  id: string
): InfrastructureNode | null => {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNode(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

export const findTopLevelEnv = (
  nodes: InfrastructureNode[],
  key: string | null
): string | null => {
  if (!key) return null;

  // Check if the key itself is a top-level environment
  const isTopLevel = nodes.some((node) => node.id === key);
  if (isTopLevel) return key;

  // Find which top-level environment contains this key
  for (const env of nodes) {
    const checkNode = (nodeList: InfrastructureNode[]): boolean => {
      for (const node of nodeList) {
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

// Flatten tree structure into a list
export function flattenTree(
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

