import { initializeApp } from 'firebase/app';

import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyDOMeO3Jcz5_0tCPzv_y9T-y0hZWd68KDA',
  authDomain: 'tutorial-8dd36.firebaseapp.com',
  projectId: 'tutorial-8dd36',
  storageBucket: 'tutorial-8dd36.appspot.com',
  messagingSenderId: '1018655082295',
  appId: '1:1018655082295:web:b0a58201d5c497b41dfcb2',
  measurementId: 'G-QYNCK9JFN2',
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
