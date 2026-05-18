function getRowKey(scan) {
  return scan?.id ?? `${scan?.username ?? "unknown"}-${scan?.created_at ?? "pending"}`
}

function formatDate(value) {
  if (!value) {
    return "Pending"
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return "Pending"
  }

  return date.toLocaleString()
}

export default function RecentScansTable({ scans, selectedScanKey, onSelect }) {
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
      <h2 style={{ marginTop: 0, fontSize: 20 }}>Recent scans</h2>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", color: "#4f5d75" }}>
              <th style={{ paddingBottom: 12 }}>User</th>
              <th style={{ paddingBottom: 12 }}>Label</th>
              <th style={{ paddingBottom: 12 }}>Risk</th>
              <th style={{ paddingBottom: 12 }}>Created</th>
            </tr>
          </thead>
          <tbody>
            {scans.map((scan) => {
              const rowKey = getRowKey(scan)
              const isSelected = rowKey === selectedScanKey

              return (
                <tr
                  key={rowKey}
                  onClick={() => onSelect(rowKey)}
                  style={{
                    cursor: "pointer",
                    background: isSelected ? "#eef4ff" : "transparent"
                  }}
                >
                  <td style={{ padding: "12px 0" }}>@{scan.username || "unknown"}</td>
                  <td style={{ padding: "12px 0", textTransform: "capitalize" }}>
                    {scan.label || "unknown"}
                  </td>
                  <td style={{ padding: "12px 0" }}>
                    {Math.round((Number(scan.fake_probability) || 0) * 100)}%
                  </td>
                  <td style={{ padding: "12px 0" }}>{formatDate(scan.created_at)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
