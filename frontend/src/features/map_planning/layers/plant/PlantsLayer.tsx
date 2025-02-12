import useMapStore from '../../store/MapStore';
import { useIsReadOnlyMode } from '../../utils/ReadOnlyModeContext';
import { CreatePlantAction, MovePlantAction, TransformPlantAction } from './actions';
import { ExtendedPlantsSummaryDisplayName } from './components/ExtendedPlantDisplay';
import { PlantLayerRelationsOverlay } from './components/PlantLayerRelationsOverlay';
import { PlantingElement } from './components/PlantingElement';
import { LayerType, PlantSpread, PlantsSummaryDto } from '@/bindings/definitions';
import IconButton from '@/components/Button/IconButton';
import { PlantLabel } from '@/features/map_planning/layers/plant/components/PlantLabel';
import { ReactComponent as CloseIcon } from '@/icons/close.svg';
import { AnimatePresence, motion } from 'framer-motion';
import Konva from 'konva';
import { KonvaEventListener } from 'konva/lib/Node';
import { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Layer } from 'react-konva';
import { Html } from 'react-konva-utils';
import * as uuid from 'uuid';

const PLANT_WIDTHS = new Map<PlantSpread, number>([
  [PlantSpread.Narrow, 10],
  [PlantSpread.Medium, 50],
  [PlantSpread.Wide, 100],
]);

function getPlantWidth({ spread = PlantSpread.Medium }): number {
  return PLANT_WIDTHS.get(spread) ?? (PLANT_WIDTHS.get(PlantSpread.Medium) as number);
}

function usePlantLayerListeners(listening: boolean) {
  const executeAction = useMapStore((state) => state.executeAction);
  const selectedPlant = useMapStore(
    (state) => state.untrackedState.layers.plants.selectedPlantForPlanting,
  );
  const timelineDate = useMapStore((state) => state.untrackedState.timelineDate);
  const getSelectedLayerId = useMapStore((state) => state.getSelectedLayerId);
  const isReadOnlyMode = useIsReadOnlyMode();

  /**
   * Event handler for planting plants
   */
  const handleCreatePlanting: KonvaEventListener<Konva.Stage, unknown> = useCallback(
    (e) => {
      if (e.target instanceof Konva.Shape || !selectedPlant || isReadOnlyMode) {
        return;
      }

      const position = e.target.getRelativePointerPosition();
      if (!position) {
        return;
      }

      const width = getPlantWidth(selectedPlant);

      executeAction(
        new CreatePlantAction({
          id: uuid.v4(),
          plantId: selectedPlant.id,
          layerId: getSelectedLayerId() ?? -1,
          // consider the offset of the stage and size of the element
          x: Math.round(position.x),
          y: Math.round(position.y),
          height: width,
          width: width,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          addDate: timelineDate,
        }),
      );
    },
    [getSelectedLayerId, executeAction, selectedPlant, timelineDate, isReadOnlyMode],
  );

  /**
   * Event handler for unselecting plants
   */
  const handleUnselectPlanting: KonvaEventListener<Konva.Stage, unknown> = useCallback((e) => {
    // only unselect if we are clicking on the background, e.g. not on a plant
    if (e.target instanceof Konva.Shape) {
      return;
    }

    // only unselect if we are not planting a new plant
    const selectedPlantForPlanting =
      useMapStore.getState().untrackedState.layers.plants.selectedPlantForPlanting;
    if (selectedPlantForPlanting) {
      return;
    }

    useMapStore.getState().selectPlanting(null);
  }, []);

  /**
   * Event handler for selecting plants
   */
  const handleSelectPlanting: KonvaEventListener<Konva.Stage, unknown> = useCallback(() => {
    const transformer = useMapStore.getState().transformer.current;
    const element = transformer?.getNodes().find((element) => element.getAttr('planting'));
    if (element) {
      useMapStore.getState().selectPlanting(element.getAttr('planting'));
    }
  }, []);

  /**
   * Event handler for transforming plants
   */
  const handleTransformPlanting: KonvaEventListener<Konva.Transformer, unknown> =
    useCallback(() => {
      const updates = (useMapStore.getState().transformer.current?.getNodes() || []).map((node) => {
        return {
          id: node.id(),
          x: Math.round(node.x()),
          y: Math.round(node.y()),
          rotation: node.rotation(),
          scaleX: node.scaleX(),
          scaleY: node.scaleY(),
        };
      });

      executeAction(new TransformPlantAction(updates));
    }, [executeAction]);

  /**
   * Event handler for moving plants
   */
  const handleMovePlanting: KonvaEventListener<Konva.Transformer, unknown> = useCallback(() => {
    const updates = (useMapStore.getState().transformer.current?.getNodes() || []).map((node) => {
      return {
        id: node.id(),
        x: Math.round(node.x()),
        y: Math.round(node.y()),
      };
    });

    executeAction(new MovePlantAction(updates));
  }, [executeAction]);

  useEffect(() => {
    if (!listening) {
      return;
    }

    useMapStore.getState().stageRef.current?.on('click.placePlant', handleCreatePlanting);
    useMapStore.getState().stageRef.current?.on('click.unselectPlanting', handleUnselectPlanting);
    useMapStore.getState().stageRef.current?.on('mouseup.selectPlanting', handleSelectPlanting);
    useMapStore.getState().transformer.current?.on('transformend.plants', handleTransformPlanting);
    useMapStore.getState().transformer.current?.on('dragend.plants', handleMovePlanting);

    return () => {
      useMapStore.getState().stageRef.current?.off('click.placePlant');
      useMapStore.getState().stageRef.current?.off('click.unselectPlanting');
      useMapStore.getState().transformer.current?.off('transformend.plants');
      useMapStore.getState().transformer.current?.off('dragend.plants');
      useMapStore.getState().stageRef.current?.off('mouseup.selectPlanting');
    };
  }, [
    listening,
    handleCreatePlanting,
    handleTransformPlanting,
    handleMovePlanting,
    handleUnselectPlanting,
    handleSelectPlanting,
  ]);
}

