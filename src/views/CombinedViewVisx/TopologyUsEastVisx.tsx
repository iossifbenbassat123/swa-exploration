import { useMemo, useEffect, useCallback, useState } from "react";
import { Group } from "@visx/group";
import { LinePath } from "@visx/shape";
import { Zoom } from "@visx/zoom";
import { INFRASTRUCTURE } from "../../constants";
import type { InfrastructureNode } from "../../infrastructureData";
import CheckIcon from "../../icons/CheckIcon";
import ExclamationIcon from "../../icons/ExclamationIcon";
import ExclamationTriangleIcon from "../../icons/ExclamationTriangleIcon";
import DockerIcon from "../../icons/DockerIcon";

const PRIMARY_COLOR = "#2E6BFF";
const BACKGROUND_COLOR = "#E3EBFF";
const SELECTED_BORDER = "#1E40AF";
const SELECTED_BACKGROUND = "#DBEAFE";
const HEALTHY_COLOR = "#689F38";
const ERROR_COLOR = "#EF5350";
const WARNING_COLOR = "#F57F17";
const TEXT_COLOR = "#363840";
const BORDER_COLOR = "#D4D5D8";

interface TopologyUsEastVisxProps {
  selectedId?: string | null;
  onNodeClick?: (nodeId: string) => void;
}

interface VisxNode {
  id: string;
  x: number;
  y: number;
  type: "root" | "serverPool" | "server";
  data: {
    label: string;
    status?: "healthy" | "warning" | "error" | "errors";
    count?: number;
    workloads?: InfrastructureNode[];
  };
  selected?: boolean;
}

interface VisxEdge {
  id: string;
  source: VisxNode;
  target: VisxNode;
}

const ServerIcon = () => (
  <div
    style={{
      width: "40px",
      height: "40px",
      background: "#E3F9FF",
      borderRadius: "6px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="#58B2CC"
      style={{ width: "24px", height: "24px" }}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5.25 14.25h13.5m-13.5 0a3 3 0 0 1-3-3m3 3a3 3 0 1 0 0 6h13.5a3 3 0 1 0 0-6m-16.5-3a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3m-19.5 0a4.5 4.5 0 0 1 .9-2.7L5.737 5.1a3.375 3.375 0 0 1 2.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 0 1 .9 2.7m0 0a3 3 0 0 1-3 3m0 3h.008v.008h-.008v-.008Zm0-6h.008v.008h-.008v-.008Zm-3 6h.008v.008h-.008v-.008Zm0-6h.008v.008h-.008v-.008Z"
      />
    </svg>
  </div>
);

const RootNode = ({ node, onClick }: { node: VisxNode; onClick: () => void }) => {
  return (
    <Group left={node.x} top={node.y}>
      <rect
        x={-60}
        y={-18}
        width={120}
        height={36}
        rx={8}
        fill={node.selected ? SELECTED_BACKGROUND : BACKGROUND_COLOR}
        stroke={node.selected ? SELECTED_BORDER : PRIMARY_COLOR}
        strokeWidth={node.selected ? 2 : 1}
        style={{ cursor: "pointer" }}
        onClick={onClick}
      />
      <text
        x={0}
        y={0}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={PRIMARY_COLOR}
        fontSize={14}
        fontWeight={600}
        style={{ cursor: "pointer", pointerEvents: "none" }}
      >
        {node.data.label}
      </text>
    </Group>
  );
};

const ServerPoolNode = ({ node, onClick }: { node: VisxNode; onClick: () => void }) => {
  const statusColor =
    node.data.status === "healthy"
      ? HEALTHY_COLOR
      : node.data.status === "errors"
      ? ERROR_COLOR
      : "#F57F17";

  return (
    <Group left={node.x} top={node.y}>
      <rect
        x={-100}
        y={-30}
        width={200}
        height={60}
        rx={8}
        fill="#fff"
        stroke={node.selected ? SELECTED_BORDER : BORDER_COLOR}
        strokeWidth={node.selected ? 3 : 2}
        style={{ cursor: "pointer" }}
        onClick={onClick}
      />
      <Group left={-80} top={-10}>
        <foreignObject width={40} height={40}>
          <div style={{ position: "relative" }}>
            <ServerIcon />
            {node.data.status === "healthy" && (
              <div
                style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-4px",
                  width: "16px",
                  height: "16px",
                  color: "#fff",
                  background: HEALTHY_COLOR,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CheckIcon />
              </div>
            )}
            {node.data.status === "errors" && (
              <div
                style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-4px",
                  width: "16px",
                  height: "16px",
                  color: "#fff",
                  background: ERROR_COLOR,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ExclamationIcon />
              </div>
            )}
          </div>
        </foreignObject>
      </Group>
      <text
        x={-30}
        y={-5}
        fill={TEXT_COLOR}
        fontSize={14}
        fontWeight={600}
        style={{ pointerEvents: "none" }}
      >
        {node.data.label}
      </text>
      <text
        x={-30}
        y={15}
        fill={statusColor}
        fontSize={12}
        fontWeight={500}
        style={{ pointerEvents: "none" }}
      >
        {node.data.count ? `${node.data.count} ${node.data.status}` : node.data.status}
      </text>
    </Group>
  );
};

const ServerNode = ({ node, onClick }: { node: VisxNode; onClick: () => void }) => {
  const statusColor =
    node.data.status === "healthy"
      ? HEALTHY_COLOR
      : node.data.status === "error"
      ? ERROR_COLOR
      : node.data.status === "warning"
      ? WARNING_COLOR
      : undefined;

  const isStacked = node.data.count && node.data.count > 1;

  return (
    <Group left={node.x} top={node.y}>
      {node.selected && (
        <rect
          x={-30}
          y={-50}
          width={60}
          height={80}
          rx={8}
          fill="rgba(30, 64, 175, 0.05)"
          stroke={SELECTED_BORDER}
          strokeWidth={2}
        />
      )}
      <Group>
        {isStacked && (
          <>
            <rect
              x={-22}
              y={-42}
              width={40}
              height={40}
              rx={6}
              fill="#E3F9FF"
              opacity={0.5}
            />
            <rect
              x={-20}
              y={-40}
              width={40}
              height={40}
              rx={6}
              fill="#E3F9FF"
              opacity={0.7}
            />
          </>
        )}
        <foreignObject x={-20} y={-20} width={40} height={40}>
          <div style={{ position: "relative" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                background: "#E3F9FF",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ width: "24px", height: "24px", color: "#58B2CC" }}>
                <DockerIcon />
              </div>
            </div>
            {node.data.status === "healthy" && (
              <div
                style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-4px",
                  width: "16px",
                  height: "16px",
                  color: "#fff",
                  background: HEALTHY_COLOR,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "10px",
                }}
              >
                <CheckIcon />
              </div>
            )}
            {node.data.status === "error" && (
              <div
                style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-4px",
                  width: "16px",
                  height: "16px",
                  color: "#fff",
                  background: ERROR_COLOR,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "10px",
                }}
              >
                <ExclamationIcon />
              </div>
            )}
            {node.data.status === "warning" && (
              <div
                style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-4px",
                  width: "16px",
                  height: "16px",
                  color: "#fff",
                  background: WARNING_COLOR,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "10px",
                }}
              >
                <ExclamationTriangleIcon />
              </div>
            )}
            {isStacked && (
              <div
                style={{
                  position: "absolute",
                  bottom: "-4px",
                  right: "-4px",
                  minWidth: "20px",
                  height: "20px",
                  padding: "0 4px",
                  background: "#1E40AF",
                  color: "#fff",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  fontWeight: "bold",
                  border: "2px solid white",
                }}
              >
                {node.data.count}
              </div>
            )}
          </div>
        </foreignObject>
        <text
          x={0}
          y={30}
          textAnchor="middle"
          fill={statusColor || "#000"}
          fontSize={12}
          fontWeight={500}
          style={{ cursor: "pointer", pointerEvents: "none" }}
        >
          {node.data.label}
        </text>
      </Group>
      <rect
        x={-30}
        y={-50}
        width={60}
        height={80}
        rx={8}
        fill="transparent"
        style={{ cursor: "pointer" }}
        onClick={onClick}
      />
    </Group>
  );
};

