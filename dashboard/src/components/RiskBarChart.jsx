const BUCKETS = [
  { label: "Low", min: 0, max: 50, color: "#0f766e" },
  { label: "Medium", min: 50, max: 70, color: "#f59e0b" },
  { label: "High", min: 70, max: 85, color: "#f97316" },
  { label: "Critical", min: 85, max: 101, color: "#b42318" }
]

export default function RiskBarChart({ scans }) {
  const counts = BUCKETS.map((bucket) => {
    const total = scans.filter((scan) => {
      const probability = (Number(scan.fake_probability) || 0) * 100
      return probability >= bucket.min && probability < bucket.max
    }).length

    return {
      ...bucket,
      total
    }
  })

  const peak = Math.max(...counts.map((bucket) => bucket.total), 1)

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
      <h2 style={{ marginTop: 0, fontSize: 20 }}>Risk buckets</h2>
      <div style={{ display: "grid", gap: 14, marginTop: 18 }}>
        {counts.map((bucket) => (
          <div key={bucket.label} style={{ display: "grid", gap: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{bucket.label}</span>
              <strong>{bucket.total}</strong>
            </div>
            <div
              style={{
                height: 12,
                borderRadius: 999,
                overflow: "hidden",
                background: "#e6ebf2"
              }}
            >
              <div
                style={{
                  width: `${(bucket.total / peak) * 100}%`,
                  height: "100%",
                  background: bucket.color
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
