import {signInAnonymously, onAuthStateChanged} from "firebase/auth"
import {auth} from "./firebase.js"

export function initAuth() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        const res = await signInAnonymously(auth)
        resolve(res.user)
      } else {
        resolve(user)
      }
    })
  })
}
