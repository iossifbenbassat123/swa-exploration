import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";

const PRIMARY_COLOR = "#2E6BFF";
const BACKGROUND_COLOR = "#E3EBFF";

export type RootNodeData = {
  label: string;
};

// Custom Root Node Component
const RootNode = ({ data }: NodeProps<Node<RootNodeData>>) => {
  return (
    <>
      <div
        style={{
          background: BACKGROUND_COLOR,
          color: PRIMARY_COLOR,
          border: `1px solid ${PRIMARY_COLOR}`,
          borderRadius: "8px",
          padding: "12px 20px",
          fontWeight: 600,
          fontSize: "14px",
        }}
      >
        {data.label}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
};

export default RootNode;
