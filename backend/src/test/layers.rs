//! Tests for [`crate::controller::layers`].

use crate::{
    error::ServiceError,
    model::{
        dto::{LayerDto, NewLayerDto},
        r#enum::{layer_type::LayerType, privacy_option::PrivacyOption},
    },
    test::util::{init_test_app, init_test_database},
};
use actix_web::{
    http::{
        header::{self, CONTENT_TYPE},
        StatusCode,
    },
    test,
};
use chrono::Utc;
use diesel::ExpressionMethods;
use diesel_async::{scoped_futures::ScopedFutureExt, AsyncPgConnection, RunQueryDsl};
use uuid::Uuid;

use super::util::dummy_map_polygons::tall_rectangle;

async fn initial_db_values(conn: &mut AsyncPgConnection) -> Result<(), ServiceError> {
    diesel::insert_into(crate::schema::maps::table)
        .values(vec![(
            &crate::schema::maps::id.eq(-1),
            &crate::schema::maps::name.eq("MyMap"),
            &crate::schema::maps::creation_date.eq(Utc::now().date_naive()),
            &crate::schema::maps::is_inactive.eq(false),
            &crate::schema::maps::zoom_factor.eq(0),
            &crate::schema::maps::honors.eq(0),
            &crate::schema::maps::visits.eq(0),
            &crate::schema::maps::harvested.eq(0),
            &crate::schema::maps::owner_id.eq(Uuid::default()),
            &crate::schema::maps::privacy.eq(PrivacyOption::Private),
            &crate::schema::maps::geometry.eq(tall_rectangle()),
        )])
        .execute(conn)
        .await?;
    diesel::insert_into(crate::schema::layers::table)
        .values(vec![
            (
                &crate::schema::layers::id.eq(-1),
                &crate::schema::layers::map_id.eq(-1),
                &crate::schema::layers::type_.eq(LayerType::Plants),
                &crate::schema::layers::name.eq("My Map"),
                &crate::schema::layers::is_alternative.eq(false),
            ),
            (
                &crate::schema::layers::id.eq(-2),
                &crate::schema::layers::map_id.eq(-1),
                &crate::schema::layers::type_.eq(LayerType::Plants),
                &crate::schema::layers::name.eq("MyMap2"),
                &crate::schema::layers::is_alternative.eq(true),
            ),
        ])
        .execute(conn)
        .await?;
    Ok(())
}

#[actix_rt::test]
async fn test_find_layers_succeeds() {
    let pool = init_test_database(|conn| initial_db_values(conn).scope_boxed()).await;
    let (token, app) = init_test_app(pool).await;

    let resp = test::TestRequest::get()
        .uri("/api/maps/-1/layers")
        .insert_header((header::AUTHORIZATION, token))
        .send_request(&app)
        .await;

    assert_eq!(resp.status(), StatusCode::OK);
    assert_eq!(
        resp.headers().get(CONTENT_TYPE).unwrap(),
        "application/json"
    );

    let results: Vec<LayerDto> = test::read_body_json(resp).await;
    assert_eq!(results.len(), 2);
}

#[actix_rt::test]
async fn test_find_layer_by_id_succeeds() {
    let pool = init_test_database(|conn| initial_db_values(conn).scope_boxed()).await;
    let (token, app) = init_test_app(pool).await;

    let resp = test::TestRequest::get()
        .uri("/api/maps/-1/layers/-1")
        .insert_header((header::AUTHORIZATION, token))
        .send_request(&app)
        .await;

    assert_eq!(resp.status(), StatusCode::OK);
    assert_eq!(
        resp.headers().get(CONTENT_TYPE).unwrap(),
        "application/json"
    );

    let result = test::read_body(resp).await;
    let result_string = std::str::from_utf8(&result).unwrap();

    let dto: LayerDto = serde_json::from_str(result_string).unwrap();
    assert_eq!(dto.id, -1);
}

#[actix_rt::test]
async fn test_create_layer_succeeds() {
    let pool = init_test_database(|conn| initial_db_values(conn).scope_boxed()).await;
    let (token, app) = init_test_app(pool.clone()).await;

    let resp = test::TestRequest::post()
        .uri("/api/maps/-1/layers")
        .insert_header((header::AUTHORIZATION, token))
        .set_json(NewLayerDto {
            map_id: -1,
            type_: LayerType::Base,
            name: "MyBaseLayer".to_string(),
            is_alternative: false,
        })
        .send_request(&app)
        .await;

    assert_eq!(resp.status(), StatusCode::CREATED);
}

#[actix_rt::test]
async fn test_create_layer_with_invalid_map_id_fails() {
    let pool = init_test_database(|conn| initial_db_values(conn).scope_boxed()).await;
    let (token, app) = init_test_app(pool.clone()).await;

    let resp = test::TestRequest::post()
        .uri("/api/maps/-2/layers")
        .insert_header((header::AUTHORIZATION, token))
        .set_json(NewLayerDto {
            map_id: -2,
            type_: LayerType::Base,
            name: "MyBaseLayer2".to_string(),
            is_alternative: false,
        })
        .send_request(&app)
        .await;

    assert_eq!(resp.status(), StatusCode::INTERNAL_SERVER_ERROR);
}

#[actix_rt::test]
async fn test_delete_by_id_succeeds() {
    let pool = init_test_database(|conn| initial_db_values(conn).scope_boxed()).await;
    let (token, app) = init_test_app(pool).await;

    let resp = test::TestRequest::delete()
        .uri("/api/maps/-1/layers/-1")
        .insert_header((header::AUTHORIZATION, token))
        .send_request(&app)
        .await;

    assert_eq!(resp.status(), StatusCode::OK);
}
