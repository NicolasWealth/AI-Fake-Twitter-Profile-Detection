export async function sendToAPI(payload) {
  try {
    const response = await fetch("http://127.0.0.1:8000/predict", {
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