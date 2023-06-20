import { LayerDto, LayerType, PlantingDto, PlantsSummaryDto } from '@/bindings/definitions';
import Konva from 'konva';
import { Node } from 'konva/lib/Node';

/**
 * An action is a change to the map state, initiated by the user.
 * It knows how to apply itself to the map state, how to reverse itself, and how to execute itself.
 * @template T The type of the return value of the execute method.
 * @template U The type of the return value of the execute method for the reversed action.
 */
export type Action<T, U> = {
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
  execute(): Promise<T>;
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
  /** Event listener responsible for adding a single shape to the transformer */
  addShapeToTransformer: (shape: Node) => void;
  /**
   * Execute a user initiated action.
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
   * It is not meant to be used by the user, on called in event handlers.
   */
  __applyRemoteAction: (action: Action<unknown, unknown>) => void;
  /**
   * Initializes the plant layer.
   */
  initPlantLayer: (plantLayer: PlantingDto[]) => void;
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
  updateSelectedLayer: (selectedLayer: LayerDto) => void;
  updateLayerVisible: (layerName: LayerType, visible: UntrackedLayerState['visible']) => void;
  updateLayerOpacity: (layerName: LayerType, opacity: UntrackedLayerState['opacity']) => void;
  selectPlantForPlanting: (plant: PlantsSummaryDto | null) => void;
  selectPlanting: (planting: PlantingDto | null) => void;
}

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
  [key in Exclude<LayerType, LayerType.Plants>]: TrackedLayerState;
} & {
  [LayerType.Plants]: TrackedPlantLayerState;
  [LayerType.Base]: TrackedBaseLayerState;
};

export type TrackedPlantLayerState = {
  index: LayerType.Plants;

  objects: PlantingDto[];
};

export type TrackedBaseLayerState = {
  rotation: number;
  scale: number;
  nextcloudImagePath: string;
};

/**
 * The state of the layers of the map.
 */
export type UntrackedLayers = {
  [key in Exclude<LayerType, LayerType.Plants>]: UntrackedLayerState;
} & {
  [LayerType.Plants]: UntrackedPlantLayerState;
};

export type UntrackedPlantLayerState = UntrackedLayerState & {
  selectedPlantForPlanting: PlantsSummaryDto | null;
  selectedPlanting: PlantingDto | null;
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
  selectedLayer: LayerDto;
  layers: UntrackedLayers;
};
