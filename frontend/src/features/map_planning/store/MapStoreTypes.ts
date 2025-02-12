import { convertToDateString } from '../utils/date-utils';
import {
  BaseLayerImageDto,
  LayerDto,
  LayerType,
  PlantingDto,
  PlantsSummaryDto,
} from '@/bindings/definitions';
import { FrontendOnlyLayerType } from '@/features/map_planning/layers/_frontend_only';
import Konva from 'konva';
import { Node } from 'konva/lib/Node';
import * as uuid from 'uuid';
import { StateCreator } from 'zustand';

import Vector2d = Konva.Vector2d;

export type MapCreator = StateCreator<TrackedMapSlice & UntrackedMapSlice, [], []>;
export type SetFn = Parameters<MapCreator>[0];
export type GetFn = Parameters<MapCreator>[1];

/**
 * This type combines layers that are only available in the frontend
 * with layers that are also reflected in the backend.
 */
export type CombinedLayerType = LayerType | FrontendOnlyLayerType;

/**
 * An action is a change to the map state, initiated by the user.
 * It knows how to apply itself to the map state, how to reverse itself, and how to execute itself.
 * @template T The type of the return value of the execute method.
 * @template U The type of the return value of the execute method for the reversed action.
 */
export type Action<T, U> = {
  /**
   * Id of the action so that RemoteActions can be filtered out.
   */
  actionId: string;

  /**
   * Entity ids that are affected by this action.
   */
  entityIds: string[];

  /**
   * Get the reverse action for this action.
   * The reverse action is populated with the current state of the object on the map.
   * This method should be called before `apply` has been called, if tracking the action in the history is desired.
   * @param state The current state of the map.
   * @returns The reverse action or null if the action cannot be reversed.
   */
  reverse(state: TrackedMapState): Action<U, T> | null;

  /**
   * Apply the action to the map state.
   * This method should only be called after `reverse` has been called, if tracking the action in the history is desired.
   * @param state The current state of the map.
   */
  apply(state: TrackedMapState): TrackedMapState;

  /**
   * Execute the action by informing the backend.
   */
  execute(mapId: number): Promise<T>;
};

/**
 * Type to keep track of the last actions of a user.
 */
type LastAction = {
  actionId: string;
  entityId: string;
};

/**
 * This part of the state contains the layers of the map and the objects on them.
 * User initiated changes to this part of the state are tracked in the history.
 * The history is used to undo and redo actions.
 */
export interface TrackedMapSlice {
  /**
   * The state of the map layers and objects.
   */
  trackedState: TrackedMapState;
  /**
   * An index pointing into the history.
   */
  step: number;
  /**
   * Contains a history of user initiated actions.
   */
  history: History;
  canUndo: boolean;
  canRedo: boolean;
  /**
   * A reference to the Konva Transformer.
   * It is used to transform selected objects.
   * The transformer is coupled with the selected objects in the `trackedState`, so it should be here.
   */
  transformer: React.RefObject<Konva.Transformer>;
  /**
   * References to timeouts used by executeActionDebounced.
   *
   * @internal This reference should never be modified by any other function than executeActionDebounced.
   */
  /** Event listener responsible for adding a single shape to the transformer */
  addShapeToTransformer: (shape: Node) => void;
  /**
   * Execute a user initiated action.
   * @param action the action to be executed
   */
  executeAction: <T, U>(action: Action<T, U>) => void;
  /**
   * Undo the last user initiated action.
   */
  undo: () => void;
  /**
   * Redo the last user initiated action.
   */
  redo: () => void;

  /**
   * Apply a remote action to the map state.
   * @param action The action to apply.
   *
   * @internal This method is only used by the EventSource to handle remote actions from other users.
   * It is not meant to be used in other places, or called from event handlers.
   */
  __applyRemoteAction: (action: Action<unknown, unknown>) => void;
  /**
   * Only called as part of the map initialization, do not call anywhere else.
   * Resets store to default values before fetching new data, to avoid temporarily displaying wrong map data.
   */
  __resetStore: () => void;
  /**
   * Initializes the plant layer.
   */
  initPlantLayer: (plantLayer: PlantingDto[]) => void;
  /**
   * Initializes the base layer.
   */
  initBaseLayer: (baseLayer: BaseLayerImageDto) => void;
  initLayerId: (layer: LayerType, layerId: number) => void;
}

/**
 * The type of the history.
 */
export type History = Array<Action<unknown, unknown>>;

/**
 * Part of store which is unaffected by the History
 */
export interface UntrackedMapSlice {
  untrackedState: UntrackedMapState;
  stageRef: React.RefObject<Konva.Stage>;
  tooltipRef: React.RefObject<Konva.Label>;
  updateMapBounds: (bounds: BoundsRect) => void;
  // The backend does not know about frontend only layers, hence they are not part of LayerDto.
  updateSelectedLayer: (selectedLayer: LayerDto | FrontendOnlyLayerType) => void;
  updateLayerVisible: (
    layerName: CombinedLayerType,
    visible: UntrackedLayerState['visible'],
  ) => void;
  updateLayerOpacity: (
    layerName: CombinedLayerType,
    opacity: UntrackedLayerState['opacity'],
  ) => void;
  lastActions: LastAction[];
  selectPlantForPlanting: (plant: PlantsSummaryDto | null) => void;
  selectPlanting: (planting: PlantingDto | null) => void;
  toggleShowPlantLabel: () => void;
  baseLayerActivateMeasurement: () => void;
  baseLayerDeactivateMeasurement: () => void;
  baseLayerSetMeasurePoint: (point: Vector2d) => void;
  updateTimelineDate: (date: string) => void;
  setTimelineBounds: (from: string, to: string) => void;
  getSelectedLayerType: () => CombinedLayerType;
  getSelectedLayerId: () => number | null;
  setTooltipText: (content: string) => void;
  setTooltipPosition: (position: { x: number; y: number }) => void;
  /**
   * Only used by the EventSource to remove actions from the list of last actions.
   * Removes the last action from the list of last actions.
   */
  __removeLastAction: (lastAction: LastAction) => void;
}

