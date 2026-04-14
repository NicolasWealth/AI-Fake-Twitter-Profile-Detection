export async function sendToAPI(data, user) {
  const res = await fetch("https://your-api/scan", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": user.uid
    },
    body: JSON.stringify(data)
  })
  return res.json()
}