const TopologyUsEastVisx = ({ selectedId, onNodeClick }: TopologyUsEastVisxProps) => {
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth - 600, // Account for side panels
        height: window.innerHeight,
      });
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Generate nodes and edges from infrastructure data
  const { nodes, edges, reverseIdMapping } = useMemo(() => {
    const usEastEnv = INFRASTRUCTURE.nodes.find(
      (node: InfrastructureNode) => node.id === "us-east"
    );
    if (!usEastEnv) {
      return { nodes: [], edges: [], reverseIdMapping: {} };
    }

    const visxNodes: VisxNode[] = [];
    const visxEdges: VisxEdge[] = [];
    const mapping: Record<string, string> = { "us-east": "us-east-root" };
    const reverseMapping: Record<string, string> = { "us-east-root": "us-east" };

    // Root node
    const rootNode: VisxNode = {
      id: "us-east-root",
      x: 400,
      y: 50,
      type: "root",
      data: { label: usEastEnv.label },
      selected: false, // Will be set after mapping is created
    };
    visxNodes.push(rootNode);

    // Server pools
    const pools = usEastEnv.children || [];
    pools.forEach((pool: InfrastructureNode, poolIndex: number) => {
      const poolX = 100 + poolIndex * 300;
      const poolNode: VisxNode = {
        id: pool.id,
        x: poolX,
        y: 200,
        type: "serverPool",
        data: { label: pool.label, status: "healthy" },
        selected: false, // Will be set after mapping is created
      };
      visxNodes.push(poolNode);
      mapping[pool.id] = pool.id;
      reverseMapping[pool.id] = pool.id;

      visxEdges.push({
        id: `us-east-root-${pool.id}`,
        source: rootNode,
        target: poolNode,
      });

      // Group workloads by status
      const workloads = pool.children || [];
      const statusGroups: Record<string, typeof workloads> = {
        healthy: [],
        warning: [],
        error: [],
      };

      workloads.forEach((workload) => {
        const status = workload.status || "healthy";
        statusGroups[status].push(workload);
      });

      // Create stacked nodes for each status group
      let groupIndex = 0;
      Object.entries(statusGroups).forEach(([status, group]) => {
        if (group.length > 0) {
          const groupId = `${pool.id}-${status}-group`;
          const count = group.length;

          const serverNode: VisxNode = {
            id: groupId,
            x: poolX - 100 + groupIndex * 100,
            y: 350,
            type: "server",
            data: {
              label: count > 1 ? `${count}x ${status}` : group[0].label,
              status: status as "healthy" | "warning" | "error",
              count: count > 1 ? count : undefined,
              workloads: group,
            },
            selected: false, // Will be set after mapping is created
          };
          visxNodes.push(serverNode);

          visxEdges.push({
            id: `${pool.id}-${groupId}`,
            source: poolNode,
            target: serverNode,
          });

          // Map each workload to its group
          group.forEach((workload: InfrastructureNode) => {
            mapping[workload.id] = groupId;
          });
          // Map group to first workload for reverse lookup
          if (group.length > 0 && !reverseMapping[groupId]) {
            reverseMapping[groupId] = group[0].id;
          }

          groupIndex++;
        }
      });
    });

    // Update node selection based on selectedId
    const topologyNodeId = selectedId ? mapping[selectedId] : null;
    visxNodes.forEach((node) => {
      node.selected = node.id === topologyNodeId;
    });

    return {
      nodes: visxNodes,
      edges: visxEdges,
      reverseIdMapping: reverseMapping,
    };
  }, [selectedId]);

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      const treeId = (reverseIdMapping as Record<string, string>)[nodeId];
      if (treeId && onNodeClick) {
        onNodeClick(treeId);
      }
    },
    [reverseIdMapping, onNodeClick]
  );

  const initialTransform = {
    scaleX: 1.2,
    scaleY: 1.2,
    translateX: 0,
    translateY: 0,
    skewX: 0,
    skewY: 0,
  };

  return (
    <div style={{ width: "100%", height: "100%", background: "#fafafa" }}>
      <Zoom<SVGSVGElement>
        width={dimensions.width}
        height={dimensions.height}
        scaleXMin={0.5}
        scaleXMax={2}
        scaleYMin={0.5}
        scaleYMax={2}
        initialTransformMatrix={initialTransform}
      >
        {(zoom) => (
          <svg
            width={dimensions.width}
            height={dimensions.height}
            style={{ cursor: zoom.isDragging ? "grabbing" : "grab" }}
            ref={zoom.containerRef}
          >
            <rect
              width={dimensions.width}
              height={dimensions.height}
              fill="#fafafa"
              onTouchStart={zoom.dragStart}
              onTouchMove={zoom.dragMove}
              onTouchEnd={zoom.dragEnd}
              onMouseDown={zoom.dragStart}
              onMouseMove={zoom.dragMove}
              onMouseUp={zoom.dragEnd}
              onMouseLeave={zoom.dragEnd}
              onWheel={zoom.handleWheel}
            />
            <g transform={zoom.toString()}>
              {/* Render edges */}
              {edges.map((edge) => {
                // Calculate connection points: from bottom of source to top of target
                const sourceY = edge.source.type === "root" 
                  ? edge.source.y + 18  // Root node height is 36, so bottom is y + 18
                  : edge.source.type === "serverPool"
                  ? edge.source.y + 30  // ServerPool height is 60, so bottom is y + 30
                  : edge.source.y + 30;  // Server node bottom (text at y+30, icon centered at y=0)
                
                const targetY = edge.target.type === "root"
                  ? edge.target.y - 18  // Top of root node
                  : edge.target.type === "serverPool"
                  ? edge.target.y - 30  // Top of serverPool
                  : edge.target.y - 50; // Top of server node (extends up to y-50)
                
                return (
                  <LinePath
                    key={edge.id}
                    data={[
                      { x: edge.source.x, y: sourceY },
                      { x: edge.target.x, y: targetY },
                    ]}
                    x={(d) => d.x}
                    y={(d) => d.y}
                    stroke="#b1b1b7"
                    strokeWidth={2}
                    markerEnd="url(#arrowhead)"
                  />
                );
              })}

              {/* Arrow marker */}
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3, 0 6" fill="#b1b1b7" />
                </marker>
              </defs>

              {/* Render nodes */}
              {nodes.map((node) => {
                const onClick = () => handleNodeClick(node.id);
                if (node.type === "root") {
                  return <RootNode key={node.id} node={node} onClick={onClick} />;
                } else if (node.type === "serverPool") {
                  return <ServerPoolNode key={node.id} node={node} onClick={onClick} />;
                } else {
                  return <ServerNode key={node.id} node={node} onClick={onClick} />;
                }
              })}
            </g>
          </svg>
        )}
      </Zoom>
    </div>
  );
};

export default TopologyUsEastVisx;

