import type { Node, Edge } from "@xyflow/react";

const PRIMARY_COLOR = "#2E6BFF";
const HEALTHY_COLOR = "#689F38";
const ERROR_COLOR = "#EF5350";

// US-East topology - 3 server pools in a horizontal layout
export const usEastNodes: Node[] = [
  {
    id: "us-east-root",
    type: "root",
    data: { label: "us-east-1.aws.com" },
    position: { x: 400, y: 50 },
  },
  {
    id: "us-east-pool-1",
    type: "serverPool",
    data: { label: "Web Tier Pool", status: "healthy" },
    position: { x: 100, y: 200 },
  },
  {
    id: "us-east-pool-2",
    type: "serverPool",
    data: { label: "API Gateway Pool", status: "healthy" },
    position: { x: 400, y: 200 },
  },
  {
    id: "us-east-pool-3",
    type: "serverPool",
    data: { label: "Database Pool", status: "errors", count: 10 },
    position: { x: 700, y: 200 },
  },
  // Web Tier children
  {
    id: "us-east-server-1",
    type: "server",
    data: { label: "nginx-frontend-1", status: "healthy" },
    position: { x: 0, y: 350 },
  },
  {
    id: "us-east-server-2",
    type: "server",
    data: { label: "nginx-frontend-2", status: "healthy" },
    position: { x: 100, y: 350 },
  },
  {
    id: "us-east-server-3",
    type: "server",
    data: { label: "react-ui-1", status: "healthy" },
    position: { x: 200, y: 350 },
  },
  // API Gateway children
  {
    id: "us-east-server-4",
    type: "server",
    data: { label: "api-gateway-1", status: "healthy" },
    position: { x: 350, y: 350 },
  },
  {
    id: "us-east-server-5",
    type: "server",
    data: { label: "kong-gateway-1", status: "healthy" },
    position: { x: 450, y: 350 },
  },
  // Database children
  {
    id: "us-east-server-6",
    type: "server",
    data: { label: "postgres-primary", status: "healthy" },
    position: { x: 600, y: 350 },
  },
  {
    id: "us-east-server-7",
    type: "server",
    data: { label: "postgres-replica-1", status: "error" },
    position: { x: 700, y: 350 },
  },
  {
    id: "us-east-server-8",
    type: "server",
    data: { label: "redis-cache", status: "healthy" },
    position: { x: 800, y: 350 },
  },
];

export const usEastEdges: Edge[] = [
  // Root to pools
  {
    id: "e-us-east-0-1",
    source: "us-east-root",
    target: "us-east-pool-1",
    type: "smoothstep",
    style: { stroke: PRIMARY_COLOR },
  },
  {
    id: "e-us-east-0-2",
    source: "us-east-root",
    target: "us-east-pool-2",
    type: "smoothstep",
    style: { stroke: PRIMARY_COLOR },
  },
  {
    id: "e-us-east-0-3",
    source: "us-east-root",
    target: "us-east-pool-3",
    type: "smoothstep",
    style: { stroke: PRIMARY_COLOR },
  },
  // Web Tier edges
  {
    id: "e-us-east-1-1",
    source: "us-east-pool-1",
    target: "us-east-server-1",
    type: "smoothstep",
    style: { stroke: HEALTHY_COLOR },
  },
  {
    id: "e-us-east-1-2",
    source: "us-east-pool-1",
    target: "us-east-server-2",
    type: "smoothstep",
    style: { stroke: HEALTHY_COLOR },
  },
  {
    id: "e-us-east-1-3",
    source: "us-east-pool-1",
    target: "us-east-server-3",
    type: "smoothstep",
    style: { stroke: HEALTHY_COLOR },
  },
  // API Gateway edges
  {
    id: "e-us-east-2-1",
    source: "us-east-pool-2",
    target: "us-east-server-4",
    type: "smoothstep",
    style: { stroke: HEALTHY_COLOR },
  },
  {
    id: "e-us-east-2-2",
    source: "us-east-pool-2",
    target: "us-east-server-5",
    type: "smoothstep",
    style: { stroke: HEALTHY_COLOR },
  },
  // Database edges
  {
    id: "e-us-east-3-1",
    source: "us-east-pool-3",
    target: "us-east-server-6",
    type: "smoothstep",
    style: { stroke: HEALTHY_COLOR },
  },
  {
    id: "e-us-east-3-2",
    source: "us-east-pool-3",
    target: "us-east-server-7",
    type: "smoothstep",
    style: { stroke: ERROR_COLOR },
  },
  {
    id: "e-us-east-3-3",
    source: "us-east-pool-3",
    target: "us-east-server-8",
    type: "smoothstep",
    style: { stroke: HEALTHY_COLOR },
  },
];