type PlantsLayerProps = Konva.LayerConfig;

function PlantsLayer(props: PlantsLayerProps) {
  usePlantLayerListeners(props.listening || false);
  const layerRef = useRef<Konva.Layer>(null);

  const plants = useMapStore((map) => map.trackedState.layers.plants.objects);
  const selectedPlant = useMapStore(
    (state) => state.untrackedState.layers.plants.selectedPlantForPlanting,
  );
  const showPlantLabels = useMapStore((state) => state.untrackedState.layers.plants.showLabels);

  const portalRef = useRef<HTMLDivElement>(
    document.getElementById('bottom-portal') as HTMLDivElement,
  );

  return (
    <>
      <PlantLayerRelationsOverlay />
      <Layer {...props} ref={layerRef} name={`${LayerType.Plants}`}>
        {plants.map((o) => (
          <PlantingElement planting={o} key={o.id} />
        ))}
        {plants.map((o) => showPlantLabels && <PlantLabel planting={o} key={o.id} />)}

        <Html>
          {createPortal(
            <AnimatePresence mode="wait">
              {selectedPlant && <SelectedPlantInfo plant={selectedPlant} />}
            </AnimatePresence>,
            portalRef.current,
          )}
        </Html>
      </Layer>
    </>
  );
}

function SelectedPlantInfo({ plant }: { plant: PlantsSummaryDto }) {
  const selectPlant = useMapStore((state) => state.selectPlantForPlanting);

  return (
    <motion.div
      className="flex gap-4 rounded-md bg-neutral-200 py-3 pl-6 pr-4 ring ring-secondary-500 dark:bg-neutral-200-dark"
      initial={{ opacity: 0 }}
      animate={{
        opacity: 100,
        transition: { delay: 0, duration: 0.1 },
      }}
      exit={{
        opacity: 0,
        transition: { delay: 0, duration: 0.1 },
      }}
    >
      <div className="flex flex-col items-center justify-center">
        <ExtendedPlantsSummaryDisplayName plant={plant}></ExtendedPlantsSummaryDisplayName>
      </div>
      <div className="flex items-center justify-center">
        <IconButton
          className="m-2 h-8 w-8 border border-neutral-500 p-1"
          onClick={() => selectPlant(null)}
          data-tourid="placement_cancel"
        >
          <CloseIcon></CloseIcon>
        </IconButton>
      </div>
    </motion.div>
  );
}

export default PlantsLayer;
