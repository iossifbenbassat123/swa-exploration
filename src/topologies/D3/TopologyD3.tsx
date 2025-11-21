import { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { INFRASTRUCTURE } from '../../constants';
import type { InfrastructureNode } from '../../infrastructureData';

const PRIMARY_COLOR = '#2E6BFF';
const BACKGROUND_COLOR = '#E3EBFF';
const SELECTED_BORDER = '#1E40AF';
const SELECTED_BACKGROUND = '#DBEAFE';
const HEALTHY_COLOR = '#689F38';
const ERROR_COLOR = '#EF5350';
const WARNING_COLOR = '#F57F17';
const BORDER_COLOR = '#D4D5D8';
const TEXT_COLOR = '#363840';

interface TopologyD3Props {
  selectedId?: string | null;
  onNodeClick?: (nodeId: string) => void;
  environmentId?: string; // 'us-east' or 'eu-west'
}

interface D3Node extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: 'root' | 'serverPool' | 'server';
  status?: 'healthy' | 'warning' | 'error';
  count?: number;
  workloads?: InfrastructureNode[];
  treeId: string; // Original tree ID for mapping
}

interface D3Link extends d3.SimulationLinkDatum<D3Node> {
  id: string;
  source: string | D3Node;
  target: string | D3Node;
}

