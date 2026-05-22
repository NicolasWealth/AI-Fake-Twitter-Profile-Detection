import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { cardStyle, theme } from "../lib/dashboardTheme.js"

const BUCKETS = [
  { label: "Low", min: 0, max: 50, color: theme.green },
  { label: "Medium", min: 50, max: 70, color: theme.amber },
  { label: "High", min: 70, max: 85, color: theme.orange },
  { label: "Critical", min: 85, max: 101, color: theme.red }
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
        ...cardStyle
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 20, color: theme.text }}>Risk buckets</h2>
        <span style={{ color: theme.muted, fontSize: 12 }}>Peak bucket: {peak}</span>
      </div>
      <div style={{ height: 220, marginTop: 18 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={counts}>
            <XAxis
              dataKey="label"
              tick={{ fill: theme.muted, fontSize: 12 }}
              axisLine={{ stroke: theme.grid }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: theme.muted, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: theme.backgroundAlt,
                border: `1px solid ${theme.borderStrong}`,
                borderRadius: 12,
                color: theme.text
              }}
            />
            <Bar dataKey="total" radius={[8, 8, 0, 0]}>
              {counts.map((bucket) => (
                <Cell key={bucket.label} fill={bucket.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
