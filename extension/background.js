import {sendToAPI} from "./api.js"
import {initAuth} from "../firebase/auth.js"

let currentUser = null

// Initialize auth on extension load
initAuth().then(user => {
  currentUser = user
  console.log("Extension authenticated:", user.uid)
}).catch(err => {
  console.error("Auth init failed:", err)
})

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "SCAN_PAGE") {
    handleScanRequest(msg.payload, sendResponse)
    return true // Keep channel open
  }
})

async function handleScanRequest(payload, sendResponse) {
  try {
    if (!currentUser) {
      currentUser = await initAuth()
    }
    const result = await sendToAPI(payload, currentUser)
    sendResponse(result)
  } catch (error) {
    console.error("Scan error:", error)
    sendResponse({ error: error.message })
  }
}
