use actix_web::web::Data;

use crate::{
    config::db::Pool,
    error::ServiceError,
    models::{
        dto::{new_seed_dto::NewSeedDTO, seed_dto::SeedDTO},
        seed::Seed,
    },
};

pub fn find_all(pool: &Data<Pool>) -> Result<Vec<SeedDTO>, ServiceError> {
    let mut conn = pool.get()?;
    let result = Seed::find_all(&mut conn)?;
    Ok(result)
}

pub fn create(new_seed: NewSeedDTO, pool: &Data<Pool>) -> Result<SeedDTO, ServiceError> {
    let mut conn = pool.get()?;
    let result = Seed::create(new_seed, &mut conn)?;
    Ok(result)
}

pub fn delete_by_id(id: i32, pool: &Data<Pool>) -> Result<(), ServiceError> {
    let mut conn = pool.get()?;
    let _ = Seed::delete_by_id(id, &mut conn)?;
    Ok(())
}