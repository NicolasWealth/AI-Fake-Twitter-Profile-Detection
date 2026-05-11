function generateExplanation(payload, result) {

    const reasons = []

    if (payload.follower_following_ratio >= 1000) {
        reasons.push(
            "Extremely high follower ratio"
        )
    }

    if (payload.username_randomness_score > 0.4) {
        reasons.push(
            "Username randomness detected"
        )
    }

    if (payload.has_profile_image === 0) {
        reasons.push(
            "Missing profile image"
        )
    }

    if (payload.bio_length < 10) {
        reasons.push(
            "Very short biography"
        )
    }

    if (payload.content_density > 50) {
        reasons.push(
            "Abnormal posting activity"
        )
    }

    if (payload.tweets_per_day > 50 ||
        payload.activity_score > 50) {
        reasons.push(
            "Very high daily posting volume"
        )
    }

    if (payload.growth_signal < 0.5 &&
        payload.account_age_days > 180) {
        reasons.push(
            "Weak follower growth for account age"
        )
    }

    if (payload.engagement_proxy > 1000000 &&
        payload.verified === 0) {
        reasons.push(
            "Large reach proxy without verification"
        )
    }

    if (payload.ratio_log > 2.5 &&
        payload.following_count < 20) {
        reasons.push(
            "Highly lopsided follower pattern"
        )
    }

    if (payload.verified === 0 &&
        payload.followers_count > 1000000) {
        reasons.push(
            "Large audience without verification"
        )
    }

    if (reasons.length === 0 &&
        (result.fake_probability || 0) >= 0.5) {
        reasons.push(
            "Several account signals differ from typical real profiles"
        )
    }

    return {
        confidence:
            Math.round(
                (result.fake_probability || 0) * 100
            ),

        reasons
    }
}