const TopologyD3 = ({ selectedId, onNodeClick, environmentId }: TopologyD3Props) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Determine which environment to render
  const envId = environmentId || 'us-east';

  // Generate nodes and links from infrastructure data
  const { nodes, links, idMapping } = useMemo(() => {
    const env = INFRASTRUCTURE.nodes.find(
      (node: InfrastructureNode) => node.id === envId
    );
    if (!env) return { nodes: [], links: [], idMapping: {} };

    const d3Nodes: D3Node[] = [];
    const d3Links: D3Link[] = [];
    const mapping: Record<string, string> = { [envId]: `${envId}-root` };

    // Root node
    const rootX = envId === 'us-east' ? 400 : 300;
    d3Nodes.push({
      id: `${envId}-root`,
      label: env.label,
      type: 'root',
      treeId: envId,
      fx: rootX,
      fy: 50,
    });

    // Server pools
    const pools = env.children || [];
    pools.forEach((pool: InfrastructureNode, poolIndex: number) => {
      const poolX = envId === 'us-east' 
        ? 100 + poolIndex * 300 
        : 250 + poolIndex * 300;
      
      d3Nodes.push({
        id: pool.id,
        label: pool.label,
        type: 'serverPool',
        status: 'healthy',
        treeId: pool.id,
        fx: poolX,
        fy: 200,
      });

      mapping[pool.id] = pool.id;

      d3Links.push({
        id: `${envId}-root-${pool.id}`,
        source: `${envId}-root`,
        target: pool.id,
      });

      // Group workloads by status
      const workloads = pool.children || [];
      const statusGroups: Record<string, typeof workloads> = {
        healthy: [],
        warning: [],
        error: [],
      };

      workloads.forEach((workload) => {
        const status = workload.status || 'healthy';
        statusGroups[status].push(workload);
      });

      // Create stacked nodes for each status group
      let groupIndex = 0;
      Object.entries(statusGroups).forEach(([status, group]) => {
        if (group.length > 0) {
          const groupId = `${pool.id}-${status}-group`;
          const count = group.length;

          const serverX = envId === 'us-east'
            ? poolX - 100 + groupIndex * 100
            : poolX - 50 + groupIndex * 100;

          d3Nodes.push({
            id: groupId,
            label: count > 1 ? `${count}x ${status}` : group[0].label,
            type: 'server',
            status: status as 'healthy' | 'warning' | 'error',
            count: count > 1 ? count : undefined,
            workloads: group,
            treeId: group[0].id, // Use first workload's ID for mapping
            fx: serverX,
            fy: 350,
          });

          d3Links.push({
            id: `${pool.id}-${groupId}`,
            source: pool.id,
            target: groupId,
          });

          // Map each workload to its group
          group.forEach((workload: InfrastructureNode) => {
            mapping[workload.id] = groupId;
          });

          groupIndex++;
        }
      });
    });

    return { nodes: d3Nodes, links: d3Links, idMapping: mapping };
  }, [envId]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || nodes.length === 0) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Clear previous render
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current).attr('width', width).attr('height', height);

    // Create container for zoom/pan
    const g = svg.append('g');

    // Add zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 1.5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Set initial transform based on environment
    const initialX = envId === 'us-east' ? width / 2 - 400 : width / 2 - 300;
    svg.call(
      zoom.transform,
      d3.zoomIdentity.translate(initialX, height / 2 - 200).scale(1.2)
    );

    // Create force simulation
    const simulation = d3
      .forceSimulation<D3Node>(nodes)
      .force(
        'link',
        d3
          .forceLink<D3Node, D3Link>(links)
          .id((d) => d.id)
          .distance(150)
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(50));

    // Draw links
    const link = g
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', PRIMARY_COLOR)
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.6);

    // Draw nodes
    const node = g
      .append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .on('click', (_event, d) => {
        if (onNodeClick) {
          onNodeClick(d.treeId);
        }
      });

    // Render root nodes
    node
      .filter((d) => d.type === 'root')
      .each(function (d) {
        const g = d3.select(this);
        const isSelected = selectedId ? idMapping[selectedId] === d.id : false;

        // Calculate text width for proper sizing
        const textMeasure = g.append('text').text(d.label).style('visibility', 'hidden');
        const textWidth = (textMeasure.node()?.getBBox().width || 100) + 40;
        textMeasure.remove();

        const nodeWidth = Math.max(textWidth, 120);
        const nodeHeight = 40;

        // Background with shadow
        g.append('defs')
          .append('filter')
          .attr('id', `shadow-${d.id}`)
          .append('feDropShadow')
          .attr('dx', 0)
          .attr('dy', 2)
          .attr('stdDeviation', isSelected ? 4 : 2)
          .attr('flood-opacity', 0.2);

        g.append('rect')
          .attr('width', nodeWidth)
          .attr('height', nodeHeight)
          .attr('rx', 8)
          .attr('x', -nodeWidth / 2)
          .attr('y', -nodeHeight / 2)
          .attr('fill', isSelected ? SELECTED_BACKGROUND : BACKGROUND_COLOR)
          .attr('stroke', isSelected ? SELECTED_BORDER : PRIMARY_COLOR)
          .attr('stroke-width', isSelected ? 2 : 1)
          .attr('filter', `url(#shadow-${d.id})`);

        // Text - centered with padding
        g.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', 5)
          .attr('fill', PRIMARY_COLOR)
          .attr('font-size', '14px')
          .attr('font-weight', '600')
          .attr('font-family', 'system-ui, -apple-system, sans-serif')
          .text(d.label);
      });

    // Render server pool nodes
    node
      .filter((d) => d.type === 'serverPool')
      .each(function (d) {
        const g = d3.select(this);
        const isSelected = selectedId ? idMapping[selectedId] === d.id : false;

        // Calculate text width for proper sizing
        const tempText = g.append('text').text(d.label).style('visibility', 'hidden');
        const textWidth = (tempText.node()?.getBBox().width || 100) + 80;
        tempText.remove();

        const nodeWidth = Math.max(textWidth, 200);
        const nodeHeight = 60;
        const padding = 12;
        const iconSize = 40;
        const gap = 12;

        // Shadow filter
        g.append('defs')
          .append('filter')
          .attr('id', `shadow-pool-${d.id}`)
          .append('feDropShadow')
          .attr('dx', 0)
          .attr('dy', 2)
          .attr('stdDeviation', isSelected ? 6 : 3)
          .attr('flood-opacity', isSelected ? 0.3 : 0.15);

        // Main container
        g.append('rect')
          .attr('width', nodeWidth)
          .attr('height', nodeHeight)
          .attr('rx', 8)
          .attr('x', -nodeWidth / 2)
          .attr('y', -nodeHeight / 2)
          .attr('fill', '#fff')
          .attr('stroke', isSelected ? SELECTED_BORDER : BORDER_COLOR)
          .attr('stroke-width', isSelected ? 3 : 2)
          .attr('filter', `url(#shadow-pool-${d.id})`);

        // Server icon background (positioned at padding from left)
        const iconX = -nodeWidth / 2 + padding;
        const iconY = -nodeHeight / 2 + padding;
        g.append('rect')
          .attr('width', iconSize)
          .attr('height', iconSize)
          .attr('rx', 6)
          .attr('x', iconX)
          .attr('y', iconY)
          .attr('fill', '#E3F9FF');

        // Server icon SVG (centered in icon background)
        const iconCenterX = iconX + iconSize / 2;
        const iconCenterY = iconY + iconSize / 2;
        const iconG = g.append('g').attr('transform', `translate(${iconCenterX}, ${iconCenterY})`);
        iconG
          .append('path')
          .attr(
            'd',
            'M5.25 14.25h13.5m-13.5 0a3 3 0 0 1-3-3m3 3a3 3 0 1 0 0 6h13.5a3 3 0 1 0 0-6m-16.5-3a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3m-19.5 0a4.5 4.5 0 0 1 .9-2.7L5.737 5.1a3.375 3.375 0 0 1 2.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 0 1 .9 2.7m0 0a3 3 0 0 1-3 3m0 3h.008v.008h-.008v-.008Zm0-6h.008v.008h-.008v-.008Zm-3 6h.008v.008h-.008v-.008Zm0-6h.008v.008h-.008v-.008Z'
          )
          .attr('fill', 'none')
          .attr('stroke', '#58B2CC')
          .attr('stroke-width', 1.5)
          .attr('stroke-linecap', 'round')
          .attr('stroke-linejoin', 'round')
          .attr('transform', 'scale(0.67) translate(-12, -12)');

        // Status indicator circle (top-right of icon: -4px from top-right)
        const statusX = iconX + iconSize - 4;
        const statusY = iconY - 4;
        g.append('circle')
          .attr('r', 8)
          .attr('cx', statusX)
          .attr('cy', statusY)
          .attr('fill', HEALTHY_COLOR);

        // Check icon in status indicator (centered in circle)
        const statusIconG = g.append('g').attr('transform', `translate(${statusX}, ${statusY})`);
        statusIconG
          .append('path')
          .attr(
            'd',
            'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'
          )
          .attr('fill', 'none')
          .attr('stroke', '#fff')
          .attr('stroke-width', 2.5)
          .attr('stroke-linecap', 'round')
          .attr('stroke-linejoin', 'round')
          .attr('transform', 'scale(0.5) translate(-12, -12)');

        // Text content (to the right of icon with gap)
        const textX = iconX + iconSize + gap;
        const textY = iconY + 14; // Align with icon center vertically

        // Label
        g.append('text')
          .attr('x', textX)
          .attr('y', textY)
          .attr('fill', TEXT_COLOR)
          .attr('font-size', '14px')
          .attr('font-weight', '600')
          .attr('font-family', 'system-ui, -apple-system, sans-serif')
          .text(d.label);

        // Status text (below label with 4px margin)
        g.append('text')
          .attr('x', textX)
          .attr('y', textY + 16)
          .attr('fill', HEALTHY_COLOR)
          .attr('font-size', '12px')
          .attr('font-weight', '500')
          .attr('font-family', 'system-ui, -apple-system, sans-serif')
          .text('healthy');
      });

    // Render server nodes
    node
      .filter((d) => d.type === 'server')
      .each(function (d) {
        const g = d3.select(this);
        const isSelected = selectedId ? idMapping[selectedId] === d.id : false;

        // Status color
        const statusColor =
          d.status === 'healthy'
            ? HEALTHY_COLOR
            : d.status === 'error'
            ? ERROR_COLOR
            : WARNING_COLOR;

        const iconSize = 40;
        const gap = 8;
        const padding = 4;

        // Selection background (if selected)
        if (isSelected) {
          g.append('rect')
            .attr('width', iconSize + padding * 2 + 4)
            .attr('height', iconSize + padding * 2 + 4 + 20) // icon + gap + text
            .attr('rx', 8)
            .attr('x', -(iconSize + padding * 2 + 4) / 2)
            .attr('y', -(iconSize + padding * 2 + 4 + 20) / 2)
            .attr('fill', 'rgba(30, 64, 175, 0.05)')
            .attr('stroke', SELECTED_BORDER)
            .attr('stroke-width', 2);
        }

        // Stacked effect for multiple workloads (behind main icon)
        if (d.count && d.count > 1) {
          g.append('rect')
            .attr('width', iconSize)
            .attr('height', iconSize)
            .attr('rx', 6)
            .attr('x', -iconSize / 2 - 4)
            .attr('y', -iconSize / 2 - 4)
            .attr('fill', '#E3F9FF')
            .attr('opacity', 0.5);

          g.append('rect')
            .attr('width', iconSize)
            .attr('height', iconSize)
            .attr('rx', 6)
            .attr('x', -iconSize / 2 - 2)
            .attr('y', -iconSize / 2 - 2)
            .attr('fill', '#E3F9FF')
            .attr('opacity', 0.7);
        }

        // Main server icon background (centered)
        g.append('rect')
          .attr('width', iconSize)
          .attr('height', iconSize)
          .attr('rx', 6)
          .attr('x', -iconSize / 2)
          .attr('y', -iconSize / 2)
          .attr('fill', '#E3F9FF');

        // Docker icon SVG (centered in icon background)
        const dockerG = g.append('g').attr('transform', 'translate(0, 0)');
        dockerG
          .append('path')
          .attr(
            'd',
            'M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0 4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0-5.571 3-5.571-3'
          )
          .attr('fill', 'none')
          .attr('stroke', '#58B2CC')
          .attr('stroke-width', 1.5)
          .attr('stroke-linecap', 'round')
          .attr('stroke-linejoin', 'round')
          .attr('transform', 'scale(0.5) translate(-12, -12)');

        // Status indicator circle (top-right of icon: -4px from top-right)
        const statusX = iconSize / 2 - 4;
        const statusY = -iconSize / 2 - 4;
        g.append('circle')
          .attr('r', 8)
          .attr('cx', statusX)
          .attr('cy', statusY)
          .attr('fill', statusColor);

        // Status icon in indicator (centered in circle)
        const statusIconG = g.append('g').attr('transform', `translate(${statusX}, ${statusY})`);
        if (d.status === 'healthy') {
          statusIconG
            .append('path')
            .attr(
              'd',
              'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'
            )
            .attr('fill', 'none')
            .attr('stroke', '#fff')
            .attr('stroke-width', 2.5)
            .attr('stroke-linecap', 'round')
            .attr('stroke-linejoin', 'round')
            .attr('transform', 'scale(0.5) translate(-12, -12)');
        } else if (d.status === 'error') {
          statusIconG
            .append('path')
            .attr(
              'd',
              'M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z'
            )
            .attr('fill', 'none')
            .attr('stroke', '#fff')
            .attr('stroke-width', 2.5)
            .attr('stroke-linecap', 'round')
            .attr('stroke-linejoin', 'round')
            .attr('transform', 'scale(0.5) translate(-12, -12)');
        } else {
          statusIconG
            .append('path')
            .attr(
              'd',
              'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z'
            )
            .attr('fill', 'none')
            .attr('stroke', '#fff')
            .attr('stroke-width', 2.5)
            .attr('stroke-linecap', 'round')
            .attr('stroke-linejoin', 'round')
            .attr('transform', 'scale(0.5) translate(-12, -12)');
        }

        // Count badge (bottom-right of icon: -4px from bottom-right)
        if (d.count && d.count > 1) {
          const badgeX = iconSize / 2 - 4;
          const badgeY = iconSize / 2 - 4;
          
          // Badge background (pill shape)
          const badgeWidth = d.count > 9 ? 24 : 20;
          g.append('rect')
            .attr('width', badgeWidth)
            .attr('height', 20)
            .attr('rx', 10)
            .attr('x', badgeX - badgeWidth / 2)
            .attr('y', badgeY - 10)
            .attr('fill', '#1E40AF')
            .attr('stroke', '#fff')
            .attr('stroke-width', 2);

          g.append('text')
            .attr('x', badgeX)
            .attr('y', badgeY + 4)
            .attr('text-anchor', 'middle')
            .attr('fill', '#fff')
            .attr('font-size', '11px')
            .attr('font-weight', 'bold')
            .attr('font-family', 'system-ui, -apple-system, sans-serif')
            .text(String(d.count));
        }

        // Label (centered below icon with gap)
        g.append('text')
          .attr('text-anchor', 'middle')
          .attr('y', iconSize / 2 + gap + 12)
          .attr('fill', statusColor)
          .attr('font-size', '12px')
          .attr('font-weight', '500')
          .attr('font-family', 'system-ui, -apple-system, sans-serif')
          .text(d.label);
      });

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d) => {
          const source = d.source as D3Node;
          return source.x || 0;
        })
        .attr('y1', (d) => {
          const source = d.source as D3Node;
          return source.y || 0;
        })
        .attr('x2', (d) => {
          const target = d.target as D3Node;
          return target.x || 0;
        })
        .attr('y2', (d) => {
          const target = d.target as D3Node;
          return target.y || 0;
        });

      node.attr('transform', (d) => `translate(${d.x || 0},${d.y || 0})`);
    });

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [nodes, links, idMapping, selectedId, onNodeClick, envId]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', background: '#fafafa' }}>
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default TopologyD3;

