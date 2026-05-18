export default function StatCard({ label, value, accent, subtext }) {
  return (
    <section
      style={{
        background: "#ffffff",
        border: `1px solid ${accent}22`,
        borderRadius: 18,
        padding: 18,
        boxShadow: "0 12px 30px rgba(20, 33, 61, 0.08)"
      }}
    >
      <div style={{ color: "#4f5d75", fontSize: 14 }}>{label}</div>
      <div style={{ marginTop: 10, fontSize: 32, fontWeight: 700, color: accent }}>
        {value}
      </div>
      <div style={{ marginTop: 6, color: "#6b7280", fontSize: 13 }}>{subtext}</div>
    </section>
  )
}
