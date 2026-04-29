const SUPABASE_URL = "https://zoxmchlwfxnudopusksr.supabase.co"
const SUPABASE_KEY = "sb_publishable_QZ9pnITIaIclvMvaQup0lQ_90gx9OoK"

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
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

    if (!res.ok) throw new Error("AI service failed")

    const result = await res.json()

    // Optional logging to Supabase (non-blocking)
    fetch(`${SUPABASE_URL}/rest/v1/scans`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`
      },
      body: JSON.stringify({
        payload,
        result,
        created_at: new Date().toISOString()
      })
    }).catch(() => { })

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