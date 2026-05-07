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

function toFiniteNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

function roundFeature(value) {
  return Number.isFinite(value) ? +value.toFixed(4) : 0
}

function buildMlPayload(rawProfile) {
  if (!rawProfile) return null

  const followers = toFiniteNumber(rawProfile.followers_count)
  const following = toFiniteNumber(rawProfile.following_count)
  const accountAgeDays = toFiniteNumber(rawProfile.account_age_days)
  const statuses = toFiniteNumber(rawProfile.statuses_count)
  const hasProfileImage = toFiniteNumber(rawProfile.has_profile_image)
  const verified = toFiniteNumber(rawProfile.verified)
  const bioLength = toFiniteNumber(rawProfile.bio_length)
  const usernameRandomnessScore = toFiniteNumber(rawProfile.username_randomness_score)
  const usernameLength = toFiniteNumber(rawProfile.username_length)

  const followerFollowingRatio =
    following > 0 ? roundFeature(followers / following) : followers
  const postsPerDay = roundFeature(statuses / (accountAgeDays + 1))
  const contentDensity = roundFeature(statuses / Math.max(accountAgeDays, 1))
  const tweetsPerDay = roundFeature(statuses / (accountAgeDays + 1))
  const engagementProxy = roundFeature(followers * tweetsPerDay)
  const followersLog = roundFeature(Math.log1p(followers))
  const followingLog = roundFeature(Math.log1p(following))
  const ratioLog = roundFeature(followersLog / (followingLog + 1))
  const activityScore = roundFeature(statuses / (accountAgeDays + 1))
  const growthSignal = roundFeature(followers / (accountAgeDays + 1))

  return {
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
