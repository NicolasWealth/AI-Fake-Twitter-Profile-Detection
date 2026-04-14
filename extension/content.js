function extractPageData() {
  return {
    url: window.location.href,
    title: document.title,
    forms: [...document.forms].length,
    links: [...document.links].map((l) => l.href)
  }
}
