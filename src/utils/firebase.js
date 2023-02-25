import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyCdxYr2ONUHMlRtJPwB-kFayYVQFTdU_TA",
  authDomain: "braintech-a5ef2.firebaseapp.com",
  databaseURL: "https://braintech-a5ef2-default-rtdb.firebaseio.com",
  projectId: "braintech-a5ef2",
  storageBucket: "braintech-a5ef2.appspot.com",
  messagingSenderId: "662306531743",
  appId: "1:662306531743:web:6412e082a2439e5ea8f5aa",
  measurementId: "G-F05X9CNHTT",
};

export const initializeFirebase = () => initializeApp(firebaseConfig);
