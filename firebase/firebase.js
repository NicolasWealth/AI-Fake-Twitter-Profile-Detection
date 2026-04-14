import {initializeApp} from "firebase/app"
import {getAuth} from "firebase/auth"

const config = {
  apiKey: "...",
  authDomain: "...",
}

const app = initializeApp(config)
export const auth = getAuth(app)
