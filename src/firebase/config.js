import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCCkHMuGJbVH0tmOS0ekQvHIdD9lzAXeuk",
  authDomain: "expensestracker-2d592.firebaseapp.com",
  projectId: "expensestracker-2d592",
  storageBucket: "expensestracker-2d592.appspot.com",
  messagingSenderId: "224019626278",
  appId: "1:224019626278:web:35fddb51c4d7a5f68d29e7"
};


initializeApp(firebaseConfig);

const db = getFirestore();
export default db