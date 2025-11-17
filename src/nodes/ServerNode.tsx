import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import CheckIcon from "../icons/CheckIcon";
import ExclamationIcon from "../icons/ExclamationIcon";
import ExclamationTriangleIcon from "../icons/ExclamationTriangleIcon";
import DockerIcon from "../icons/DockerIcon";

const HEALTHY_COLOR = "#689F38";
const ERROR_COLOR = "#EF5350";
const WARNING_COLOR = "#F57F17";

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
    <div style={{ width: "24px", height: "24px", color: "#58B2CC" }}>
      <DockerIcon />
    </div>
  </div>
);

export type ServerData = {
  label: string;
  status?: "healthy" | "error" | "warning";
  count?: number;
  workloads?: any[];
};

// Custom Server Node Component (Level 3)
const ServerNode = ({ data, selected }: NodeProps<Node<ServerData>>) => {
  const statusColor =
    data.status === "healthy"
      ? HEALTHY_COLOR
      : data.status === "error"
      ? ERROR_COLOR
      : data.status === "warning"
      ? WARNING_COLOR
      : undefined;

  const isStacked = data.count && data.count > 1;

  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
          cursor: "pointer",
          padding: "4px",
          borderRadius: "8px",
          border: `2px solid ${selected ? "#1E40AF" : "transparent"}`,
          background: selected ? "rgba(30, 64, 175, 0.05)" : "transparent",
          transition: "all 0.2s ease",
        }}
      >
        <div style={{ position: "relative" }}>
          {/* Stacked effect - show multiple layers behind */}
          {isStacked && (
            <>
              <div
                style={{
                  position: "absolute",
                  top: "-4px",
                  left: "-4px",
                  width: "40px",
                  height: "40px",
                  background: "#E3F9FF",
                  borderRadius: "6px",
                  opacity: 0.5,
                  zIndex: -2,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "-2px",
                  left: "-2px",
                  width: "40px",
                  height: "40px",
                  background: "#E3F9FF",
                  borderRadius: "6px",
                  opacity: 0.7,
                  zIndex: -1,
                }}
              />
            </>
          )}
          <ServerIcon />
          {/* Status Icon - Top Right of Server Icon */}
          {data.status === "healthy" && (
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
          {data.status === "error" && (
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
          {data.status === "warning" && (
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
          {/* Count badge for stacked nodes */}
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
              {data.count}
            </div>
          )}
        </div>
        <div
          style={{
            fontSize: "12px",
            color: statusColor || "#000",
            fontWeight: 500,
            textAlign: "center",
          }}
        >
          {data.label}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
};

export default ServerNode;