const LAYER_TYPES = Object.values(LayerType);
const FRONTEND_ONLY_LAYER_TYPES = Object.values(FrontendOnlyLayerType);
const COMBINED_LAYER_TYPES = [...LAYER_TYPES, ...FRONTEND_ONLY_LAYER_TYPES];

export const TRACKED_DEFAULT_STATE: TrackedMapState = {
  layers: LAYER_TYPES.reduce(
    (acc, layerName) => ({
      ...acc,
      [layerName]: {
        id: -1,
        index: layerName,
        objects: [],
      },
      [LayerType.Base]: {
        layerId: 0,
        id: -1,
        index: LayerType.Base,
        imageId: uuid.v4(),
        scale: 100,
        rotation: 0,
        nextcloudImagePath: '',
      },
      [LayerType.Plants]: {
        id: -1,
        index: LayerType.Plants,
        objects: [],
        loadedObjects: [],
      },
    }),
    {} as TrackedLayers,
  ),
};

export const UNTRACKED_DEFAULT_STATE: UntrackedMapState = {
  mapId: -1,
  editorBounds: { x: 0, y: 0, width: 0, height: 0 },
  timelineDate: convertToDateString(new Date()),
  fetchDate: convertToDateString(new Date()),
  timelineBounds: {
    from: convertToDateString(new Date()),
    to: convertToDateString(new Date()),
  },
  selectedLayer: {
    id: -1,
    is_alternative: false,
    name: 'none',
    type_: LayerType.Base,
    map_id: -1,
  },
  tooltipContent: '',
  tooltipPosition: { x: 0, y: 0 },
  layers: COMBINED_LAYER_TYPES.reduce(
    (acc, layerName) => ({
      ...acc,
      [layerName]: {
        visible: true,
        opacity: 1,
      },
      [LayerType.Plants]: {
        visible: true,
        opacity: 1,
        showLabels: true,
      } as UntrackedPlantLayerState,
      [LayerType.Base]: {
        visible: true,
        opacity: 1,
        measureStep: 'inactive',
        measurePoint1: null,
        measurePoint2: null,
      } as UntrackedBaseLayerState,
    }),
    {} as UntrackedLayers,
  ),
};

/**
 * The state of a layer's object.
 */
export type ObjectState = {
  index: LayerType;
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
};

/**
 * The state of a map's layer.
 */
export type TrackedLayerState = {
  index: LayerType;
  id: number;
  /**
   * The state of the objects on the layer.
   */
  objects: ObjectState[];
};

/**
 * The state of a map's layer.
 */
export type UntrackedLayerState = {
  index: LayerType;
  visible: boolean;
  opacity: number;
};

/**
 * The state of the layers of the map.
 */
export type TrackedLayers = {
  [key in Exclude<LayerType, LayerType.Plants | LayerType.Base>]: TrackedLayerState;
} & {
  [LayerType.Plants]: TrackedPlantLayerState;
  [LayerType.Base]: TrackedBaseLayerState;
};

export type TrackedPlantLayerState = {
  index: LayerType.Plants;
  id: number;

  /**
   * The objects visible relative to the current selected date.
   * This is a subset of `loadedObjects`.
   */
  objects: PlantingDto[];
  /**
   * The objects that have been loaded from the backend.
   */
  loadedObjects: PlantingDto[];
};

export type TrackedBaseLayerState = {
  id: number;
  layerId: number;
  imageId: string;
  rotation: number;
  scale: number;
  nextcloudImagePath: string;
};

/**
 * The state of the layers of the map.
 */
export type UntrackedLayers = {
  [key in Exclude<CombinedLayerType, LayerType.Plants | LayerType.Base>]: UntrackedLayerState;
} & {
  [LayerType.Plants]: UntrackedPlantLayerState;
  [LayerType.Base]: UntrackedBaseLayerState;
};

export type UntrackedPlantLayerState = UntrackedLayerState & {
  selectedPlantForPlanting: PlantsSummaryDto | null;
  selectedPlanting: PlantingDto | null;
  showLabels: boolean;
};

export type UntrackedBaseLayerState = UntrackedLayerState & {
  measurePoint1: Vector2d | null;
  measurePoint2: Vector2d | null;
  measureStep: 'inactive' | 'none selected' | 'one selected' | 'both selected';
};

/**
 * The state of the map tracked by the history.
 */
export type TrackedMapState = {
  layers: TrackedLayers;
};

/**
 * The state of the map untracked by the history.
 */
export type UntrackedMapState = {
  mapId: number;
  editorBounds: BoundsRect;
  // The backend does not know about frontend only layers, hence they are not part of LayerDto.
  selectedLayer: LayerDto | FrontendOnlyLayerType;
  /** used for the bounds calculation */
  timelineDate: string;
  /** used for fetching */
  fetchDate: string;
  timelineBounds: {
    from: string;
    to: string;
  };
  /** Storing the current content prevents constant rerenders of the tooltip component.  */
  tooltipContent: string;
  tooltipPosition: { x: number; y: number };
  layers: UntrackedLayers;
};

/**
 * Represents a simple rectangle with width, height and position.
 */
export type BoundsRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};
