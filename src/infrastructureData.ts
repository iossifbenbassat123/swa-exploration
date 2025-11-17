import type { TreeNode } from "primereact/treenode";
import type { Node, Edge } from "@xyflow/react";

export interface InfrastructureNode {
  id: string;
  label: string;
  type: "environment" | "serverPool" | "workload";
  status?: "healthy" | "warning" | "error";
  children?: InfrastructureNode[];
  metadata?: Record<string, unknown>;
}

export interface Infrastructure {
  name: string;
  description: string;
  nodes: InfrastructureNode[];
}

// Infrastructure 1: Cloud-based multi-region setup
export const infrastructure1: Infrastructure = {
  name: "Cloud Multi-Region",
  description: "AWS-based multi-region infrastructure",
  nodes: [
    {
      id: "us-east",
      label: "us-east-1.aws.com",
      type: "environment",
      children: [
        {
          id: "us-east-pool-1",
          label: "Web Tier Pool",
          type: "serverPool",
          children: (() => {
            const workloads: InfrastructureNode[] = [];

            for (let i = 1; i <= 10000; i++) {
              // Distribute: 70% healthy, 20% warning, 10% error
              let status: "healthy" | "warning" | "error";
              const rand = Math.random();
              if (rand < 0.7) status = "healthy";
              else if (rand < 0.9) status = "warning";
              else status = "error";

              workloads.push({
                id: `us-east-pool-1-w${i}`,
                label: `workload-${i}`,
                type: "workload",
                status,
              });
            }
            return workloads;
          })(),
        },
        {
          id: "us-east-pool-2",
          label: "API Gateway Pool",
          type: "serverPool",
          children: [
            {
              id: "us-east-pool-2-w1",
              label: "aws-api-gateway-1",
              type: "workload",
              status: "healthy",
            },
            {
              id: "us-east-pool-2-w2",
              label: "aws-api-gateway-2",
              type: "workload",
              status: "healthy",
            },
            {
              id: "us-east-pool-2-w3",
              label: "aws-kong-gateway-1",
              type: "workload",
              status: "warning",
            },
          ],
        },
        {
          id: "us-east-pool-3",
          label: "Database Pool",
          type: "serverPool",
          children: [
            {
              id: "us-east-pool-3-w1",
              label: "aws-postgres-primary",
              type: "workload",
              status: "healthy",
            },
            {
              id: "us-east-pool-3-w2",
              label: "aws-postgres-replica-1",
              type: "workload",
              status: "healthy",
            },
            {
              id: "us-east-pool-3-w3",
              label: "aws-redis-cache",
              type: "workload",
              status: "error",
            },
          ],
        },
      ],
    },
    {
      id: "eu-west",
      label: "eu-west-1.aws.com",
      type: "environment",
      children: [
        {
          id: "eu-west-pool-1",
          label: "Web Tier Pool",
          type: "serverPool",
          children: [
            {
              id: "eu-west-pool-1-w1",
              label: "aws-nginx-frontend-1",
              type: "workload",
              status: "healthy",
            },
            {
              id: "eu-west-pool-1-w2",
              label: "aws-nginx-frontend-2",
              type: "workload",
              status: "healthy",
            },
          ],
        },
        {
          id: "eu-west-pool-2",
          label: "Database Pool",
          type: "serverPool",
          children: [
            {
              id: "eu-west-pool-2-w1",
              label: "aws-postgres-replica-2",
              type: "workload",
              status: "healthy",
            },
            {
              id: "eu-west-pool-2-w2",
              label: "aws-redis-cache",
              type: "workload",
              status: "warning",
            },
          ],
        },
      ],
    },
  ],
};

// Infrastructure 2: Hybrid cloud with on-premise
export const infrastructure2: Infrastructure = {
  name: "Hybrid Cloud",
  description: "Azure cloud with on-premise datacenter",
  nodes: [
    {
      id: "azure-prod",
      label: "prod.azure.com",
      type: "environment",
      children: [
        {
          id: "azure-prod-pool-1",
          label: "Kubernetes Cluster",
          type: "serverPool",
          children: [
            {
              id: "azure-prod-pool-1-w1",
              label: "k8s-auth-service",
              type: "workload",
            },
            {
              id: "azure-prod-pool-1-w2",
              label: "k8s-billing-service",
              type: "workload",
            },
            {
              id: "azure-prod-pool-1-w3",
              label: "k8s-user-service",
              type: "workload",
            },
            {
              id: "azure-prod-pool-1-w4",
              label: "k8s-notification-service",
              type: "workload",
            },
          ],
        },
        {
          id: "azure-prod-pool-2",
          label: "Storage Pool",
          type: "serverPool",
          children: [
            {
              id: "azure-prod-pool-2-w1",
              label: "azure-blob-storage",
              type: "workload",
            },
            {
              id: "azure-prod-pool-2-w2",
              label: "azure-file-share",
              type: "workload",
            },
          ],
        },
      ],
    },
    {
      id: "on-prem-dc1",
      label: "datacenter-01.local",
      type: "environment",
      children: [
        {
          id: "on-prem-dc1-pool-1",
          label: "Legacy Systems",
          type: "serverPool",
          children: [
            {
              id: "on-prem-dc1-pool-1-w1",
              label: "oracle-erp-system",
              type: "workload",
            },
            {
              id: "on-prem-dc1-pool-1-w2",
              label: "sap-integration",
              type: "workload",
            },
            {
              id: "on-prem-dc1-pool-1-w3",
              label: "mainframe-connector",
              type: "workload",
            },
          ],
        },
        {
          id: "on-prem-dc1-pool-2",
          label: "File Servers",
          type: "serverPool",
          children: [
            {
              id: "on-prem-dc1-pool-2-w1",
              label: "windows-file-server-1",
              type: "workload",
            },
            {
              id: "on-prem-dc1-pool-2-w2",
              label: "windows-file-server-2",
              type: "workload",
            },
          ],
        },
      ],
    },
  ],
};

