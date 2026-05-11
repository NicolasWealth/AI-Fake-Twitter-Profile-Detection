import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend
}
    from "recharts"

export default function FakeVsRealChart({
    scans
}) {

    const fake =
        scans.filter(
            (s) => s.label === "fake"
        ).length

    const real =
        scans.filter(
            (s) => s.label === "real"
        ).length

    const data = [
        {
            name: "Fake",
            value: fake
        },
        {
            name: "Real",
            value: real
        }
    ]

    return (
        <PieChart
            width={400}
            height={300}
        >
            <Pie
                data={data}
                dataKey="value"
                outerRadius={100}
                label
            >
                <Cell fill="#d93025" />
                <Cell fill="#188038" />
            </Pie>

            <Tooltip />

            <Legend />

        </PieChart>
    )
}