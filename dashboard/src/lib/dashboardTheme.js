export const theme = {
  background: "#03111c",
  backgroundAlt: "#071a29",
  panel: "rgba(8, 26, 41, 0.88)",
  panelStrong: "rgba(12, 33, 51, 0.96)",
  border: "rgba(96, 165, 250, 0.18)",
  borderStrong: "rgba(125, 211, 252, 0.28)",
  text: "#e6f2ff",
  muted: "#88a4c2",
  subtle: "#5f7a96",
  grid: "rgba(125, 211, 252, 0.08)",
  cyan: "#22d3ee",
  blue: "#60a5fa",
  green: "#2dd4bf",
  amber: "#fbbf24",
  orange: "#fb923c",
  red: "#fb7185",
  magenta: "#c084fc"
}

export const cardStyle = {
  background: `linear-gradient(180deg, ${theme.panelStrong} 0%, ${theme.panel} 100%)`,
  border: `1px solid ${theme.border}`,
  borderRadius: 24,
  padding: 22,
  boxShadow: "0 24px 80px rgba(1, 8, 15, 0.42)",
  backdropFilter: "blur(18px)"
}

export function getProbabilityValue(scan) {
  return Math.round((Number(scan?.fake_probability) || 0) * 100)
}

export function getConfidenceValue(scan) {
  const explicitConfidence = Number(scan?.confidence)
  if (Number.isFinite(explicitConfidence)) {
    return Math.round(explicitConfidence * 100)
  }

  const probability = Number(scan?.fake_probability) || 0
  return Math.round((probability >= 0.5 ? probability : 1 - probability) * 100)
}

export function getRiskTone(probability, confidence = probability >= 50 ? probability : 100 - probability) {
  if (probability >= 85) {
    return { label: "Critical", color: theme.red }
  }

  if (probability >= 70) {
    return { label: "High", color: theme.orange }
  }

  if (probability >= 50) {
    return { label: "Medium", color: theme.amber }
  }

  if (confidence < 60) {
    return { label: "Uncertain", color: theme.blue }
  }

  return { label: "Low", color: theme.green }
}

export function formatTimestamp(value, options = {}) {
  if (!value) {
    return "Pending"
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return "Pending"
  }

  return date.toLocaleString([], options)
}

export function createBadgeStyle(color) {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 10px",
    borderRadius: 999,
    border: `1px solid ${color}55`,
    background: `${color}18`,
    color,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase"
  }
}
