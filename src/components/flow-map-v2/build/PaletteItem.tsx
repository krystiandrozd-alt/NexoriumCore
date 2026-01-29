'use client';

// Nexorium Core - Palette Item Component
// Draggable palette item for manual design mode

import { memo } from 'react';
import {
  Server,
  Database,
  Globe,
  MessageSquare,
  Scale,
  Cloud,
  HardDrive,
  ExternalLink,
  StickyNote,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ManualNodeType } from '@/types/flow-map-manual';
import { nodeTypeStyles } from '@/types/flow-map-manual';

interface PaletteItemProps {
  type: ManualNodeType;
  label: string;
  description: string;
  icon: string;
}

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  Server,
  Database,
  Globe,
  MessageSquare,
  Scale,
  Cloud,
  HardDrive,
  ExternalLink,
  StickyNote,
};

function PaletteItem({ type, label, description, icon }: PaletteItemProps) {
  const Icon = iconMap[icon] || Server;
  const styles = nodeTypeStyles[type];

  const handleDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData('application/manual-node-type', type);
    event.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-grab',
        'border border-transparent',
        'transition-all duration-150',
        'hover:bg-white/10 hover:border-white/20',
        'active:cursor-grabbing active:scale-95'
      )}
      title={description}
    >
      <div
        className="w-8 h-8 rounded-md flex items-center justify-center"
        style={{
          backgroundColor: styles.bgColor,
          borderColor: styles.borderColor,
          borderWidth: '1px',
        }}
      >
        <Icon className="h-4 w-4" color={styles.iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-white font-medium truncate">{label}</div>
        <div className="text-[10px] text-slate-500 truncate">{description}</div>
      </div>
    </div>
  );
}

export default memo(PaletteItem);
