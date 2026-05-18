import { useEffect, useState } from "react"

import ConfidenceGauge from "../components/ConfidenceGauge.jsx"
import ExplanationPanel from "../components/ExplanationPanel.jsx"
import FakeVsRealChart from "../components/FakeVsRealChart.jsx"
import PredictionPie from "../components/PredictionPie.jsx"
import RecentScansTable from "../components/RecentScansTable.jsx"
import RiskBarChart from "../components/RiskBarChart.jsx"
import StatCard from "../components/StatCard.jsx"
import { supabase } from "../lib/supabase"

const MAX_SCANS = 100

function getScanKey(scan) {
  if (!scan) {
    return null
  }

  return scan.id ?? `${scan.username ?? "unknown"}-${scan.created_at ?? "pending"}`
}

function sortScans(items) {
  return [...items].sort((left, right) => {
    const leftTime = Date.parse(left?.created_at ?? 0) || 0
    const rightTime = Date.parse(right?.created_at ?? 0) || 0
    return rightTime - leftTime
  })
}

function mergeScans(current, incoming) {
  const merged = new Map(current.map((scan) => [getScanKey(scan), scan]))

  incoming.forEach((scan) => {
    merged.set(getScanKey(scan), scan)
  })

  return sortScans([...merged.values()]).slice(0, MAX_SCANS)
}

export default function Dashboard() {
  const [scans, setScans] = useState([])
  const [selectedScanKey, setSelectedScanKey] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setError(
        "Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before loading scans."
      )
      setLoading(false)
      return undefined
    }

    let cancelled = false

    async function loadScans() {
      const { data, error: loadError } = await supabase
        .from("scans")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(MAX_SCANS)

      if (cancelled) {
        return
      }

      if (loadError) {
        setError(loadError.message)
      } else {
        const nextScans = mergeScans([], data ?? [])
        setError("")
        setScans(nextScans)
        setSelectedScanKey((current) => current ?? getScanKey(nextScans[0]))
      }

      setLoading(false)
    }

    loadScans()

    const channel = supabase
      .channel("scans-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "scans"
        },
        ({ new: newScan }) => {
          if (!newScan || cancelled) {
            return
          }

          setScans((current) => mergeScans(current, [newScan]))
          setSelectedScanKey((current) => current ?? getScanKey(newScan))
        }
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [])

  const selectedScan =
    scans.find((scan) => getScanKey(scan) === selectedScanKey) ?? scans[0] ?? null

  const fakeCount = scans.filter((scan) => scan.label === "fake").length
  const realCount = scans.filter((scan) => scan.label === "real").length
  const averageRisk =
    scans.length === 0
      ? 0
      : Math.round(
          scans.reduce(
            (sum, scan) => sum + (Number(scan.fake_probability) || 0),
            0
          ) * 100 / scans.length
        )

  return (
    <div
      style={{
        padding: 24,
        display: "grid",
        gap: 24,
        color: "#14213d"
      }}
    >
      <section>
        <h1 style={{ margin: 0, fontSize: 32 }}>Fake Profile Detection Dashboard</h1>
        <p style={{ marginTop: 8, color: "#4f5d75" }}>
          Live scan activity, risk distribution, and the latest account signals.
        </p>
      </section>

      {loading && <p>Loading scans...</p>}

      {!loading && error && <p style={{ color: "crimson" }}>{error}</p>}

      {!loading && !error && (
        <>
          <section
            style={{
              display: "grid",
              gap: 16,
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))"
            }}
          >
            <StatCard
              label="Total scans"
              value={scans.length}
              accent="#14213d"
              subtext="Latest 100 rows"
            />
            <StatCard
              label="Flagged fake"
              value={fakeCount}
              accent="#b42318"
              subtext="Model label fake"
            />
            <StatCard
              label="Flagged real"
              value={realCount}
              accent="#0f766e"
              subtext="Model label real"
            />
            <StatCard
              label="Average risk"
              value={`${averageRisk}%`}
              accent="#f59e0b"
              subtext="Mean fake probability"
            />
          </section>

          <section
            style={{
              display: "grid",
              gap: 16,
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              alignItems: "stretch"
            }}
          >
            <PredictionPie scans={scans} />
            <RiskBarChart scans={scans} />
            <FakeVsRealChart scans={scans} />
            <ConfidenceGauge scan={selectedScan} />
          </section>

          <section
            style={{
              display: "grid",
              gap: 16,
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))"
            }}
          >
            <RecentScansTable
              scans={scans}
              selectedScanKey={selectedScan ? getScanKey(selectedScan) : null}
              onSelect={setSelectedScanKey}
            />
            <ExplanationPanel scan={selectedScan} />
          </section>
        </>
      )}
    </div>
  )
}
