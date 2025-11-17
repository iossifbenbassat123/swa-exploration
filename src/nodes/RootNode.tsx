import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";

const PRIMARY_COLOR = "#2E6BFF";
const BACKGROUND_COLOR = "#E3EBFF";
const SELECTED_BORDER = "#1E40AF";
const SELECTED_BACKGROUND = "#DBEAFE";

export type RootNodeData = {
  label: string;
};

// Custom Root Node Component
const RootNode = ({ data, selected }: NodeProps<Node<RootNodeData>>) => {
  return (
    <>
      <div
        style={{
          background: selected ? SELECTED_BACKGROUND : BACKGROUND_COLOR,
          color: PRIMARY_COLOR,
          border: `${selected ? "2px" : "1px"} solid ${
            selected ? SELECTED_BORDER : PRIMARY_COLOR
          }`,
          borderRadius: "8px",
          padding: "12px 20px",
          fontWeight: 600,
          fontSize: "14px",
          cursor: "pointer",
          boxShadow: selected ? "0 0 0 3px rgba(30, 64, 175, 0.1)" : "none",
          transition: "all 0.2s ease",
        }}
      >
        {data.label}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
};

export default RootNode;
