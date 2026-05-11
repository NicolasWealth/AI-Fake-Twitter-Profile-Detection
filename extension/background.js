const SUPABASE_URL = "https://zoxmchlwfxnudopusksr.supabase.co"
const SUPABASE_KEY = "sb_publishable_QZ9pnITIaIclvMvaQup0lQ_90gx9OoK"
const SUPABASE_MAX_SCHEMA_RETRIES = 12

function getSupabaseHeaders() {
  return {
    "Content-Type": "application/json",
    "Prefer": "return=minimal",
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`
  }
}

function getMissingSchemaColumn(errorText) {
  try {
    const parsed = JSON.parse(errorText)
    const message = parsed?.message || ""
    const match = message.match(/Could not find the '([^']+)' column/i)
    return match ? match[1] : null
  } catch {
    return null
  }
}

async function insertSupabaseScan(row) {
  const body = { ...row }

  for (let attempt = 0; attempt <= SUPABASE_MAX_SCHEMA_RETRIES; attempt++) {
    const sbRes = await fetch(`${SUPABASE_URL}/rest/v1/scans`, {
      method: "POST",
      headers: getSupabaseHeaders(),
      body: JSON.stringify(body)
    })

    if (sbRes.ok) {
      return {
        ok: true,
        body
      }
    }

    const errText = await sbRes.text()
    const missingColumn = getMissingSchemaColumn(errText)

    if (
      sbRes.status === 400 &&
      missingColumn &&
      Object.prototype.hasOwnProperty.call(body, missingColumn)
    ) {
      console.warn(`[FPD] Supabase schema missing '${missingColumn}', retrying without it`)
      delete body[missingColumn]
      continue
    }

    return {
      ok: false,
      status: sbRes.status,
      errorText: errText
    }
  }

  return {
    ok: false,
    status: 400,
    errorText: "Supabase schema retry limit reached"
  }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type !== "SCAN_PAGE") return false

  handleScanRequest(msg.payload)
    .then((data) => {
      sendResponse({
        success: true,
        data
      })
    })
    .catch((error) => {
      const message =
        error instanceof Error ? error.message : String(error)

      console.error("Scan error:", error)
      sendResponse({
        success: false,
        error: message
      })
    })

  return true
})

async function handleScanRequest(payload) {
  const res = await fetch("https://smart-fake-profile-detection.onrender.com/predict", {
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

  const supabaseBody = {
    ...payload,
    prediction: result.prediction,
    label: result.label,
    fake_probability: result.fake_probability || 0
  }

  console.log("[FPD] Sending to Supabase:", supabaseBody)

  const supabaseResult = await insertSupabaseScan(supabaseBody)

  if (!supabaseResult.ok) {
    console.error("[FPD] Supabase error:", supabaseResult.status, supabaseResult.errorText)
  } else {
    console.log("[FPD] Supabase save OK for:", payload.username)
  }

  return result
}
