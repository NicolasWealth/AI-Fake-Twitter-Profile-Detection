import { useEffect, useState }
    from "react"

import { supabase }
    from "../lib/supabase"

import FakeVsRealChart
    from "../components/FakeVsRealChart"

export default function Dashboard() {

    const [scans, setScans] =
        useState([])
    const [error, setError] =
        useState("")
    const [loading, setLoading] =
        useState(true)

    useEffect(() => {
        loadScans()
    }, [])

    async function loadScans() {
        if (!supabase) {
            setError(
                "Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before loading scans."
            )
            setLoading(false)
            return
        }

        const { data, error } =
            await supabase
                .from("scans")
                .select("*")
                .order("created_at", {
                    ascending: false
                })

        if (error) {
            setError(error.message)
        } else {
            setScans(data ?? [])
        }

        setLoading(false)
    }

    return (
        <div style={{ padding: 20 }}>

            <h1>
                Fake Profile Detection Dashboard
            </h1>

            <h2>
                Total Scans: {scans.length}
            </h2>

            {!loading && !error && scans.length > 0 && (
                <FakeVsRealChart scans={scans} />
            )}

            {loading && (
                <p>Loading scans...</p>
            )}

            {!loading && error && (
                <p style={{ color: "crimson" }}>
                    {error}
                </p>
            )}

            {scans.map((scan) => (
                <div
                    key={scan.id}
                    style={{
                        border: "1px solid #ccc",
                        padding: 12,
                        marginBottom: 12
                    }}
                >
                    <h3>
                        @{scan.username}
                    </h3>

                    <p>
                        Platform: {scan.platform}
                    </p>

                    <p>
                        Label: {scan.label}
                    </p>

                    <p>
                        Confidence:
                        {" "}
                        {Math.round(
                            (scan.fake_probability ?? 0) * 100
                        )}%
                    </p>

                </div>
            ))}

        </div>
    )
}
