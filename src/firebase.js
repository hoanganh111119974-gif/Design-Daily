import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBUJ4rRDA2yBBRks2MVt20PV6bi_vsAQOM",
  authDomain: "design-daily-bd49f.firebaseapp.com",
  projectId: "design-daily-bd49f",
  storageBucket: "design-daily-bd49f.firebasestorage.app",
  messagingSenderId: "452673408830",
  appId: "1:452673408830:web:8d015d0d9e650eafae666f",
  measurementId: "G-89PWLVF79E"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
