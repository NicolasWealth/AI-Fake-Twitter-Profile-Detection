function getCount(scans, label) {
  return scans.filter((scan) => scan.label === label).length
}

function getPercent(count, total) {
  if (!total) {
    return 0
  }

  return Math.round((count / total) * 100)
}

export default function FakeVsRealChart({ scans }) {
  const fakeCount = getCount(scans, "fake")
  const realCount = getCount(scans, "real")
  const total = fakeCount + realCount

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
      <h2 style={{ marginTop: 0, fontSize: 20 }}>Label split</h2>
      <div
        style={{
          marginTop: 20,
          height: 18,
          borderRadius: 999,
          overflow: "hidden",
          background: "#e6ebf2",
          display: "flex"
        }}
      >
        <div
          style={{
            width: `${getPercent(fakeCount, total)}%`,
            background: "#b42318"
          }}
        />
        <div
          style={{
            width: `${getPercent(realCount, total)}%`,
            background: "#0f766e"
          }}
        />
      </div>
      <div
        style={{
          marginTop: 16,
          display: "grid",
          gap: 12
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Fake</span>
          <strong>{fakeCount}</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Real</span>
          <strong>{realCount}</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", color: "#4f5d75" }}>
          <span>Total labeled</span>
          <strong>{total}</strong>
        </div>
      </div>
    </section>
  )
}
