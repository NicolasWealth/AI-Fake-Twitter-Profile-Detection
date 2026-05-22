import axios from "axios";

const API_URL = "https://smart-fake-profile-detection.onrender.com/predict";

export const predictAccount = async (payload) => {
    const res = await axios.post(API_URL, payload);
    return res.data;
};
