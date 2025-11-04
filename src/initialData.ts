import type { Node, Edge } from "@xyflow/react";

const PRIMARY_COLOR = "#2E6BFF";
const BACKGROUND_COLOR = "#E3EBFF";

export const initialNodes: Node[] = [
  {
    id: "0",
    type: "input",
    data: { label: "dev.example.com" },
    position: { x: 300, y: 50 },
    style: {
      background: BACKGROUND_COLOR,
      color: PRIMARY_COLOR,
      border: `1px solid ${PRIMARY_COLOR}`,
    },
  },
  {
    id: "1",
    type: "serverPool",
    data: { label: "server pool 001", status: "healthy" },
    position: { x: 0, y: 200 },
  },
  {
    id: "2",
    type: "serverPool",
    data: { label: "server pool 002", status: "errors", count: 25 },
    position: { x: 250, y: 200 },
  },
  {
    id: "3",
    type: "serverPool",
    data: { label: "server pool 003", status: "errors", count: 50 },
    position: { x: 500, y: 200 },
  },
  {
    id: "4",
    type: "serverPool",
    data: { label: "server pool 004", status: "unknown", count: 37 },
    position: { x: 750, y: 200 },
  },
  // Level 3 - Server pool 001 children (1 child)
  {
    id: "5",
    type: "server",
    data: { label: "Server 1-1" },
    position: { x: 0, y: 350 },
  },
  // Level 3 - Server pool 002 children (2 children)
  {
    id: "6",
    type: "server",
    data: { label: "Server 2-1" },
    position: { x: 175, y: 350 },
  },
  {
    id: "7",
    type: "server",
    data: { label: "Server 2-2" },
    position: { x: 325, y: 350 },
  },
  // Level 3 - Server pool 003 children (3 children)
  {
    id: "8",
    type: "server",
    data: { label: "Server 3-1" },
    position: { x: 425, y: 350 },
  },
  {
    id: "9",
    type: "server",
    data: { label: "Server 3-2" },
    position: { x: 500, y: 350 },
  },
  {
    id: "10",
    type: "server",
    data: { label: "Server 3-3" },
    position: { x: 575, y: 350 },
  },
  // Level 3 - Server pool 004 children (2 children)
  {
    id: "11",
    type: "server",
    data: { label: "Server 4-1" },
    position: { x: 675, y: 350 },
  },
  {
    id: "12",
    type: "server",
    data: { label: "Server 4-2" },
    position: { x: 825, y: 350 },
  },
];

export const initialEdges: Edge[] = [
  {
    id: "e0-1",
    source: "0",
    target: "1",
    type: "smoothstep",
    style: { stroke: PRIMARY_COLOR },
  },
  {
    id: "e0-2",
    source: "0",
    target: "2",
    type: "smoothstep",
    style: { stroke: PRIMARY_COLOR },
  },
  {
    id: "e0-3",
    source: "0",
    target: "3",
    type: "smoothstep",
    style: { stroke: PRIMARY_COLOR },
  },
  {
    id: "e0-4",
    source: "0",
    target: "4",
    type: "smoothstep",
    style: { stroke: PRIMARY_COLOR },
  },
  // Edges from server pool 001 to its children
  {
    id: "e1-5",
    source: "1",
    target: "5",
    type: "smoothstep",
    style: { stroke: PRIMARY_COLOR },
  },
  // Edges from server pool 002 to its children
  {
    id: "e2-6",
    source: "2",
    target: "6",
    type: "smoothstep",
    style: { stroke: PRIMARY_COLOR },
  },
  {
    id: "e2-7",
    source: "2",
    target: "7",
    type: "smoothstep",
    style: { stroke: PRIMARY_COLOR },
  },
  // Edges from server pool 003 to its children
  {
    id: "e3-8",
    source: "3",
    target: "8",
    type: "smoothstep",
    style: { stroke: PRIMARY_COLOR },
  },
  {
    id: "e3-9",
    source: "3",
    target: "9",
    type: "smoothstep",
    style: { stroke: PRIMARY_COLOR },
  },
  {
    id: "e3-10",
    source: "3",
    target: "10",
    type: "smoothstep",
    style: { stroke: PRIMARY_COLOR },
  },
  // Edges from server pool 004 to its children
  {
    id: "e4-11",
    source: "4",
    target: "11",
    type: "smoothstep",
    style: { stroke: PRIMARY_COLOR },
  },
  {
    id: "e4-12",
    source: "4",
    target: "12",
    type: "smoothstep",
    style: { stroke: PRIMARY_COLOR },
  },
];
