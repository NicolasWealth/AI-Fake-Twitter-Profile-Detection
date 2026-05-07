let lastPath = ""

function removeBadge() {
  const old = document.getElementById("fake-profile-ai-badge")
  if (old) old.remove()
}

function showBadge(text, color) {
  removeBadge()
  const badge = document.createElement("div")
  badge.id = "fake-profile-ai-badge"
  badge.innerText = text
  badge.style.cssText = `
    position: fixed; top: 90px; right: 20px; z-index: 999999;
    padding: 12px 16px; border-radius: 12px;
    font-size: 14px; font-weight: 700; color: #fff;
    background: ${color}; box-shadow: 0 8px 24px rgba(0,0,0,.25);
  `
  document.body.appendChild(badge)
}

function scanProfile() {
  const path = window.location.pathname
  if (path === lastPath) return
  lastPath = path

  const parts = path.split("/").filter(Boolean)
  if (parts.length !== 1) return
  if (typeof extractProfileData !== "function") return
  if (typeof buildMlPayload !== "function") return

  setTimeout(function delayedScan() {
    const rawProfile = extractProfileData()
    const payload = buildMlPayload(rawProfile)

    if (!rawProfile || !payload) {
      showBadge("Extraction Error", "#555")
      return
    }

    showBadge("Scanning...", "#444")
    console.log("[FPD] Raw profile:", rawProfile)
    console.log("[FPD] Payload to backend:", payload)

    chrome.runtime.sendMessage({ type: "SCAN_PAGE", payload }, function onScanResponse(response) {
      console.log("[FPD] Response:", response)

      if (chrome.runtime.lastError) {
        console.error("[FPD] Runtime error:", chrome.runtime.lastError)
        showBadge("Extension Error", "#555")
        return
      }

      if (!response || !response.success) {
        showBadge("API Error", "#555")
        return
      }

      const data = response.data
      const score = Math.round((data.fake_probability || 0) * 100)

      if (data.label === "fake") {
        showBadge(`Fake ${score}%`, "#d93025")
      } else {
        showBadge(`Real ${100 - score}%`, "#188038")
      }
    })
  }, 2500)
}

const observer = new MutationObserver(scanProfile)
observer.observe(document.body, { childList: true, subtree: true })
scanProfile()
