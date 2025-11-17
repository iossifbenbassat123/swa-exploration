import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import CheckIcon from "../icons/CheckIcon";
import ExclamationIcon from "../icons/ExclamationIcon";
import ExclamationTriangleIcon from "../icons/ExclamationTriangleIcon";

const TEXT_COLOR = "#363840";
const HEALTHY_COLOR = "#689F38";
const ERROR_COLOR = "#EF5350";
const UNKNOWN_COLOR = "#F57F17";
const BORDER_COLOR = "#D4D5D8";

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

export type ServerPoolData = {
  label: string;
  status: "healthy" | "errors" | "unknown";
  count?: number;
};

// Custom Server Pool Node Component
const ServerPoolNode = ({
  data,
  selected,
}: NodeProps<Node<ServerPoolData>>) => {
  const statusColor =
    data.status === "healthy"
      ? HEALTHY_COLOR
      : data.status === "errors"
      ? ERROR_COLOR
      : UNKNOWN_COLOR;

  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div
        style={{
          background: "#fff",
          border: `${selected ? "3px" : "2px"} solid ${
            selected ? "#1E40AF" : BORDER_COLOR
          }`,
          borderRadius: "8px",
          padding: "12px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          minWidth: "200px",
          position: "relative",
          cursor: "pointer",
          boxShadow: selected ? "0 0 0 3px rgba(30, 64, 175, 0.1)" : "none",
          transition: "all 0.2s ease",
        }}
      >
        {/* Server Icon */}
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
              }}
            >
              <CheckIcon />
            </div>
          )}
          {data.status === "errors" && (
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
              }}
            >
              <ExclamationTriangleIcon />
            </div>
          )}
        </div>

        {/* Text Content */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontWeight: 600,
              fontSize: "14px",
              color: TEXT_COLOR,
              marginBottom: "4px",
            }}
          >
            {data.label}
          </div>
          <div
            style={{
              fontSize: "12px",
              color: statusColor,
              fontWeight: 500,
            }}
          >
            {data.count ? `${data.count} ${data.status}` : data.status}
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
};

export default ServerPoolNode;
