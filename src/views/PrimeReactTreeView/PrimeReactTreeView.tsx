import { useState } from "react";
import { Tree } from "primereact/tree";
import type { TreeNode } from "primereact/treenode";

export default function PrimeReactTreeView() {
  const generateServerPools = (envKey: string, envPrefix: string) => {
    const workloadNames = [
      "aws-win-nginx",
      "dev-docker-billing-ui",
      "azure-linux-webapp",
      "gcp-k8s-api-gateway",
      "on-prem-postgres-db",
      "aws-lambda-auth-svc",
      "docker-redis-cache",
      "k8s-monitoring-stack",
      "azure-mssql-datawarehouse",
      "gcp-storage-service",
    ];

    return Array.from({ length: 10 }, (_, poolIndex) => ({
      key: `${envKey}-${poolIndex}`,
      label: `Server pool ${String(poolIndex + 1).padStart(3, "0")}`,
      data: `Server Pool ${poolIndex + 1}`,
      children: Array.from({ length: 10 }, (_, workloadIndex) => ({
        key: `${envKey}-${poolIndex}-${workloadIndex}`,
        label: `${envPrefix}-${workloadNames[workloadIndex]}-${
          workloadIndex + 1
        }`,
        data: `Workload ${workloadIndex + 1}`,
      })),
    }));
  };

  const [nodes] = useState<TreeNode[]>([
    {
      key: "prod",
      label: "prod.example.com",
      data: "Production Environment",
      children: generateServerPools("prod", "prod"),
    },
    {
      key: "test",
      label: "test.example.com",
      data: "Test Environment",
      children: generateServerPools("test", "test"),
    },
    {
      key: "dev",
      label: "dev.example.com",
      data: "Development Environment",
      children: generateServerPools("dev", "dev"),
    },
  ]);

  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  return (
    <div style={{ padding: "2rem" }}>
      <style>{`
        .custom-tree .p-tree-toggler {
          width: 14px !important;
          height: 14px !important;
          background: #2979FF !important;
          border-radius: 2px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          margin-right: 0.5rem !important;
          position: relative !important;
        }
        
        .custom-tree .p-tree-toggler:hover {
          background: #1565C0 !important;
        }
        
        .custom-tree .p-tree-toggler .p-tree-toggler-icon {
          display: none !important;
        }
        
        .custom-tree .p-tree-toggler::after {
          content: '+';
          color: white;
          font-size: 12px;
          font-weight: bold;
          line-height: 1;
        }
        
        .custom-tree .p-tree-node-content[aria-expanded="true"] .p-tree-toggler::after {
          content: '-';
        }
        
        /* Tree lines styling */
        .custom-tree .p-tree-node-children {
          padding-left: 1rem;
          position: relative;
        }
        
        .custom-tree .p-tree-node {
          position: relative;
        }
        
        /* Vertical line for nested items */
        .custom-tree .p-tree-node-children::before {
          content: '';
          position: absolute;
          left: 7px;
          top: 0;
          bottom: 0;
          width: 1px;
          background: #d1d5db;
        }
        
        /* Horizontal line connecting to each item */
        .custom-tree .p-tree-node::before {
          content: '';
          position: absolute;
          left: -13px;
          top: 18px;
          width: 13px;
          height: 1px;
          background: #d1d5db;
        }
        
        /* Remove line for root level items */
        .custom-tree > .p-tree-container > .p-tree-node::before {
          display: none;
        }
        
        /* Adjust last child vertical line */
        .custom-tree .p-tree-node:last-child::after {
          content: '';
          position: absolute;
          left: -13px;
          top: 18px;
          bottom: 0;
          width: 1px;
          background: white;
        }
      `}</style>
      <h1 style={{ marginBottom: "1.5rem" }}>PrimeReact Tree Example</h1>

      <div style={{ maxWidth: "800px" }}>
        <h2 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>
          Infrastructure Tree
        </h2>
        <p style={{ marginBottom: "1rem", color: "#666" }}>
          3 environments × 10 server pools × 10 workloads each = 300 total
          workloads
        </p>
        <Tree
          value={nodes}
          selectionMode="single"
          selectionKeys={selectedKey}
          onSelectionChange={(e) => setSelectedKey(e.value as string)}
          className="custom-tree"
        />

        {selectedKey && (
          <div
            style={{
              marginTop: "1rem",
              padding: "1rem",
              background: "#f5f5f5",
              borderRadius: "4px",
            }}
          >
            <strong>Selected Node Key:</strong> {selectedKey}
          </div>
        )}
      </div>
    </div>
  );
}
