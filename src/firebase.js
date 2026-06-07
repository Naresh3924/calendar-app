import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBkylRKBnaI4T4GUTx-sh_SrPp1pk3lS-g",
  authDomain: "amzeno-calendar.firebaseapp.com",
  projectId: "amzeno-calendar",
  storageBucket: "amzeno-calendar.firebasestorage.app",
  messagingSenderId: "245371940587",
  appId: "1:245371940587:web:0aba9c21ce15babc7f18ae",
  measurementId: "G-XKLL88GBXQ",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export default app;
