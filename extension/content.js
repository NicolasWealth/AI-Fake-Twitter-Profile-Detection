function extractPageData() {
  const getCount = (selector) => {
    const text = document.querySelector(selector)?.innerText || "0"
    return parseInt(text.replace(/[^0-9]/g, "")) || 0
  }

  return {
    username: window.location.pathname.replace("/", ""),
    followersCount: getCount('a[href$="/followers"]'),
    followingCount: getCount('a[href$="/following"]'),
    postsCount: getCount('div[dir="auto"] > span:first-child')
  }
}
