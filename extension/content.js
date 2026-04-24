function getCount(selector) {
  const text = document.querySelector(selector)?.innerText || "0"
  return parseInt(text.replace(/[^0-9]/g, ""), 10) || 0
}

function extractProfileData() {
  const username = window.location.pathname.split("/")[1] || ""

  const followersCount = getCount('a[href$="/followers"]')
  const followingCount = getCount('a[href$="/following"]')

  const postsText = document.querySelector('a[href$="/with_replies"]')?.innerText || ""
  const postsCount = parseInt(postsText.replace(/[^0-9]/g, ""), 10) || 0

  return {
    username,
    followersCount,
    followingCount,
    postsCount
  }
}

setTimeout(() => {
  const data = extractProfileData()
  console.log("Extracted:", data)

  chrome.runtime.sendMessage(
    {
      type: "SCAN_PAGE",
      payload: data
    },
    (response) => {
      console.log("Scan result:", response)
    }
  )
}, 3000)