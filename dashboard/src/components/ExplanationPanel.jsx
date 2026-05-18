function getReasonList(scan) {
  if (!scan) {
    return []
  }

  if (Array.isArray(scan.explanation) && scan.explanation.length > 0) {
    return scan.explanation
  }

  const reasons = []
  const probability = Number(scan.fake_probability) || 0

  if ((Number(scan.username_randomness_score) || 0) > 0.4) {
    reasons.push("Username randomness detected")
  }

  if (Number(scan.has_profile_image) === 0) {
    reasons.push("Missing profile image")
  }

  if ((Number(scan.bio_length) || 0) < 10) {
    reasons.push("Very short biography")
  }

  if ((Number(scan.content_density) || 0) > 50) {
    reasons.push("Abnormal posting activity")
  }

  if ((Number(scan.follower_following_ratio) || 0) > 100) {
    reasons.push("Highly lopsided follower ratio")
  }

  if ((Number(scan.growth_signal) || 0) < 0.5 && (Number(scan.account_age_days) || 0) > 180) {
    reasons.push("Weak follower growth for account age")
  }

  if (reasons.length === 0) {
    reasons.push(
      probability >= 0.5
        ? "Several account signals differ from typical real profiles"
        : "Risk score is driven by a low suspiciousness profile."
    )
  }

  return reasons
}

export default function ExplanationPanel({ scan }) {
  const reasons = getReasonList(scan)

  return (
    <section
      style={{
        background: "#ffffff",
        border: "1px solid #d7deea",
        borderRadius: 20,
        padding: 20,
        boxShadow: "0 12px 30px rgba(20, 33, 61, 0.08)"
      }}
    >
      <h2 style={{ marginTop: 0, fontSize: 20 }}>Selected scan</h2>
      {!scan && <p style={{ color: "#4f5d75", marginBottom: 0 }}>No scan selected.</p>}
      {scan && (
        <>
          <div
            style={{
              padding: 16,
              borderRadius: 16,
              background: "#f7f9fc",
              marginBottom: 16
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 700 }}>@{scan.username || "unknown"}</div>
            <div style={{ color: "#4f5d75", marginTop: 4 }}>
              {scan.platform || "twitter"} • {scan.label || "unknown"} •{" "}
              {Math.round((Number(scan.fake_probability) || 0) * 100)}% suspicious
            </div>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {reasons.map((reason) => (
              <div
                key={reason}
                style={{
                  borderLeft: "4px solid #f59e0b",
                  padding: "10px 12px",
                  background: "#fffaf0",
                  borderRadius: 8
                }}
              >
                {reason}
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
