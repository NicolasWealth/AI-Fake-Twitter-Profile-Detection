/**
 * Raw extractor contract
 * {
 *   username: string,
 *   followers_count: number,
 *   following_count: number,
 *   account_age_days: number,
 *   statuses_count: number,
 *   has_profile_image: number,
 *   verified: number,
 *   bio_length: number,
 *   username_randomness_score: number,
 *   username_length: number
 * }
 *
 * ML payload is built from raw metrics by `shared/featureEngineering.js`.
 */
