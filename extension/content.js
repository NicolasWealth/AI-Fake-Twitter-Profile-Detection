let lastPath = ""

// ─── Number parsing ───────────────────────────────────────────────────────────
// Handles "34.3M", "1.2K", "1,449", "500" — number can appear anywhere in text
function parseCount(text) {
  if (!text) return 0
  const m = text.match(/([\d,]+(?:\.\d+)?)\s*([KkMmBb])?/)
  if (!m) return 0
  const num = parseFloat(m[1].replace(/,/g, ""))
  const s = (m[2] || "").toUpperCase()
  if (s === "M") return Math.round(num * 1_000_000)
  if (s === "K") return Math.round(num * 1_000)
  if (s === "B") return Math.round(num * 1_000_000_000)
  return Math.round(num) || 0
}

// ─── Page-text extraction (PRIMARY — immune to DOM structure changes) ─────────
// Scans the full rendered text for patterns like "34.3M Followers" or "1,449\nFollowing"
function getStatFromText(label) {
  const text = document.body.innerText
  const re = new RegExp(
    `([\\d,]+(?:\\.\\d+)?\\s*[KkMmBb]?)\\s*${label}`,
    "i"
  )
  const match = text.match(re)
  return match ? parseCount(match[1]) : 0
}

// ─── querySelector extraction (SECONDARY — faster when DOM cooperates) ────────
function getCountFromDOM(...selectors) {
  for (const sel of selectors) {
    const el = document.querySelector(sel)
    if (el) {
      const val = parseCount(el.innerText || "")
      if (val > 0) return val
    }
  }
  return 0
}

// ─── Combined: try DOM first, fall back to page text ─────────────────────────
function getStat(label, ...selectors) {
  const fromDOM = getCountFromDOM(...selectors)
  if (fromDOM > 0) return fromDOM
  return getStatFromText(label)
}

// ─── Username randomness score ────────────────────────────────────────────────
function calcRandomness(username) {
  if (!username) return 0
  let weird = 0
  for (const char of username) {
    if (/[0-9_]/.test(char)) weird++
  }
  return +(weird / username.length).toFixed(4)
}

// ─── Main extraction ──────────────────────────────────────────────────────────
function extractProfileData() {
  const username = window.location.pathname.split("/").filter(Boolean)[0] || ""

  // Followers — try link selector, then fall back to page text
  const followers = getStat(
    "Followers",
    `a[href*="/${username}/verified_followers"]`,
    `a[href*="/${username}/followers"]`,
    `a[href*="/verified_followers"]`,
    `a[href*="/followers"]`
  )

  // Following
  const following = getStat(
    "Following",
    `a[href*="/${username}/following"]`,
    `a[href*="/following"]`
  )

  // Posts/Statuses — Twitter shows "X posts" in profile header text
  const statuses =
    getStatFromText("posts") ||
    getStat(
      "Posts",
      `a[href="/${username}"]`,
      `a[href*="/with_replies"]`
    )

  // Bio
  const bio =
    document.querySelector('[data-testid="UserDescription"]')?.innerText || ""

  // Verified badge
  const verified =
    document.querySelector('[data-testid="icon-verified"]') ? 1 : 0

  // Profile image
  const profileImage =
    document.querySelector('img[src*="profile_images"]') ? 1 : 0

  // Account age — extract full "Joined Month Year" for precision
  let accountAgeDays = 365
  const joinedMatch = document.body.innerText.match(/Joined\s+(\w+\s+\d{4})/)
  if (joinedMatch) {
    const parsed = new Date(joinedMatch[1])
    if (!isNaN(parsed.getTime())) {
      accountAgeDays = Math.max(
        Math.floor((Date.now() - parsed.getTime()) / 86_400_000),
        1
      )
    }
  }

  // Derived features
  const ratio = following > 0 ? +(followers / following).toFixed(4) : followers
  const postsPerDay = +(statuses / (accountAgeDays + 1)).toFixed(4)

  // content_density = statuses_count / account_age_days (no +1 offset, as requested)
  const contentDensity = +(statuses / Math.max(accountAgeDays, 1)).toFixed(4)

  console.log("[FPD] Extracted:", {
    username, followers, following, statuses,
    bio_length: bio.length, verified, profileImage,
    accountAgeDays, ratio, postsPerDay, contentDensity
  })

  return {
    username,
    followers_count:           followers,
    following_count:           following,
    follower_following_ratio:  ratio,
    account_age_days:          accountAgeDays,
    statuses_count:            statuses,
    posts_per_day:             postsPerDay,
    content_density:           contentDensity,
    has_profile_image:         profileImage,
    verified,
    bio_length:                bio.length,
    username_randomness_score: calcRandomness(username),
    username_length:           username.length
  }
}

// ─── Badge UI ─────────────────────────────────────────────────────────────────
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

// ─── Scan logic ───────────────────────────────────────────────────────────────
function scanProfile() {
  const path = window.location.pathname
  if (path === lastPath) return
  lastPath = path

  const parts = path.split("/").filter(Boolean)
  if (parts.length !== 1) return

  setTimeout(function delayedScan() {
    const payload = extractProfileData()
    showBadge("Scanning...", "#444")
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
        showBadge(`🔴 Fake ${score}%`, "#d93025")
      } else {
        showBadge(`🟢 Real ${100 - score}%`, "#188038")
      }
    })
  }, 2500)
}

// ─── Observer ─────────────────────────────────────────────────────────────────
const observer = new MutationObserver(scanProfile)
observer.observe(document.body, { childList: true, subtree: true })
scanProfile()