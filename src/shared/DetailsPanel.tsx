import type { InfrastructureNode } from "../infrastructureData";
import { getStatusColor } from "./TreeUtils";

interface DetailsPanelProps {
  selectedId: string | null;
  selectedNode: InfrastructureNode | null;
  activeEnvId: string | null;
}

export const DetailsPanel = ({
  selectedId,
  selectedNode,
  activeEnvId,
}: DetailsPanelProps) => {
  return (
    <div
      style={{
        width: "300px",
        minWidth: "300px",
        background: "#f9fafb",
        borderLeft: "1px solid #e5e7eb",
        padding: "1rem",
        overflowY: "auto",
      }}
    >
      <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem" }}>Details</h3>

      {selectedId && selectedNode ? (
        <div>
          <div
            style={{
              padding: "0.75rem",
              background: "#fff",
              borderRadius: "4px",
              marginBottom: "1rem",
              border: "1px solid #e5e7eb",
            }}
          >
            <p
              style={{
                color: "#111827",
                fontSize: "1rem",
                fontWeight: 600,
                marginBottom: "0.5rem",
              }}
            >
              {selectedNode.label}
            </p>
            <p
              style={{
                color: "#6b7280",
                fontSize: "0.85rem",
                marginBottom: "0.25rem",
              }}
            >
              <strong>ID:</strong> {selectedNode.id}
            </p>
            <p
              style={{
                color: "#6b7280",
                fontSize: "0.85rem",
                marginBottom: "0.25rem",
              }}
            >
              <strong>Type:</strong>{" "}
              <span
                style={{
                  padding: "0.125rem 0.5rem",
                  background:
                    selectedNode.type === "environment"
                      ? "#dbeafe"
                      : selectedNode.type === "serverPool"
                      ? "#fef3c7"
                      : "#ddd6fe",
                  color:
                    selectedNode.type === "environment"
                      ? "#1e40af"
                      : selectedNode.type === "serverPool"
                      ? "#92400e"
                      : "#5b21b6",
                  borderRadius: "4px",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                }}
              >
                {selectedNode.type}
              </span>
            </p>
          </div>
          <p
            style={{
              color: "#6b7280",
              fontSize: "0.85rem",
              marginBottom: "0.5rem",
            }}
          >
            <strong>Active Environment:</strong> {activeEnvId || "None"}
          </p>

          {/* Show workload statistics for server pools */}
          {selectedNode.type === "serverPool" &&
            selectedNode.children &&
            selectedNode.children.length > 0 && (
              <div style={{ marginTop: "1rem" }}>
                <p
                  style={{
                    color: "#111827",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    marginBottom: "0.5rem",
                  }}
                >
                  Workload Status
                </p>
                {(() => {
                  const healthyCount = selectedNode.children.filter(
                    (c) => c.status === "healthy"
                  ).length;
                  const warningCount = selectedNode.children.filter(
                    (c) => c.status === "warning"
                  ).length;
                  const errorCount = selectedNode.children.filter(
                    (c) => c.status === "error"
                  ).length;

                  return (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem",
                      }}
                    >
                      <div
                        style={{
                          padding: "0.5rem",
                          background: "#fff",
                          border: "1px solid #e5e7eb",
                          borderRadius: "4px",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <span
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: getStatusColor("healthy"),
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{ color: "#111827", fontSize: "0.85rem" }}
                        >
                          Healthy: <strong>{healthyCount}</strong>
                        </span>
                      </div>
                      <div
                        style={{
                          padding: "0.5rem",
                          background: "#fff",
                          border: "1px solid #e5e7eb",
                          borderRadius: "4px",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <span
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: getStatusColor("warning"),
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{ color: "#111827", fontSize: "0.85rem" }}
                        >
                          Warning: <strong>{warningCount}</strong>
                        </span>
                      </div>
                      <div
                        style={{
                          padding: "0.5rem",
                          background: "#fff",
                          border: "1px solid #e5e7eb",
                          borderRadius: "4px",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <span
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: getStatusColor("error"),
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{ color: "#111827", fontSize: "0.85rem" }}
                        >
                          Error: <strong>{errorCount}</strong>
                        </span>
                      </div>
                      <div
                        style={{
                          padding: "0.5rem",
                          background: "#f9fafb",
                          border: "1px solid #e5e7eb",
                          borderRadius: "4px",
                          marginTop: "0.5rem",
                        }}
                      >
                        <span
                          style={{ color: "#6b7280", fontSize: "0.85rem" }}
                        >
                          Total: <strong>{selectedNode.children.length}</strong>
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
        </div>
      ) : (
        <p style={{ color: "#999", fontSize: "0.9rem" }}>
          Select an item from the tree or topology to view details
        </p>
      )}
    </div>
  );
};

