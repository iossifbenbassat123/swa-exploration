import type { InfrastructureNode } from "../infrastructureData";

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

