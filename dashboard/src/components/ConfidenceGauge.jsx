function getProbability(scan) {
  return Math.round((Number(scan?.fake_probability) || 0) * 100)
}

function getRiskTone(probability) {
  if (probability >= 85) {
    return { label: "Critical", color: "#8b1e1e" }
  }

  if (probability >= 70) {
    return { label: "High", color: "#b42318" }
  }

  if (probability >= 50) {
    return { label: "Medium", color: "#f59e0b" }
  }

  return { label: "Low", color: "#0f766e" }
}

export default function ConfidenceGauge({ scan }) {
  const probability = getProbability(scan)
  const tone = getRiskTone(probability)
  const fill = Math.min(Math.max(probability, 0), 100)

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
      <h2 style={{ marginTop: 0, fontSize: 20 }}>Current confidence</h2>
      <div
        style={{
          marginTop: 20,
          padding: 24,
          borderRadius: 18,
          background: `linear-gradient(90deg, ${tone.color} ${fill}%, #e6ebf2 ${fill}%)`
        }}
      >
        <div style={{ fontSize: 40, fontWeight: 700, color: "#ffffff" }}>
          {scan ? `${probability}%` : "--"}
        </div>
        <div style={{ color: "#ffffff", opacity: 0.92 }}>
          {scan ? `${tone.label} risk for @${scan.username || "unknown"}` : "Select a scan"}
        </div>
      </div>
      <p style={{ marginBottom: 0, color: "#4f5d75" }}>
        Uses the saved fake probability from the latest selected scan.
      </p>
    </section>
  )
}
