import { offset } from '@floating-ui/dom';
import i18next from 'i18next';
import { ShepherdOptionsWithType, Tour } from 'react-shepherd';

const t = i18next.t;

/**
 * Takes text input and generates an HTMLElement with action formatting.
 * Action description will be shown in semi-bold and colored.
 *
 * @param action the description of the action the user should do.
 * @param text general information that should be shown before the action.
 * @returns an HTMLElement.
 */
function actionText(action: string, text?: string) {
  const textWrapper = document.createElement('div');
  const infoSpan = document.createElement('span');
  if (text) {
    infoSpan.innerHTML = `${text}<br />`;
  }
  const actionSpan = document.createElement('span');
  actionSpan.innerText = action;
  actionSpan.classList.add('text-secondary-200', 'font-medium');
  textWrapper.append(infoSpan, actionSpan);
  return textWrapper;
}

const standardButtons = [
  {
    text: t('guidedTour:back'),
    type: 'back',
  },
  {
    text: t('guidedTour:next'),
    type: 'next',
  },
];

const arrowOptions = {
  middleware: [offset(15)],
};

export const mapEditorSteps: ShepherdOptionsWithType[] = [
  {
    id: 'welcome',
    title: t('guidedTour:mapEditor.welcome_title'),
    text: t('guidedTour:mapEditor.welcome_text'),
    buttons: [
      {
        text: t('guidedTour:next'),
        type: 'next',
      },
    ],
  },
  {
    id: 'toolboxIntro',
    title: t('guidedTour:mapEditor.toolbox_intro_title'),
    text: t('guidedTour:mapEditor.toolbox_intro_text'),
    buttons: standardButtons,
    attachTo: {
      element: '[data-tourid="toolbox"]',
      on: 'right',
    },
  },
  {
    id: 'layersIntro',
    title: t('guidedTour:mapEditor.layers_intro_title'),
    text: t('guidedTour:mapEditor.layers_intro_text'),
    buttons: standardButtons,
    attachTo: {
      element: '[data-tourid="layers"]',
      on: 'left',
    },
  },
  {
    id: 'timelineIntro',
    title: t('guidedTour:mapEditor.timeline_intro_title'),
    text: t('guidedTour:mapEditor.timeline_intro_text'),
    buttons: standardButtons,
    attachTo: {
      element: '[data-tourid="timeline"]',
      on: 'top',
    },
  },
  {
    id: 'baseLayerIntro',
    title: `${t('guidedTour:mapEditor.base_layer_title')} (1/2)`,
    text: t('guidedTour:mapEditor.base_layer_intro'),
    buttons: standardButtons,
    attachTo: {
      element: '[data-tourid="bottom_right_toolbar"]',
      on: 'left',
    },
  },
  {
    id: 'baseLayerToolbar',
    title: `${t('guidedTour:mapEditor.base_layer_title')} (2/2)`,
    text: t('guidedTour:mapEditor.base_layer_toolbar'),
    buttons: standardButtons,
  },
  {
    id: 'plantsLayerSelect',
    title: `${t('guidedTour:mapEditor.plants_layer_title')} (1/17)`,
    text: actionText(
      t('guidedTour:mapEditor.plants_layer_select_action'),
      t('guidedTour:mapEditor.plants_layer_select_text'),
    ),
    buttons: [
      {
        text: t('guidedTour:back'),
        type: 'back',
      },
    ],
    attachTo: {
      element: '[data-tourid="plants_select"]',
      on: 'left',
    },
    advanceOn: {
      selector: '[data-tourid="plants_select"]',
      event: 'click',
    },
    classes: 'action-step',
    canClickTarget: true,
  },
  {
    id: 'plantsLayerIntro',
    title: `${t('guidedTour:mapEditor.plants_layer_title')} (2/17)`,
    text: t('guidedTour:mapEditor.plants_layer_intro'),
    buttons: standardButtons,
  },
  {
    id: 'plantsLayerRightToolbar',
    title: `${t('guidedTour:mapEditor.plants_layer_title')} (3/17)`,
    text: t('guidedTour:mapEditor.plants_layer_right_toolbar'),
    buttons: standardButtons,
    attachTo: {
      element: '[data-tourid="bottom_right_toolbar"]',
      on: 'left',
    },
  },
  {
    id: 'plantsLayerFirstPlantingSearch',
    title: `${t('guidedTour:mapEditor.plants_layer_title')} (4/17)`,
    text: actionText(
      t('guidedTour:mapEditor.plants_layer_first_planting_search_action'),
      t('guidedTour:mapEditor.plants_layer_first_planting_search_text'),
    ),
    attachTo: {
      element: '[data-tourid="search_button"]',
      on: 'left',
    },
    advanceOn: {
      selector: '[data-tourid="search_button"]',
      event: 'click',
    },
    classes: 'action-step',
    canClickTarget: true,
  },
  {
    id: 'plantsLayerFirstPlantingSelect',
    title: `${t('guidedTour:mapEditor.plants_layer_title')} (5/17)`,
    text: actionText(
      t('guidedTour:mapEditor.plants_layer_first_planting_select_action'),
      t('guidedTour:mapEditor.plants_layer_first_planting_select_text'),
    ),
    attachTo: {
      element: '[data-tourid="bottom_right_toolbar"]',
      on: 'left-start',
    },
    floatingUIOptions: {
      middleware: [
        offset({
          mainAxis: 15,
          crossAxis: -50,
        }),
      ],
    },
    arrow: false,
    advanceOn: {
      selector: '[data-tourid="plant_list"]',
      event: 'click',
    },
    beforeShowPromise: function () {
      return new Promise(function (resolve) {
        setTimeout(() => resolve(null), 10);
      });
    },
    classes: 'action-step',
    canClickTarget: true,
  },
  {
    id: 'plantsLayerFirstPlantingPlace',
    title: `${t('guidedTour:mapEditor.plants_layer_title')} (6/17)`,
    text: actionText(t('guidedTour:mapEditor.plants_layer_first_planting_place')),
    attachTo: {
      element: '[data-tourid="canvas"]',
      on: 'top',
    },
    advanceOn: {
      selector: '[data-tourid="canvas"]',
      event: 'click',
    },
    classes: 'action-step',
    canClickTarget: true,
  },
  {
    id: 'plantLayerChangeDate',
    title: `${t('guidedTour:mapEditor.plants_layer_title')} (7/17)`,
    text: actionText(
      t('guidedTour:mapEditor.plants_layer_change_date_action'),
      t('guidedTour:mapEditor.plants_layer_change_date_text'),
    ),
    attachTo: {
      element: '[data-tourid="date_picker"]',
      on: 'top',
    },
    advanceOn: {
      selector: '[data-tourid="date_picker"]',
      event: 'change',
    },
    classes: 'action-step',
    canClickTarget: true,
  },
  {
    id: 'plantsLayerSecondPlantingSearch',
    title: `${t('guidedTour:mapEditor.plants_layer_title')} (8/17)`,
    text: actionText(
      t('guidedTour:mapEditor.plants_layer_second_planting_search_action'),
      t('guidedTour:mapEditor.plants_layer_second_planting_search_text'),
    ),
    attachTo: {
      element: '[data-tourid="search_button"]',
      on: 'left',
    },
    advanceOn: {
      selector: '[data-tourid="search_button"]',
      event: 'click',
    },
    classes: 'action-step',
    canClickTarget: true,
  },
  {
    id: 'plantsLayerSecondPlantingSelect',
    title: `${t('guidedTour:mapEditor.plants_layer_title')} (9/17)`,
    text: actionText(
      t('guidedTour:mapEditor.plants_layer_second_planting_select_action'),
      t('guidedTour:mapEditor.plants_layer_second_planting_select_text'),
    ),
    attachTo: {
      element: '[data-tourid="bottom_right_toolbar"]',
      on: 'left-start',
    },
    floatingUIOptions: {
      middleware: [
        offset({
          mainAxis: 15,
          crossAxis: -10,
        }),
      ],
    },
    arrow: false,
    advanceOn: {
      selector: '[data-tourid="plant_list"]',
      event: 'click',
    },
    beforeShowPromise: function () {
      return new Promise(function (resolve) {
        setTimeout(() => resolve(null), 10);
      });
    },
    classes: 'action-step',
    canClickTarget: true,
  },
  {
    id: 'plantsLayerSecondPlantingPlace',
    title: `${t('guidedTour:mapEditor.plants_layer_title')} (10/17)`,
    text: actionText(t('guidedTour:mapEditor.plants_layer_second_planting_place')),
    attachTo: {
      element: '[data-tourid="canvas"]',
      on: 'top',
    },
    advanceOn: {
      selector: '[data-tourid="canvas"]',
      event: 'click',
    },
    classes: 'action-step',
    canClickTarget: true,
  },
  {
    id: 'plantsLayerRelations',
    title: `${t('guidedTour:mapEditor.plants_layer_title')} (11/17)`,
    text: t('guidedTour:mapEditor.plants_layer_relations'),
    buttons: standardButtons,
    attachTo: {
      element: '[data-tourid="canvas"]',
      on: 'top',
    },
  },
  {
    id: 'plantsLayerPlacementCancel',
    title: `${t('guidedTour:mapEditor.plants_layer_title')} (12/17)`,
    text: actionText(
      t('guidedTour:mapEditor.plants_layer_placement_cancel_action'),
      t('guidedTour:mapEditor.plants_layer_placement_cancel_text'),
    ),
    attachTo: {
      element: '[data-tourid="placement_cancel"]',
      on: 'top',
    },
    advanceOn: {
      selector: '[data-tourid="placement_cancel"]',
      event: 'click',
    },
    classes: 'action-step',
    canClickTarget: true,
  },
  {
    id: 'plantsLayerUndo',
    title: `${t('guidedTour:mapEditor.plants_layer_title')} (13/17)`,
    text: actionText(
      t('guidedTour:mapEditor.plants_layer_undo_action'),
      t('guidedTour:mapEditor.plants_layer_undo_text'),
    ),
    attachTo: {
      element: '[data-tourid="undo"]',
      on: 'top',
    },
    advanceOn: {
      selector: '[data-tourid="undo"]',
      event: 'click',
    },
    classes: 'action-step',
    canClickTarget: true,
  },
  {
    id: 'plantsLayerPlacedSelect',
    title: `${t('guidedTour:mapEditor.plants_layer_title')} (14/17)`,
    text: actionText(t('guidedTour:mapEditor.plants_layer_placed_select')),
    attachTo: {
      element: '[data-tourid="canvas"]',
      on: 'top',
    },
    advanceOn: {
      selector: '[data-tourid="canvas"]',
      event: 'selectPlant',
    },
    classes: 'action-step',
    canClickTarget: true,
  },
  {
    id: 'plantsLayerLeftToolbar',
    title: `${t('guidedTour:mapEditor.plants_layer_title')} (15/17)`,
    text: t('guidedTour:mapEditor.plants_layer_left_toolbar'),
    buttons: standardButtons,
    attachTo: {
      element: '[data-tourid="bottom_left_toolbar"]',
      on: 'right',
    },
  },
  {
    id: 'plantsLayerPlantingDelete',
    title: `${t('guidedTour:mapEditor.plants_layer_title')} (16/17)`,
    text: actionText(
      t('guidedTour:mapEditor.plants_layer_delete_action'),
      t('guidedTour:mapEditor.plants_layer_delete_text'),
    ),
    attachTo: {
      element: '[data-tourid="planting_delete"]',
      on: 'right',
    },
    advanceOn: {
      selector: '[data-tourid="bottom_left_toolbar"]',
      event: 'click',
    },
    classes: 'action-step',
    canClickTarget: true,
  },
  {
    id: 'plantLayerRevertDate',
    title: `${t('guidedTour:mapEditor.plants_layer_title')} (17/17)`,
    text: actionText(
      t('guidedTour:mapEditor.plants_layer_revert_date_action'),
      t('guidedTour:mapEditor.plants_layer_revert_date_text'),
    ),
    attachTo: {
      element: '[data-tourid="date_picker"]',
      on: 'top',
    },
    advanceOn: {
      selector: '[data-tourid="date_picker"]',
      event: 'change',
    },
    classes: 'action-step',
    canClickTarget: true,
  },
  {
    id: 'congratulations',
    title: t('guidedTour:mapEditor.congratulations_title'),
    text: t('guidedTour:mapEditor.congratulations_text'),
    buttons: [
      {
        text: t('guidedTour:finish'),
        type: 'next',
      },
    ],
  },
];

export const tourOptions: Tour.TourOptions = {
  defaultStepOptions: {
    cancelIcon: {
      enabled: true,
    },
    floatingUIOptions: arrowOptions,
    canClickTarget: false,
    highlightClass: 'highlighted',
  },
  useModalOverlay: true,
};
