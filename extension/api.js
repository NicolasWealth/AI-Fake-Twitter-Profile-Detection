export async function sendToAPI(data, user) {
  console.log("Sending to API:", data, user.uid)

  // simulate API delay
  await new Promise((res) => setTimeout(res, 1000))

  return {
    riskScore: 0.78,
    isBot: true,
    confidence: 0.85
  }
}