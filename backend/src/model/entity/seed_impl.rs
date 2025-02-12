//! Contains the implementation of [`Seed`].

use diesel::pg::Pg;
use diesel::{
    debug_query, BoolExpressionMethods, ExpressionMethods, PgTextExpressionMethods, QueryDsl,
    QueryResult,
};
use diesel_async::{AsyncPgConnection, RunQueryDsl};
use log::debug;
use uuid::Uuid;

use crate::db::pagination::Paginate;
use crate::model::dto::{Page, PageParameters, SeedSearchParameters};
use crate::{
    model::dto::{NewSeedDto, SeedDto},
    schema::seeds::{self, all_columns, harvest_year, name, owner_id},
};

use super::{NewSeed, Seed};

impl Seed {
    /// Get a page of seeds.
    ///
    /// # Errors
    /// * Unknown, diesel doesn't say why it might error.
    pub async fn find(
        search_parameters: SeedSearchParameters,
        user_id: Uuid,
        page_parameters: PageParameters,
        conn: &mut AsyncPgConnection,
    ) -> QueryResult<Page<SeedDto>> {
        let mut query = seeds::table.select(all_columns).into_boxed();

        if let Some(name_search) = search_parameters.name {
            query = query.filter(name.ilike(format!("%{name_search}%")));
        }
        if let Some(harvest_year_search) = search_parameters.harvest_year {
            query = query.filter(harvest_year.eq(harvest_year_search));
        }

        // Only return seeds that belong to the user.
        query = query.filter(owner_id.eq(user_id));

        let query = query
            .paginate(page_parameters.page)
            .per_page(page_parameters.per_page);
        debug!("{}", debug_query::<Pg, _>(&query));
        query.load_page::<Self>(conn).await.map(Page::from_entity)
    }

    /// Fetch seed by id from the database.
    ///
    /// # Errors
    /// * Unknown, diesel doesn't say why it might error.
    pub async fn find_by_id(
        id: i32,
        user_id: Uuid,
        conn: &mut AsyncPgConnection,
    ) -> QueryResult<SeedDto> {
        let mut query = seeds::table.select(all_columns).into_boxed();

        // Only return seeds that belong to the user.
        query = query.filter(owner_id.eq(user_id).and(seeds::id.eq(id)));

        debug!("{}", debug_query::<Pg, _>(&query));
        query.first::<Self>(conn).await.map(Into::into)
    }

    /// Create a new seed in the database.
    ///
    /// # Errors
    /// * Unknown, diesel doesn't say why it might error.
    pub async fn create(
        new_seed: NewSeedDto,
        user_id: Uuid,
        conn: &mut AsyncPgConnection,
    ) -> QueryResult<SeedDto> {
        let new_seed = NewSeed::from((new_seed, user_id));
        let query = diesel::insert_into(seeds::table).values(&new_seed);
        debug!("{}", debug_query::<Pg, _>(&query));
        query.get_result::<Self>(conn).await.map(Into::into)
    }

    /// Delete the seed from the database.
    ///
    /// # Errors
    /// * Unknown, diesel doesn't say why it might error.
    pub async fn delete_by_id(
        id: i32,
        user_id: Uuid,
        conn: &mut AsyncPgConnection,
    ) -> QueryResult<usize> {
        // Only delete seeds that belong to the user.
        let source = seeds::table.filter(owner_id.eq(user_id).and(seeds::id.eq(id)));

        let query = diesel::delete(source);
        debug!("{}", debug_query::<Pg, _>(&query));
        query.execute(conn).await
    }
}
