let lastPath = ""

function getNumber(text) {
  if (!text) return 0

  text = text.trim().toUpperCase()

  if (text.includes("K")) return Math.round(parseFloat(text) * 1000)
  if (text.includes("M")) return Math.round(parseFloat(text) * 1000000)

  return parseInt(text.replace(/[^0-9]/g, ""), 10) || 0
}

function getCount(selector) {
  const text = document.querySelector(selector)?.innerText || "0"
  return getNumber(text)
}

function calcRandomness(username) {
  if (!username) return 0

  let weird = 0

  for (const char of username) {
    if (/[0-9_]/.test(char)) weird++
  }

  return +(weird / username.length).toFixed(2)
}

function extractProfileData() {
  const username = window.location.pathname.split("/")[1] || ""

  const followers = getCount('a[href$="/followers"]')
  const following = getCount('a[href$="/following"]')

  const postsText =
    document.querySelector('a[href$="/with_replies"]')?.innerText || "0"

  const statuses = getNumber(postsText)

  const bio =
    document.querySelector('[data-testid="UserDescription"]')?.innerText || ""

  const verified =
    document.querySelector('[data-testid="icon-verified"]') ? 1 : 0

  const profileImage =
    document.querySelector('img[src*="profile_images"]') ? 1 : 0

  const joinedText =
    document.body.innerText.match(/Joined .*?(\d{4})/)

  const joinedYear = joinedText ? parseInt(joinedText[1], 10) : 2026

  const currentYear = new Date().getFullYear()

  const accountAgeDays = (currentYear - joinedYear) * 365

  const ratio = following > 0
    ? +(followers / following).toFixed(4)
    : followers

  const postsPerDay = accountAgeDays > 0
    ? +(statuses / accountAgeDays).toFixed(4)
    : 0

  return {
    followers_count: followers || 0,
    following_count: following || 0,
    follower_following_ratio: ratio || 0,
    account_age_days: accountAgeDays || 1,
    statuses_count: statuses || 0,
    posts_per_day: postsPerDay || 0,
    has_profile_image: profileImage || 0,
    verified: verified || 0,
    bio_length: bio.length || 0,
    username_randomness_score: calcRandomness(username) || 0,
    username_length: username.length || 0
  }
}

function removeBadge() {
  const old = document.getElementById("fake-profile-ai-badge")
  if (old) old.remove()
}

function showBadge(text, color) {
  removeBadge()

  const badge = document.createElement("div")
  badge.id = "fake-profile-ai-badge"

  badge.innerText = text

  badge.style.position = "fixed"
  badge.style.top = "90px"
  badge.style.right = "20px"
  badge.style.zIndex = "999999"
  badge.style.padding = "12px 16px"
  badge.style.borderRadius = "12px"
  badge.style.fontSize = "14px"
  badge.style.fontWeight = "700"
  badge.style.color = "#fff"
  badge.style.background = color
  badge.style.boxShadow = "0 8px 24px rgba(0,0,0,.25)"

  document.body.appendChild(badge)
}

function scanProfile() {
  const path = window.location.pathname

  if (path === lastPath) return
  lastPath = path

  const parts = path.split("/").filter(Boolean)

  if (parts.length !== 1) return

  setTimeout(() => {
    const payload = extractProfileData()

    showBadge("Scanning...", "#444")

    console.log("Payload:", payload)

    chrome.runtime.sendMessage(
      {
        type: "SCAN_PAGE",
        payload
      },
      (response) => {
        console.log("RAW RESPONSE:", response)

        if (chrome.runtime.lastError) {
          console.log(chrome.runtime.lastError)
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
      }
    )
  }, 2500)
}

const observer = new MutationObserver(() => {
  scanProfile()
})

observer.observe(document.body, {
  childList: true,
  subtree: true
})

scanProfile()