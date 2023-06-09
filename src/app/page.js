'use client'
import styles from './page.module.css'
import { initializeApp } from "firebase/app"
import "firebase/firestore"
import "firebase/auth"
import {Image} from 'next/image'

import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import {useAuthState} from "react-firebase-hooks/auth"
import {useCollectionData} from "react-firebase-hooks/firestore"
import { collection, getFirestore, query, orderBy, serverTimestamp, Firestore, addDoc } from 'firebase/firestore'
import {useState} from "react";

const app = initializeApp({
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STOREAGE_BUCKET,
    messagingSenderId: process.env.MESSAGEG_SENDER_ID,
    appId: process.env.APP_ID,
    measurementId: process.env.MEASUREMENT_ID
})
const auth = getAuth()
const firestore = getFirestore(app)


export default function Home() {

    const [user] = useAuthState(auth)

    return (
        <main className='App'>
        <header>
        </header>

        <section>
            {user ? <ChatRoom /> : <SignIn />}
        </section>
        </main>
    )
}

function SignIn(){

    async function useSignInWithGoogle(){
        const provider = new GoogleAuthProvider()
        await signInWithPopup(auth, provider)
    }

    return (
        <button className='signin' onClick={useSignInWithGoogle}> Sign in with Google </button>
    )
}
function ChatRoom() {

    const messageRef = collection(firestore, 'messages');
    const another_query = query(messageRef, orderBy('createdAt'));

    const [message] = useCollectionData(another_query, {idField: 'id'});
    const [formValue, setFormValue] = useState('')

    const sendMessage = async (e) => {
        e.preventDefault()
        const {uid, photoURL } = auth.currentUser
        await addDoc(messageRef, {
            text: formValue,
            createdAt: serverTimestamp(),
            uid,
            photoURL
        })

        setFormValue('')
    }



    return (
        <div>
            <div>
                {message && message.map(msg => <ChatMessage key={msg.id} message={msg} />)}
            </div>
            <form onSubmit={sendMessage}>
                <input value={formValue} onChange={(e) => setFormValue(e.target.value)} />
                <button type="submit">Send</button>
            </form>
        </div>
    )
}

function SignOut() {
    return auth.currentUser && (
        <button onClick={() => auth.signOut()}>Sign Out</button>
    )
}

function ChatMessage(props) {
    const {text, uid, photoURL } = props.message

    const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received'
    return (
        <div className={`message ${messageClass}`}>
        <img src={photoURL} />
        <p>{text}</p>
        </div>
    )
}
