export function getRiskLevel(probability) {

    const score =
        probability * 100

    if (score >= 85) {
        return {
            level: "Critical",
            color: "#8B0000"
        }
    }

    if (score >= 70) {
        return {
            level: "High",
            color: "#d93025"
        }
    }

    if (score >= 50) {
        return {
            level: "Medium",
            color: "#f9ab00"
        }
    }

    return {
        level: "Low",
        color: "#188038"
    }
}