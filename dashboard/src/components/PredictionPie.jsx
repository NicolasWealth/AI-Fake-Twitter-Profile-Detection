export default function PredictionPie({ scans }) {
  const fakeCount = scans.filter((scan) => scan.label === "fake").length
  const realCount = scans.filter((scan) => scan.label === "real").length
  const total = Math.max(fakeCount + realCount, 1)
  const fakeAngle = Math.round((fakeCount / total) * 360)

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
      <h2 style={{ marginTop: 0, fontSize: 20 }}>Prediction share</h2>
      <div
        style={{
          width: 180,
          height: 180,
          margin: "20px auto",
          borderRadius: "50%",
          background: `conic-gradient(#b42318 0deg ${fakeAngle}deg, #0f766e ${fakeAngle}deg 360deg)`,
          display: "grid",
          placeItems: "center"
        }}
      >
        <div
          style={{
            width: 110,
            height: 110,
            borderRadius: "50%",
            background: "#ffffff",
            display: "grid",
            placeItems: "center",
            textAlign: "center"
          }}
        >
          <strong>{scans.length}</strong>
          <span style={{ color: "#4f5d75", fontSize: 12 }}>total scans</span>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
        <span>Fake: {fakeCount}</span>
        <span>Real: {realCount}</span>
      </div>
    </section>
  )
}
