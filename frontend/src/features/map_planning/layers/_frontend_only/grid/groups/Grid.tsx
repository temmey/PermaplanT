import { calculateGridStep } from '@/features/map_planning/layers/_frontend_only/grid/util/Calculations';
import {
  RELATIVE_DOT_SIZE,
  SEA_BLUE_500,
} from '@/features/map_planning/layers/_frontend_only/grid/util/Constants';
import { BoundsRect } from '@/features/map_planning/store/MapStoreTypes';
import { Group, Line } from 'react-konva';

export const Grid = (rect: BoundsRect) => {
  const gridStep = calculateGridStep(rect.width);

  const gridDotSize = rect.width * RELATIVE_DOT_SIZE;

  // Draw the grid larger than necessary to avoid artifacts while panning the viewport.
  const startX = -rect.x - rect.width - ((-rect.x - rect.width) % gridStep);
  const startY = -rect.y - rect.height - ((-rect.y - rect.height) % gridStep);

  const endX = -rect.x + rect.width * 2;
  const endY = -rect.y + rect.height * 2;

  const lines = [];
  for (let y = startY; y < endY; y += gridStep) {
    lines.push(
      <Line
        strokeWidth={gridDotSize}
        stroke={SEA_BLUE_500}
        points={[startX, y, endX, y]}
        dash={[gridDotSize, gridStep - gridDotSize]}
      ></Line>,
    );
  }

  return <Group>{lines}</Group>;
};
