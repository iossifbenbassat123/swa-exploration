import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import CheckIcon from "../icons/CheckIcon";
import ExclamationIcon from "../icons/ExclamationIcon";
import ExclamationTriangleIcon from "../icons/ExclamationTriangleIcon";
import DockerIcon from "../icons/DockerIcon";

const HEALTHY_COLOR = "#689F38";
const ERROR_COLOR = "#EF5350";
const UNKNOWN_COLOR = "#F57F17";

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
  status?: "healthy" | "error" | "unknown";
};

// Custom Server Node Component (Level 3)
const ServerNode = ({ data }: NodeProps<Node<ServerData>>) => {
  const statusColor =
    data.status === "healthy"
      ? HEALTHY_COLOR
      : data.status === "error"
      ? ERROR_COLOR
      : data.status === "unknown"
      ? UNKNOWN_COLOR
      : undefined;

  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <div style={{ position: "relative" }}>
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
          {data.status === "unknown" && (
            <div
              style={{
                position: "absolute",
                top: "-4px",
                right: "-4px",
                width: "16px",
                height: "16px",
                color: "#fff",
                background: UNKNOWN_COLOR,
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
