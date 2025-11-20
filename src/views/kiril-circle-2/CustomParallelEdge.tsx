import { BaseEdge } from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';

export default function CustomParallelEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  markerEnd,
  data,
}: EdgeProps) {
  const offset = (data?.offset as number) || 0;

  // Normalize direction: always calculate from left to right (or bottom to top if vertical)
  // This ensures both edges use the same reference direction
  const isReversed = sourceX > targetX || (sourceX === targetX && sourceY > targetY);

  const refStartX = isReversed ? targetX : sourceX;
  const refStartY = isReversed ? targetY : sourceY;
  const refEndX = isReversed ? sourceX : targetX;
  const refEndY = isReversed ? sourceY : targetY;

  // Calculate direction vector based on normalized direction
  const dx = refEndX - refStartX;
  const dy = refEndY - refStartY;
  const length = Math.sqrt(dx * dx + dy * dy);

  // Perpendicular vector (pointing "up" relative to normalized direction)
  const perpX = -dy / length;
  const perpY = dx / length;

  // Midpoint
  const midX = (refStartX + refEndX) / 2;
  const midY = (refStartY + refEndY) / 2;

  // Control point (same arc for all edges between these nodes)
  const curvature = -0.25;
  const controlOffset = length * curvature;
  const baseControlX = midX + perpX * controlOffset;
  const baseControlY = midY + perpY * controlOffset;

  // Apply offset to actual source and target (not normalized ones)
  const offsetSourceX = sourceX + perpX * offset;
  const offsetSourceY = sourceY + perpY * offset;
  const offsetTargetX = targetX + perpX * offset;
  const offsetTargetY = targetY + perpY * offset;
  const offsetControlX = baseControlX + perpX * offset;
  const offsetControlY = baseControlY + perpY * offset;

  // Create path using actual source/target positions
  const path = `M ${offsetSourceX},${offsetSourceY} Q ${offsetControlX},${offsetControlY} ${offsetTargetX},${offsetTargetY}`;

  return <BaseEdge path={path} markerEnd={markerEnd} style={style} />;
}
