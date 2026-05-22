function getRiskLevel(probability, confidence) {

    const score =
        probability * 100
    const resolvedConfidence =
        Number.isFinite(confidence)
            ? confidence
            : probability >= 0.5
                ? probability
                : 1 - probability

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

    if (resolvedConfidence < 0.60) {
        return {
            level: "Uncertain",
            color: "#2563eb"
        }
    }

    return {
        level: "Low",
        color: "#188038"
    }
}
