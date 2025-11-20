import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';

export interface CircleNodeData extends Record<string, unknown> {
  label: string;
  segments: {
    value: number;
    color: string;
    label?: string;
  }[];
  size?: number;
  strokeWidth?: number;
  showTooltip?: boolean;
}

interface CircleNodeProps extends NodeProps {
  data: CircleNodeData;
}

function CircleNode({ data, selected }: CircleNodeProps) {
  const { label, segments, size = 100, strokeWidth = 20 } = data;

  // Calculate total value
  const total = segments.reduce((sum, seg) => sum + seg.value, 0);

  // Generate SVG path for each segment
  const generateSegments = () => {
    const radius = size / 2;
    const innerRadius = radius - strokeWidth;
    let currentAngle = -90; // Start from top

    return segments.map((segment, index) => {
      const angle = (segment.value / total) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;

      currentAngle = endAngle;

      // Convert angles to radians
      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;

      // Calculate outer arc points
      const x1 = radius + radius * Math.cos(startRad);
      const y1 = radius + radius * Math.sin(startRad);
      const x2 = radius + radius * Math.cos(endRad);
      const y2 = radius + radius * Math.sin(endRad);

      // Calculate inner arc points
      const x3 = radius + innerRadius * Math.cos(endRad);
      const y3 = radius + innerRadius * Math.sin(endRad);
      const x4 = radius + innerRadius * Math.cos(startRad);
      const y4 = radius + innerRadius * Math.sin(startRad);

      const largeArc = angle > 180 ? 1 : 0;

      const pathData = [
        `M ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
        `L ${x3} ${y3}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}`,
        'Z',
      ].join(' ');

      return <path key={index} d={pathData} fill={segment.color} stroke="white" strokeWidth="1" />;
    });
  };

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      {/* Label above the circle */}
      <div
        style={{
          fontSize: '14px',
          fontWeight: 500,
          color: '#1a73e8',
          backgroundColor: selected ? '#e8f0fe' : 'transparent',
          padding: '4px 8px',
          borderRadius: '4px',
          transition: 'background-color 0.2s',
        }}
      >
        {label}
      </div>

      {/* Circle with segments */}
      <div style={{ position: 'relative' }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{
            filter: selected ? 'drop-shadow(0 0 8px rgba(26, 115, 232, 0.4))' : 'none',
            transition: 'filter 0.2s',
          }}
        >
          {generateSegments()}
        </svg>

        {/* Center dot (optional) */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#666',
          }}
        />
      </div>

      {/* Connection handles removed - React Flow will calculate from node boundaries */}
    </div>
  );
}

export default memo(CircleNode);