// Infrastructure 3: Multi-cloud strategy
export const infrastructure3: Infrastructure = {
  name: "Multi-Cloud",
  description: "GCP and AWS distributed infrastructure",
  nodes: [
    {
      id: "gcp-prod",
      label: "prod.gcp.com",
      type: "environment",
      children: [
        {
          id: "gcp-prod-pool-1",
          label: "Analytics Pool",
          type: "serverPool",
          children: [
            {
              id: "gcp-prod-pool-1-w1",
              label: "gcp-bigquery-analytics",
              type: "workload",
            },
            {
              id: "gcp-prod-pool-1-w2",
              label: "gcp-dataflow-pipeline",
              type: "workload",
            },
            {
              id: "gcp-prod-pool-1-w3",
              label: "gcp-pubsub-streaming",
              type: "workload",
            },
          ],
        },
        {
          id: "gcp-prod-pool-2",
          label: "ML Pool",
          type: "serverPool",
          children: [
            {
              id: "gcp-prod-pool-2-w1",
              label: "gcp-vertex-ai-model",
              type: "workload",
            },
            {
              id: "gcp-prod-pool-2-w2",
              label: "gcp-ml-training-job",
              type: "workload",
            },
          ],
        },
      ],
    },
    {
      id: "aws-prod",
      label: "prod.aws.com",
      type: "environment",
      children: [
        {
          id: "aws-prod-pool-1",
          label: "Serverless Pool",
          type: "serverPool",
          children: [
            {
              id: "aws-prod-pool-1-w1",
              label: "lambda-image-processor",
              type: "workload",
            },
            {
              id: "aws-prod-pool-1-w2",
              label: "lambda-data-transformer",
              type: "workload",
            },
            {
              id: "aws-prod-pool-1-w3",
              label: "lambda-email-sender",
              type: "workload",
            },
          ],
        },
        {
          id: "aws-prod-pool-2",
          label: "Container Pool",
          type: "serverPool",
          children: [
            {
              id: "aws-prod-pool-2-w1",
              label: "ecs-web-app",
              type: "workload",
            },
            {
              id: "aws-prod-pool-2-w2",
              label: "ecs-worker-service",
              type: "workload",
            },
            {
              id: "aws-prod-pool-2-w3",
              label: "ecs-cron-jobs",
              type: "workload",
            },
          ],
        },
      ],
    },
    {
      id: "gcp-staging",
      label: "staging.gcp.com",
      type: "environment",
      children: [
        {
          id: "gcp-staging-pool-1",
          label: "Test Pool",
          type: "serverPool",
          children: [
            {
              id: "gcp-staging-pool-1-w1",
              label: "gcp-test-environment",
              type: "workload",
            },
            {
              id: "gcp-staging-pool-1-w2",
              label: "gcp-qa-automation",
              type: "workload",
            },
          ],
        },
      ],
    },
  ],
};

// Convert infrastructure to TreeNode format
export function infrastructureToTree(infra: Infrastructure): TreeNode[] {
  function convertNode(node: InfrastructureNode): TreeNode {
    return {
      key: node.id,
      label: node.label,
      data: node.type,
      children: node.children?.map(convertNode),
    };
  }

  return infra.nodes.map(convertNode);
}

// Convert infrastructure to ReactFlow nodes and edges
export function infrastructureToTopology(infra: Infrastructure): {
  nodes: Node[];
  edges: Edge[];
} {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  let yPos = 100;
  const xGap = 300;
  const yGap = 150;

  infra.nodes.forEach((env) => {
    const envX = 400;
    const envY = yPos;

    // Environment node
    nodes.push({
      id: env.id,
      type: "root",
      position: { x: envX, y: envY },
      data: { label: env.label },
    });

    const poolY = envY + yGap;

    env.children?.forEach((pool, poolIndex) => {
      const poolX = envX + (poolIndex - (env.children!.length - 1) / 2) * xGap;

      // Server pool node
      nodes.push({
        id: pool.id,
        type: "serverPool",
        position: { x: poolX, y: poolY },
        data: { label: pool.label },
      });

      edges.push({
        id: `${env.id}-${pool.id}`,
        source: env.id,
        target: pool.id,
      });

      const workloadY = poolY + yGap;

      pool.children?.forEach((workload, workloadIndex) => {
        const workloadX =
          poolX + (workloadIndex - (pool.children!.length - 1) / 2) * 120;

        // Workload node
        nodes.push({
          id: workload.id,
          type: "server",
          position: { x: workloadX, y: workloadY },
          data: { label: workload.label },
        });

        edges.push({
          id: `${pool.id}-${workload.id}`,
          source: pool.id,
          target: workload.id,
        });
      });
    });

    yPos += 600; // Space between environments
  });

  return { nodes, edges };
}
