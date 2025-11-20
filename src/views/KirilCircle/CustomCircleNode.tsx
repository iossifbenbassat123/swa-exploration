// CustomCircleNode.jsx
import { Handle, Position } from '@xyflow/react';
import { useState } from 'react';

interface NodeData {
  label: string;
  healthy: number;
  errors: number;
  unknown: number;
}

function CustomCircleNode({ data }: { data: NodeData }) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Calculate percentages and angles for the colored segments
  const total = data.healthy + data.errors + data.unknown;
  const errorAngle = (data.errors / total) * 360;
  // const unknownAngle = (data.unknown / total) * 360;
  const healthyAngle = (data.healthy / total) * 360;

  const createArc = (startAngle: number, endAngle: number, radius: number): string => {
    const start = polarToCartesian(50, 50, radius, endAngle);
    const end = polarToCartesian(50, 50, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(' ');
  };

  interface CartesianPoint {
    x: number;
    y: number;
  }

  const polarToCartesian = (
    centerX: number,
    centerY: number,
    radius: number,
    angleInDegrees: number
  ): CartesianPoint => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  return (
    <div
      style={{ position: 'relative' }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Label above the circle */}
      <div
        style={{
          position: 'absolute',
          top: '-30px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#e0e7ff',
          padding: '4px 12px',
          borderRadius: '4px',
          color: '#3b82f6',
          fontSize: '14px',
          whiteSpace: 'nowrap',
        }}
      >
        {data.label}
      </div>

      {/* Circle with colored segments using arcs */}
      <svg width="100" height="100">
        {/* Background white circle */}
        <circle cx="50" cy="50" r="40" fill="white" />

        {/* Green segment (healthy) */}
        <path
          d={createArc(0, healthyAngle, 40)}
          stroke="#22c55e"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
        />

        {/* Red segment (errors) */}
        <path
          d={createArc(healthyAngle, healthyAngle + errorAngle, 40)}
          stroke="#ef4444"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
        />

        {/* Orange/Yellow segment (unknown) */}
        <path
          d={createArc(healthyAngle + errorAngle, 360, 40)}
          stroke="#f59e0b"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
        />
      </svg>

      {/* Tooltip */}
      {showTooltip && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '110px',
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
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ color: '#22c55e', marginRight: '8px' }}>✓</span>
            <span>{data.healthy} Healthy identities</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ color: '#ef4444', marginRight: '8px' }}>!</span>
            <span>+{data.errors} Errors</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ color: '#f59e0b', marginRight: '8px' }}>⚠</span>
            <span>+{data.unknown} Unknown</span>
          </div>
        </div>
      )}

      {/* Handles for connections */}
      <Handle type="target" position={Position.Left} id="left" />
      <Handle type="target" position={Position.Right} id="right" />
      <Handle type="target" position={Position.Top} id="top" />
      <Handle type="target" position={Position.Bottom} id="bottom" />
      <Handle type="source" position={Position.Left} id="left-source" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} id="right-source" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Top} id="top-source" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} id="bottom-source" style={{ opacity: 0 }} />
    </div>
  );
}

export default CustomCircleNode;
