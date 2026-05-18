import { CONFIG } from "./config.js"

export async function sendToAPI(payload) {
  try {
    const response = await fetch(CONFIG.API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    return await response.json();

  } catch (err) {
    console.error("API ERROR:", err);

    return {
      error: true,
      message: err.message
    };
  }
}
