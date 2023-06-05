//! `Planting` endpoints.

// As this is just an api draft at this stage there are several clippy errors that
// need to be ignored for the CI to accept this.
// FIXME:
//  Remove these clippy allows when these endpoints are full implemented.

use std::sync::RwLock;

use actix_web::{
    delete, error, get, patch, post,
    web::{Data, Json, Path, Query},
    HttpResponse, Result,
};

use crate::config::auth::user_info::UserInfo;
use crate::config::data::AppDataInner;
use crate::model::dto::actions::{
    CreatePlantActionDto, DeletePlantActionDto, MovePlantActionDto, TransformPlantActionDto,
};
use crate::model::dto::{
    NewPlantingDto, PlantLayerObjectDto, PlantingSearchParameters, UpdatePlantingDto,
};

/// FIXME: REMOVE THIS HACK ❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗
static PLANTINGS: RwLock<Vec<PlantLayerObjectDto>> = RwLock::new(vec![]);

/// FIXME: REMOVE
#[allow(clippy::expect_used)]
fn find_planting_by_id(id: &str) -> Option<PlantLayerObjectDto> {
    PLANTINGS
        .read()
        .expect("acquiring read lock failed")
        .iter()
        .find(|planting| planting.id == id)
        .cloned()
}

/// FIXME: REMOVE
#[allow(clippy::expect_used)]
fn replace_planting(planting: PlantLayerObjectDto) {
    let mut plantings = PLANTINGS.write().expect("acquiring write lock failed");
    if let Some(p) = plantings.iter_mut().find(|p| p.id == planting.id) {
        *p = planting;
    }
}

/// Endpoint for listing and filtering `Planting`.
/// If no page parameters are provided, the first page is returned.
///
/// # Errors
/// * If the connection to the database could not be established.
#[allow(unused_variables)]
#[allow(clippy::unused_async)]
#[allow(clippy::expect_used)]
#[utoipa::path(
    context_path = "/api/plantings",
    params(
        PlantingSearchParameters,
    ),
    responses(
        (status = 200, description = "Find plantings", body = Vec<PlantLayerObjectDto>)
    ),
    security(
        ("oauth2" = [])
    )
)]
#[get("")]
pub async fn find(
    search_query: Query<PlantingSearchParameters>,
    app_data: Data<AppDataInner>,
) -> Result<HttpResponse> {
    let plantings = PLANTINGS
        .read()
        .expect("acquiring read lock failed")
        .clone();

    Ok(HttpResponse::Ok().json(plantings))
}

/// Endpoint for creating a new `Planting`.
///
/// # Errors
/// * If the connection to the database could not be established.
#[allow(unused_variables)]
#[allow(clippy::unused_async)]
#[allow(clippy::expect_used)]
#[utoipa::path(
    context_path = "/api/plantings",
    request_body = NewPlantingDto,
    responses(
        (status = 201, description = "Create a planting", body = PlantLayerObjectDto)
    ),
    security(
        ("oauth2" = [])
    )
)]
#[post("")]
pub async fn create(
    new_plant_json: Json<NewPlantingDto>,
    app_data: Data<AppDataInner>,
    user_info: UserInfo,
) -> Result<HttpResponse> {
    // TODO: implement service that validates (permission, integrity) and creates the record.
    {
        PLANTINGS
            .write()
            .expect("acquiring write lock failed")
            .push(PlantLayerObjectDto {
                id: new_plant_json.id.clone(),
                plant_id: new_plant_json.plant_id,
                x: new_plant_json.x,
                y: new_plant_json.y,
                height: new_plant_json.height,
                width: new_plant_json.width,
                rotation: new_plant_json.rotation,
                scale_x: new_plant_json.scale_x,
                scale_y: new_plant_json.scale_y,
            });
    }

    if let Some(dto) = find_planting_by_id(&new_plant_json.id) {
        let notified = app_data
            .broadcaster
            .broadcast(
                new_plant_json.map_id,
                &CreatePlantActionDto::new(dto.clone(), user_info.id.to_string()),
            )
            .await;

        if notified.is_ok() {
            return Ok(HttpResponse::Created().json(dto));
        }
    }

    Err(error::ErrorInternalServerError("Could not create planting"))
}

/// Endpoint for updating a `Planting`.
///
/// # Errors
/// * If the connection to the database could not be established.
#[allow(unused_variables)]
#[allow(clippy::unused_async)]
#[allow(clippy::expect_used)]
#[utoipa::path(
    context_path = "/api/plantings",
    request_body = UpdatePlantingDto,
    responses(
        (status = 200, description = "Update a planting", body = PlantLayerObjectDto)
    ),
    security(
        ("oauth2" = [])
    )
)]
#[patch("/{id}")]
pub async fn update(
    id: Path<String>,
    new_plant_json: Json<UpdatePlantingDto>,
    app_data: Data<AppDataInner>,
    user_info: UserInfo,
) -> Result<HttpResponse> {
    // TODO: implement service that validates (permission, integrity) and updates the record.
    let mut planting =
        find_planting_by_id(&id).ok_or_else(|| error::ErrorNotFound("Planting not found"))?;

    match *new_plant_json {
        UpdatePlantingDto {
            x: Some(x),
            y: Some(y),
            rotation: Some(rotation),
            scale_x: Some(scale_x),
            scale_y: Some(scale_y),
            ..
        } => {
            planting.x = x;
            planting.y = y;
            planting.rotation = rotation;
            planting.scale_x = scale_x;
            planting.scale_y = scale_y;
            replace_planting(planting.clone());

            let notified = app_data
                .broadcaster
                .broadcast(
                    new_plant_json.map_id,
                    &TransformPlantActionDto::new(planting.clone(), user_info.id.to_string()),
                )
                .await;

            if notified.is_ok() {
                return Ok(HttpResponse::Ok().json(planting));
            }
        }
        UpdatePlantingDto {
            x: Some(x),
            y: Some(y),
            ..
        } => {
            planting.x = x;
            planting.y = y;
            replace_planting(planting.clone());

            let notified = app_data
                .broadcaster
                .broadcast(
                    new_plant_json.map_id,
                    &MovePlantActionDto::new(planting.clone(), user_info.id.to_string()),
                )
                .await;

            if notified.is_ok() {
                return Ok(HttpResponse::Ok().json(planting));
            }
        }
        _ => {}
    }

    Err(error::ErrorBadRequest(
        "Invalid arguments passed for update planting",
    ))
}

/// Endpoint for deleting a `Planting`.
///
/// # Errors
/// * If the connection to the database could not be established.
#[allow(unused_variables)]
#[allow(clippy::unused_async)]
#[allow(clippy::expect_used)]
#[utoipa::path(
    context_path = "/api/plantings",
    responses(
        (status = 200, description = "Delete a planting", body = String)
    ),
    security(
        ("oauth2" = [])
    )
)]
#[delete("/{id}")]
pub async fn delete(
    path: Path<String>,
    app_data: Data<AppDataInner>,
    user_info: UserInfo,
) -> Result<HttpResponse> {
    // TODO: implement a service that validates (permissions) and deletes the planting
    {
        let mut plantings = PLANTINGS.write().expect("acquiring write lock failed");
        plantings.retain(|planting| planting.id != *path);
    }

    let notified = app_data
        .broadcaster
        .broadcast(
            // TODO: get map_id from request or from path?
            1,
            &DeletePlantActionDto::new(path.to_string(), user_info.id.to_string()),
        )
        .await;

    match notified {
        Ok(_) => Ok(HttpResponse::Ok().finish()),
        Err(_) => Err(error::ErrorNotFound("Planting not found")),
    }
}
