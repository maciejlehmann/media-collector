import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyCc-pzICsBvRo9gXdl-SJDezZixwEqsoSs',
  authDomain: 'actors-media-collector.firebaseapp.com',
  projectId: 'actors-media-collector',
  storageBucket: 'actors-media-collector.firebasestorage.app',
  messagingSenderId: '915153368106',
  appId: '1:915153368106:web:36d19a804be1776b543f53',
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

export { db, auth }
