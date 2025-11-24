import { getTypeColor, getStatusColor } from '../../shared/TreeUtils';

export interface FlattenedItem {
  id: string;
  label: string;
  type: 'environment' | 'serverPool' | 'workload';
  status?: 'healthy' | 'warning' | 'error';
  level: number;
  hasChildren: boolean;
  isExpanded: boolean;
  isLoadMore?: boolean;
  isLoadAll?: boolean;
  poolId?: string;
  totalCount?: number;
}

export const ROW_HEIGHT = 36;

interface TreeItemTemplateProps {
  item: FlattenedItem;
  selectedId: string | null;
  onToggle: (itemId: string) => void;
  onLoadMore: (item: FlattenedItem) => void;
  onSelect: (id: string) => void;
}

export const TreeItemTemplate = ({
  item,
  selectedId,
  onToggle,
  onLoadMore,
  onSelect,
}: TreeItemTemplateProps) => {
  const typeColors = getTypeColor(item.type);
  const isSelected = item.id === selectedId;
  const isLoadMore = item.isLoadMore || false;
  const isExpandedParent = item.hasChildren && item.isExpanded;

  // Determine background color with solid background for sticky parents
  let backgroundColor = 'transparent';
  if (isLoadMore) {
    backgroundColor = '#f0f9ff';
  } else if (isSelected) {
    backgroundColor = '#e0f2fe';
  } else if (isExpandedParent) {
    backgroundColor = '#ffffff';
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0.375rem 0.5rem',
        paddingLeft: `${0.5 + item.level * 1.5}rem`,
        cursor: 'pointer',
        background: backgroundColor,
        borderRadius: '4px',
        transition: 'background 0.15s ease',
        height: ROW_HEIGHT,
        position: isExpandedParent ? 'sticky' : 'relative',
        top: isExpandedParent ? 0 : 'auto',
        zIndex: isExpandedParent ? 10 : 1,
        boxShadow: isExpandedParent ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (isLoadMore && item.poolId) {
          onLoadMore(item);
        } else if (item.hasChildren) {
          onToggle(item.id);
        } else {
          onSelect(item.id);
        }
      }}
      onMouseEnter={(e) => {
        if (!isSelected && !isLoadMore) {
          e.currentTarget.style.background = '#f9fafb';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected && !isLoadMore) {
          e.currentTarget.style.background = 'transparent';
        }
      }}
    >
      {/* Toggle button */}
      {item.hasChildren && (
        <span
          onClick={(e) => {
            e.stopPropagation();
            onToggle(item.id);
          }}
          style={{
            width: '16px',
            height: '16px',
            background: '#2979FF',
            borderRadius: '2px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '0.5rem',
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold',
            flexShrink: 0,
            cursor: 'pointer',
          }}
        >
          {item.isExpanded ? '-' : '+'}
        </span>
      )}

      {/* Spacer for items without toggle */}
      {!item.hasChildren && <span style={{ width: '16px', marginRight: '0.5rem' }} />}

      {/* Status indicator for workloads */}
      {item.type === 'workload' && item.status && !isLoadMore && (
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: getStatusColor(item.status),
            marginRight: '0.5rem',
            flexShrink: 0,
          }}
        />
      )}

      {/* Load More/Load All icon */}
      {isLoadMore && (
        <span
          style={{
            width: '16px',
            height: '16px',
            background: item.isLoadAll ? '#7c3aed' : '#2979FF',
            borderRadius: '2px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '0.5rem',
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold',
            flexShrink: 0,
          }}
        >
          {item.isLoadAll ? '↓' : '+'}
        </span>
      )}

      {/* Node label */}
      <span
        style={{
          fontSize: '0.875rem',
          color: isLoadMore ? (item.isLoadAll ? '#7c3aed' : '#2979FF') : '#111827',
          fontWeight: isLoadMore ? 600 : isSelected ? 600 : 400,
          marginRight: '0.5rem',
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {item.label}
      </span>

      {/* Type badge */}
      {!isLoadMore && (
        <span
          style={{
            padding: '0.125rem 0.375rem',
            background: typeColors.bg,
            color: typeColors.color,
            borderRadius: '3px',
            fontSize: '0.7rem',
            fontWeight: 500,
            flexShrink: 0,
          }}
        >
          {item.type}
        </span>
      )}
    </div>
  );
};

