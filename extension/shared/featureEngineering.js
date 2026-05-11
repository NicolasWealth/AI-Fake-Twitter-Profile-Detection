function clamp(value, min, max) {
  return Math.min(
    Math.max(value, min),
    max
  )
}

const ML_FEATURE_FIELDS = [
  "followers_count",
  "following_count",
  "follower_following_ratio",
  "account_age_days",
  "statuses_count",
  "posts_per_day",
  "content_density",
  "tweets_per_day",
  "engagement_proxy",
  "followers_log",
  "following_log",
  "ratio_log",
  "activity_score",
  "growth_signal",
  "has_profile_image",
  "verified",
  "bio_length",
  "username_randomness_score",
  "username_length"
]

const FEATURE_BOUNDS = {
  followers_count: [0, 1000000000],
  following_count: [0, 1000000],
  follower_following_ratio: [0, 1000],
  posts_per_day: [0, 500],
  content_density: [0, 500],
  tweets_per_day: [0, 500],
  engagement_proxy: [0, 100000000],
  activity_score: [0, 500],
  growth_signal: [0, 1000000]
}

function toFiniteNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

function roundFeature(value) {
  return Number.isFinite(value) ? +value.toFixed(4) : 0
}

function boundedFeature(value, field) {
  const [min, max] = FEATURE_BOUNDS[field]
  return clamp(value, min, max)
}

function buildMlPayload(rawProfile) {
  if (!rawProfile) return null

  const followers = boundedFeature(
    toFiniteNumber(rawProfile.followers_count),
    "followers_count"
  )
  const following = boundedFeature(
    toFiniteNumber(rawProfile.following_count),
    "following_count"
  )
  const accountAgeDays = Math.max(0, toFiniteNumber(rawProfile.account_age_days))
  const statuses = Math.max(0, toFiniteNumber(rawProfile.statuses_count))
  const hasProfileImage = clamp(toFiniteNumber(rawProfile.has_profile_image), 0, 1)
  const verified = clamp(toFiniteNumber(rawProfile.verified), 0, 1)
  const bioLength = Math.max(0, toFiniteNumber(rawProfile.bio_length))
  const usernameRandomnessScore = toFiniteNumber(rawProfile.username_randomness_score)
  const usernameLength = Math.max(0, toFiniteNumber(rawProfile.username_length))

  const followerFollowingRatio =
    roundFeature(
      boundedFeature(
        followers / (following + 1),
        "follower_following_ratio"
      )
    )
  const postsPerDay = roundFeature(
    boundedFeature(
      statuses / (accountAgeDays + 1),
      "posts_per_day"
    )
  )
  const contentDensity = roundFeature(
    boundedFeature(
      statuses / Math.max(accountAgeDays, 1),
      "content_density"
    )
  )
  const tweetsPerDay = roundFeature(
    boundedFeature(
      statuses / (accountAgeDays + 1),
      "tweets_per_day"
    )
  )
  const engagementProxy = roundFeature(
    boundedFeature(
      followers * tweetsPerDay,
      "engagement_proxy"
    )
  )
  const followersLog = roundFeature(Math.log1p(followers))
  const followingLog = roundFeature(Math.log1p(following))
  const ratioLog = roundFeature(followersLog / (followingLog + 1))
  const activityScore = roundFeature(
    boundedFeature(
      statuses / (accountAgeDays + 1),
      "activity_score"
    )
  )
  const growthSignal = roundFeature(
    boundedFeature(
      followers / (accountAgeDays + 1),
      "growth_signal"
    )
  )

  return {
    platform: "twitter",
    username: rawProfile.username || "",
    followers_count: followers,
    following_count: following,
    follower_following_ratio: followerFollowingRatio,
    account_age_days: accountAgeDays,
    statuses_count: statuses,
    posts_per_day: postsPerDay,
    content_density: contentDensity,
    tweets_per_day: tweetsPerDay,
    engagement_proxy: engagementProxy,
    followers_log: followersLog,
    following_log: followingLog,
    ratio_log: ratioLog,
    activity_score: activityScore,
    growth_signal: growthSignal,
    has_profile_image: hasProfileImage,
    verified,
    bio_length: bioLength,
    username_randomness_score: usernameRandomnessScore,
    username_length: usernameLength
  }
}

if (typeof globalThis !== "undefined") {
  globalThis.ML_FEATURE_FIELDS = ML_FEATURE_FIELDS
  globalThis.buildMlPayload = buildMlPayload
}
