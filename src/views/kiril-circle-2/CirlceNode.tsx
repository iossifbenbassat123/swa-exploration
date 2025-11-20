import { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { useNavigate } from 'react-router-dom';

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
  link?: string;
}

interface CircleNodeProps extends NodeProps {
  data: CircleNodeData;
}

function CircleNode({ data, selected }: CircleNodeProps) {
  const {
    label,
    segments,
    size = 100,
    strokeWidth = 20,
    showTooltip: showTooltipProp,
    link,
  } = data;
  const [showTooltip, setShowTooltip] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    if (link) {
      // Check if it's an external URL or internal route
      if (link.startsWith('http://') || link.startsWith('https://')) {
        window.open(link, '_blank', 'noopener,noreferrer');
      } else {
        navigate(link);
      }
    }
  };

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
        cursor: link ? 'pointer' : 'default',
      }}
      onClick={link ? handleClick : undefined}
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
      <div
        style={{ position: 'relative' }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
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

        {/* Tooltip */}
        {(showTooltip || showTooltipProp) && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: `${size + 10}px`,
              transform: 'translateY(-50%)',
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '12px 16px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              zIndex: 1000,
              minWidth: '200px',
            }}
          >
            {segments.map((segment, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: index < segments.length - 1 ? '8px' : '0',
                }}
              >
                <span
                  style={{
                    color: segment.color,
                    marginRight: '8px',
                    fontSize: '14px',
                  }}
                >
                  {segment.label ? '✓' : '●'}
                </span>
                <span>
                  {segment.value} {segment.label || `Segment ${index + 1}`}
                </span>
              </div>
            ))}
            {total > 0 && (
              <div
                style={{
                  marginTop: '8px',
                  paddingTop: '8px',
                  borderTop: '1px solid #e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  fontWeight: 600,
                }}
              >
                <span style={{ marginRight: '8px' }}>Total:</span>
                <span>{total}</span>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Invisible handles at node boundaries - React Flow will use these automatically */}
      <Handle
        type="source"
        position={Position.Right}
        style={{ opacity: 0, width: 1, height: 1, pointerEvents: 'none' }}
      />
      <Handle
        type="target"
        position={Position.Left}
        style={{ opacity: 0, width: 1, height: 1, pointerEvents: 'none' }}
      />
      <Handle
        type="source"
        position={Position.Top}
        style={{ opacity: 0, width: 1, height: 1, pointerEvents: 'none' }}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        style={{ opacity: 0, width: 1, height: 1, pointerEvents: 'none' }}
      />
    </div>
  );
}

export default memo(CircleNode);
