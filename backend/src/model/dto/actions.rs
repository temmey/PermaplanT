//! Contains all the actions that can be broadcasted via [`crate::sse::broadcaster::Broadcaster`].

// The properties of the actions are not documented because they are
// self-explanatory and should be already documented in the respective
// entity DTOs.
#![allow(clippy::missing_docs_in_private_items)]
// Don't make the `new` functions const, there might come more fields in the future.
#![allow(clippy::missing_const_for_fn)]

use crate::model::dto::plantings::PlantingDto;
use serde::Serialize;
use typeshare::typeshare;
use uuid::Uuid;

use super::BaseLayerImageDto;

#[typeshare]
#[derive(Debug, Serialize, Clone)]
// Use the name of the enum variant as the type field looking like { "type": "CreatePlanting", ... }.
/// An enum representing all the actions that can be broadcasted via [`crate::sse::broadcaster::Broadcaster`].
#[serde(tag = "type", content = "payload")]
pub enum Action {
    /// An action used to broadcast creation of a plant.
    CreatePlanting(CreatePlantActionPayload),
    /// An action used to broadcast deletion of a plant.
    DeletePlanting(DeletePlantActionPayload),
    /// An action used to broadcast movement of a plant.
    MovePlanting(MovePlantActionPayload),
    /// An action used to broadcast transformation of a plant.
    TransformPlanting(TransformPlantActionPayload),
    /// An action used to broadcast creation of a baseLayerImage.
    CreateBaseLayerImage(CreateBaseLayerImageActionPayload),
    /// An action used to broadcast update of a baseLayerImage.
    UpdateBaseLayerImage(UpdateBaseLayerImageActionPayload),
    /// An action used to broadcast deletion of a baseLayerImage.
    DeleteBaseLayerImage(DeleteBaseLayerImageActionPayload),
}

#[typeshare]
#[derive(Debug, Serialize, Clone)]
/// The payload of the [`Action::CreatePlanting`].
/// This struct should always match [`PlantingDto`].
#[serde(rename_all = "camelCase")]
pub struct CreatePlantActionPayload {
    user_id: Uuid,
    id: Uuid,
    layer_id: i32,
    plant_id: i32,
    x: i32,
    y: i32,
    width: i32,
    height: i32,
    rotation: f32,
    scale_x: f32,
    scale_y: f32,
}

impl CreatePlantActionPayload {
    #[must_use]
    pub fn new(payload: PlantingDto, user_id: Uuid) -> Self {
        Self {
            user_id,
            id: payload.id,
            layer_id: payload.layer_id,
            plant_id: payload.plant_id,
            x: payload.x,
            y: payload.y,
            width: payload.width,
            height: payload.height,
            rotation: payload.rotation,
            scale_x: payload.scale_x,
            scale_y: payload.scale_y,
        }
    }
}

#[typeshare]
#[derive(Debug, Serialize, Clone)]
/// The payload of the [`Action::DeletePlanting`].
#[serde(rename_all = "camelCase")]
pub struct DeletePlantActionPayload {
    user_id: Uuid,
    id: Uuid,
}

impl DeletePlantActionPayload {
    #[must_use]
    pub fn new(id: Uuid, user_id: Uuid) -> Self {
        Self { user_id, id }
    }
}

#[typeshare]
#[derive(Debug, Serialize, Clone)]
/// The payload of the [`Action::MovePlanting`].
#[serde(rename_all = "camelCase")]
pub struct MovePlantActionPayload {
    user_id: Uuid,
    id: Uuid,
    x: i32,
    y: i32,
}

impl MovePlantActionPayload {
    #[must_use]
    pub fn new(payload: PlantingDto, user_id: Uuid) -> Self {
        Self {
            user_id,
            id: payload.id,
            x: payload.x,
            y: payload.y,
        }
    }
}

#[typeshare]
#[derive(Debug, Serialize, Clone)]
/// The payload of the [`Action::TransformPlanting`].
#[serde(rename_all = "camelCase")]
pub struct TransformPlantActionPayload {
    user_id: Uuid,
    id: Uuid,
    x: i32,
    y: i32,
    rotation: f32,
    scale_x: f32,
    scale_y: f32,
}

impl TransformPlantActionPayload {
    #[must_use]
    pub fn new(payload: PlantingDto, user_id: Uuid) -> Self {
        Self {
            user_id,
            id: payload.id,
            x: payload.x,
            y: payload.y,
            rotation: payload.rotation,
            scale_x: payload.scale_x,
            scale_y: payload.scale_y,
        }
    }
}

#[typeshare]
#[derive(Debug, Serialize, Clone)]
/// The payload of the [`Action::CreateBaseLayerImage`].
/// This struct should always match [`BaseLayerImageDto`].
#[serde(rename_all = "camelCase")]
pub struct CreateBaseLayerImageActionPayload {
    user_id: Uuid,
    id: Uuid,
    layer_id: i32,
    rotation: f32,
    scale: f32,
    path: String,
}

impl CreateBaseLayerImageActionPayload {
    #[must_use]
    pub fn new(payload: BaseLayerImageDto, user_id: Uuid) -> Self {
        Self {
            user_id,
            id: payload.id,
            layer_id: payload.layer_id,
            rotation: payload.rotation,
            scale: payload.scale,
            path: payload.path,
        }
    }
}

#[typeshare]
#[derive(Debug, Serialize, Clone)]
/// The payload of the [`Action::DeleteBaseLayerImage`].
#[serde(rename_all = "camelCase")]
pub struct DeleteBaseLayerImageActionPayload {
    user_id: Uuid,
    id: Uuid,
}

impl DeleteBaseLayerImageActionPayload {
    #[must_use]
    pub fn new(id: Uuid, user_id: Uuid) -> Self {
        Self { user_id, id }
    }
}

#[typeshare]
#[derive(Debug, Serialize, Clone)]
/// The payload of the [`Action::UpdateBaseLayerImage`].
#[serde(rename_all = "camelCase")]
pub struct UpdateBaseLayerImageActionPayload {
    user_id: Uuid,
    id: Uuid,
    layer_id: i32,
    rotation: f32,
    scale: f32,
    path: String,
}

impl UpdateBaseLayerImageActionPayload {
    #[must_use]
    pub fn new(payload: BaseLayerImageDto, user_id: Uuid) -> Self {
        Self {
            user_id,
            id: payload.id,
            layer_id: payload.layer_id,
            rotation: payload.rotation,
            scale: payload.scale,
            path: payload.path,
        }
    }
}
