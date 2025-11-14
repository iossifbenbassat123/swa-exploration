import type { Node, Edge } from "@xyflow/react";

const PRIMARY_COLOR = "#2E6BFF";
const HEALTHY_COLOR = "#689F38";
const UNKNOWN_COLOR = "#F57F17";

// EU-West topology - 2 server pools in a different vertical layout
export const euWestNodes: Node[] = [
  {
    id: "eu-west-root",
    type: "root",
    data: { label: "eu-west-1.aws.com" },
    position: { x: 300, y: 50 },
  },
  {
    id: "eu-west-pool-1",
    type: "serverPool",
    data: { label: "Web Tier Pool", status: "healthy" },
    position: { x: 150, y: 200 },
  },
  {
    id: "eu-west-pool-2",
    type: "serverPool",
    data: { label: "Database Pool", status: "unknown", count: 5 },
    position: { x: 450, y: 200 },
  },
  // Web Tier children - only 2 servers
  {
    id: "eu-west-server-1",
    type: "server",
    data: { label: "nginx-frontend-1", status: "healthy" },
    position: { x: 100, y: 350 },
  },
  {
    id: "eu-west-server-2",
    type: "server",
    data: { label: "nginx-frontend-2", status: "healthy" },
    position: { x: 200, y: 350 },
  },
  // Database children
  {
    id: "eu-west-server-3",
    type: "server",
    data: { label: "postgres-replica-2", status: "unknown" },
    position: { x: 400, y: 350 },
  },
  {
    id: "eu-west-server-4",
    type: "server",
    data: { label: "redis-cache", status: "healthy" },
    position: { x: 500, y: 350 },
  },
];

export const euWestEdges: Edge[] = [
  // Root to pools
  {
    id: "e-eu-west-0-1",
    source: "eu-west-root",
    target: "eu-west-pool-1",
    type: "smoothstep",
    style: { stroke: PRIMARY_COLOR },
  },
  {
    id: "e-eu-west-0-2",
    source: "eu-west-root",
    target: "eu-west-pool-2",
    type: "smoothstep",
    style: { stroke: PRIMARY_COLOR },
  },
  // Web Tier edges
  {
    id: "e-eu-west-1-1",
    source: "eu-west-pool-1",
    target: "eu-west-server-1",
    type: "smoothstep",
    style: { stroke: HEALTHY_COLOR },
  },
  {
    id: "e-eu-west-1-2",
    source: "eu-west-pool-1",
    target: "eu-west-server-2",
    type: "smoothstep",
    style: { stroke: HEALTHY_COLOR },
  },
  // Database edges
  {
    id: "e-eu-west-2-1",
    source: "eu-west-pool-2",
    target: "eu-west-server-3",
    type: "smoothstep",
    style: { stroke: UNKNOWN_COLOR },
  },
  {
    id: "e-eu-west-2-2",
    source: "eu-west-pool-2",
    target: "eu-west-server-4",
    type: "smoothstep",
    style: { stroke: HEALTHY_COLOR },
  },
];
