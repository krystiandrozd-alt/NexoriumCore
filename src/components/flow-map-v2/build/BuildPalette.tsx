'use client';

// Nexorium Core - Build Palette Component
// Draggable palette for manual design mode

import { memo } from 'react';
import PaletteItem from './PaletteItem';
import { paletteItems } from '@/types/flow-map-manual';

function BuildPalette() {
  return (
    <div className="space-y-2">
      <label className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
        Drag to Canvas
      </label>
      <div className="space-y-1">
        {paletteItems.map((item) => (
          <PaletteItem
            key={item.type}
            type={item.type}
            label={item.label}
            description={item.description}
            icon={item.icon}
          />
        ))}
      </div>
    </div>
  );
}

export default memo(BuildPalette);
