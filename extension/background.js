const SUPABASE_URL = "https://zoxmchlwfxnudopusksr.supabase.co"
const SUPABASE_KEY = "sb_publishable_QZ9pnITIaIclvMvaQup0lQ_90gx9OoK"

chrome.runtime.onMessage.addListener(function onMessageListener(msg, sender, sendResponse) {
  if (msg.type === "SCAN_PAGE") {
    handleScanRequest(msg.payload, sendResponse)
    return true
  }
})

async function handleScanRequest(payload, sendResponse) {
  try {
    const res = await fetch("http://127.0.0.1:8000/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })

    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`AI service failed (${res.status}): ${errorText}`)
    }

    const result = await res.json()

    // Log scan to Supabase
    const supabaseBody = {
      ...payload,
      prediction: result.prediction,
      label: result.label,
      fake_probability: result.fake_probability || 0
    }

    console.log("[FPD] Sending to Supabase:", supabaseBody)

    const sbRes = await fetch(`${SUPABASE_URL}/rest/v1/scans`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`
      },
      body: JSON.stringify(supabaseBody)
    })

    if (!sbRes.ok) {
      const errText = await sbRes.text()
      console.error("[FPD] Supabase error:", sbRes.status, errText)
    } else {
      console.log("[FPD] Supabase save OK for:", payload.username)
    }

    sendResponse({
      success: true,
      data: result
    })

  } catch (error) {
    console.error("Scan error:", error)

    sendResponse({
      success: false,
      error: error.message
    })
  }
}
