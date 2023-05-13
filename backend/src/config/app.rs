//! Configuration of the server.

use std::env;

use dotenvy::dotenv;

/// Configuration data for the server.
pub struct Config {
    /// The address and port the server should be started on.
    pub bind_address: (String, u16),
    /// The location of the database as a URL.
    pub database_url: String,
    /// The location of the server that issues tokens.
    ///
    /// Other relevant URLs such as the `jwks_uri` or the `token_endpoint`.
    #[cfg(feature = "auth")]
    pub oauth2_issuer_uri: String,
}

impl Config {
    /// Load the configuration using environment variables.
    ///
    /// # Errors
    /// * If the .env file is present, but there was an error loading it.
    /// * If an environment variable is missing.
    /// * If a variable could not be parsed correctly.
    pub fn from_env() -> Result<Self, Box<dyn std::error::Error>> {
        load_env_file()?;

        let host = env::var("BIND_ADDRESS_HOST")
            .map_err(|_| "Failed to get BIND_ADDRESS_HOST from environment.")?;
        let port = env::var("BIND_ADDRESS_PORT")
            .map_err(|_| "Failed to get BIND_ADDRESS_PORT from environment.")?
            .parse::<u16>()
            .map_err(|e| e.to_string())?;

        let database_url =
            env::var("DATABASE_URL").map_err(|_| "Failed to get DATABASE_URL from environment.")?;
        #[cfg(feature = "auth")]
        let oauth2_issuer_uri = env::var("OAUTH2_ISSUER_URI")
            .map_err(|_| "Failed to get OAUTH2_ISSUER_URI from environment.")?;

        Ok(Self {
            bind_address: (host, port),
            database_url,
            #[cfg(feature = "auth")]
            oauth2_issuer_uri,
        })
    }
}

/// Load the .env file. A missing file does not result in an error.
///
/// # Errors
/// * If the .env file is present, but there was an error loading it.
fn load_env_file() -> Result<(), Box<dyn std::error::Error>> {
    match dotenv() {
        Err(e) if e.not_found() => Ok(()), // missing .env is ok
        Err(e) => Err(e.into()),           // any other errors are a problem
        _ => Ok(()),
    }
}
