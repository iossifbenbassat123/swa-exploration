import type { Infrastructure } from "./infrastructureData";

// Global infrastructure constant used across the application
export const INFRASTRUCTURE: Infrastructure = {
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
            const workloads = [];

            for (let i = 1; i <= 100000; i++) {
              // Distribute: 70% healthy, 20% warning, 10% error
              let status: "healthy" | "warning" | "error";
              const rand = Math.random();
              if (rand < 0.7) status = "healthy";
              else if (rand < 0.9) status = "warning";
              else status = "error";

              workloads.push({
                id: `us-east-pool-1-w${i}`,
                label: `workload-${i}`,
                type: "workload" as const,
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
