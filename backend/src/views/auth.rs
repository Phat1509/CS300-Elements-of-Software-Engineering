use serde::{Deserialize, Serialize};

use crate::models::_entities::users;

#[derive(Debug, Deserialize, Serialize, utoipa::ToSchema)]
pub struct LoginResponse {
    pub token: String,
    pub pid: String,
    pub name: String,
    pub is_verified: bool,
    pub is_staff: bool,
}

impl LoginResponse {
    #[must_use]
    pub fn new(user: &users::Model, token: &String) -> Self {
        Self {
            token: token.to_string(),
            pid: user.pid.to_string(),
            name: user.name.clone(),
            is_verified: user.email_verified_at.is_some(),
            is_staff: user.is_staff,
        }
    }
}

#[derive(Debug, Deserialize, Serialize, utoipa::ToSchema)]
pub struct CurrentResponse {
    pub pid: String,
    pub name: String,
    pub email: String,
    pub is_staff: bool,
}

impl CurrentResponse {
    #[must_use]
    pub fn new(user: &users::Model) -> Self {
        Self {
            pid: user.pid.to_string(),
            name: user.name.clone(),
            email: user.email.clone(),
            is_staff: user.is_staff,
        }
    }
}
