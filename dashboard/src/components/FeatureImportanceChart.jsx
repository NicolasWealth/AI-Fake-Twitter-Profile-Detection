import { motion } from "framer-motion"
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { cardStyle, theme } from "../lib/dashboardTheme.js"

function toChartData(importance) {
  return Object.entries(importance || {})
    .map(([feature, value]) => ({
      feature,
      value: Number(value) || 0
    }))
    .sort((left, right) => right.value - left.value)
    .slice(0, 10)
}

export default function FeatureImportanceChart({ importance, loading, error }) {
  const data = toChartData(importance)

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.08 }}
      style={{
        ...cardStyle,
        display: "grid",
        gap: 18
      }}
    >
      <div>
        <h2 style={{ margin: 0, fontSize: 22, color: theme.text }}>Feature importance</h2>
        <p style={{ marginTop: 8, color: theme.muted }}>
          Top ranked signals driving the current classifier, sorted descending.
        </p>
      </div>

      {loading && <p style={{ color: theme.muted }}>Loading feature importance...</p>}
      {error && <p style={{ color: theme.red }}>{error}</p>}

      {!loading && !error && data.length > 0 && (
        <div style={{ height: 360 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 12, right: 18 }}>
              <CartesianGrid stroke={theme.grid} horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: theme.muted, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="feature"
                width={120}
                tick={{ fill: theme.text, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: theme.backgroundAlt,
                  border: `1px solid ${theme.borderStrong}`,
                  borderRadius: 12,
                  color: theme.text
                }}
              />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {data.map((entry, index) => (
                  <Cell
                    key={entry.feature}
                    fill={index < 3 ? theme.cyan : index < 6 ? theme.blue : theme.magenta}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {!loading && !error && data.length === 0 && (
        <p style={{ color: theme.muted }}>
          No feature importance payload is available yet. Re-run the training pipeline or use a model that exposes coefficients or importances.
        </p>
      )}
    </motion.section>
  )
}
